/**
 * Forge App: Telemetry Service - Dedicated Turso SQLite Client (2026 LTS)
 * Strict Per-App Database Isolation (Enterprise Multi-Tenant Standard)
 */

import { createLogger, getDatabaseClient } from '../lib/sdk';

const logger = createLogger('telemetry-db');
/**
 * telemetryDb
 * @requirements [HLR-TEL-801] [LLR-SUB-004] [HLR-TEL-002] [LLR-TEL-002.1]
 */
export const telemetryDb = getDatabaseClient('telemetry.db');

// Initialize telemetry snapshots table
telemetryDb.run(`
  CREATE TABLE IF NOT EXISTS telemetry_snapshots (
    id TEXT PRIMARY KEY,
    cpu_percent REAL NOT NULL,
    memory_mb REAL NOT NULL,
    active_services INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  );
`);

// Initialize multi-tenant request events table for blast radius accounting
telemetryDb.run(`
  CREATE TABLE IF NOT EXISTS request_events (
    id TEXT PRIMARY KEY,
    trace_id TEXT NOT NULL,
    incident_token TEXT,
    service TEXT NOT NULL,
    route TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration_ms REAL NOT NULL,
    org_id TEXT,
    user_id TEXT,
    tier TEXT,
    error_type TEXT,
    timestamp INTEGER NOT NULL
  );
`);
telemetryDb.run(`CREATE INDEX IF NOT EXISTS idx_req_events_ts ON request_events(timestamp);`);
telemetryDb.run(`CREATE INDEX IF NOT EXISTS idx_req_events_org ON request_events(org_id);`);
telemetryDb.run(`CREATE INDEX IF NOT EXISTS idx_req_events_status ON request_events(status_code);`);

export interface BlastRadiusResult {
  windowSeconds: number;
  totalActiveOrgs: number;
  impactedOrgs: number;
  totalRequests: number;
  totalErrors: number;
  blastRadiusPct: number;
  severity: 'NORMAL' | 'ELEVATED' | 'P0_CRITICAL';
  enterpriseImpacted: boolean;
}

/**
 * Calculates real-time multi-tenant blast radius across a sliding time window.
 * @requirements [HLR-TEL-801] [LLR-OBS-003]
 */
export function calculateBlastRadius(windowSeconds: number = 300): BlastRadiusResult {
  const cutoff = Math.floor(Date.now() / 1000) - windowSeconds;

  const stmt = telemetryDb.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN org_id IS NOT NULL AND org_id != '' THEN org_id END) as total_active_orgs,
      COUNT(DISTINCT CASE WHEN status_code >= 500 AND org_id IS NOT NULL AND org_id != '' THEN org_id END) as impacted_orgs,
      COUNT(CASE WHEN status_code >= 500 AND tier = 'enterprise' THEN 1 END) as enterprise_errors,
      COUNT(CASE WHEN status_code >= 500 THEN 1 END) as total_errors,
      COUNT(*) as total_requests
    FROM request_events
    WHERE timestamp >= ?
  `);

  const row = stmt.get(cutoff) as any;
  const totalActiveOrgs = Number(row?.total_active_orgs || 0);
  const impactedOrgs = Number(row?.impacted_orgs || 0);
  const totalRequests = Number(row?.total_requests || 0);
  const totalErrors = Number(row?.total_errors || 0);
  const enterpriseErrors = Number(row?.enterprise_errors || 0);

  const blastRadiusPct = totalActiveOrgs > 0
    ? Number(((impactedOrgs / totalActiveOrgs) * 100).toFixed(2))
    : 0;

  let severity: 'NORMAL' | 'ELEVATED' | 'P0_CRITICAL' = 'NORMAL';
  if (blastRadiusPct >= 5.0 || enterpriseErrors > 0) {
    severity = 'P0_CRITICAL';
  } else if (blastRadiusPct >= 1.0) {
    severity = 'ELEVATED';
  }

  return {
    windowSeconds,
    totalActiveOrgs,
    impactedOrgs,
    totalRequests,
    totalErrors,
    blastRadiusPct,
    severity,
    enterpriseImpacted: enterpriseErrors > 0,
  };
}

logger.info('Initialized isolated Turso DB for telemetry microservice with Blast Radius tables');

