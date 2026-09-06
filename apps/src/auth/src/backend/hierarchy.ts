/**
 * @forge/auth - Scoped Employee Hierarchy Engine (2026 LTS)
 * Enterprise IAM Standard:
 * - Linear upward management chain resolution (Employee -> Manager -> Skip-Level -> Executive)
 * - Downward direct and subordinate reports query
 * - Scoped data boundary (Zero cross-tenant or un-related department leakage)
 */

import { getAuthDb } from '../db';
import type { EmployeeSummary, ManagerChainEntry, ScopedHierarchyResponse } from '@forge/types';

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
