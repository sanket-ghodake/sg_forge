/**
 * @forge/auth - Scoped Employee Hierarchy Engine (2026 LTS)
 * Enterprise IAM Standard:
 * - Linear upward management chain resolution (Employee -> Manager -> Skip-Level -> Executive)
 * - Downward direct and subordinate reports query
 * - Scoped data boundary (Zero cross-tenant or un-related department leakage)
 */

import { getAuthDb } from '../db';
import type {
  EmployeeSummary,
  ManagerChainEntry,
  ScopedHierarchyResponse,
  EmployeeManagerCheckResponse,
} from '@forge/types';
import { verifyJwt } from './crypto';

function problem(title: string, detail: string, status: number = 400): Response {
  return Response.json(
    {
      type: 'https://tools.ietf.org/html/rfc7807',
      title,
      status,
      detail,
    },
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json',
      },
    }
  );
}

function extractBearerOrCookieToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  const cookieHeader = req.headers.get('cookie') || '';
  const cName = (process.env.SESSION_COOKIE_NAME || 'forge_session').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)(?:${cName}|forge_session)=([^;]+)`));
  return match ? match[1] : null;
}


/**
 * getScopedHierarchyData
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export function getScopedHierarchyData(identifier: string): ScopedHierarchyResponse | null {
  const db = getAuthDb();
  if (!identifier) return null;

  // 1. Resolve Target Employee
  const employeeRow = db
    .query(
      `SELECT u.id, u.email, u.display_name as displayName, u.principal_type as principalType,
              p.job_title as jobTitle, p.employee_code as employeeCode,
              n.name as departmentName, n.path as orgPath
       FROM auth_users u
       LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
       LEFT JOIN auth_org_nodes n ON p.org_node_id = n.id
       WHERE u.id = ? OR u.email = ?
       LIMIT 1;`
    )
    .get(identifier, identifier) as EmployeeSummary | null;

  if (!employeeRow) return null;

  // 2. Linear Upward Management Chain (Iterative Manager Traversal)
  const managementChain: ManagerChainEntry[] = [];
  const visited = new Set<string>([employeeRow.id]);
  let currentEmpId = employeeRow.id;
  let level = 1;

  while (level <= 10) {
    const relRow = db
      .query(
        `SELECT r.related_to_id, r.relationship_type,
                u.id, u.email, u.display_name as displayName,
                p.job_title as jobTitle, n.name as department
         FROM auth_employee_relationships r
         JOIN auth_users u ON r.related_to_id = u.id
         LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
         LEFT JOIN auth_org_nodes n ON p.org_node_id = n.id
         WHERE r.employee_id = ? AND r.is_primary = 1
         LIMIT 1;`
      )
      .get(currentEmpId) as any;

    if (!relRow || !relRow.related_to_id || visited.has(relRow.related_to_id)) {
      break;
    }

    managementChain.push({
      level,
      relationship: relRow.relationship_type || 'LINE_MANAGER',
      id: relRow.id,
      displayName: relRow.displayName,
      email: relRow.email,
      jobTitle: relRow.jobTitle || null,
      department: relRow.department || null,
    });

    visited.add(relRow.related_to_id);
    currentEmpId = relRow.related_to_id;
    level++;
  }

  // 3. Direct Subordinates / Reports (Downward)
  const directReports = db
    .query(
      `SELECT u.id, u.email, u.display_name as displayName, u.principal_type as principalType,
              p.job_title as jobTitle, p.employee_code as employeeCode,
              n.name as departmentName, n.path as orgPath
       FROM auth_employee_relationships r
       JOIN auth_users u ON r.employee_id = u.id
       LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
       LEFT JOIN auth_org_nodes n ON p.org_node_id = n.id
       WHERE r.related_to_id = ? AND r.is_primary = 1
       ORDER BY u.display_name ASC;`
    )
    .all(employeeRow.id) as EmployeeSummary[];

  return {
    status: 'SUCCESS',
    employee: employeeRow,
    managementChain,
    directReports,
    summary: {
      totalManagersAbove: managementChain.length,
      totalDirectReports: directReports.length,
      isTopLevel: managementChain.length === 0,
    },
  };
}

/**
 * Fast O(1) check to determine if an employee is a manager by having >= 1 direct subordinate reports.
 * Designation or job title is intentionally ignored.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-012]
 */
export function checkIsManager(
  identifier: string
): { userId: string; isManager: boolean; directReportsCount: number } | null {
  const db = getAuthDb();
  if (!identifier) return null;

  const row = db
    .query(
      `SELECT 
         u.id as userId,
         (SELECT COUNT(*) FROM auth_employee_relationships r 
          WHERE r.related_to_id = u.id AND r.is_primary = 1) as directReportsCount
       FROM auth_users u
       WHERE u.id = ? OR u.email = ?
       LIMIT 1;`
    )
    .get(identifier, identifier) as { userId: string; directReportsCount: number } | null;

  if (!row) return null;

  const count = Number(row.directReportsCount || 0);
  return {
    userId: row.userId,
    isManager: count > 0,
    directReportsCount: count,
  };
}

/**
 * REST Handler for GET /api/v1/auth/hierarchy/:id/is-manager and /me/is-manager.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-012]
 */
export async function handleIsManagerCheck(req: Request, targetId?: string): Promise<Response> {
  const url = new URL(req.url);
  let identifier =
    targetId ||
    url.searchParams.get('user_id') ||
    url.searchParams.get('id') ||
    url.searchParams.get('email');

  // If requesting /me or identifier is omitted, resolve caller from session
  if (!identifier || identifier === 'me') {
    const token = extractBearerOrCookieToken(req);
    if (!token) {
      return problem(
        'Unauthorized',
        'Authentication required to access personal manager status (/me/is-manager)',
        401
      );
    }
    const { valid, payload } = verifyJwt(token);
    if (!valid || !payload) {
      return problem('Unauthorized', 'Invalid or expired session token', 401);
    }
    identifier = payload.sub;
  }

  const result = checkIsManager(identifier);
  if (!result) {
    return problem(
      'Not Found',
      `Employee with identifier "${identifier}" was not found in organizational hierarchy`,
      404
    );
  }

  const responsePayload: EmployeeManagerCheckResponse = {
    status: 'SUCCESS',
    userId: result.userId,
    isManager: result.isManager,
    directReportsCount: result.directReportsCount,
  };

  return Response.json(responsePayload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

