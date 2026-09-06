/**
 * @forge/auth - Session Manager & Refresh Token Rotation (2026 LTS)
 * ASVS 5.0 Compliant: Refresh Token Rotation (RTR) & Replay Attack Defense.
 */

import { getAuthDb } from '../db/db';
import { generateSecureToken, hashToken, signJwt } from './crypto';
import { evaluateUserPermissions } from './iam-engine';
import { createLogger } from '@forge/sdk';

const logger = createLogger('auth-session');

/**
 * AUTH_SECURITY_BOUNDS
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export const AUTH_SECURITY_BOUNDS = {
  // Access Token Bounds (Short-lived, memory/cookie protected)
  ACCESS_TOKEN_MIN_SECONDS: 60, // Floor: 1 minute
  ACCESS_TOKEN_MAX_CEILING_SECONDS: 1800, // Ceiling: 30 minutes
  ACCESS_TOKEN_DEFAULT_SECONDS: 900, // Default: 15 minutes

  // Refresh Token Sliding Inactivity Bounds (Auto-refresh on active usage)
  REFRESH_TOKEN_MIN_SECONDS: 300, // Floor: 5 minutes
  REFRESH_TOKEN_MAX_CEILING_SECONDS: 604800, // Ceiling: 7 days
  REFRESH_TOKEN_DEFAULT_SECONDS: 604800, // Default: 7 days

  // Absolute Session Lifetime Bounds (Hard Wall on Family - requires re-auth)
  ABSOLUTE_SESSION_MIN_SECONDS: 3600, // Floor: 1 hour
  ABSOLUTE_SESSION_MAX_CEILING_SECONDS: 604800, // Ceiling: 7 days
  ABSOLUTE_SESSION_DEFAULT_SECONDS: 86400, // Default: 24 hours
} as const;

/**
 * ResolvedSessionLifetimes
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export interface ResolvedSessionLifetimes {
  accessTokenExpirySeconds: number;
  refreshTokenExpirySeconds: number;
  absoluteSessionMaxSeconds: number;
}

function clampWithWarning(
  name: string,
  rawVal: string | undefined,
  minFloor: number,
  maxCeiling: number,
  defaultVal: number
): number {
  if (!rawVal || isNaN(Number(rawVal))) {
    return defaultVal;
  }
  const parsed = Number(rawVal);
  if (parsed < minFloor) {
    logger.warn(
      `[SECURITY CLAMP] ${name} (${parsed}s) is below security floor of ${minFloor}s. Clamping to floor.`
    );
    return minFloor;
  }
  if (parsed > maxCeiling) {
    logger.warn(
      `[SECURITY CLAMP] ${name} (${parsed}s) exceeds hard security ceiling of ${maxCeiling}s. Clamping to ceiling.`
    );
    return maxCeiling;
  }
  return parsed;
}

/**
 * resolveSessionLifetimes
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function resolveSessionLifetimes(envOverride?: Record<string, string | undefined>): ResolvedSessionLifetimes {
  const env = envOverride || process.env;

  const accessTokenExpirySeconds = clampWithWarning(
    'JWT_ACCESS_TOKEN_EXPIRY_SECONDS',
    env.JWT_ACCESS_TOKEN_EXPIRY_SECONDS || env.JWT_EXPIRY_SECONDS,
    AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_MIN_SECONDS,
    AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_MAX_CEILING_SECONDS,
    AUTH_SECURITY_BOUNDS.ACCESS_TOKEN_DEFAULT_SECONDS
  );

  const refreshTokenExpirySeconds = clampWithWarning(
    'JWT_REFRESH_TOKEN_EXPIRY_SECONDS',
    env.JWT_REFRESH_TOKEN_EXPIRY_SECONDS,
    AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_MIN_SECONDS,
    AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_MAX_CEILING_SECONDS,
    AUTH_SECURITY_BOUNDS.REFRESH_TOKEN_DEFAULT_SECONDS
  );

  const absoluteSessionMaxSeconds = clampWithWarning(
    'AUTH_ABSOLUTE_SESSION_MAX_SECONDS',
    env.AUTH_ABSOLUTE_SESSION_MAX_SECONDS,
    AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_MIN_SECONDS,
    AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_MAX_CEILING_SECONDS,
    AUTH_SECURITY_BOUNDS.ABSOLUTE_SESSION_DEFAULT_SECONDS
  );

  return {
    accessTokenExpirySeconds,
    refreshTokenExpirySeconds,
    absoluteSessionMaxSeconds,
  };
}

/**
 * SessionIssueResult
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export interface SessionIssueResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    displayName: string;
    principalType: string;
    orgId: string;
    roles: string[];
    permissions: string[];
  };
}

/**
 * createSession
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function createSession(
  userId: string,
  userAgent: string | null = null,
  ipHash: string | null = null
): SessionIssueResult | null {
  const db = getAuthDb();
  const lifetimes = resolveSessionLifetimes();

  const user = db
    .query(
      `SELECT id, org_id, email, display_name, principal_type, status, token_version
       FROM auth_users WHERE id = ? AND status = 'ACTIVE';`
    )
    .get(userId) as any;

  if (!user) return null;

  const { roles, permissions } = evaluateUserPermissions(user.id, user.org_id);
  const rawRefreshToken = generateSecureToken(48);
  const tokenHash = hashToken(rawRefreshToken);
  const familyId = `fam_${generateSecureToken(16)}`;
  const sessionId = `sess_${generateSecureToken(16)}`;
  const now = Date.now();
  const expiresAt = now + lifetimes.refreshTokenExpirySeconds * 1000;

  db.run(
    `INSERT INTO auth_sessions (id, user_id, org_id, refresh_token_hash, family_id, is_revoked, user_agent, ip_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?);`,
    [sessionId, user.id, user.org_id, tokenHash, familyId, userAgent, ipHash, expiresAt, now]
  );

  const accessToken = signJwt(
    {
      iss: 'https://forge.internal/auth',
      sub: user.id,
      email: user.email,
      display_name: user.display_name,
      principal_type: user.principal_type,
      org_id: user.org_id,
      roles,
      permissions,
      token_version: user.token_version,
    },
    lifetimes.accessTokenExpirySeconds
  );

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: lifetimes.accessTokenExpirySeconds,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      principalType: user.principal_type,
      orgId: user.org_id,
      roles,
      permissions,
    },
  };
}

/**
 * rotateRefreshToken
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002] [LLR-AUTH-004]
 */
export function rotateRefreshToken(
  rawRefreshToken: string,
  userAgent: string | null = null,
  ipHash: string | null = null
): SessionIssueResult | { error: string } {
  const db = getAuthDb();
  const lifetimes = resolveSessionLifetimes();
  const tokenHash = hashToken(rawRefreshToken);

  const session = db
    .query(
      `SELECT s.id, s.user_id, s.org_id, s.family_id, s.is_revoked, s.expires_at, s.created_at,
              u.email, u.display_name, u.principal_type, u.status, u.token_version
       FROM auth_sessions s
       JOIN auth_users u ON s.user_id = u.id
       WHERE s.refresh_token_hash = ?;`
    )
    .get(tokenHash) as any;

  if (!session) {
    return { error: 'Invalid refresh token' };
  }

  // REPLAY ATTACK DETECTION: If token was already revoked, kill the entire family!
  if (session.is_revoked === 1) {
    logger.warn(`Security alert: Replay attempt detected for family ${session.family_id}. Revoking family.`);
    db.run(`UPDATE auth_sessions SET is_revoked = 1 WHERE family_id = ?;`, [session.family_id]);
    return { error: 'Session compromised. All sessions revoked.' };
  }

  const now = Date.now();
  if (now > session.expires_at || session.status !== 'ACTIVE') {
    db.run(`UPDATE auth_sessions SET is_revoked = 1 WHERE id = ?;`, [session.id]);
    return { error: 'Session expired or user inactive' };
  }

  // ABSOLUTE SESSION CEILING CHECK:
  // Measure total elapsed time since this session family was originally established.
  const familyOrigin = db
    .query(`SELECT MIN(created_at) as family_created_at FROM auth_sessions WHERE family_id = ?;`)
    .get(session.family_id) as { family_created_at: number | null } | null;

  const familyCreatedAt = familyOrigin?.family_created_at || session.created_at || now;
  const elapsedMs = now - familyCreatedAt;
  const absoluteMaxMs = lifetimes.absoluteSessionMaxSeconds * 1000;

  if (elapsedMs > absoluteMaxMs) {
    logger.warn(
      `[SECURITY CEILING] Session family ${session.family_id} for user ${session.user_id} reached absolute maximum lifetime (${Math.round(elapsedMs / 1000)}s > ${lifetimes.absoluteSessionMaxSeconds}s). Revoking family.`
    );
    db.run(`UPDATE auth_sessions SET is_revoked = 1 WHERE family_id = ?;`, [session.family_id]);
    return { error: 'Session reached absolute maximum lifetime. Re-authentication required.' };
  }

  // Revoke the current single refresh token
  db.run(`UPDATE auth_sessions SET is_revoked = 1 WHERE id = ?;`, [session.id]);

  // Issue new rotated token in the same family
  const newRawRefreshToken = generateSecureToken(48);
  const newTokenHash = hashToken(newRawRefreshToken);
  const newSessionId = `sess_${generateSecureToken(16)}`;
  const expiresAt = now + lifetimes.refreshTokenExpirySeconds * 1000;

  db.run(
    `INSERT INTO auth_sessions (id, user_id, org_id, refresh_token_hash, family_id, is_revoked, user_agent, ip_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?);`,
    [newSessionId, session.user_id, session.org_id, newTokenHash, session.family_id, userAgent, ipHash, expiresAt, now]
  );

  const { roles, permissions } = evaluateUserPermissions(session.user_id, session.org_id);

  const accessToken = signJwt(
    {
      iss: 'https://forge.internal/auth',
      sub: session.user_id,
      email: session.email,
      display_name: session.display_name,
      principal_type: session.principal_type,
      org_id: session.org_id,
      roles,
      permissions,
      token_version: session.token_version,
    },
    lifetimes.accessTokenExpirySeconds
  );

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    expiresIn: lifetimes.accessTokenExpirySeconds,
    user: {
      id: session.user_id,
      email: session.email,
      displayName: session.display_name,
      principalType: session.principal_type,
      orgId: session.org_id,
      roles,
      permissions,
    },
  };
}

/**
 * revokeSession
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function revokeSession(rawRefreshToken: string): boolean {
  const db = getAuthDb();
  const tokenHash = hashToken(rawRefreshToken);
  const res = db.run(`UPDATE auth_sessions SET is_revoked = 1 WHERE refresh_token_hash = ?;`, [tokenHash]);
  return res.changes > 0;
}

/**
 * getUserActiveSessions
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function getUserActiveSessions(userId: string): Array<{
  id: string;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: number;
  expiresAt: number;
}> {
  const db = getAuthDb();
  const now = Date.now();
  const rows = db
    .query(
      `SELECT id, user_agent, ip_hash, created_at, expires_at
       FROM auth_sessions
       WHERE user_id = ? AND is_revoked = 0 AND expires_at > ?
       ORDER BY created_at DESC;`
    )
    .all(userId, now) as any[];

  return rows.map((r) => ({
    id: r.id,
    userAgent: r.user_agent,
    ipHash: r.ip_hash,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
  }));
}

/**
 * revokeOtherSessions
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function revokeOtherSessions(userId: string, currentRawRefreshToken: string): number {
  const db = getAuthDb();
  const currentTokenHash = hashToken(currentRawRefreshToken);
  const res = db.run(
    `UPDATE auth_sessions
     SET is_revoked = 1
     WHERE user_id = ? AND refresh_token_hash != ? AND is_revoked = 0;`,
    [userId, currentTokenHash]
  );
  return res.changes;
}
