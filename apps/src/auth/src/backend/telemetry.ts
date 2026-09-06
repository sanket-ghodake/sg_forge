/**
 * @forge/auth - 4-Pillar Observability & Isolated Logging Engine (2026 LTS)
 * Manages Dual-Probe Health, Browser Logs, Docker Lifecycle, and Backend/DB Logs.
 */

import { existsSync, mkdirSync, appendFileSync, statSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { cpus, freemem, totalmem, uptime as osUptime } from 'node:os';
import { createLogger, explainLog } from '@forge/sdk';
import { getAuthDb } from '../db/db';

const logger = createLogger('auth-telemetry');
const MAX_LOG_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_RING_BUFFER_SIZE = 1000;

/**
 * TelemetryLogEntry
 * @requirements [HLR-SDK-303] [LLR-SDK-002] [LLR-SDK-003]
 */
export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  service: string;
  source: 'app' | 'browser' | 'docker' | 'db';
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  traceId?: string;
  durationMs?: number;
  plainEnglishSummary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DualProbeHealthStatus
 * @requirements [HLR-SDK-303] [LLR-SDK-002] [LLR-SDK-003]
 */
export interface DualProbeHealthStatus {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  port: number;
  livez: boolean;
  readyz: boolean;
  timestamp: string;
  uptimeSeconds: number;
  vitals: {
    memoryUsedMb: number;
    memoryTotalMb: number;
    memoryPercent: number;
    cpuCores: number;
    hostUptimeSeconds: number;
  };
  database: {
    connected: boolean;
    activeUsers: number;
    activeSessions: number;
    latencyMs: number;
  };
}

class AuthTelemetryEngine {
  private logDir: string;
  private ringBuffer: TelemetryLogEntry[] = [];

  constructor() {
    this.logDir = join(import.meta.dir, '..', '..', 'logs');
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    try {
      if (!existsSync(this.logDir)) {
        mkdirSync(this.logDir, { recursive: true });
      }
    } catch {
      // Fallback relative path
      const fallback = join(import.meta.dir, '..', '..', 'logs');
      if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true });
      this.logDir = fallback;
    }
  }

  private appendLogFile(filename: string, entry: TelemetryLogEntry): void {
    try {
      this.ensureLogDir();
      const targetFile = join(this.logDir, filename);
      const line = JSON.stringify(entry) + '\n';
      appendFileSync(targetFile, line, 'utf8');

      // Rolling rotation check if > 5MB
      if (existsSync(targetFile)) {
        const stats = statSync(targetFile);
        if (stats.size > MAX_LOG_SIZE_BYTES) {
          const backup1 = `${targetFile}.1`;
          const backup2 = `${targetFile}.2`;
          if (existsSync(backup1)) renameSync(backup1, backup2);
          renameSync(targetFile, backup1);
        }
      }
    } catch (err) {
      // Fail-safe: Disk write error must never bring down the auth service
    }
  }

  public recordLog(
    source: 'app' | 'browser' | 'docker' | 'db',
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    message: string,
    metadata?: Record<string, unknown>,
    durationMs?: number,
    traceId?: string
  ): TelemetryLogEntry {
    const entry: TelemetryLogEntry = {
      id: `auth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      service: 'auth',
      source,
      level,
      message,
      durationMs,
      traceId,
      metadata,
    };

    entry.plainEnglishSummary = explainLog({
      severity: level,
      service: 'auth',
      message,
      timestamp: entry.timestamp,
    });

    // In-memory ring buffer
    if (this.ringBuffer.length >= MAX_RING_BUFFER_SIZE) {
      this.ringBuffer.shift();
    }
    this.ringBuffer.push(entry);

    // Write to dedicated pillar log file
    const fileMap: Record<string, string> = {
      app: 'app.log',
      browser: 'browser.log',
      docker: 'docker.log',
      db: 'db.log',
    };
    const filename = fileMap[source] || 'app.log';
    this.appendLogFile(filename, entry);

    return entry;
  }

  public getHealthStatus(port: number): DualProbeHealthStatus {
    const startDbPing = performance.now();
    let dbConnected = false;
    let activeUsers = 0;
    let activeSessions = 0;

    try {
      const db = getAuthDb();
      const userCount = db.query('SELECT COUNT(*) as count FROM auth_users WHERE status = "ACTIVE";').get() as any;
      const sessionCount = db.query('SELECT COUNT(*) as count FROM auth_sessions WHERE is_revoked = 0;').get() as any;
      activeUsers = userCount?.count || 0;
      activeSessions = sessionCount?.count || 0;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }
    const dbLatencyMs = parseFloat((performance.now() - startDbPing).toFixed(2));

    const totalMem = totalmem();
    const freeMem = freemem();
    const usedMem = totalMem - freeMem;

    return {
      status: dbConnected ? 'ok' : 'degraded',
      service: 'auth',
      port,
      livez: true, // Process event loop responsive
      readyz: dbConnected, // Database connected and operational
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      vitals: {
        memoryUsedMb: Math.round(usedMem / (1024 * 1024)),
        memoryTotalMb: Math.round(totalMem / (1024 * 1024)),
        memoryPercent: Math.round((usedMem / totalMem) * 100),
        cpuCores: cpus().length,
        hostUptimeSeconds: Math.floor(osUptime()),
      },
      database: {
        connected: dbConnected,
        activeUsers,
        activeSessions,
        latencyMs: dbLatencyMs,
      },
    };
  }

  public getRecentLogs(limit = 50, source?: string): TelemetryLogEntry[] {
    let logs = this.ringBuffer;
    if (source && source !== 'all') {
      logs = logs.filter((l) => l.source === source);
    }
    return logs.slice(-limit).reverse();
  }
}

/**
 * authTelemetry
 * @requirements [HLR-SDK-303] [LLR-SDK-002] [LLR-SDK-003]
 */
export const authTelemetry = new AuthTelemetryEngine();
