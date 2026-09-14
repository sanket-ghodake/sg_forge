/**
 * @forge/auth - Employee Password Restoration & Forced Reset Service (2026 LTS)
 * Manages administrative password resets, Argon2id encryption, active session revocation,
 * and mandatory user password upgrade enforcement on next login.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */

import { createLogger } from '@forge/sdk';
import { getAuthDb } from '../db/db';
import { hashPassword } from './crypto';
import { logAuditEvent } from './audit-logger';

const logger = createLogger('auth-employee-password');

export interface ResetEmployeePasswordResult {
  ok: boolean;
  id: string;
  email: string;
  must_change_password: boolean;
  message: string;
}

/**
 * Administratively reset an employee's password with a temporary password.
 * Revokes all existing sessions and forces the user to set a permanent password upon next login.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export function resetEmployeePassword(
  userId: string,
  temporaryPassword: string,
  actorId: string = 'devcenter-admin',
  ip: string = '127.0.0.1'
): ResetEmployeePasswordResult {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid employee ID is required');
  }

  if (!temporaryPassword || typeof temporaryPassword !== 'string' || temporaryPassword.length < 8) {
    throw new Error('Temporary password must be at least 8 characters long');
  }

  const db = getAuthDb();
  const user = db.query('SELECT id, org_id, email, display_name FROM auth_users WHERE id = ?;').get(userId) as {
    id: string;
    org_id: string;
    email: string;
    display_name: string;
  } | null;

  if (!user) {
    throw new Error(`Employee with ID "${userId}" not found`);
  }

  const { hash, salt } = hashPassword(temporaryPassword);
  const now = Date.now();

  // 1. Update user credentials, enforce must_change_password, and bump token_version (invalidating active JWTs)
  db.run(
    `UPDATE auth_users
     SET password_hash = ?, salt = ?, must_change_password = 1, token_version = token_version + 1, updated_at = ?
     WHERE id = ?;`,
    [hash, salt, now, userId]
  );

  // 2. Invalidate all existing server sessions for this user immediately
  db.run('UPDATE auth_sessions SET is_revoked = 1 WHERE user_id = ?;', [userId]);

  logger.info(`Administrative password reset executed for user ${user.email} (${userId}) by ${actorId}`);

  // 3. Emit structured audit event
  logAuditEvent({
    orgId: user.org_id,
    actorId,
    action: 'EMPLOYEE_PASSWORD_RESET',
    resource: `auth/employees/${userId}`,
    status: 'SUCCESS',
    details: {
      userId,
      email: user.email,
      forcedChange: true,
      sessionsRevoked: true,
    },
    ip,
  });

  return {
    ok: true,
    id: userId,
    email: user.email,
    must_change_password: true,
    message: 'Temporary password set. User will be required to change password upon next login.',
  };
}
