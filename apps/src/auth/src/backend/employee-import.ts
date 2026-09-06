/**
 * @forge/auth - Employee Bulk Import Engine (2026 LTS)
 * High-performance batch CSV/JSON importer with dry-run validation and atomic transactions.
 */

import { Database } from 'bun:sqlite';
import { randomBytes } from 'node:crypto';
import { createLogger } from '@forge/sdk';
import { hashPassword } from './crypto';

const logger = createLogger('auth-import');

/**
 * BatchImportRecord
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface BatchImportRecord {
  display_name: string;
  email: string;
  job_title?: string;
  employee_code?: string;
  department?: string;
  manager_email?: string;
  role?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
}

/**
 * BatchImportOptions
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface BatchImportOptions {
  autoCreateDepartments?: boolean;
  duplicateAction?: 'update' | 'skip' | 'error';
  dryRun?: boolean;
}

/**
 * executeBatchImport
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export function executeBatchImport(
  db: Database,
  records: BatchImportRecord[],
  options: BatchImportOptions = {}
) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('No records provided for import');
  }
  if (records.length > 5000) {
    throw new Error('Batch exceeds maximum limit of 5,000 records');
  }

  const org: any = db.query('SELECT id FROM auth_organizations LIMIT 1;').get();
  const orgId = org?.id || 'org-sg-forge-global';
  const now = Date.now();

  // Cache existing nodes & users for lookup
  const existingNodes: any[] = db.query('SELECT id, name, path FROM auth_org_nodes;').all();
  const nodeMap = new Map<string, string>();
  for (const n of existingNodes) {
    nodeMap.set(n.name.toLowerCase(), n.id);
    if (n.path) nodeMap.set(n.path.toLowerCase(), n.id);
  }

  const existingUsers: any[] = db.query('SELECT id, email FROM auth_users;').all();
  const userEmailMap = new Map<string, string>();
  for (const u of existingUsers) {
    userEmailMap.set(u.email.toLowerCase(), u.id);
  }

  const validation = {
    total: records.length,
    valid: 0,
    invalid: 0,
    errors: [] as { row: number; email?: string; error: string }[],
    createdDepartments: [] as string[],
    dryRun: !!options.dryRun,
  };

  const validRows: Array<{
    email: string;
    name: string;
    title: string;
    code: string | null;
    nodeId: string | null;
    role: string;
    status: string;
    managerEmail: string | null;
  }> = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 1. Validation Phase
  records.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = String(row.display_name || '').trim();
    const email = String(row.email || '').trim().toLowerCase();

    if (!name) {
      validation.invalid++;
      validation.errors.push({ row: rowNum, error: 'Missing employee display name' });
      return;
    }
    if (!email || !emailRegex.test(email)) {
      validation.invalid++;
      validation.errors.push({ row: rowNum, email, error: `Invalid email address: "${email}"` });
      return;
    }

    let nodeId: string | null = null;
    const deptName = String(row.department || '').trim();
    if (deptName) {
      const lowerDept = deptName.toLowerCase();
      if (nodeMap.has(lowerDept)) {
        nodeId = nodeMap.get(lowerDept)!;
      } else if (options.autoCreateDepartments !== false) {
        const newDeptId = `dept-${randomBytes(6).toString('hex')}`;
        const slug = deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const path = `/root/${slug}`;
        if (!options.dryRun) {
          db.run(
            `INSERT INTO auth_org_nodes (id, org_id, type_id, parent_id, name, code, path, created_at, updated_at)
             VALUES (?, ?, 'type_department', 'node_root', ?, ?, ?, ?, ?);`,
            [newDeptId, orgId, deptName, slug.toUpperCase(), path, now, now]
          );
        }
        nodeMap.set(lowerDept, newDeptId);
        nodeId = newDeptId;
        validation.createdDepartments.push(deptName);
      }
    }

    validation.valid++;
    validRows.push({
      email,
      name,
      title: row.job_title || 'Employee',
      code: row.employee_code || null,
      nodeId,
      role: row.role || 'roles/employee',
      status: row.status || 'ACTIVE',
      managerEmail: row.manager_email ? String(row.manager_email).trim().toLowerCase() : null,
    });
  });

  if (options.dryRun || validRows.length === 0) {
    return {
      ...validation,
      created: 0,
      updated: 0,
      skipped: 0,
    };
  }

  // 2. Execution Phase (Atomic Transaction)
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const defaultPassword = 'password123';
  const { hash, salt } = hashPassword(defaultPassword);

  db.transaction(() => {
    // A. Insert or update users & profiles
    for (const r of validRows) {
      if (userEmailMap.has(r.email)) {
        const existingUserId = userEmailMap.get(r.email)!;
        if (options.duplicateAction === 'error') {
          throw new Error(`Duplicate employee email found: ${r.email}`);
        } else if (options.duplicateAction === 'skip') {
          skipped++;
          continue;
        }

        // Default: Update
        db.run(
          `UPDATE auth_users SET display_name = ?, status = ?, updated_at = ? WHERE id = ?;`,
          [r.name, r.status, now, existingUserId]
        );
        db.run(
          `UPDATE auth_employee_profiles SET job_title = ?, employee_code = ?, org_node_id = ?, updated_at = ? WHERE user_id = ?;`,
          [r.title, r.code, r.nodeId, now, existingUserId]
        );
        updated++;
      } else {
        // Create new
        const newUserId = `usr-${randomBytes(6).toString('hex')}`;
        db.run(
          `INSERT INTO auth_users (id, org_id, email, password_hash, salt, display_name, principal_type, status, must_change_password, token_version, custom_attributes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'EMPLOYEE', ?, 1, 1, '{}', ?, ?);`,
          [newUserId, orgId, r.email, hash, salt, r.name, r.status, now, now]
        );
        db.run(
          `INSERT INTO auth_employee_profiles (user_id, org_node_id, job_title, employee_code, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [newUserId, r.nodeId, r.title, r.code, now, now]
        );
        const bindingId = `bind-${randomBytes(6).toString('hex')}`;
        db.run(
          `INSERT INTO auth_iam_policy_bindings (id, org_id, principal_id, role_id, resource_scope, created_at)
           VALUES (?, ?, ?, ?, 'org/*', ?);`,
          [bindingId, orgId, newUserId, r.role, now]
        );
        userEmailMap.set(r.email, newUserId);
        created++;
      }
    }

    // B. Link Manager Relationships
    for (const r of validRows) {
      if (r.managerEmail && userEmailMap.has(r.managerEmail)) {
        const employeeId = userEmailMap.get(r.email)!;
        const managerId = userEmailMap.get(r.managerEmail)!;

        if (employeeId !== managerId) {
          db.run(
            `DELETE FROM auth_employee_relationships WHERE employee_id = ? AND relationship_type = 'LINE_MANAGER';`,
            [employeeId]
          );
          const relId = `rel-${randomBytes(6).toString('hex')}`;
          db.run(
            `INSERT INTO auth_employee_relationships (id, org_id, employee_id, related_to_id, relationship_type, is_primary)
             VALUES (?, ?, ?, ?, 'LINE_MANAGER', 1);`,
            [relId, orgId, employeeId, managerId]
          );
        }
      }
    }
  })();

  logger.info(`Batch import finished: ${created} created, ${updated} updated, ${skipped} skipped, ${validation.invalid} invalid`);

  return {
    total: records.length,
    valid: validRows.length,
    invalid: validation.invalid,
    errors: validation.errors,
    created,
    updated,
    skipped,
    createdDepartments: validation.createdDepartments,
    dryRun: !!options.dryRun,
  };
}
