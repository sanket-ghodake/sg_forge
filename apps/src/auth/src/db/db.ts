/**
 * @forge/auth - Database Client & Lifecycle Manager (2026 LTS)
 * Manages auth.db with WAL mode, auto-vacuum, and zero-leak connection lifecycle.
 */

import { Database } from 'bun:sqlite';
import {
  closeDatabaseClient,
  createLogger,
  getDatabaseClient,
  resolveCanonicalDataDir,
  resolveCanonicalDbPath,
} from '@forge/sdk';

let logger: any = null;
function getLogger() {
  if (!logger) logger = createLogger('auth-db');
  return logger;
}

/**
 * resolveAuthDataDir
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export function resolveAuthDataDir(): string {
  return resolveCanonicalDataDir();
}

let dbInstance: Database | null = null;

/**
 * getAuthDb
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export function getAuthDb(forceLive: boolean = false): Database {
  if (dbInstance) return dbInstance;

  dbInstance = getDatabaseClient('auth.db', { forceLive });
  initAuthSchema(dbInstance);
  const resolvedPath = resolveCanonicalDbPath('auth.db', forceLive);
  getLogger().info(`Auth DB connection initialized at: ${resolvedPath}`);

  return dbInstance;
}

/**
 * initAuthSchema
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export function initAuthSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL UNIQUE,
      brand_name TEXT,
      brand_tagline TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_org_node_types (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      level_order INTEGER NOT NULL,
      description TEXT,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_org_nodes (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      type_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      parent_id TEXT,
      path TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES auth_org_node_types(id) ON DELETE RESTRICT,
      FOREIGN KEY (parent_id) REFERENCES auth_org_nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      display_name TEXT NOT NULL,
      principal_type TEXT NOT NULL CHECK(principal_type IN ('EMPLOYEE', 'ADMIN', 'SERVICE_ACCOUNT')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'INVITED')),
      must_change_password INTEGER NOT NULL DEFAULT 1,
      token_version INTEGER NOT NULL DEFAULT 1,
      custom_attributes TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_employee_profiles (
      user_id TEXT PRIMARY KEY,
      org_node_id TEXT,
      job_title TEXT NOT NULL,
      employee_code TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
      FOREIGN KEY (org_node_id) REFERENCES auth_org_nodes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS auth_employee_relationships (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      related_to_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL CHECK(relationship_type IN ('LINE_MANAGER', 'PROJECT_LEAD', 'MENTOR', 'DOTTED_LINE')),
      is_primary INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES auth_users(id) ON DELETE CASCADE,
      FOREIGN KEY (related_to_id) REFERENCES auth_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_iam_permissions (
      id TEXT PRIMARY KEY,
      service TEXT NOT NULL,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_iam_roles (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      title TEXT NOT NULL,
      role_type TEXT NOT NULL CHECK(role_type IN ('PREDEFINED', 'CUSTOM')),
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_iam_role_permissions (
      role_id TEXT NOT NULL,
      permission_id TEXT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES auth_iam_roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES auth_iam_permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_iam_policy_bindings (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      principal_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      resource_scope TEXT NOT NULL,
      condition_expr TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (principal_id) REFERENCES auth_users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES auth_iam_roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      org_id TEXT NOT NULL,
      refresh_token_hash TEXT NOT NULL UNIQUE,
      family_id TEXT NOT NULL,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      user_agent TEXT,
      ip_hash TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_audit_logs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'DENIED', 'ERROR')),
      details TEXT NOT NULL,
      ip_hash TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (org_id) REFERENCES auth_organizations(id) ON DELETE CASCADE
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON auth_users(email);
    CREATE INDEX IF NOT EXISTS idx_users_org ON auth_users(org_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON auth_sessions(refresh_token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_family ON auth_sessions(family_id);
    CREATE INDEX IF NOT EXISTS idx_policy_principal ON auth_iam_policy_bindings(principal_id);
    CREATE INDEX IF NOT EXISTS idx_org_nodes_parent ON auth_org_nodes(parent_id);
    CREATE INDEX IF NOT EXISTS idx_org_nodes_path ON auth_org_nodes(path);
  `);
}

/**
 * closeAuthDb
 * @requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]
 */
export function closeAuthDb(): void {
  if (dbInstance) {
    try {
      dbInstance.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch {}
    dbInstance.close();
    dbInstance = null;
    getLogger().info('Auth DB connection closed cleanly with WAL checkpoint.');
  }
}
