/**
 * @forge/auth - Organization & Employee REST API Handlers (2026 LTS)
 * Handles live org tree, employee lifecycle CRUD, batch import, and RBAC enforcement.
 */

import { createLogger } from '@forge/sdk';
import { employeeController, sanitizeCsvField } from './employee-controller';
import { getOrgTree } from './org-tree-service';
import { verifyJwt, hashToken } from './crypto';
import { getAuthDb } from '../db/db';

const logger = createLogger('auth-org-api');

function problem(
  title: string,
  detail: string,
  status: number = 400,
  headersObj: Record<string, string> = {},
  traceId?: string
): Response {
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

function extractAuthContext(req: Request): {
  userId: string;
  email: string;
  roles: string[];
  isAuthenticated: boolean;
} {
  const authHeader = req.headers.get('authorization') || '';
  let token: string | null = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieName = process.env.SESSION_COOKIE_NAME || 'forge_session';
    const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)(?:${escapedName}|forge_session)=([^;]+)`));
    if (match) token = match[1];
  }

  if (!token) {
    return { userId: '', email: '', roles: [], isAuthenticated: false };
  }

  // 1. Try JWT verify
  const jwtRes = verifyJwt(token);
  if (jwtRes.valid && jwtRes.payload) {
    return {
      userId: jwtRes.payload.sub,
      email: jwtRes.payload.email || '',
      roles: jwtRes.payload.roles || ['roles/employee'],
      isAuthenticated: true,
    };
  }

  // 2. Try DB Session Lookup
  try {
    const db = getAuthDb();
    const tokenHash = hashToken(token);
    const sessionRow: any = db
      .query(
        `SELECT s.user_id, u.email
         FROM auth_sessions s
         JOIN auth_users u ON s.user_id = u.id
         WHERE s.refresh_token_hash = ? AND s.is_revoked = 0 AND s.expires_at > ?;`
      )
      .get(tokenHash, Date.now());

    if (sessionRow) {
      const userRoles: any[] = db
        .query(`SELECT role_id FROM auth_iam_policy_bindings WHERE principal_id = ?;`)
        .all(sessionRow.user_id);
      const roles = userRoles.length > 0 ? userRoles.map((r) => r.role_id) : ['roles/employee'];
      return {
        userId: sessionRow.user_id,
        email: sessionRow.email,
        roles,
        isAuthenticated: true,
      };
    }
  } catch (err) {
    logger.warn('Error verifying session token:', err instanceof Error ? { error: err.message } : undefined);
  }

  return { userId: '', email: '', roles: [], isAuthenticated: false };
}

function hasAdminRole(roles: string[]): boolean {
  return roles.some((r) =>
    r === 'roles/super_admin' ||
    r === 'roles/hr_admin' ||
    r === 'roles/hr.admin' ||
    r === 'roles/security.admin' ||
    r === 'roles/admin'
  );
}

/**
 * Handle GET /api/v1/auth/org/tree
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export function handleGetOrgTree(req: Request): Response {
  try {
    const url = new URL(req.url);
    const maxDepth = url.searchParams.get('max_depth') ? Number(url.searchParams.get('max_depth')) : 5;
    const rootId = url.searchParams.get('root_id') || undefined;
    const department = url.searchParams.get('department') || undefined;

    const tree = getOrgTree({ maxDepth, rootId, department });
    return Response.json({ ok: true, data: tree });
  } catch (err: any) {
    logger.error('Failed to get org tree:', err);
    return problem('Internal Server Error', err?.message || 'Failed to fetch org tree', 500);
  }
}

/**
 * Handle GET /api/v1/auth/org/employees
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export function handleListEmployees(req: Request): Response {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const departmentId = url.searchParams.get('departmentId') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const limit = Number(url.searchParams.get('limit') || 50);
    const offset = Number(url.searchParams.get('offset') || 0);

    const result = employeeController.listEmployees({ search, departmentId, status, limit, offset });
    return Response.json({ ok: true, status: 'ok', ...result });
  } catch (err: any) {
    logger.error('Failed to list employees:', err);
    return problem('Internal Server Error', err?.message || 'Failed to list employees', 500);
  }
}

/**
 * Handle GET /api/v1/auth/org/employees/:id
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export function handleGetEmployee(req: Request, employeeId: string): Response {
  try {
    const result = employeeController.getEmployeeHierarchy(employeeId);
    if (!result) return problem('Not Found', `Employee "${employeeId}" not found`, 404);
    return Response.json({ ok: true, status: 'ok', ...result });
  } catch (err: any) {
    logger.error('Failed to get employee hierarchy:', err);
    return problem('Internal Server Error', err?.message || 'Failed to get employee', 500);
  }
}

/**
 * Handle POST /api/v1/auth/org/employees (Create Employee)
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export async function handleCreateEmployee(req: Request): Promise<Response> {
  const ip = extractClientIp(req);
  const auth = extractAuthContext(req);

  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required to create employee', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Requires administrative role.', 403);
  }

  try {
    const body: any = await req.json().catch(() => null);
    if (!body) return problem('Bad Request', 'Invalid JSON body', 400);

    const actorId = auth.userId || 'devcenter-admin';
    const created = employeeController.createEmployee(body, actorId, ip);
    return Response.json({ ok: true, status: 'ok', employee: created }, { status: 201 });
  } catch (err: any) {
    logger.warn('Failed to create employee:', err);
    return problem('Bad Request', err?.message || 'Failed to create employee', 400);
  }
}

/**
 * Handle POST / PATCH /api/v1/auth/org/employees/update (or :id)
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export async function handleUpdateEmployee(req: Request, employeeId?: string): Promise<Response> {
  const ip = extractClientIp(req);
  const auth = extractAuthContext(req);

  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required to update employee', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Requires administrative role.', 403);
  }

  try {
    const body: any = await req.json().catch(() => null);
    if (!body) return problem('Bad Request', 'Invalid JSON body', 400);

    const targetId = employeeId || body.id;
    if (!targetId) return problem('Bad Request', 'Missing employee ID', 400);

    const actorId = auth.userId || 'devcenter-admin';
    const updated = employeeController.updateEmployee(targetId, body, actorId, ip);
    return Response.json({ ok: true, ...updated });
  } catch (err: any) {
    logger.warn('Failed to update employee:', err);
    return problem('Bad Request', err?.message || 'Failed to update employee', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/employees/revoke (or :id/revoke)
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export async function handleRevokeEmployee(req: Request, employeeId?: string): Promise<Response> {
  const ip = extractClientIp(req);
  const auth = extractAuthContext(req);

  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required to revoke sessions', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Requires administrative role.', 403);
  }

  try {
    const body: any = await req.json().catch(() => ({}));
    const targetId = employeeId || body?.id;
    if (!targetId) return problem('Bad Request', 'Missing employee ID', 400);

    const actorId = auth.userId || 'devcenter-admin';
    const revoked = employeeController.revokeSessions(targetId, actorId, ip);
    return Response.json({ ok: true, ...revoked });
  } catch (err: any) {
    logger.warn('Failed to revoke sessions:', err);
    return problem('Bad Request', err?.message || 'Failed to revoke sessions', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/employees/import
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export async function handleBatchImport(req: Request): Promise<Response> {
  const ip = extractClientIp(req);
  const auth = extractAuthContext(req);

  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required for bulk import', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Requires administrative role.', 403);
  }

  try {
    const body: any = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.records)) {
      return problem('Bad Request', 'Invalid payload: records array is required', 400);
    }

    const actorId = auth.userId || 'devcenter-admin';
    const summary = employeeController.batchImport(body.records, body.options || {}, actorId, ip);
    return Response.json({ ok: true, status: 'ok', summary });
  } catch (err: any) {
    logger.error('Bulk import failed:', err);
    return problem('Bad Request', err?.message || 'Bulk import failed', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/employees/bulk-action
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export async function handleBulkAction(req: Request): Promise<Response> {
  const ip = extractClientIp(req);
  const auth = extractAuthContext(req);

  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required for bulk actions', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Requires administrative role.', 403);
  }

  try {
    const body: any = await req.json().catch(() => null);
    if (!body || !body.action || !Array.isArray(body.userIds)) {
      return problem('Bad Request', 'Invalid payload: action and userIds are required', 400);
    }

    const actorId = auth.userId || 'devcenter-admin';
    const res = employeeController.bulkAction(body.orgId || 'org_main', body.action, body.userIds, actorId, ip);
    return Response.json({ ok: true, ...res });
  } catch (err: any) {
    logger.error('Bulk action failed:', err);
    return problem('Bad Request', err?.message || 'Bulk action failed', 400);
  }
}

/**
 * Handle GET /api/v1/auth/org/employees/export
  * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export function handleExportEmployees(req: Request): Response {
  const auth = extractAuthContext(req);
  if (!auth.isAuthenticated) {
    return problem('Unauthorized', 'Authentication required to export directory', 401);
  }
  if (!hasAdminRole(auth.roles)) {
    return problem('Forbidden', 'Insufficient permissions. Export requires administrative role.', 403);
  }

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'csv';
    const data = employeeController.listEmployees({
      search: url.searchParams.get('search') || undefined,
      departmentId: url.searchParams.get('departmentId') || undefined,
      status: url.searchParams.get('status') || undefined,
      limit: 5000,
      offset: 0,
    });

    if (format === 'json') {
      return new Response(JSON.stringify(data.items, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="employees_export_${Date.now()}.json"`,
        },
      });
    }

    const headers = ['id', 'display_name', 'email', 'job_title', 'employee_code', 'department_name', 'manager_email', 'status', 'roles'];
    const csv =
      headers.join(',') +
      '\n' +
      data.items
        .map((item) =>
          [
            JSON.stringify(sanitizeCsvField(item.id)),
            JSON.stringify(sanitizeCsvField(item.display_name)),
            JSON.stringify(sanitizeCsvField(item.email)),
            JSON.stringify(sanitizeCsvField(item.job_title)),
            JSON.stringify(sanitizeCsvField(item.employee_code)),
            JSON.stringify(sanitizeCsvField(item.department_name)),
            JSON.stringify(sanitizeCsvField(item.manager_email)),
            JSON.stringify(sanitizeCsvField(item.status)),
            JSON.stringify(sanitizeCsvField((item.roles || []).join('; '))),
          ].join(',')
        )
        .join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="employees_export_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    logger.error('Export failed:', err);
    return problem('Internal Server Error', err?.message || 'Export failed', 500);
  }
}
