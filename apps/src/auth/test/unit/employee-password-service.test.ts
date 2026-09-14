/**
 * @forge/auth/test/unit - Employee Password Restoration & Forced Reset Tests (Tier 1 & Tier 2)
 * Tests administrative password resets, session invalidations, mandatory reset enforcement,
 * negative security boundaries, and the full end-to-end restore lifecycle.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-003] [LLR-AUTH-007]
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { getAuthDb } from '../../src/db/db';
import { signJwt } from '../../src/backend/crypto';
import { handleLogin, handleSetPassword } from '../../src/backend/api-handlers';
import { handleResetEmployeePassword } from '../../src/backend/api-org-handlers';
import { resetEmployeePassword } from '../../src/backend/employee-password-service';

describe('Tier 1 Unit & Tier 2 Integration: Employee Password Restoration Flow', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should administratively reset password and enforce must_change_password flag', () => {
    // 1. Arrange: locate test user
    const db = getAuthDb();
    const user: any = db.query("SELECT id, email, must_change_password FROM auth_users WHERE email = 'developer@forge.internal';").get();
    expect(user).toBeDefined();

    // 2. Act: Administratively reset password
    const result = resetEmployeePassword(user.id, 'TemporarySecret#2026!');

    // 3. Assert
    expect(result.ok).toBe(true);
    expect(result.id).toBe(user.id);
    expect(result.must_change_password).toBe(true);

    const updated: any = db.query('SELECT must_change_password, token_version FROM auth_users WHERE id = ?;').get(user.id);
    expect(updated.must_change_password).toBe(1);
    expect(updated.token_version).toBeGreaterThan(0);
  });

  it('should immediately revoke all active sessions when password is reset', () => {
    const db = getAuthDb();
    const user: any = db.query("SELECT id FROM auth_users WHERE email = 'developer@forge.internal';").get();
    expect(user).toBeDefined();

    // Insert a dummy active session
    const sessionId = `sess-test-${Date.now()}`;
    db.run(
      `INSERT INTO auth_sessions (id, user_id, org_id, refresh_token_hash, family_id, is_revoked, expires_at, created_at)
       VALUES (?, ?, 'org-sg-forge-global', ?, 'family-1', 0, ?, ?);`,
      [sessionId, user.id, 'dummy_hash', Date.now() + 3600000, Date.now()]
    );

    // Verify session is active
    const beforeSession: any = db.query('SELECT is_revoked FROM auth_sessions WHERE id = ?;').get(sessionId);
    expect(beforeSession.is_revoked).toBe(0);

    // Act: Reset password
    resetEmployeePassword(user.id, 'NewTempPass#2026!');

    // Assert: Session must now be revoked
    const afterSession: any = db.query('SELECT is_revoked FROM auth_sessions WHERE id = ?;').get(sessionId);
    expect(afterSession.is_revoked).toBe(1);
  });

  it('should reject reset attempts with password length less than 8 characters', () => {
    const db = getAuthDb();
    const user: any = db.query("SELECT id FROM auth_users WHERE email = 'developer@forge.internal';").get();
    expect(user).toBeDefined();

    expect(() => {
      resetEmployeePassword(user.id, 'short');
    }).toThrow('Temporary password must be at least 8 characters long');
  });

  it('should reject reset attempts for non-existent employee ID', () => {
    expect(() => {
      resetEmployeePassword('non-existent-user-id', 'ValidPassword123!');
    }).toThrow('Employee with ID "non-existent-user-id" not found');
  });

  it('handleResetEmployeePassword should return 401 when caller is unauthenticated', async () => {
    const req = new Request('http://localhost:3004/api/v1/auth/org/employees/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'usr-employee', temporaryPassword: 'NewTempPass#2026!' }),
    });

    const res = await handleResetEmployeePassword(req);
    expect(res.status).toBe(401);
  });

  it('handleResetEmployeePassword should return 403 when caller is a standard employee', async () => {
    const employeeToken = signJwt({
      sub: 'usr-employee',
      email: 'developer@forge.internal',
      roles: ['roles/employee'],
    });

    const req = new Request('http://localhost:3004/api/v1/auth/org/employees/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({ id: 'usr-employee', temporaryPassword: 'NewTempPass#2026!' }),
    });

    const res = await handleResetEmployeePassword(req);
    expect(res.status).toBe(403);
  });

  it('handleResetEmployeePassword should succeed when caller is admin', async () => {
    const adminToken = signJwt({
      sub: 'usr-superadmin',
      email: 'superadmin@forge.internal',
      roles: ['roles/super_admin'],
    });

    const req = new Request('http://localhost:3004/api/v1/auth/org/employees/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id: 'usr-developer', temporaryPassword: 'AdminAssignedTemp#2026!' }),
    });

    const res = await handleResetEmployeePassword(req);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.ok).toBe(true);
    expect(json.must_change_password).toBe(true);
  });

  it('end-to-end: employee logs in with temporary password, is forced to reset, and sets permanent password', async () => {
    const db = getAuthDb();
    const user: any = db.query("SELECT id, email FROM auth_users WHERE email = 'developer@forge.internal';").get();
    expect(user).toBeDefined();

    // 1. Admin resets password
    const tempPassword = 'TempAdminPassword#2026!';
    resetEmployeePassword(user.id, tempPassword);

    // 2. Employee logs in with the temporary password
    const loginReq = new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: tempPassword,
      }),
    });

    const loginRes = await handleLogin(loginReq);
    expect(loginRes.status).toBe(200);
    const loginData: any = await loginRes.json();

    // Assert: User must change password intercept
    expect(loginData.status).toBe('MUST_CHANGE_PASSWORD');
    expect(loginData.tempToken).toBeDefined();

    // 3. Employee sets their own permanent password
    const permanentPassword = 'MyPermanentSecretPassword#2026!';
    const setPwdReq = new Request('http://localhost:3004/api/v1/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: loginData.tempToken,
        newPassword: permanentPassword,
      }),
    });

    const setPwdRes = await handleSetPassword(setPwdReq);
    expect(setPwdRes.status).toBe(200);
    const setPwdData: any = await setPwdRes.json();
    expect(setPwdData.status).toBe('SUCCESS');
    expect(setPwdData.accessToken).toBeDefined();

    // 4. Employee logs in with permanent password
    const finalLoginReq = new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: permanentPassword,
      }),
    });

    const finalLoginRes = await handleLogin(finalLoginReq);
    expect(finalLoginRes.status).toBe(200);
    const finalLoginData: any = await finalLoginRes.json();
    expect(finalLoginData.status).toBe('SUCCESS');
    expect(finalLoginData.accessToken).toBeDefined();
  });
});
