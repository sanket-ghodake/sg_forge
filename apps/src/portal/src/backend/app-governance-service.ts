/**
 * @forge/portal - Enterprise Application Governance & Administration Service (2026 LTS)
 * Manages designated application administrators, enrollment access policies, SLAs,
 * and infrastructure routing controls with dual Super Admin / Department Admin governance.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import type { Database } from 'bun:sqlite';
import { randomBytes } from 'node:crypto';
import { createLogger, getDatabaseClient, bindAppPolicyApi } from '@forge/sdk';

const logger = createLogger('app-governance-service');

/**
 * AppAdminRecord
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AppAdminRecord {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userTitle: string;
  userDept: string;
  roleType: 'PRIMARY_OWNER' | 'APPROVER' | 'ADMIN';
  avatarInitial: string;
  assignedBy: string;
  assignedAt: number;
}

/**
 * AppGovernancePolicyRecord
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AppGovernancePolicyRecord {
  appId: string;
  accessMode: 'OPEN' | 'REQUEST_REQUIRED' | 'RESTRICTED';
  requiredRole: string;
  departmentOwner: string;
  requireJustification: boolean;
  slaHours: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  ingressPath?: string;
  internalPort?: number;
  updatedAt: number;
  updatedBy: string;
}

/**
 * AppGovernanceSummary
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AppGovernanceSummary {
  appId: string;
  policy: AppGovernancePolicyRecord;
  admins: AppAdminRecord[];
  metrics: {
    activeUsersCount: number;
    pendingRequestsCount: number;
    slaCompliancePct?: number;
  };
}

export { getAppActiveUsers, revokeUserAppAccess, type AppEntitledUserRecord } from './app-users-service';

function getDatabase(): Database {
  const db = getDatabaseClient('portal.db');
  initGovernanceTables(db);
  return db;
}

function initGovernanceTables(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_app_admins (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_title TEXT NOT NULL,
      user_dept TEXT NOT NULL,
      role_type TEXT NOT NULL DEFAULT 'ADMIN',
      avatar_initial TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_at INTEGER NOT NULL,
      UNIQUE(app_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS portal_app_governance_policies (
      app_id TEXT PRIMARY KEY,
      access_mode TEXT NOT NULL DEFAULT 'REQUEST_REQUIRED',
      required_role TEXT DEFAULT 'roles/employee',
      department_owner TEXT NOT NULL,
      require_justification INTEGER NOT NULL DEFAULT 1,
      sla_hours INTEGER NOT NULL DEFAULT 24,
      status TEXT NOT NULL DEFAULT 'ONLINE',
      ingress_path TEXT,
      internal_port INTEGER,
      updated_at INTEGER NOT NULL,
      updated_by TEXT NOT NULL
    );
  `);

  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decided_by TEXT;'); } catch {}
  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decided_at INTEGER;'); } catch {}
  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decision_notes TEXT;'); } catch {}

  const countRow = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM portal_app_admins').get();
  if (!countRow || countRow.count === 0) {
    seedInitialGovernance(db);
  }
}

function seedInitialGovernance(db: Database): void {
  const now = Date.now();
  const seedApps = [
    { appId: 'telemetry', owner: 'Infrastructure & SRE', mode: 'REQUEST_REQUIRED' as const, role: 'roles/admin', path: '/telemetry', port: 3002, admins: [{ name: 'Alex Rivera', title: 'Principal Reliability Engineer', email: 'alex.rivera@forge.internal', roleType: 'PRIMARY_OWNER' as const, init: 'AR' }, { name: 'Marcus Vance', title: 'Director of Infrastructure', email: 'marcus.vance@forge.internal', roleType: 'ADMIN' as const, init: 'MV' }] },
    { appId: 'billing', owner: 'Finance & Treasury', mode: 'REQUEST_REQUIRED' as const, role: 'roles/billing.admin', path: '/billing', port: 3003, admins: [{ name: 'Sarah Chen', title: 'Financial Operations Lead', email: 'sarah.chen@forge.internal', roleType: 'PRIMARY_OWNER' as const, init: 'SC' }, { name: 'Elena Rostova', title: 'Senior Treasury Manager', email: 'elena.rostova@forge.internal', roleType: 'ADMIN' as const, init: 'ER' }] },
    { appId: 'expenses', owner: 'Finance Team', mode: 'OPEN' as const, role: 'roles/employee', path: '/expenses', port: 3001, admins: [{ name: 'Sarah Chen', title: 'VP of Finance & Operations', email: 'sarah.chen@forge.internal', roleType: 'PRIMARY_OWNER' as const, init: 'SC' }, { name: 'Priya Sharma', title: 'People & Payroll Ops Lead', email: 'priya.sharma@forge.internal', roleType: 'ADMIN' as const, init: 'PS' }] },
    { appId: 'code', owner: 'Core Engineering', mode: 'OPEN' as const, role: 'roles/employee', path: '/code', port: 3004, admins: [{ name: 'David Kim', title: 'VP of Engineering', email: 'david.kim@forge.internal', roleType: 'PRIMARY_OWNER' as const, init: 'DK' }, { name: 'Alex Rivera', title: 'Staff Platform Architect', email: 'alex.rivera@forge.internal', roleType: 'ADMIN' as const, init: 'AR' }] },
  ];

  for (const a of seedApps) {
    db.run(
      `INSERT OR REPLACE INTO portal_app_governance_policies 
       (app_id, access_mode, required_role, department_owner, require_justification, sla_hours, status, ingress_path, internal_port, updated_at, updated_by)
       VALUES (?, ?, ?, ?, 1, 24, 'ONLINE', ?, ?, ?, 'system_seed');`,
      [a.appId, a.mode, a.role, a.owner, a.path, a.port, now]
    );

    for (const adm of a.admins) {
      const adminId = `adm-${randomBytes(4).toString('hex')}`;
      const fakeUserId = `usr_${adm.name.toLowerCase().replace(/\s+/g, '_')}`;
      db.run(
        `INSERT OR IGNORE INTO portal_app_admins
         (id, app_id, user_id, user_name, user_email, user_title, user_dept, role_type, avatar_initial, assigned_by, assigned_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'system_bootstrap', ?);`,
        [adminId, a.appId, fakeUserId, adm.name, adm.email, adm.title, a.owner, adm.roleType, adm.init, now]
      );
    }
  }
}

/**
 * Get full governance summary for an application
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getAppGovernance(appId: string): AppGovernanceSummary {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');

  let policy = db.query<any, [string]>('SELECT * FROM portal_app_governance_policies WHERE app_id = ?').get(cleanAppId);
  if (!policy) {
    policy = {
      app_id: cleanAppId,
      access_mode: 'REQUEST_REQUIRED',
      required_role: 'roles/employee',
      department_owner: 'Engineering & Platform',
      require_justification: 1,
      sla_hours: 24,
      status: 'ONLINE',
      ingress_path: `/${cleanAppId}`,
      internal_port: 3000,
      updated_at: Date.now(),
      updated_by: 'system_default',
    };
  }

  const rawAdmins = db.query<any, [string]>('SELECT * FROM portal_app_admins WHERE app_id = ? ORDER BY assigned_at ASC').all(cleanAppId);
  const admins: AppAdminRecord[] = rawAdmins.map((r) => ({
    id: r.id,
    appId: r.app_id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    userTitle: r.user_title,
    userDept: r.user_dept,
    roleType: r.role_type as any,
    avatarInitial: r.avatar_initial,
    assignedBy: r.assigned_by,
    assignedAt: r.assigned_at,
  }));

  const pendingReq = db.query<{ count: number }, [string, string]>(
    "SELECT COUNT(*) as count FROM portal_app_access_requests WHERE (app_id = ? OR app_id = ?) AND status = 'PENDING'"
  ).get(cleanAppId, `apps/${cleanAppId}`);

  const approvedUsersCount = db.query<{ count: number }, [string, string]>(
    "SELECT COUNT(DISTINCT user_id) as count FROM portal_app_access_requests WHERE (app_id = ? OR app_id = ?) AND status = 'APPROVED'"
  ).get(cleanAppId, `apps/${cleanAppId}`)?.count || 0;

  // Real SLA compliance % calculation
  const decided = db.query<any, [string, string]>(
    "SELECT created_at, decided_at FROM portal_app_access_requests WHERE (app_id = ? OR app_id = ?) AND status IN ('APPROVED', 'REJECTED') AND decided_at IS NOT NULL"
  ).all(cleanAppId, `apps/${cleanAppId}`);

  const targetSlaMs = (policy.sla_hours || 24) * 3600 * 1000;
  const withinSla = decided.filter((r) => (r.decided_at - r.created_at) <= targetSlaMs).length;
  const slaCompliancePct = decided.length > 0 ? Math.round((withinSla / decided.length) * 1000) / 10 : 100;

  return {
    appId: cleanAppId,
    policy: {
      appId: policy.app_id,
      accessMode: policy.access_mode,
      requiredRole: policy.required_role || 'roles/employee',
      departmentOwner: policy.department_owner,
      requireJustification: Boolean(policy.require_justification),
      slaHours: policy.sla_hours || 24,
      status: policy.status || 'ONLINE',
      ingressPath: policy.ingress_path || `/${cleanAppId}`,
      internalPort: policy.internal_port || 3000,
      updatedAt: policy.updated_at,
      updatedBy: policy.updated_by,
    },
    admins,
    metrics: {
      activeUsersCount: approvedUsersCount + admins.length,
      pendingRequestsCount: pendingReq ? pendingReq.count : 0,
      slaCompliancePct,
    },
  };
}

/**
 * Add a new administrator to an application
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export async function addAppAdmin(
  appId: string,
  admin: {
    userId: string;
    userName: string;
    userEmail: string;
    userTitle?: string;
    userDept?: string;
    roleType?: 'PRIMARY_OWNER' | 'APPROVER' | 'ADMIN';
    avatarInitial?: string;
  },
  actorId: string = 'system',
  options: { headers?: Record<string, string> } = {}
): Promise<AppAdminRecord> {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');
  const id = `adm-${randomBytes(4).toString('hex')}`;
  const now = Date.now();
  const roleType = admin.roleType || 'ADMIN';
  const initial = admin.avatarInitial || admin.userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  db.run(
    `INSERT OR REPLACE INTO portal_app_admins
     (id, app_id, user_id, user_name, user_email, user_title, user_dept, role_type, avatar_initial, assigned_by, assigned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      cleanAppId,
      admin.userId,
      admin.userName,
      admin.userEmail,
      admin.userTitle || 'Team Administrator',
      admin.userDept || 'Operations',
      roleType,
      initial,
      actorId,
      now,
    ]
  );

  try {
    await bindAppPolicyApi({ userId: admin.userId, appId: cleanAppId, roleId: 'roles/admin' }, options);
  } catch (err) {
    logger.warn('Auth IAM policy binding note during admin assignment:', { error: String(err) });
  }

  return {
    id,
    appId: cleanAppId,
    userId: admin.userId,
    userName: admin.userName,
    userEmail: admin.userEmail,
    userTitle: admin.userTitle || 'Team Administrator',
    userDept: admin.userDept || 'Operations',
    roleType,
    avatarInitial: initial,
    assignedBy: actorId,
    assignedAt: now,
  };
}

/**
 * Revoke an administrator from an application with safety invariant check
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function removeAppAdmin(appId: string, userId: string, _actorId: string): { ok: boolean; remaining: number } {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');

  const admins = db.query<any, [string]>('SELECT id, user_id FROM portal_app_admins WHERE app_id = ?').all(cleanAppId);
  if (admins.length <= 1) {
    throw new Error('Safety Invariant: Cannot remove the last administrator. Appoint another administrator before revoking.');
  }

  db.run('DELETE FROM portal_app_admins WHERE app_id = ? AND user_id = ?;', [cleanAppId, userId]);
  const remaining = admins.length - 1;
  return { ok: true, remaining };
}

/**
 * Update access and governance policy for an application
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function updateAppPolicy(
  appId: string,
  updates: Partial<AppGovernancePolicyRecord>,
  actorId: string,
  isSuperAdmin: boolean
): AppGovernancePolicyRecord {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');
  const existing = getAppGovernance(cleanAppId).policy;
  const now = Date.now();

  const accessMode = updates.accessMode || existing.accessMode;
  const requiredRole = updates.requiredRole || existing.requiredRole;
  const departmentOwner = updates.departmentOwner || existing.departmentOwner;
  const requireJustification = updates.requireJustification !== undefined ? (updates.requireJustification ? 1 : 0) : existing.requireJustification ? 1 : 0;
  const slaHours = updates.slaHours !== undefined ? Number(updates.slaHours) : existing.slaHours;

  let status = existing.status;
  let ingressPath = existing.ingressPath;
  let internalPort = existing.internalPort;

  if (isSuperAdmin) {
    if (updates.status) status = updates.status;
    if (updates.ingressPath) ingressPath = updates.ingressPath;
    if (updates.internalPort !== undefined) internalPort = Number(updates.internalPort);
  }

  db.run(
    `INSERT OR REPLACE INTO portal_app_governance_policies
     (app_id, access_mode, required_role, department_owner, require_justification, sla_hours, status, ingress_path, internal_port, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      cleanAppId,
      accessMode,
      requiredRole || 'roles/employee',
      departmentOwner || null,
      requireJustification,
      slaHours,
      status,
      ingressPath || null,
      internalPort ?? null,
      now,
      actorId,
    ]
  );

  return {
    appId: cleanAppId,
    accessMode,
    requiredRole,
    departmentOwner,
    requireJustification: Boolean(requireJustification),
    slaHours,
    status,
    ingressPath,
    internalPort,
    updatedAt: now,
    updatedBy: actorId,
  };
}

export { getAppAccessRequestsHistory, type AppAccessRequestHistoryItem } from './app-history-service';

/**
 * Retrieve all live application policies and administrators from the database
 * to dynamically hydrate catalog data without hardcoded mocks.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getLiveAppGovernanceData(): {
  policies: Map<string, AppGovernancePolicyRecord>;
  admins: Map<string, AppAdminRecord[]>;
} {
  const db = getDatabase();
  const policies = new Map<string, AppGovernancePolicyRecord>();
  const admins = new Map<string, AppAdminRecord[]>();

  try {
    const rawPolicies = db.query<any, []>('SELECT * FROM portal_app_governance_policies').all();
    for (const p of rawPolicies) {
      policies.set(p.app_id, {
        appId: p.app_id,
        accessMode: p.access_mode,
        requiredRole: p.required_role || 'roles/employee',
        departmentOwner: p.department_owner,
        requireJustification: Boolean(p.require_justification),
        slaHours: p.sla_hours || 24,
        status: p.status || 'ONLINE',
        ingressPath: p.ingress_path,
        internalPort: p.internal_port,
        updatedAt: p.updated_at,
        updatedBy: p.updated_by,
      });
    }

    const rawAdmins = db.query<any, []>('SELECT * FROM portal_app_admins ORDER BY assigned_at ASC').all();
    for (const a of rawAdmins) {
      const list = admins.get(a.app_id) || [];
      list.push({
        id: a.id,
        appId: a.app_id,
        userId: a.user_id,
        userName: a.user_name,
        userEmail: a.user_email,
        userTitle: a.user_title,
        userDept: a.user_dept,
        roleType: a.role_type,
        avatarInitial: a.avatar_initial,
        assignedBy: a.assigned_by,
        assignedAt: a.assigned_at,
      });
      admins.set(a.app_id, list);
    }
  } catch (err) {
    logger.warn('Failed to query live app governance data:', { error: String(err) });
  }

  return { policies, admins };
}

