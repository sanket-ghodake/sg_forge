/**
 * @forge/auth - REST API Handlers (2026 LTS)
 * Login, Password Setup, Refresh, Revocation, Directory, MFA, Audit & 4-Pillar Observability.
 */

import { getAuthDb } from '../db/db';
import {
  generateSecureToken,
  hashPassword,
  verifyPassword,
  getPublicJwks,
  verifyJwt,
} from './crypto';
import {
  createSession,
  rotateRefreshToken,
  revokeSession,
  getUserActiveSessions,
  revokeOtherSessions,
  resolveSessionLifetimes,
} from './session-manager';
import { checkRateLimit, recordFailedAttempt, resetAttempts } from './rate-limiter';
import { logAuditEvent } from './audit-logger';
import { authTelemetry } from './telemetry';
import { createLogger } from '@forge/sdk';

const logger = createLogger('auth-api');

// In-memory temp tokens for password reset verification
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();

function problem(title: string, detail: string, status: number = 400, headersObj: Record<string, string> = {}, traceId?: string): Response {
  const headers = new Headers({
    'Content-Type': 'application/problem+json',
    ...(traceId ? { 'x-trace-id': traceId } : {}),
    ...headersObj,
  });

  return Response.json(
    {
      type: 'https://tools.ietf.org/html/rfc7807',
      title,
      status,
      detail,
      ...(traceId ? { traceId } : {}),
    },
    { status, headers }
  );
}

function extractClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
}

const getSessionCookieName = () => process.env.SESSION_COOKIE_NAME || 'forge_session';

function extractBearerOrCookieToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  const cookieHeader = req.headers.get('cookie') || '';
  const cName = getSessionCookieName().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)(?:${cName}|forge_session)=([^;]+)`));
  return match ? match[1] : null;
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleLogin(req: Request): Promise<Response> {
  const startTime = performance.now();
  const ip = extractClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      authTelemetry.recordLog('app', 'WARN', 'Login rejected: Missing email or password', { ip });
      return problem('Bad Request', 'Email and password are required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Rate Limit (Anti-Brute Force Shield)
    const rateStatus = checkRateLimit(ip, cleanEmail);
    if (rateStatus.isBlocked) {
      authTelemetry.recordLog('app', 'WARN', `Rate limit triggered for ${cleanEmail} from ${ip}`, {
        ip,
        retryAfter: rateStatus.retryAfterSeconds,
      });

      logAuditEvent({
        orgId: 'system',
        actorId: cleanEmail,
        action: 'AUTH_RATE_LIMITED',
        resource: 'auth/login',
        status: 'DENIED',
        details: { ip, retryAfterSeconds: rateStatus.retryAfterSeconds },
        ip,
      });

      return problem(
        'Too Many Requests',
        `Too many failed attempts. Please retry after ${rateStatus.retryAfterSeconds} seconds.`,
        429,
        { 'Retry-After': String(rateStatus.retryAfterSeconds) }
      );
    }

    const db = getAuthDb();
    const dbQueryStart = performance.now();
    const user = db
      .query(
        `SELECT id, org_id, email, password_hash, salt, display_name, principal_type, status, must_change_password
         FROM auth_users WHERE lower(email) = ?;`
      )
      .get(cleanEmail) as any;
    const dbQueryDuration = performance.now() - dbQueryStart;

    authTelemetry.recordLog('db', 'DEBUG', `Queried user by email: ${cleanEmail}`, { durationMs: dbQueryDuration }, dbQueryDuration);

    if (!user) {
      recordFailedAttempt(ip, cleanEmail);
      authTelemetry.recordLog('app', 'WARN', `Failed login: User not found (${cleanEmail}) from ${ip}`, { ip });
      logAuditEvent({
        orgId: 'unknown',
        actorId: cleanEmail,
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth/login',
        status: 'DENIED',
        details: { reason: 'User not found', userAgent },
        ip,
      });
      return problem('Unauthorized', 'Invalid credentials', 401);
    }

    if (user.status !== 'ACTIVE') {
      authTelemetry.recordLog('app', 'WARN', `Login blocked: Account ${cleanEmail} is suspended`, { ip });
      return problem('Forbidden', 'Account is suspended or inactive', 403);
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      recordFailedAttempt(ip, cleanEmail);
      authTelemetry.recordLog('app', 'WARN', `Failed login: Invalid password for ${cleanEmail} from ${ip}`, { ip });
      logAuditEvent({
        orgId: user.org_id,
        actorId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        resource: 'auth/login',
        status: 'DENIED',
        details: { reason: 'Incorrect password', userAgent },
        ip,
      });
      return problem('Unauthorized', 'Invalid credentials', 401);
    }

    // Reset rate limits on successful password verification
    resetAttempts(ip, cleanEmail);

    // First time login - intercept for password change
    if (user.must_change_password === 1) {
      const tempToken = generateSecureToken(32);
      passwordResetTokens.set(tempToken, {
        userId: user.id,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      authTelemetry.recordLog('app', 'INFO', `First-time login intercepted for password change: ${cleanEmail}`, { ip });

      return Response.json({
        status: 'MUST_CHANGE_PASSWORD',
        message: 'First time login detected. You must set a new password.',
        tempToken,
        email: user.email,
        displayName: user.display_name,
      });
    }

    // Normal login - issue session
    const session = createSession(user.id, userAgent, ip);
    if (!session) {
      authTelemetry.recordLog('app', 'ERROR', `Session creation failed for user ${user.id}`, { ip });
      return problem('Internal Error', 'Failed to create session', 500);
    }

    const duration = performance.now() - startTime;
    authTelemetry.recordLog('app', 'INFO', `Successful login: ${cleanEmail} (Role: ${user.principal_type})`, {
      ip,
      userId: user.id,
      durationMs: duration,
    }, duration);

    logAuditEvent({
      orgId: user.org_id,
      actorId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'auth/login',
      status: 'SUCCESS',
      details: { userAgent },
      ip,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const sName = getSessionCookieName();
    const lifetimes = resolveSessionLifetimes();
    const cookieHeader = `forge_refresh_token=${session.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetimes.refreshTokenExpirySeconds}${isProd ? '; Secure' : ''}`;
    const sessionCookieHeader = `${sName}=${session.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${lifetimes.accessTokenExpirySeconds}${isProd ? '; Secure' : ''}`;

    const headers = new Headers();
    headers.append('Set-Cookie', cookieHeader);
    headers.append('Set-Cookie', sessionCookieHeader);
    return Response.json({ status: 'SUCCESS', accessToken: session.accessToken, user: session.user }, { status: 200, headers });
  } catch (err: any) {
    authTelemetry.recordLog('app', 'ERROR', `Login handler exception: ${err?.message || 'Unknown'}`, { error: String(err) });
    logger.error('Login handler error:', err);
    return problem('Internal Server Error', 'An unexpected error occurred during authentication', 500);
  }
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleSetPassword(req: Request): Promise<Response> {
  const ip = extractClientIp(req);
  try {
    const body = await req.json();
    const { tempToken, newPassword } = body;

    if (!tempToken || !newPassword) {
      return problem('Bad Request', 'Temporary token and new password are required', 400);
    }

    const resetEntry = passwordResetTokens.get(tempToken);
    if (!resetEntry || Date.now() > resetEntry.expiresAt) {
      authTelemetry.recordLog('app', 'WARN', 'Password reset failed: Invalid or expired reset token', { ip });
      return problem('Unauthorized', 'Reset token has expired or is invalid. Please log in again.', 401);
    }

    if (newPassword.length < 8) {
      return problem('Bad Request', 'Password must be at least 8 characters long', 400);
    }

    const db = getAuthDb();
    const { hash, salt } = hashPassword(newPassword);

    db.run(
      `UPDATE auth_users
       SET password_hash = ?, salt = ?, must_change_password = 0, token_version = token_version + 1, updated_at = ?
       WHERE id = ?;`,
      [hash, salt, Date.now(), resetEntry.userId]
    );

    passwordResetTokens.delete(tempToken);

    authTelemetry.recordLog('app', 'INFO', `User ${resetEntry.userId} successfully configured permanent password`, { ip });
    authTelemetry.recordLog('db', 'DEBUG', `Updated password hash and cleared must_change_password for ${resetEntry.userId}`);

    logAuditEvent({
      orgId: 'system',
      actorId: resetEntry.userId,
      action: 'AUTH_PASSWORD_CHANGED',
      resource: 'auth/set-password',
      status: 'SUCCESS',
      ip,
    });

    const session = createSession(resetEntry.userId, req.headers.get('user-agent') || 'Unknown', ip);
    if (!session) {
      return problem('Internal Error', 'Password changed but session initialization failed', 500);
    }

    const isProd = process.env.NODE_ENV === 'production';
    const sName = getSessionCookieName();
    const lifetimes = resolveSessionLifetimes();
    const cookieHeader = `forge_refresh_token=${session.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetimes.refreshTokenExpirySeconds}${isProd ? '; Secure' : ''}`;
    const sessionCookieHeader = `${sName}=${session.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${lifetimes.accessTokenExpirySeconds}${isProd ? '; Secure' : ''}`;

    const headers = new Headers();
    headers.append('Set-Cookie', cookieHeader);
    headers.append('Set-Cookie', sessionCookieHeader);
    return Response.json({ status: 'SUCCESS', message: 'Password successfully updated.', accessToken: session.accessToken, user: session.user }, { status: 200, headers });
  } catch (err: any) {
    logger.error('Set password error:', err);
    authTelemetry.recordLog('app', 'ERROR', `Set password exception: ${err?.message || 'Unknown'}`);
    return problem('Internal Server Error', 'Failed to update password', 500);
  }
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleRefresh(req: Request): Promise<Response> {
  const ip = extractClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/forge_refresh_token=([^;]+)/);
  const rawToken = match ? match[1] : null;

  if (!rawToken) {
    return problem('Unauthorized', 'Refresh token missing', 401);
  }

  const result = rotateRefreshToken(rawToken, userAgent, ip);
  if ('error' in result) {
    authTelemetry.recordLog('app', 'WARN', `Refresh token rotation failed: ${result.error}`, { ip });
    return problem('Unauthorized', result.error, 401);
  }

  authTelemetry.recordLog('app', 'DEBUG', `Rotated refresh token for user ${result.user.id}`, { ip });

  const isProd = process.env.NODE_ENV === 'production';
  const sName = getSessionCookieName();
  const lifetimes = resolveSessionLifetimes();
  const newCookie = `forge_refresh_token=${result.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetimes.refreshTokenExpirySeconds}${isProd ? '; Secure' : ''}`;
  const sessionCookie = `${sName}=${result.accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${lifetimes.accessTokenExpirySeconds}${isProd ? '; Secure' : ''}`;

  const headers = new Headers();
  headers.append('Set-Cookie', newCookie);
  headers.append('Set-Cookie', sessionCookie);
  return Response.json({ status: 'SUCCESS', accessToken: result.accessToken, user: result.user }, { status: 200, headers });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleLogout(req: Request): Promise<Response> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/forge_refresh_token=([^;]+)/);
  if (match) {
    revokeSession(match[1]);
    authTelemetry.recordLog('app', 'INFO', 'User session explicitly revoked via logout');
  }

  const sName = getSessionCookieName();
  const headers = new Headers();
  headers.append('Set-Cookie', 'forge_refresh_token=; Path=/; HttpOnly; Max-Age=0');
  headers.append('Set-Cookie', `${sName}=; Path=/; Max-Age=0`);
  if (sName !== 'forge_session') headers.append('Set-Cookie', 'forge_session=; Path=/; Max-Age=0');
  return Response.json({ status: 'SUCCESS', message: 'Logged out successfully' }, { status: 200, headers });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleBrowserLog(req: Request): Promise<Response> {
  try {
    const payload = await req.json();
    const { level = 'ERROR', message = 'Browser error', metadata = {} } = payload;
    const ip = extractClientIp(req);

    authTelemetry.recordLog(
      'browser',
      level.toUpperCase() as any,
      String(message),
      { ...metadata, ip }
    );

    return Response.json({ status: 'ok', received: true });
  } catch {
    return Response.json({ status: 'ignored' }, { status: 400 });
  }
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export function handleJwks(): Response {
  return Response.json(getPublicJwks(), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

import { getScopedHierarchyData } from './hierarchy';

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export function handleDirectory(req?: Request): Response {
  if (req) {
    const token = extractBearerOrCookieToken(req);
    if (!token) return problem('Unauthorized', 'Authentication required to access directory', 401);
    const { valid, payload } = verifyJwt(token);
    if (!valid || !payload) return problem('Unauthorized', 'Invalid or expired token', 401);
  }

  const db = getAuthDb();
  const org = db.query('SELECT * FROM auth_organizations LIMIT 1;').get();
  const nodes = db.query('SELECT * FROM auth_org_nodes ORDER BY path ASC;').all();
  const users = db
    .query(
      `SELECT u.id, u.email, u.display_name, u.principal_type, u.status, u.must_change_password,
              p.job_title, p.employee_code, p.org_node_id,
              n.name as department_name, n.path as org_path
       FROM auth_users u
       LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
       LEFT JOIN auth_org_nodes n ON p.org_node_id = n.id
       ORDER BY u.display_name ASC;`
    )
    .all();

  return Response.json({
    organization: org,
    nodes,
    users,
  });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleScopedHierarchy(req: Request, targetId?: string): Promise<Response> {
  const url = new URL(req.url);
  let identifier = targetId || url.searchParams.get('user_id') || url.searchParams.get('id') || url.searchParams.get('email');

  // If requesting /me or identifier is omitted, resolve caller from session
  if (!identifier || identifier === 'me') {
    const token = extractBearerOrCookieToken(req);
    if (!token) {
      return problem('Unauthorized', 'Authentication required to access personal hierarchy (/me)', 401);
    }
    const { valid, payload } = verifyJwt(token);
    if (!valid || !payload) {
      return problem('Unauthorized', 'Invalid or expired session token', 401);
    }
    identifier = payload.sub;
  }

  const result = getScopedHierarchyData(identifier);
  if (!result) {
    return problem('Not Found', `Employee with identifier "${identifier}" was not found in organizational hierarchy`, 404);
  }

  return Response.json(result, {
    headers: { 'Content-Type': 'application/json' },
  });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleGetMySessions(req: Request): Promise<Response> {
  const token = extractBearerOrCookieToken(req);
  if (!token) return problem('Unauthorized', 'Authentication required', 401);

  const { valid, payload } = verifyJwt(token);
  if (!valid || !payload) return problem('Unauthorized', 'Invalid or expired token', 401);

  const sessions = getUserActiveSessions(payload.sub);
  return Response.json({ status: 'SUCCESS', sessions });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export async function handleRevokeOtherSessions(req: Request): Promise<Response> {
  const token = extractBearerOrCookieToken(req);
  if (!token) return problem('Unauthorized', 'Authentication required', 401);

  const { valid, payload } = verifyJwt(token);
  if (!valid || !payload) return problem('Unauthorized', 'Invalid or expired token', 401);

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/forge_refresh_token=([^;]+)/);
  const currentRefreshToken = match ? match[1] : '';

  const count = revokeOtherSessions(payload.sub, currentRefreshToken);

  authTelemetry.recordLog('app', 'INFO', `User ${payload.sub} revoked ${count} other sessions`);

  logAuditEvent({
    orgId: payload.org_id,
    actorId: payload.sub,
    action: 'AUTH_SESSION_REVOKED',
    resource: 'auth/sessions/revoke-others',
    status: 'SUCCESS',
    details: { count },
  });

  return Response.json({
    status: 'SUCCESS',
    message: `Revoked ${count} other active device sessions.`,
  });
}

/** @requirements [HLR-AUTH-101] [LLR-AUTH-003] */
export function handleGetTelemetryLogs(req: Request): Response {
  const token = extractBearerOrCookieToken(req);
  if (!token) return problem('Unauthorized', 'Authentication required', 401);
  const { valid, payload } = verifyJwt(token);
  if (!valid || !payload) return problem('Unauthorized', 'Invalid or expired token', 401);

  const hasAdmin = payload.principal_type === 'ADMIN' || (payload.roles && payload.roles.some((r: string) => r.includes('admin')));
  if (!hasAdmin) {
    return problem('Forbidden', 'Administrative privileges required to inspect system telemetry logs', 403);
  }

  const url = new URL(req.url);
  const source = url.searchParams.get('source') || undefined;
  const limit = Math.min(200, Number(url.searchParams.get('limit') || 50));
  const logs = authTelemetry.getRecentLogs(limit, source);
  return Response.json({ status: 'ok', logs });
}
