/**
 * @forge/auth - Generic Multi-Tenant Org & IAM Seed Generator (2026 LTS)
 * Populates standard organizational trees, diverse GCP-style Admin personas, and employees.
 * Guarantees default Superadmin, Admin, HR, and IT personas with dedicated IAM roles.
 * Default credentials: password123 with mandatory first-time password reset.
 */

import { getAuthDb } from './db';
import { hashPassword } from '../backend/crypto';
import { createLogger, isTestEnvironment, loadBrandConfig } from '@forge/sdk';

const logger = createLogger('auth-seed');

/**
 * DEFAULT_PASSWORD
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export const DEFAULT_PASSWORD = 'password123';

/**
 * seedAuthDatabase
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export function seedAuthDatabase(force: boolean = false): void {
  const db = getAuthDb();

  // Check if already seeded
  const existingOrg = db.query('SELECT id FROM auth_organizations LIMIT 1;').get() as { id: string } | null;
  if (existingOrg && !force) {
    logger.info('Auth database already seeded. Skipping initial seeding.');
    return;
  }

  if (force) {
    // Safety invariant: NEVER force-wipe live development or production databases
    if (!isTestEnvironment() && process.env.ALLOW_DB_WIPE !== 'true') {
      logger.warn('Blocked attempt to force-wipe non-test database! Set ALLOW_DB_WIPE=true to override.');
      return;
    }
    db.run('DELETE FROM auth_audit_logs;');
    db.run('DELETE FROM auth_sessions;');
    db.run('DELETE FROM auth_iam_policy_bindings;');
    db.run('DELETE FROM auth_iam_role_permissions;');
    db.run('DELETE FROM auth_iam_roles;');
    db.run('DELETE FROM auth_iam_permissions;');
    db.run('DELETE FROM auth_employee_relationships;');
    db.run('DELETE FROM auth_employee_profiles;');
    db.run('DELETE FROM auth_users;');
    db.run('DELETE FROM auth_org_nodes;');
    db.run('DELETE FROM auth_org_node_types;');
    db.run('DELETE FROM auth_organizations;');
  }

  logger.info('Seeding Auth database with generic Org structure, GCP-style IAM, and test personas...');

  const now = Date.now();
  const brand = loadBrandConfig();
  const brandName = brand.name || 'AG Dashboard';
  const brandTagline = brand.tagline || 'Modular Corporate Portal & Identity Gateway';

  const orgId = 'org-sg-forge-global';
  const { hash: defaultHash, salt: defaultSalt } = hashPassword(DEFAULT_PASSWORD);

  const domain = process.env.AUTH_ORG_DOMAIN || brand.domain || 'forge.internal';

  db.transaction(() => {
    // 1. Organization
    db.run(
      `INSERT INTO auth_organizations (id, name, domain, brand_name, brand_tagline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [orgId, brandName, domain, brandName, brandTagline, now, now]
    );

    // 2. Generic Org Node Types (Dynamic levels)
    const nodeTypes = [
      { id: 'type_company', name: 'ORGANIZATION', level_order: 0, desc: 'Root Enterprise Entity' },
      { id: 'type_division', name: 'DIVISION', level_order: 1, desc: 'Strategic Business Unit' },
      { id: 'type_department', name: 'DEPARTMENT', level_order: 2, desc: 'Functional Department' },
      { id: 'type_squad', name: 'SQUAD', level_order: 3, desc: 'Cross-functional Execution Team' },
    ];

    for (const nt of nodeTypes) {
      db.run(
        `INSERT INTO auth_org_node_types (id, org_id, name, level_order, description) VALUES (?, ?, ?, ?, ?);`,
        [nt.id, orgId, nt.name, nt.level_order, nt.desc]
      );
    }

    // 3. Generic Org Nodes (Tree with materialized paths)
    const nodes = [
      { id: 'node_root', type_id: 'type_company', name: brandName, code: 'HQ', parent_id: null, path: '/root' },
      { id: 'node_div_tech', type_id: 'type_division', name: 'Technology & Engineering', code: 'TECH', parent_id: 'node_root', path: '/root/tech' },
      { id: 'node_div_fin', type_id: 'type_division', name: 'Finance & Operations', code: 'FINOPS', parent_id: 'node_root', path: '/root/finops' },
      { id: 'node_dept_core_eng', type_id: 'type_department', name: 'Core Platform Engineering', code: 'ENG-CORE', parent_id: 'node_div_tech', path: '/root/tech/eng-core' },
      { id: 'node_dept_sec_ops', type_id: 'type_department', name: 'Security & Cloud Operations', code: 'SEC-OPS', parent_id: 'node_div_tech', path: '/root/tech/sec-ops' },
      { id: 'node_dept_it', type_id: 'type_department', name: 'IT Infrastructure & Workplace Systems', code: 'IT-SYS', parent_id: 'node_div_tech', path: '/root/tech/it' },
      { id: 'node_dept_hr', type_id: 'type_department', name: 'Human Resources & People Operations', code: 'HR-PEOPLE', parent_id: 'node_div_fin', path: '/root/finops/hr' },
      { id: 'node_dept_accounting', type_id: 'type_department', name: 'Accounting & Billing', code: 'FIN-ACC', parent_id: 'node_div_fin', path: '/root/finops/accounting' },
      { id: 'node_squad_backend', type_id: 'type_squad', name: 'Backend & Infrastructure Squad', code: 'SQ-BE', parent_id: 'node_dept_core_eng', path: '/root/tech/eng-core/be' },
    ];

    for (const node of nodes) {
      db.run(
        `INSERT INTO auth_org_nodes (id, org_id, type_id, name, code, parent_id, path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [node.id, orgId, node.type_id, node.name, node.code, node.parent_id, node.path, now, now]
      );
    }

    // 4. IAM Permissions (<service>.<resource>.<action>)
    const permissions = [
      // Core Admin & IAM
      { id: 'auth.users.read', service: 'auth', resource: 'users', action: 'read', desc: 'View user directory' },
      { id: 'auth.users.write', service: 'auth', resource: 'users', action: 'write', desc: 'Create, update & suspend users' },
      { id: 'iam.roles.read', service: 'iam', resource: 'roles', action: 'read', desc: 'View IAM roles and policies' },
      { id: 'iam.roles.grant', service: 'iam', resource: 'roles', action: 'grant', desc: 'Grant policy bindings and privileges' },
      // HR & People Management
      { id: 'hr.employees.manage', service: 'hr', resource: 'employees', action: 'manage', desc: 'Manage employee profiles, onboarding and org tree' },
      // IT & Workplace Management
      { id: 'it.systems.manage', service: 'it', resource: 'systems', action: 'manage', desc: 'Manage workplace IT devices, platform infra and access' },
      // Portal & Workspaces
      { id: 'portal.workspace.access', service: 'portal', resource: 'workspace', action: 'access', desc: 'Access the main portal canvas' },
      { id: 'portal.settings.update', service: 'portal', resource: 'settings', action: 'update', desc: 'Update organization portal settings' },
      // Platform & Dev Center
      { id: 'forge.apps.deploy', service: 'forge', resource: 'apps', action: 'deploy', desc: 'Deploy & configure Forge micro-apps' },
      { id: 'forge.logs.view', service: 'forge', resource: 'logs', action: 'view', desc: 'Inspect platform telemetry & container logs' },
      // Billing & Expenses
      { id: 'billing.invoices.view', service: 'billing', resource: 'invoices', action: 'view', desc: 'View invoices and ledger' },
      { id: 'billing.invoices.manage', service: 'billing', resource: 'invoices', action: 'manage', desc: 'Create and process billing payouts' },
      { id: 'expenses.reports.submit', service: 'expenses', resource: 'reports', action: 'submit', desc: 'Submit employee expense claims' },
      { id: 'expenses.reports.approve', service: 'expenses', resource: 'reports', action: 'approve', desc: 'Approve department expense requests' },
    ];

    for (const p of permissions) {
      db.run(
        `INSERT INTO auth_iam_permissions (id, service, resource, action, description) VALUES (?, ?, ?, ?, ?);`,
        [p.id, p.service, p.resource, p.action, p.desc]
      );
    }

    // 5. IAM Roles (Predefined Standard Roles)
    const roles = [
      { id: 'roles/super_admin', title: 'Super Administrator', type: 'PREDEFINED', desc: 'Full administrative access across all org services' },
      { id: 'roles/security.admin', title: 'IAM & Security Administrator', type: 'PREDEFINED', desc: 'Manage identity, user directory and policy bindings' },
      { id: 'roles/hr.admin', title: 'HR & People Administrator', type: 'PREDEFINED', desc: 'Manage employee lifecycle, onboarding and org directory' },
      { id: 'roles/it.admin', title: 'IT & Systems Administrator', type: 'PREDEFINED', desc: 'Manage IT infrastructure, workplace systems and access' },
      { id: 'roles/dev.operator', title: 'Forge Platform Operator', type: 'PREDEFINED', desc: 'Deploy micro-apps and view system logs' },
      { id: 'roles/billing.admin', title: 'Billing Administrator', type: 'PREDEFINED', desc: 'Manage invoices, revenue and payout schedules' },
      { id: 'roles/employee', title: 'Standard Employee', type: 'PREDEFINED', desc: 'Basic portal workspace access and self-service expenses' },
    ];

    for (const r of roles) {
      db.run(
        `INSERT INTO auth_iam_roles (id, org_id, title, role_type, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [r.id, null, r.title, r.type, r.desc, now, now]
      );
    }

    // 6. Role Permissions Mapping
    const roleMap: Record<string, string[]> = {
      'roles/super_admin': permissions.map((p) => p.id),
      'roles/security.admin': ['auth.users.read', 'auth.users.write', 'iam.roles.read', 'iam.roles.grant', 'it.systems.manage', 'portal.workspace.access'],
      'roles/hr.admin': ['auth.users.read', 'auth.users.write', 'hr.employees.manage', 'portal.workspace.access'],
      'roles/it.admin': ['auth.users.read', 'it.systems.manage', 'forge.apps.deploy', 'forge.logs.view', 'portal.workspace.access'],
      'roles/dev.operator': ['portal.workspace.access', 'forge.apps.deploy', 'forge.logs.view'],
      'roles/billing.admin': ['portal.workspace.access', 'billing.invoices.view', 'billing.invoices.manage', 'expenses.reports.approve'],
      'roles/employee': ['portal.workspace.access', 'expenses.reports.submit', 'billing.invoices.view'],
    };

    for (const [roleId, permIds] of Object.entries(roleMap)) {
      for (const permId of permIds) {
        db.run(`INSERT INTO auth_iam_role_permissions (role_id, permission_id) VALUES (?, ?);`, [roleId, permId]);
      }
    }

    // 7. Seed Users & Personas (Guarantees Superadmin, Admin, HR, and IT)
    const personas = [
      // 1. Super Administrator (Root Founder & CTO)
      {
        id: 'usr-superadmin',
        email: 'superadmin@forge.internal',
        name: 'Rajesh Sharma (Founder & CTO)',
        type: 'ADMIN' as const,
        role: 'roles/super_admin',
        nodeId: 'node_root',
        title: 'Founder & Chief Technology Officer',
        code: 'EMP-001',
        managerId: null,
      },

      // 2. Admin (VP of Information Security & System Admin)
      {
        id: 'usr-secadmin',
        email: 'security@forge.internal',
        name: 'Pooja Deshmukh (VP InfoSec)',
        type: 'ADMIN' as const,
        role: 'roles/security.admin',
        nodeId: 'node_dept_sec_ops',
        title: 'VP of Information Security & Compliance',
        code: 'EMP-002',
        managerId: 'usr-superadmin',
      },

      // 3. HR Administrator (Head of People Operations & HR)
      {
        id: 'usr-hradmin',
        email: 'hr@forge.internal',
        name: 'Shalini Verma (Head of HR & People Operations)',
        type: 'ADMIN' as const,
        role: 'roles/hr.admin',
        nodeId: 'node_dept_hr',
        title: 'Head of People Operations & Talent',
        code: 'EMP-005',
        managerId: 'usr-superadmin',
      },

      // 4. IT Administrator (Lead Workplace Systems & IT Admin)
      {
        id: 'usr-itadmin',
        email: 'it@forge.internal',
        name: 'Vikram Malhotra (Lead IT & Systems Admin)',
        type: 'ADMIN' as const,
        role: 'roles/it.admin',
        nodeId: 'node_dept_it',
        title: 'Lead IT & Workplace Systems Administrator',
        code: 'EMP-006',
        managerId: 'usr-superadmin',
      },

      // Tier 1: Directors & Finance
      {
        id: 'usr-billadmin',
        email: 'billing.admin@forge.internal',
        name: 'Vikramaditya Patel (Director Finance)',
        type: 'ADMIN' as const,
        role: 'roles/billing.admin',
        nodeId: 'node_dept_accounting',
        title: 'Director of Corporate Finance & Operations',
        code: 'EMP-003',
        managerId: 'usr-superadmin',
      },
      {
        id: 'usr-developer',
        email: 'developer@forge.internal',
        name: 'Ananya Iyer (Principal Architect)',
        type: 'ADMIN' as const,
        role: 'roles/dev.operator',
        nodeId: 'node_dept_core_eng',
        title: 'Principal Systems Architect & Platform Operator',
        code: 'EMP-004',
        managerId: 'usr-superadmin',
      },
      {
        id: 'usr-bob-lead',
        email: 'bob.lead@forge.internal',
        name: 'Rohan Kulkarni (Engineering Director)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_core_eng',
        title: 'Director of Core Platform Engineering',
        code: 'EMP-010',
        managerId: 'usr-superadmin',
      },

      // Tier 2: Leads & Specialists
      {
        id: 'usr-siddharth-sre',
        email: 'siddharth.verma@forge.internal',
        name: 'Siddharth Verma (DevSecOps Lead)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_sec_ops',
        title: 'DevSecOps & Platform SRE Lead',
        code: 'EMP-020',
        managerId: 'usr-secadmin',
      },
      {
        id: 'usr-carol-fin',
        email: 'carol.fin@forge.internal',
        name: 'Kavita Reddy (Principal Analyst)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_accounting',
        title: 'Principal Financial Planning Analyst',
        code: 'EMP-012',
        managerId: 'usr-billadmin',
      },
      {
        id: 'usr-ishaan-ai',
        email: 'ishaan.sengupta@forge.internal',
        name: 'Ishaan Sengupta (Staff AI Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_core_eng',
        title: 'Staff AI & Machine Learning Systems Engineer',
        code: 'EMP-023',
        managerId: 'usr-developer',
      },
      {
        id: 'usr-alice-eng',
        email: 'alice.eng@forge.internal',
        name: 'Aditi Sharma (Senior Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Senior Distributed Systems Engineer',
        code: 'EMP-011',
        managerId: 'usr-bob-lead',
      },
      {
        id: 'usr-tanvi-fe',
        email: 'tanvi.hegde@forge.internal',
        name: 'Tanvi Hegde (Staff UI Architect)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Staff UI/UX & Frontend Architect',
        code: 'EMP-025',
        managerId: 'usr-bob-lead',
      },
      {
        id: 'usr-meera-qa',
        email: 'meera.raghavan@forge.internal',
        name: 'Meera Raghavan (Lead QA Architect)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Lead Platform QA & Chaos Engineer',
        code: 'EMP-026',
        managerId: 'usr-bob-lead',
      },

      // Tier 3: Engineers & Associates
      {
        id: 'usr-sneha-cloud',
        email: 'sneha.sundaram@forge.internal',
        name: 'Sneha Sundaram (Cloud Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_sec_ops',
        title: 'Cloud Infrastructure & Kubernetes Engineer',
        code: 'EMP-021',
        managerId: 'usr-siddharth-sre',
      },
      {
        id: 'usr-karan-acc',
        email: 'karan.joshi@forge.internal',
        name: 'Karan Joshi (Accounts Specialist)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_dept_accounting',
        title: 'Senior Corporate Treasury Specialist',
        code: 'EMP-022',
        managerId: 'usr-carol-fin',
      },
      {
        id: 'usr-amit-dev',
        email: 'amitabh.mukherjee@forge.internal',
        name: 'Amitabh Mukherjee (Backend Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Backend Platform Systems Engineer',
        code: 'EMP-024',
        managerId: 'usr-alice-eng',
      },
      {
        id: 'usr-neha-int',
        email: 'neha.chawla@forge.internal',
        name: 'Neha Chawla (Associate Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Associate Distributed Systems Engineer',
        code: 'EMP-027',
        managerId: 'usr-alice-eng',
      },
      {
        id: 'usr-arjun-design',
        email: 'arjun.nair@forge.internal',
        name: 'Arjun Nair (Design Engineer)',
        type: 'EMPLOYEE' as const,
        role: 'roles/employee',
        nodeId: 'node_squad_backend',
        title: 'Design Systems & Component Engineer',
        code: 'EMP-028',
        managerId: 'usr-tanvi-fe',
      },
    ];

    for (const p of personas) {
      const userEmail = p.email.includes('@forge.internal')
        ? p.email.replace('@forge.internal', `@${domain}`)
        : p.email;

      db.run(
        `INSERT INTO auth_users (id, org_id, email, password_hash, salt, display_name, principal_type, status, must_change_password, token_version, custom_attributes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 1, 1, '{}', ?, ?);`,
        [p.id, orgId, userEmail, defaultHash, defaultSalt, p.name, p.type, now, now]
      );

      db.run(
        `INSERT INTO auth_employee_profiles (user_id, org_node_id, job_title, employee_code, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [p.id, p.nodeId, p.title, p.code, now, now]
      );

      db.run(
        `INSERT INTO auth_iam_policy_bindings (id, org_id, principal_id, role_id, resource_scope, condition_expr, created_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?);`,
        [`bind-${p.id}`, orgId, p.id, p.role, 'org/*', now]
      );

      if (p.managerId) {
        db.run(
          `INSERT INTO auth_employee_relationships (id, org_id, employee_id, related_to_id, relationship_type, is_primary)
           VALUES (?, ?, ?, ?, 'LINE_MANAGER', 1);`,
          [`rel-${p.id}`, orgId, p.id, p.managerId]
        );
      }
    }
  })();

  logger.info('Auth database seeding completed successfully.');
}
