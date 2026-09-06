/**
 * @forge/auth - Employee Directory & Organization Controller (2026 LTS)
 * Manages enterprise employee lifecycle, reporting hierarchies, and IAM role bindings.
 * Enterprise SRE Observability & Exclusive Auth Database Isolation.
 */

import type { Database } from 'bun:sqlite';
import { randomBytes } from 'node:crypto';
import { createLogger } from '@forge/sdk';
import { getAuthDb } from '../db/db';
import { hashPassword } from './crypto';
import { logAuditEvent } from './audit-logger';
import { executeBatchImport, type BatchImportRecord, type BatchImportOptions } from './employee-import';

const logger = createLogger('auth-employees');

/** Sanitize input string against CSV Formula Injection  * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export function sanitizeCsvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str.trim();
}

/**
 * EmployeeListItem
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface EmployeeListItem {
  id: string;
  org_id: string;
  email: string;
  display_name: string;
  principal_type: string;
  status: string;
  must_change_password: number;
  token_version: number;
  job_title: string | null;
  employee_code: string | null;
  org_node_id: string | null;
  department_name: string | null;
  department_path: string | null;
  manager_id: string | null;
  manager_name: string | null;
  manager_email: string | null;
  roles: string[];
  created_at: number;
  updated_at: number;
}

/**
 * EmployeeController
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export class EmployeeController {
  private getDb(): Database {
    return getAuthDb();
  }

  public listEmployees(params: {
    search?: string;
    departmentId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): { items: EmployeeListItem[]; total: number; departments: any[] } {
    const db = this.getDb();
    const search = params.search ? `%${params.search.toLowerCase()}%` : null;
    const deptId = params.departmentId || null;
    const status = params.status || null;
    const limit = Math.min(params.limit || 50, 200);
    const offset = params.offset || 0;

    let whereClauses: string[] = ["u.principal_type IN ('EMPLOYEE', 'ADMIN')"];
    const bindings: any[] = [];

    if (search) {
      whereClauses.push(
        '(LOWER(u.display_name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(COALESCE(p.employee_code, "")) LIKE ? OR LOWER(COALESCE(p.job_title, "")) LIKE ?)'
      );
      bindings.push(search, search, search, search);
    }
    if (deptId) {
      whereClauses.push('p.org_node_id = ?');
      bindings.push(deptId);
    }
    if (status) {
      whereClauses.push('u.status = ?');
      bindings.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow: any = db
      .query(
        `SELECT COUNT(u.id) as count
         FROM auth_users u
         LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
         ${whereSql};`
      )
      .get(...bindings);
    const total = countRow?.count || 0;

    const rows: any[] = db
      .query(
        `SELECT
          u.id, u.org_id, u.email, u.display_name, u.principal_type, u.status,
          u.must_change_password, u.token_version, u.created_at, u.updated_at,
          p.job_title, p.employee_code, p.org_node_id,
          n.name as department_name, n.path as department_path,
          r.related_to_id as manager_id,
          mgr.display_name as manager_name,
          mgr.email as manager_email
         FROM auth_users u
         LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
         LEFT JOIN auth_org_nodes n ON p.org_node_id = n.id
         LEFT JOIN auth_employee_relationships r ON u.id = r.employee_id AND r.relationship_type = 'LINE_MANAGER' AND r.is_primary = 1
         LEFT JOIN auth_users mgr ON r.related_to_id = mgr.id
         ${whereSql}
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?;`
      )
      .all(...bindings, limit, offset);

    const userIds = rows.map((r) => r.id);
    const rolesMap = new Map<string, string[]>();

    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const roleBindings: any[] = db
        .query(
          `SELECT principal_id, role_id FROM auth_iam_policy_bindings WHERE principal_id IN (${placeholders});`
        )
        .all(...userIds);
      for (const rb of roleBindings) {
        if (!rolesMap.has(rb.principal_id)) rolesMap.set(rb.principal_id, []);
        rolesMap.get(rb.principal_id)!.push(rb.role_id);
      }
    }

    const items: EmployeeListItem[] = rows.map((r) => ({
      ...r,
      roles: rolesMap.get(r.id) || ['roles/employee'],
    }));

    const departments: any[] = db
      .query(
        `SELECT id, name, code, path FROM auth_org_nodes ORDER BY path ASC, name ASC;`
      )
      .all();

    return { items, total, departments };
  }

  public getEmployeeHierarchy(userId: string) {
    const db = this.getDb();
    const user: any = db.query(`SELECT id, display_name, email FROM auth_users WHERE id = ?;`).get(userId);
    if (!user) return null;

    const managementChain: any[] = [];
    let currId = userId;
    const visited = new Set<string>([currId]);

    for (let i = 0; i < 10; i++) {
      const rel: any = db
        .query(
          `SELECT r.related_to_id, u.display_name, u.email, p.job_title
           FROM auth_employee_relationships r
           JOIN auth_users u ON r.related_to_id = u.id
           LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
           WHERE r.employee_id = ? AND r.relationship_type = 'LINE_MANAGER' AND r.is_primary = 1
           LIMIT 1;`
        )
        .get(currId);

      if (!rel || visited.has(rel.related_to_id)) break;
      visited.add(rel.related_to_id);
      managementChain.push({
        id: rel.related_to_id,
        display_name: rel.display_name,
        email: rel.email,
        job_title: rel.job_title || 'Manager',
      });
      currId = rel.related_to_id;
    }

    const directReports: any[] = db
      .query(
        `SELECT u.id, u.display_name, u.email, p.job_title, p.employee_code
         FROM auth_employee_relationships r
         JOIN auth_users u ON r.employee_id = u.id
         LEFT JOIN auth_employee_profiles p ON u.id = p.user_id
         WHERE r.related_to_id = ? AND r.relationship_type = 'LINE_MANAGER' AND r.is_primary = 1;`
      )
      .all(userId);

    return { user, managementChain, directReports };
  }

  public createEmployee(
    payload: {
      display_name: string;
      email: string;
      job_title: string;
      employee_code?: string;
      department_id?: string;
      manager_id?: string;
      role?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
      password?: string;
      must_change_password?: boolean;
      org_id?: string;
    },
    actorId: string = 'auth-service',
    ip: string = '127.0.0.1'
  ) {
    if (!payload.email || !payload.display_name) {
      throw new Error('Name and email are required');
    }

    const emailClean = payload.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      throw new Error(`Invalid email address format: "${payload.email}"`);
    }

    const db = this.getDb();
    const existing = db.query('SELECT id FROM auth_users WHERE email = ?;').get(emailClean);
    if (existing) {
      throw new Error(`Employee with email "${emailClean}" already exists`);
    }

    const org: any = db.query('SELECT id FROM auth_organizations LIMIT 1;').get();
    const orgId = payload.org_id || org?.id || 'org-sg-forge-global';
    const userId = `usr-${randomBytes(6).toString('hex')}`;
    const now = Date.now();
    const rawPassword = payload.password || 'password123';
    const { hash, salt } = hashPassword(rawPassword);

    db.transaction(() => {
      db.run(
        `INSERT INTO auth_users (id, org_id, email, password_hash, salt, display_name, principal_type, status, must_change_password, token_version, custom_attributes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'EMPLOYEE', ?, ?, 1, '{}', ?, ?);`,
        [userId, orgId, emailClean, hash, salt, payload.display_name.trim(), payload.status || 'ACTIVE', payload.must_change_password !== false ? 1 : 0, now, now]
      );
      db.run(
        `INSERT INTO auth_employee_profiles (user_id, org_node_id, job_title, employee_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);`,
        [userId, payload.department_id || null, payload.job_title || 'Employee', payload.employee_code || null, now, now]
      );
      if (payload.manager_id) {
        const relId = `rel-${randomBytes(6).toString('hex')}`;
        db.run(`INSERT INTO auth_employee_relationships (id, org_id, employee_id, related_to_id, relationship_type, is_primary) VALUES (?, ?, ?, ?, 'LINE_MANAGER', 1);`, [relId, orgId, userId, payload.manager_id]);
      }
      const roleId = payload.role || 'roles/employee';
      const bindingId = `bind-${randomBytes(6).toString('hex')}`;
      db.run(`INSERT INTO auth_iam_policy_bindings (id, org_id, principal_id, role_id, resource_scope, created_at) VALUES (?, ?, ?, ?, 'org/*', ?);`, [bindingId, orgId, userId, roleId, now]);
      
      logAuditEvent({
        orgId,
        actorId,
        action: 'EMPLOYEE_CREATED',
        resource: `auth/employees/${userId}`,
        status: 'SUCCESS',
        details: { email: emailClean, title: payload.job_title, role: roleId },
        ip,
      });
    })();

    logger.info(`Successfully created employee "${payload.display_name}" (${emailClean})`);
    return { id: userId, email: emailClean, display_name: payload.display_name };
  }

  public updateEmployee(
    userId: string,
    payload: {
      display_name?: string;
      job_title?: string;
      employee_code?: string;
      department_id?: string | null;
      manager_id?: string | null;
      status?: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
      role?: string;
    },
    actorId: string = 'auth-service',
    ip: string = '127.0.0.1'
  ) {
    const db = this.getDb();
    const user: any = db.query('SELECT id, org_id FROM auth_users WHERE id = ?;').get(userId);
    if (!user) throw new Error(`Employee with ID "${userId}" not found`);

    const now = Date.now();

    db.transaction(() => {
      if (payload.display_name || payload.status) {
        const updates: string[] = ['updated_at = ?'];
        const params: any[] = [now];
        if (payload.display_name) { updates.push('display_name = ?'); params.push(payload.display_name.trim()); }
        if (payload.status) {
          updates.push('status = ?'); params.push(payload.status);
          if (payload.status === 'SUSPENDED') updates.push('token_version = token_version + 1');
        }
        params.push(userId);
        db.run(`UPDATE auth_users SET ${updates.join(', ')} WHERE id = ?;`, params);
      }

      if (payload.job_title !== undefined || payload.employee_code !== undefined || payload.department_id !== undefined) {
        const profUpdates: string[] = ['updated_at = ?'];
        const profParams: any[] = [now];
        if (payload.job_title !== undefined) { profUpdates.push('job_title = ?'); profParams.push(payload.job_title); }
        if (payload.employee_code !== undefined) { profUpdates.push('employee_code = ?'); profParams.push(payload.employee_code); }
        if (payload.department_id !== undefined) { profUpdates.push('org_node_id = ?'); profParams.push(payload.department_id); }
        profParams.push(userId);
        db.run(`UPDATE auth_employee_profiles SET ${profUpdates.join(', ')} WHERE user_id = ?;`, profParams);
      }

      if (payload.manager_id !== undefined) {
        db.run(`DELETE FROM auth_employee_relationships WHERE employee_id = ? AND relationship_type = 'LINE_MANAGER';`, [userId]);
        if (payload.manager_id) {
          const relId = `rel-${randomBytes(6).toString('hex')}`;
          db.run(`INSERT INTO auth_employee_relationships (id, org_id, employee_id, related_to_id, relationship_type, is_primary) VALUES (?, ?, ?, ?, 'LINE_MANAGER', 1);`, [relId, user.org_id, userId, payload.manager_id]);
        }
      }

      if (payload.role) {
        db.run(`DELETE FROM auth_iam_policy_bindings WHERE principal_id = ?;`, [userId]);
        const bindingId = `bind-${randomBytes(6).toString('hex')}`;
        db.run(`INSERT INTO auth_iam_policy_bindings (id, org_id, principal_id, role_id, resource_scope, created_at) VALUES (?, ?, ?, ?, 'org/*', ?);`, [bindingId, user.org_id, userId, payload.role, now]);
      }

      logAuditEvent({
        orgId: user.org_id,
        actorId,
        action: 'EMPLOYEE_UPDATED',
        resource: `auth/employees/${userId}`,
        status: 'SUCCESS',
        details: payload,
        ip,
      });
    })();

    return { status: 'ok', id: userId };
  }

  public revokeSessions(userId: string, actorId: string = 'auth-service', ip: string = '127.0.0.1') {
    const db = this.getDb();
    const user: any = db.query('SELECT id, org_id FROM auth_users WHERE id = ?;').get(userId);
    if (!user) throw new Error(`Employee with ID "${userId}" not found`);

    db.run('UPDATE auth_users SET token_version = token_version + 1, updated_at = ? WHERE id = ?;', [Date.now(), userId]);
    db.run('UPDATE auth_sessions SET is_revoked = 1 WHERE user_id = ?;', [userId]);

    logAuditEvent({
      orgId: user.org_id,
      actorId,
      action: 'EMPLOYEE_REVOKED',
      resource: `auth/employees/${userId}`,
      status: 'SUCCESS',
      details: { userId },
      ip,
    });

    return { status: 'ok', message: 'All active sessions invalidated' };
  }

  public getFullOrgTree(orgId: string = 'org_main') {
    const listRes = this.listEmployees({ limit: 1000 });
    const employees = listRes.items;
    const byId = new Map<string, any>();
    const roots: any[] = [];

    for (const emp of employees) {
      byId.set(emp.id, { ...emp, children: [] });
    }

    for (const emp of employees) {
      const node = byId.get(emp.id)!;
      if (emp.manager_id && byId.has(emp.manager_id) && emp.manager_id !== emp.id) {
        byId.get(emp.manager_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return { roots, total: employees.length, departments: listRes.departments };
  }

  public bulkAction(
    actionOrOrgId: string,
    userIdsOrAction: any,
    maybeUserIds?: string[],
    actorId: string = 'auth-service',
    ip: string = '127.0.0.1'
  ) {
    let action = Array.isArray(userIdsOrAction) ? actionOrOrgId : userIdsOrAction;
    const userIds = Array.isArray(userIdsOrAction) ? userIdsOrAction : (maybeUserIds || []);
    if (action === 'revoke_sessions') action = 'revoke';
    if (!userIds || userIds.length === 0) return { status: 'error', error: 'No user IDs provided', processed: 0 };

    const db = this.getDb();
    const now = Date.now();
    db.transaction(() => {
      for (const uid of userIds) {
        if (action === 'revoke' || action === 'suspend') {
          db.run('UPDATE auth_users SET token_version = token_version + 1, updated_at = ? WHERE id = ?;', [now, uid]);
          db.run('UPDATE auth_sessions SET is_revoked = 1 WHERE user_id = ?;', [uid]);
          if (action === 'suspend') db.run("UPDATE auth_users SET status = 'SUSPENDED' WHERE id = ?;", [uid]);
        } else if (action === 'activate') {
          db.run("UPDATE auth_users SET status = 'ACTIVE', updated_at = ? WHERE id = ?;", [now, uid]);
        }
      }

      logAuditEvent({
        orgId: 'org-sg-forge-global',
        actorId,
        action: 'EMPLOYEE_BULK_ACTION',
        resource: 'auth/employees',
        status: 'SUCCESS',
        details: { action, count: userIds.length, userIds },
        ip,
      });
    })();

    return { status: 'ok', processed: userIds.length };
  }

  public batchImport(
    records: BatchImportRecord[],
    options: BatchImportOptions = {},
    actorId: string = 'auth-service',
    ip: string = '127.0.0.1'
  ) {
    const db = this.getDb();
    const summary = executeBatchImport(db, records, options);

    if (!options.dryRun && summary.created > 0) {
      logAuditEvent({
        orgId: 'org-sg-forge-global',
        actorId,
        action: 'EMPLOYEE_BATCH_IMPORTED',
        resource: 'auth/employees',
        status: 'SUCCESS',
        details: { total: summary.total, created: summary.created, updated: summary.updated },
        ip,
      });
    }

    return summary;
  }
}

/**
 * employeeController
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export const employeeController = new EmployeeController();
