/**
 * @forge/auth - Audit & Session Management Controller (2026 LTS)
 * Handles security audit query stream and active multi-device session inspection.
 */

import { getOrgAuditLogs } from './audit-logger';
import { getUserActiveSessions, revokeOtherSessions } from './session-manager';
import { verifyJwt } from './crypto';

function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieName = process.env.SESSION_COOKIE_NAME || 'forge_session';
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)(?:${escapedName}|forge_session)=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * handleGetAuditLogs
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function handleGetAuditLogs(req: Request): Response {
  const token = extractToken(req);
  if (!token) {
    return Response.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }
  const { valid, payload } = verifyJwt(token);
  if (!valid || !payload) {
    return Response.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  const hasAdmin =
    payload.principal_type === 'ADMIN' ||
    (payload.roles &&
      payload.roles.some((r: string) =>
        r === 'roles/super_admin' ||
        r === 'roles/security.admin' ||
        r === 'roles/admin' ||
        r.includes('admin')
      ));
  if (!hasAdmin) {
    return Response.json({ ok: false, error: 'Forbidden: Security & Audit logs require administrative roles' }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));
  const logs = getOrgAuditLogs(limit);
  return Response.json({ ok: true, data: logs });
}

/**
 * handleGetUserSessions
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]
 */
export function handleGetUserSessions(req: Request): Response {
  const token = extractToken(req);
  if (!token) {
    return Response.json({ ok: false, error: 'Authentication required' }, { status: 401 });
  }
  const { valid, payload } = verifyJwt(token);
  if (!valid || !payload) {
    return Response.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  const sessions = getUserActiveSessions(payload.sub);
  return Response.json({ ok: true, data: sessions });
}
