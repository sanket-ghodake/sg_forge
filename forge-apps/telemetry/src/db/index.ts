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

logger.info('Initialized isolated Turso DB for telemetry microservice');
