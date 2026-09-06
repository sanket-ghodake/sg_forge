/**
 * @forge/auth - GCP-Style IAM Engine & Policy Evaluator (2026 LTS)
 * Evaluates Permissions, Roles, and Hierarchical Scopes.
 */

import { getAuthDb } from '../db/db';

/**
 * EvaluatedIamContext
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export interface EvaluatedIamContext {
  roles: string[];
  permissions: string[];
}

/**
 * evaluateUserPermissions
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export function evaluateUserPermissions(userId: string, orgId: string): EvaluatedIamContext {
  const db = getAuthDb();

  // Find all policy bindings for user
  const bindings = db
    .query(
      `SELECT role_id FROM auth_iam_policy_bindings
       WHERE principal_id = ? AND org_id = ?;`
    )
    .all(userId, orgId) as Array<{ role_id: string }>;

  const roleIds = bindings.map((b) => b.role_id);
  if (roleIds.length === 0) {
    return { roles: [], permissions: [] };
  }

  // Find all permissions mapped to these roles
  const placeholders = roleIds.map(() => '?').join(',');
  const permissions = db
    .query(
      `SELECT DISTINCT permission_id FROM auth_iam_role_permissions
       WHERE role_id IN (${placeholders});`
    )
    .all(...roleIds) as Array<{ permission_id: string }>;

  return {
    roles: roleIds,
    permissions: permissions.map((p) => p.permission_id),
  };
}

/**
 * hasPermission
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export function hasPermission(
  userId: string,
  orgId: string,
  requiredPermission: string
): boolean {
  const context = evaluateUserPermissions(userId, orgId);

  // Super admin wildcard check
  if (context.roles.includes('roles/super_admin') || context.permissions.includes('*')) {
    return true;
  }

  return context.permissions.includes(requiredPermission);
}
