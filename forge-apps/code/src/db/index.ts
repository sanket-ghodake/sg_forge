/**
 * @forge-apps/code - Dedicated Turso SQLite Database Client & Store (2026 LTS)
 * Strict Per-App Database Isolation (Enterprise Multi-Tenant Standard)
 */

import { createLogger, getDatabaseClient } from '../lib/sdk';
import type { ActiveSessionRecord, ProjectMemberRecord, ProjectRecord } from './schema';

const logger = createLogger('code-db');
/**
 * codeDb
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export const codeDb = getDatabaseClient('code.db');

// Initialize isolated tables
codeDb.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    fs_path TEXT NOT NULL UNIQUE,
    default_branch TEXT DEFAULT 'main',
    is_active INTEGER DEFAULT 1,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

codeDb.run(`
  CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PROJECT_ADMIN', 'DEVELOPER')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(project_id, user_id)
  );
`);

codeDb.run(`
  CREATE TABLE IF NOT EXISTS active_sessions (
    project_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    active_user_id TEXT NOT NULL,
    active_user_email TEXT NOT NULL,
    active_user_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'PENDING_TAKEOVER')),
    connected_at INTEGER NOT NULL,
    last_heartbeat INTEGER NOT NULL,
    takeover_requester_id TEXT,
    takeover_requester_email TEXT,
    takeover_requester_name TEXT,
    takeover_expires_at INTEGER
  );
`);

logger.info('Initialized isolated Turso DB for code microservice');

// Seed current repo if no projects exist
const existingCount = (codeDb.prepare('SELECT COUNT(*) as count FROM projects').get() as any)?.count || 0;
if (existingCount === 0) {
  const now = Date.now();
  const defaultPath = process.env.HOST_REPO_DIR || '/workspace';
  codeDb.prepare(`
    INSERT INTO projects (id, name, slug, description, fs_path, default_branch, is_active, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'proj-forge-main',
    'SG Forge Platform',
    'sg-forge-platform',
    'Primary core platform monorepo with microservices and portal',
    defaultPath,
    'main',
    1,
    'system-seed',
    now,
    now
  );
  logger.info('[SYSTEM_SEED] Registered primary platform repository (proj-forge-main)');
}

/**
 * listProjects
 * @requirements [HLR-CODE-701] [LLR-SUB-003] [HLR-CODE-001] [LLR-CODE-001.1] [LLR-CODE-001.2]
 */
export function listProjects(userId: string, isSuperAdmin: boolean): Array<ProjectRecord & { userRole?: string; activeSession?: ActiveSessionRecord | null }> {
  let projects: ProjectRecord[] = [];
  if (isSuperAdmin) {
    projects = codeDb.prepare('SELECT * FROM projects WHERE is_active = 1 ORDER BY name ASC').all() as ProjectRecord[];
  } else {
    projects = codeDb.prepare(`
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ? AND p.is_active = 1
      ORDER BY p.name ASC
    `).all(userId) as ProjectRecord[];
  }

  return projects.map((p) => {
    let role = isSuperAdmin ? 'SUPER_ADMIN' : 'DEVELOPER';
    if (!isSuperAdmin) {
      const mem = codeDb.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?').get(p.id, userId) as any;
      if (mem) role = mem.role;
    }
    const activeSession = getActiveSession(p.id);
    return {
      ...p,
      userRole: role,
      activeSession,
    };
  });
}

/**
 * getProjectById
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getProjectById(id: string): ProjectRecord | null {
  return (codeDb.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRecord) || null;
}

/**
 * getProjectBySlug
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getProjectBySlug(slug: string): ProjectRecord | null {
  return (codeDb.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as ProjectRecord) || null;
}

/**
 * createProject
 * @requirements [HLR-CODE-701] [LLR-SUB-003] [HLR-CODE-001] [LLR-CODE-001.1] [LLR-CODE-001.2]
 */
export function createProject(record: Omit<ProjectRecord, 'created_at' | 'updated_at'>): ProjectRecord {
  const now = Date.now();
  codeDb.prepare(`
    INSERT INTO projects (id, name, slug, description, fs_path, default_branch, is_active, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.name,
    record.slug,
    record.description,
    record.fs_path,
    record.default_branch || 'main',
    record.is_active ?? 1,
    record.created_by,
    now,
    now
  );
  return { ...record, created_at: now, updated_at: now };
}

/**
 * deleteProject
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function deleteProject(id: string): boolean {
  codeDb.prepare('DELETE FROM active_sessions WHERE project_id = ?').run(id);
  codeDb.prepare('DELETE FROM project_members WHERE project_id = ?').run(id);
  codeDb.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return true;
}

/**
 * getProjectMembers
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getProjectMembers(projectId: string): ProjectMemberRecord[] {
  return codeDb.prepare('SELECT * FROM project_members WHERE project_id = ? ORDER BY created_at ASC').all(projectId) as ProjectMemberRecord[];
}

/**
 * addProjectMember
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function addProjectMember(member: Omit<ProjectMemberRecord, 'created_at' | 'updated_at'>): ProjectMemberRecord {
  const now = Date.now();
  codeDb.prepare(`
    INSERT INTO project_members (id, project_id, user_id, user_email, user_name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(project_id, user_id) DO UPDATE SET
      role = excluded.role,
      updated_at = excluded.updated_at
  `).run(
    member.id,
    member.project_id,
    member.user_id,
    member.user_email,
    member.user_name,
    member.role,
    now,
    now
  );
  return { ...member, created_at: now, updated_at: now };
}

/**
 * removeProjectMember
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function removeProjectMember(projectId: string, userId: string): boolean {
  codeDb.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(projectId, userId);
  return true;
}

/**
 * getUserProjectRole
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getUserProjectRole(projectId: string, userId: string, isSuperAdmin: boolean): 'SUPER_ADMIN' | 'PROJECT_ADMIN' | 'DEVELOPER' | null {
  if (isSuperAdmin) return 'SUPER_ADMIN';
  const mem = codeDb.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?').get(projectId, userId) as any;
  if (!mem) return null;
  return mem.role;
}

/**
 * getActiveSession
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getActiveSession(projectId: string): ActiveSessionRecord | null {
  return (codeDb.prepare('SELECT * FROM active_sessions WHERE project_id = ?').get(projectId) as ActiveSessionRecord) || null;
}

/**
 * upsertActiveSession
 * @requirements [HLR-CODE-701] [LLR-SUB-003] [HLR-CODE-002] [LLR-CODE-002.1]
 */
export function upsertActiveSession(session: ActiveSessionRecord): void {
  codeDb.prepare(`
    INSERT INTO active_sessions (
      project_id, session_id, active_user_id, active_user_email, active_user_name,
      status, connected_at, last_heartbeat, takeover_requester_id, takeover_requester_email, takeover_requester_name, takeover_expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET
      session_id = excluded.session_id,
      active_user_id = excluded.active_user_id,
      active_user_email = excluded.active_user_email,
      active_user_name = excluded.active_user_name,
      status = excluded.status,
      connected_at = excluded.connected_at,
      last_heartbeat = excluded.last_heartbeat,
      takeover_requester_id = excluded.takeover_requester_id,
      takeover_requester_email = excluded.takeover_requester_email,
      takeover_requester_name = excluded.takeover_requester_name,
      takeover_expires_at = excluded.takeover_expires_at
  `).run(
    session.project_id,
    session.session_id,
    session.active_user_id,
    session.active_user_email,
    session.active_user_name,
    session.status,
    session.connected_at,
    session.last_heartbeat,
    session.takeover_requester_id,
    session.takeover_requester_email,
    session.takeover_requester_name,
    session.takeover_expires_at
  );
}

/**
 * deleteActiveSession
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function deleteActiveSession(projectId: string): void {
  codeDb.prepare('DELETE FROM active_sessions WHERE project_id = ?').run(projectId);
}
