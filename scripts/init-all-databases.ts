/**
 * @forge/scripts - Microservices Database Initializer & Seeder (2026 LTS)
 * Initializes dedicated Turso/SQLite databases with schema tables and seed data
 * for all microservices across the SG Forge platform.
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveCanonicalDataDir } from '../apps/src/sdk/src';

import { seedAuthDatabase } from '../apps/src/auth/src/db/seed';

const DATA_DIR = resolveCanonicalDataDir();
const isForce = process.argv.includes('--force') || process.env.ALLOW_DB_WIPE === 'true';
console.log(`🚀 Initializing microservices databases in: ${DATA_DIR}${isForce ? ' [FORCE RESEED]' : ''}`);

// 1. Auth Database (auth.db)
function initAuthDb() {
  seedAuthDatabase(isForce);
  console.log('  ✅ auth.db initialized (canonical IAM, org tree, test personas)');
}

// 2. Telemetry Database (telemetry.db)
function initTelemetryDb() {
  const dbPath = join(DATA_DIR, 'telemetry.db');
  const db = new Database(dbPath, { create: true });
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');

  if (isForce) {
    db.run('DROP TABLE IF EXISTS system_alerts;');
    db.run('DROP TABLE IF EXISTS trace_spans;');
    db.run('DROP TABLE IF EXISTS service_metrics;');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS service_metrics (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL,
      cpu_percent REAL NOT NULL,
      memory_mb REAL NOT NULL,
      request_rate_rps REAL NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS trace_spans (
      id TEXT PRIMARY KEY,
      trace_id TEXT NOT NULL,
      parent_span_id TEXT,
      service_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      duration_ms REAL NOT NULL,
      status_code INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS system_alerts (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'WARNING',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'resolved',
      triggered_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  const metricsCount = db.query('SELECT COUNT(*) as c FROM service_metrics;').get() as any;
  if (!metricsCount?.c) {
    const now = Math.floor(Date.now() / 1000);
    db.run(`
      INSERT INTO service_metrics (id, service_name, cpu_percent, memory_mb, request_rate_rps, timestamp) VALUES
      ('m_01', 'auth', 2.4, 48.2, 142.5, ${now - 300}),
      ('m_02', 'dev-dashboard', 1.8, 56.1, 88.0, ${now - 200}),
      ('m_03', 'code', 0.9, 36.4, 25.1, ${now - 100});

      INSERT INTO system_alerts (id, service_name, severity, message, status, triggered_at) VALUES
      ('alt_01', 'code', 'INFO', 'Incremental WAL vacuum completed successfully', 'resolved', ${now - 3600});
    `);
  }
  db.close();
  console.log('  ✅ telemetry.db initialized (service_metrics, trace_spans, system_alerts)');
}

// 5. Dev Hub Database (dev_hub.db)
function initDevHubDb() {
  const dbPath = join(DATA_DIR, 'dev_hub.db');
  const db = new Database(dbPath, { create: true });
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');

  if (isForce) {
    db.run('DROP TABLE IF EXISTS webhooks;');
    db.run('DROP TABLE IF EXISTS api_specs;');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS api_specs (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL UNIQUE,
      version TEXT NOT NULL DEFAULT '1.0.0',
      title TEXT NOT NULL,
      openapi_json TEXT,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      target_url TEXT NOT NULL,
      event_types TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  const specCount = db.query('SELECT COUNT(*) as c FROM api_specs;').get() as any;
  if (!specCount?.c) {
    db.run(`
      INSERT INTO api_specs (id, service_name, version, title) VALUES
      ('spec_auth', 'auth', '2.0.0', 'Auth & RBAC Identity API'),
      ('spec_devcenter', 'dev-dashboard', '2.0.0', 'Platform Observability & Metrics API'),
      ('spec_portal', 'portal', '2.1.0', 'Workspace Portal Gateway API');
    `);
  }
  db.close();
  console.log('  ✅ dev_hub.db initialized (api_specs, webhooks)');
}

// 6. Platform Core Database (platform_core.db)
function initPlatformCoreDb() {
  const dbPath = join(DATA_DIR, 'platform_core.db');
  const db = new Database(dbPath, { create: true });
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA busy_timeout = 5000;');
  db.run('PRAGMA auto_vacuum = INCREMENTAL;');
  db.run('PRAGMA synchronous = NORMAL;');

  if (isForce) {
    db.run('DROP TABLE IF EXISTS remote_connections;');
    db.run('DROP TABLE IF EXISTS audit_logs;');
    db.run('DROP TABLE IF EXISTS issue_reports;');
    db.run('DROP TABLE IF EXISTS traffic_events;');
    db.run('DROP TABLE IF EXISTS apps_registry;');
  }

  db.run(`CREATE TABLE IF NOT EXISTS apps_registry (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, port INTEGER NOT NULL, ingress_path TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Micro-Apps', access_role TEXT NOT NULL DEFAULT 'General',
    container_name TEXT, db_file_path TEXT, runtime_type TEXT NOT NULL DEFAULT 'bun-watch',
    remote_url TEXT, status TEXT NOT NULL DEFAULT 'active', storage_quota_mb INTEGER NOT NULL DEFAULT 50,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS traffic_events (
    id TEXT PRIMARY KEY, app_id TEXT NOT NULL, path TEXT NOT NULL, method TEXT NOT NULL,
    status_code INTEGER NOT NULL, duration_ms REAL NOT NULL, ip_hash TEXT, user_agent TEXT,
    trace_id TEXT, timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS issue_reports (
    id TEXT PRIMARY KEY, app_id TEXT NOT NULL, fingerprint TEXT NOT NULL UNIQUE, error_type TEXT NOT NULL,
    message TEXT NOT NULL, stack_trace TEXT, context_json TEXT, trace_id TEXT,
    occurrence_count INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'open',
    first_seen INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), last_seen INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action_type TEXT NOT NULL, target_service TEXT NOT NULL,
    payload_json TEXT, ip_hash TEXT, result_status TEXT NOT NULL DEFAULT 'success',
    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS remote_connections (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'turso',
    url TEXT NOT NULL, auth_token TEXT, is_active INTEGER NOT NULL DEFAULT 1,
    last_ping_ms REAL, error_message TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')), updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );`);

  db.close();
  console.log('  ✅ platform_core.db initialized (apps_registry, traffic, issues, audit, remotes)');
}

// Run all initializations
initAuthDb();
initTelemetryDb();
initDevHubDb();
initPlatformCoreDb();

console.log('🎉 All microservices databases successfully configured & seeded in:', DATA_DIR);
