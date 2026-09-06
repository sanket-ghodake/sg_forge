/**
 * @forge/dev-dashboard - Core Platform Database & Schema Manager (2026 LTS)
 * Manages platform_core.db with WAL mode, auto-vacuum, and per-app DB discovery.
 * Enterprise Cloud & Turso Architectural Baseline
 */

import { Database } from 'bun:sqlite';
import { accessSync, constants, copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  createLogger,
  loadServiceRegistry,
  resolveCanonicalDataDir,
  resolveCanonicalDbPath,
} from '@forge/sdk';

const logger = createLogger('dev-dashboard-db');

/** @requirements [HLR-SDK-302] [LLR-DB-001] */
export const resolveDataDir = resolveCanonicalDataDir;
const DATA_DIR = resolveDataDir();
const CORE_DB_PATH = resolveCanonicalDbPath('platform_core.db');

/**
 * Validates and safely resolves path to an application database file.
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export function getSafeDbPath(dbName: string): string | null {
  if (!dbName || typeof dbName !== 'string') return null;
  const safeName = basename(dbName);
  if (safeName !== dbName || dbName.includes('..') || dbName.includes('/') || dbName.includes('\\')) return null;
  return safeName === 'platform_core.db' || safeName === basename(CORE_DB_PATH) ? CORE_DB_PATH : join(DATA_DIR, safeName);
}

/**
 * Application registry record stored in platform core database.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export interface AppRegistryRecord {
  id: string;
  name: string;
  port: number;
  ingress_path: string;
  category: string;
  access_role: string;
  container_name: string | null;
  db_file_path: string | null;
  runtime_type: string;
  remote_url: string | null;
  status: string;
  storage_quota_mb: number;
  created_at: number;
  updated_at: number;
}

/**
 * Traffic telemetry event record for monitoring network throughput.
 * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */
export interface TrafficEventRecord {
  id: string;
  app_id: string;
  path: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_hash: string | null;
  user_agent: string | null;
  trace_id: string | null;
  timestamp: number;
}

/**
 * RFC 7807 incident issue report record.
 * @requirements [HLR-SDK-303] [LLR-SDK-004]
 */
export interface IssueReportRecord {
  id: string;
  app_id: string;
  fingerprint: string;
  error_type: string;
  message: string;
  stack_trace: string | null;
  context_json: string | null;
  trace_id: string | null;
  occurrence_count: number;
  status: string;
  first_seen: number;
  last_seen: number;
}

/**
 * Administrative audit log record for zero-trust tracking.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface AuditLogRecord {
  id: string;
  actor_id: string;
  action_type: string;
  target_service: string;
  payload_json: string | null;
  ip_hash: string | null;
  result_status: string;
  timestamp: number;
}

class PlatformDatabaseManager {
  private db: Database;

  constructor() {
    this.db = new Database(CORE_DB_PATH, { create: true });
    this.initDatabase();
  }

  private initDatabase(): void {
    try {
      this.db.run('PRAGMA journal_mode = WAL;');
      this.db.run('PRAGMA busy_timeout = 5000;');
      this.db.run('PRAGMA auto_vacuum = INCREMENTAL;');
      this.db.run('PRAGMA synchronous = NORMAL;');

      // 1. Dynamic Forge App Registry
      this.db.run(`CREATE TABLE IF NOT EXISTS apps_registry (id TEXT PRIMARY KEY, name TEXT NOT NULL, port INTEGER NOT NULL, ingress_path TEXT NOT NULL UNIQUE, category TEXT NOT NULL DEFAULT 'Micro-Apps', access_role TEXT NOT NULL DEFAULT 'General', container_name TEXT, db_file_path TEXT, runtime_type TEXT NOT NULL DEFAULT 'bun-watch', remote_url TEXT, status TEXT NOT NULL DEFAULT 'active', storage_quota_mb INTEGER NOT NULL DEFAULT 50, created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`);

      // 2. Traffic Telemetry Events
      this.db.run(`CREATE TABLE IF NOT EXISTS traffic_events (id TEXT PRIMARY KEY, app_id TEXT NOT NULL, path TEXT NOT NULL, method TEXT NOT NULL, status_code INTEGER NOT NULL, duration_ms REAL NOT NULL, ip_hash TEXT, user_agent TEXT, trace_id TEXT, timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))); CREATE INDEX IF NOT EXISTS idx_traffic_timestamp ON traffic_events(timestamp); CREATE INDEX IF NOT EXISTS idx_traffic_app_id ON traffic_events(app_id);`);

      // 3. RFC 7807 Issue Incident Reports
      this.db.run(`CREATE TABLE IF NOT EXISTS issue_reports (id TEXT PRIMARY KEY, app_id TEXT NOT NULL, fingerprint TEXT NOT NULL, error_type TEXT NOT NULL, message TEXT NOT NULL, stack_trace TEXT, context_json TEXT, trace_id TEXT, occurrence_count INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'open', first_seen INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), last_seen INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))); CREATE INDEX IF NOT EXISTS idx_issue_fingerprint ON issue_reports(fingerprint);`);

      // 4. Immutable Administrative Audit Log
      this.db.run(`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action_type TEXT NOT NULL, target_service TEXT NOT NULL, payload_json TEXT, ip_hash TEXT, result_status TEXT NOT NULL, timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))); CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);`);

      this.syncWithEnvRegistry();
      logger.info('🗄️ Platform Core Database initialized successfully in WAL mode');
    } catch (err) {
      logger.error('Failed to initialize Platform Core DB', { error: String(err) });
    }
  }

  public syncWithEnvRegistry(): void {
    const services = loadServiceRegistry();
    const upsert = this.db.prepare(`
      INSERT INTO apps_registry (id, name, port, ingress_path, category, access_role, container_name, db_file_path, runtime_type, status, updated_at)
      VALUES ($id, $name, $port, $path, $category, $role, $container, $dbPath, $runtime, 'active', strftime('%s', 'now'))
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, port = excluded.port, ingress_path = excluded.ingress_path, category = excluded.category, access_role = excluded.access_role, container_name = excluded.container_name, updated_at = strftime('%s', 'now');
    `);

    for (const s of services) {
      const dbPath = join(DATA_DIR, `${s.id}.db`);
      upsert.run({
        $id: s.id,
        $name: s.name,
        $port: s.port,
        $path: s.path,
        $category: s.category,
        $role: s.role,
        $container: s.containerName,
        $dbPath: dbPath,
        $runtime: 'bun-watch',
      });
    }

    // Prune only transient test entries not present in .env, preserving user-created dynamic apps
    const validIds = services.map((s) => s.id);
    if (validIds.length > 0) {
      const placeholders = validIds.map(() => '?').join(',');
      this.db.run(`DELETE FROM apps_registry WHERE (id LIKE 'test_%' OR id LIKE 'e2e_%' OR id LIKE 'mock_%') AND id NOT IN (${placeholders})`, validIds);
    }

    logger.info(`🌱 Synchronized ${services.length} services from .env registry into apps_registry`);
  }

  public getAppsRegistry(): AppRegistryRecord[] {
    return this.db.query('SELECT * FROM apps_registry ORDER BY category, name ASC').all() as AppRegistryRecord[];
  }

  public getAppById(id: string): AppRegistryRecord | null {
    return this.db.query('SELECT * FROM apps_registry WHERE id = ?').get(id) as AppRegistryRecord | null;
  }

  public registerApp(record: Partial<AppRegistryRecord>): boolean {
    const id = record.id || `app-${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    const dbPath = record.db_file_path || join(DATA_DIR, `${id}.db`);

    const query = this.db.prepare(`
      INSERT INTO apps_registry (id, name, port, ingress_path, category, access_role, container_name, db_file_path, runtime_type, remote_url, status, storage_quota_mb, created_at, updated_at)
      VALUES ($id, $name, $port, $ingress_path, $category, $access_role, $container_name, $db_file_path, $runtime_type, $remote_url, 'active', $storage_quota_mb, $now, $now)
    `);

    query.run({
      $id: id,
      $name: record.name || 'Untitled App',
      $port: record.port || 8090,
      $ingress_path: record.ingress_path || `/apps/${id}`,
      $category: record.category || 'Micro-Apps',
      $access_role: record.access_role || 'General',
      $container_name: record.container_name || `app-${id}`,
      $db_file_path: dbPath,
      $runtime_type: record.runtime_type || 'bun-watch',
      $remote_url: record.remote_url || null,
      $storage_quota_mb: record.storage_quota_mb || 50,
      $now: now,
    });

    this.logAudit('system', 'app_register', id, JSON.stringify(record), 'success');
    return true;
  }

  public updateApp(id: string, updates: Partial<AppRegistryRecord>): boolean {
    const existing = this.getAppById(id);
    if (!existing) return false;
    const now = Math.floor(Date.now() / 1000);
    const updated = { ...existing, ...updates, updated_at: now };
    const query = this.db.prepare(`
      UPDATE apps_registry SET
        name = $name, port = $port, ingress_path = $ingress_path, category = $category,
        access_role = $access_role, container_name = $container_name, db_file_path = $db_file_path,
        runtime_type = $runtime_type, remote_url = $remote_url, status = $status,
        storage_quota_mb = $storage_quota_mb, updated_at = $now
      WHERE id = $id
    `);
    query.run({
      $id: id,
      $name: updated.name,
      $port: updated.port,
      $ingress_path: updated.ingress_path,
      $category: updated.category,
      $access_role: updated.access_role,
      $container_name: updated.container_name,
      $db_file_path: updated.db_file_path,
      $runtime_type: updated.runtime_type,
      $remote_url: updated.remote_url,
      $status: updated.status,
      $storage_quota_mb: updated.storage_quota_mb,
      $now: now,
    });
    this.logAudit('developer', 'app_update', id, JSON.stringify(updates), 'success');
    return true;
  }

  public deleteApp(id: string): boolean {
    const res = this.db.run('DELETE FROM apps_registry WHERE id = ?', [id]);
    this.logAudit('developer', 'app_delete', id, null, 'success');
    return (res as any).changes > 0;
  }

  public setAppStatus(id: string, status: string): boolean {
    const existing = this.getAppById(id);
    if (!existing) return false;
    const now = Math.floor(Date.now() / 1000);
    const res = this.db.run('UPDATE apps_registry SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);
    this.logAudit('developer', status === 'disabled' ? 'app_disable' : 'app_enable', id, JSON.stringify({ previousStatus: existing.status, newStatus: status }), 'success');
    return (res as any).changes > 0;
  }

  public logAudit(actorId: string, actionType: string, targetService: string, payload: string | null, status: string): void {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Math.floor(Date.now() / 1000);
    this.db.run('INSERT INTO audit_logs (id, actor_id, action_type, target_service, payload_json, result_status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, actorId, actionType, targetService, payload, status, now]);
  }

  public recordTraffic(appId: string, path: string, method: string, statusCode: number, durationMs: number, traceId?: string): void {
    const id = `trf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Math.floor(Date.now() / 1000);
    this.db.run(
      'INSERT INTO traffic_events (id, app_id, path, method, status_code, duration_ms, trace_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, appId, path, method, statusCode, durationMs, traceId || null, now]
    );
  }

  public listDatabases(): Array<{ name: string; path: string; sizeBytes: number }> {
    const dbs: Array<{ name: string; path: string; sizeBytes: number }> = [];
    if (existsSync(DATA_DIR)) {
      for (const file of readdirSync(DATA_DIR)) {
        if (file.endsWith('.db')) {
          const fullPath = join(DATA_DIR, file);
          const stats = statSync(fullPath);
          dbs.push({ name: file, path: fullPath, sizeBytes: stats.size });
        }
      }
    }
    return dbs;
  }

  public executeQuery(dbName: string, sql: string, readOnly = true): { columns: string[]; rows: any[]; durationMs: number; affectedRows?: number; error?: string } {
    const start = performance.now();
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) {
      return { columns: [], rows: [], durationMs: 0, error: `Database file ${dbName} not found or invalid name` };
    }

    try {
      // Strip comments to inspect actual leading SQL verb
      const strippedSql = sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '').trim();
      const upper = strippedSql.toUpperCase();
      const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA') || upper.startsWith('EXPLAIN');

      if (readOnly && !isSelect) {
        return { columns: [], rows: [], durationMs: 0, error: 'Database is in READ_ONLY sandbox mode. Mutating queries are blocked.' };
      }

      if (upper.includes('ATTACH') || upper.includes('DETACH')) {
        return { columns: [], rows: [], durationMs: 0, error: 'ATTACH and DETACH statements are forbidden in developer console' };
      }

      const dbInstance = new Database(targetPath, { readonly: readOnly });

      if (isSelect) {
        const rows = dbInstance.query(sql).all() as any[];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        const durationMs = Number((performance.now() - start).toFixed(2));
        dbInstance.close();
        return { columns, rows, durationMs };
      } else {
        const result = dbInstance.run(sql);
        const durationMs = Number((performance.now() - start).toFixed(2));
        dbInstance.close();
        return { columns: [], rows: [], durationMs, affectedRows: result.changes };
      }
    } catch (err: any) {
      const durationMs = Number((performance.now() - start).toFixed(2));
      return { columns: [], rows: [], durationMs, error: err.message || String(err) };
    }
  }

  public optimizeDatabase(dbName: string): { success: boolean; message: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { success: false, message: 'Database not found or invalid name' };
    try {
      const dbInstance = new Database(targetPath);
      dbInstance.run('PRAGMA optimize;');
      dbInstance.run('PRAGMA wal_checkpoint(PASSIVE);');
      dbInstance.run('PRAGMA incremental_vacuum(100);');
      dbInstance.close();
      return { success: true, message: `Database ${dbName} optimized successfully (WAL checkpoint + incremental vacuum).` };
    } catch (err: any) {
      return { success: false, message: err.message || String(err) };
    }
  }

  public backupDatabase(dbName: string): { success: boolean; message: string; backupFile?: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { success: false, message: 'Database not found or invalid name' };
    try {
      const backupDir = join(DATA_DIR, 'backups');
      if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
      const filename = `${dbName.replace('.db', '')}_snapshot_${Date.now()}.db`;
      const destPath = join(backupDir, filename);
      copyFileSync(targetPath, destPath);
      this.logAudit('developer', 'db_backup', dbName, JSON.stringify({ backupFile: filename }), 'success');
      return { success: true, message: `Snapshot ${filename} saved in data/backups/`, backupFile: filename };
    } catch (err: any) {
      return { success: false, message: err.message || String(err) };
    }
  }

  public getTableSchema(dbName: string, tableName: string): { columns: Array<{ cid: number; name: string; type: string; notnull: number; dflt_value: any; pk: number }>; error?: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { columns: [], error: `Database ${dbName} not found or invalid name` };
    try {
      const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const dbInstance = new Database(targetPath, { readonly: true });
      const columns = dbInstance.query(`PRAGMA table_info("${sanitizedTable}");`).all() as any[];
      dbInstance.close();
      return { columns };
    } catch (err: any) {
      return { columns: [], error: err.message || String(err) };
    }
  }

  public getTableDdl(dbName: string, tableName: string): { ddl: string; indexes: string[]; error?: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { ddl: '', indexes: [], error: `Database ${dbName} not found or invalid name` };
    try {
      const dbInstance = new Database(targetPath, { readonly: true });
      const tableRow = dbInstance.query(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?;`).get(tableName) as { sql: string } | null;
      const indexRows = dbInstance.query(`SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL;`).all(tableName) as Array<{ sql: string }>;
      dbInstance.close();
      return {
        ddl: tableRow?.sql || `-- Table ${tableName} schema not found in sqlite_master`,
        indexes: indexRows.map((r) => r.sql),
      };
    } catch (err: any) {
      return { ddl: '', indexes: [], error: err.message || String(err) };
    }
  }

  public getTableRows(
    dbName: string,
    tableName: string,
    page = 1,
    limit = 25,
    search?: string
  ): { columns: string[]; rows: any[]; totalCount: number; page: number; limit: number; error?: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { columns: [], rows: [], totalCount: 0, page, limit, error: `Database ${dbName} not found or invalid name` };
    try {
      const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, '');
      const safeLimit = Math.max(1, Math.min(100, Number(limit) || 25));
      const safePage = Math.max(1, Number(page) || 1);
      const offset = (safePage - 1) * safeLimit;

      const dbInstance = new Database(targetPath, { readonly: true });
      const colInfo = dbInstance.query(`PRAGMA table_info("${sanitizedTable}");`).all() as any[];
      const colNames = colInfo.map((c) => String(c.name).replace(/[^a-zA-Z0-9_]/g, ''));

      let rows: any[] = [];
      let totalCount = 0;

      const cleanSearch = (search || '').trim();
      if (cleanSearch && colNames.length > 0) {
        const whereClause = colNames.map((c) => `CAST("${c}" AS TEXT) LIKE ?`).join(' OR ');
        const searchPattern = `%${cleanSearch}%`;
        const searchParams = colNames.map(() => searchPattern);

        const countRow = dbInstance.query(`SELECT COUNT(*) as count FROM "${sanitizedTable}" WHERE ${whereClause};`).get(...searchParams) as { count: number } | null;
        totalCount = countRow?.count || 0;

        rows = dbInstance.query(`SELECT * FROM "${sanitizedTable}" WHERE ${whereClause} LIMIT ? OFFSET ?;`).all(...searchParams, safeLimit, offset) as any[];
      } else {
        const countRow = dbInstance.query(`SELECT COUNT(*) as count FROM "${sanitizedTable}";`).get() as { count: number } | null;
        totalCount = countRow?.count || 0;
        rows = dbInstance.query(`SELECT * FROM "${sanitizedTable}" LIMIT ? OFFSET ?;`).all(safeLimit, offset) as any[];
      }

      const columns = colNames.length > 0 ? colNames : (rows.length > 0 ? Object.keys(rows[0]) : []);
      dbInstance.close();

      return { columns, rows, totalCount, page: safePage, limit: safeLimit };
    } catch (err: any) {
      return { columns: [], rows: [], totalCount: 0, page, limit, error: err.message || String(err) };
    }
  }

  public runIntegrityCheck(dbName: string): { integrity: string[]; foreignKeyErrors: any[]; success: boolean; error?: string } {
    const targetPath = getSafeDbPath(dbName);
    if (!targetPath || !existsSync(targetPath)) return { integrity: [], foreignKeyErrors: [], success: false, error: `Database ${dbName} not found or invalid name` };
    try {
      const dbInstance = new Database(targetPath, { readonly: true });
      const integrity = (dbInstance.query('PRAGMA integrity_check;').all() as Array<{ integrity_check: string }>).map(r => r.integrity_check);
      const foreignKeyErrors = dbInstance.query('PRAGMA foreign_key_check;').all() as any[];
      dbInstance.close();
      return { integrity, foreignKeyErrors, success: integrity.includes('ok') && foreignKeyErrors.length === 0 };
    } catch (err: any) {
      return { integrity: [], foreignKeyErrors: [], success: false, error: err.message || String(err) };
    }
  }

  public getTrafficSummary(limit = 100): TrafficEventRecord[] {
    return this.db.query('SELECT * FROM traffic_events ORDER BY timestamp DESC LIMIT ?').all(limit) as TrafficEventRecord[];
  }

  public getIssues(limit = 50): IssueReportRecord[] {
    return this.db.query('SELECT * FROM issue_reports ORDER BY last_seen DESC LIMIT ?').all(limit) as IssueReportRecord[];
  }

  public recordIssue(appId: string, errorType: string, message: string, stackTrace?: string, contextJson?: string, traceId?: string): string {
    const fingerprint = `${appId}:${errorType}:${message.slice(0, 120)}`;
    const now = Math.floor(Date.now() / 1000);
    const existing = this.db.query('SELECT id, occurrence_count FROM issue_reports WHERE fingerprint = ?').get(fingerprint) as any;
    if (existing) {
      this.db.run('UPDATE issue_reports SET occurrence_count = occurrence_count + 1, last_seen = ?, message = ?, stack_trace = COALESCE(?, stack_trace), trace_id = COALESCE(?, trace_id) WHERE id = ?', [now, message, stackTrace || null, traceId || null, existing.id]);
      return existing.id;
    }
    const id = `issue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.db.run('INSERT INTO issue_reports (id, app_id, fingerprint, error_type, message, stack_trace, context_json, trace_id, occurrence_count, status, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)', [id, appId, fingerprint, errorType, message, stackTrace || null, contextJson || null, traceId || null, 'open', now, now]);
    return id;
  }

  public updateIssueStatus(id: string, status: string): boolean {
    return (this.db.run('UPDATE issue_reports SET status = ? WHERE id = ?', [status, id]) as any).changes > 0;
  }

  public deleteIssue(id: string): boolean {
    return (this.db.run('DELETE FROM issue_reports WHERE id = ?', [id]) as any).changes > 0;
  }

  public getRawDb(): Database { return this.db; }

  public getAuditLogs(limit = 50): AuditLogRecord[] {
    return this.db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as AuditLogRecord[];
  }
}

/**
 * Global singleton instance of PlatformDatabaseManager.
 * @requirements [HLR-SDK-302] [LLR-DB-001]
 */
export const platformDb = new PlatformDatabaseManager();
