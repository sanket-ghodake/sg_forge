/**
 * @forge/sdk - Enterprise Foundation SDK: Structured Logger (v2.0.0 LTS)
 * Enterprise SRE Observability & Enterprise AppSec Standard:
 * - Deterministic JSON structured logging with PII/secret redaction
 * - Plain English summary generator for rapid troubleshooting
 * - Colocated local disk write with 5MB rolling log rotation
 * - Background telemetry forwarding to DevCenter dashboard
 */

/**
 * Supported severity levels for structured SRE logging.
 * @requirements [HLR-SDK-303] [LLR-SDK-002]
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

const SENSITIVE_KEY_REGEX =
  /^(password|pass|secret|token|temptoken|accesstoken|refreshtoken|apikey|api_key|authorization|auth|cookie|set-cookie|creditcard|cvv|ssn|privatekey)$/i;
const BEARER_REGEX = /Bearer\s+[a-zA-Z0-9_\-\.]+/gi;

/**
 * Enterprise PII & Secret Redaction Engine (Enterprise AppSec Standard).
 * Recursively sanitizes objects, arrays, and strings to prevent leaking credentials.
 * @requirements [HLR-SDK-303] [LLR-SDK-003]
 */
export function redactSensitiveData(data: unknown, depth = 0): unknown {
  if (depth > 6 || data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return data.replace(BEARER_REGEX, 'Bearer [REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = redactSensitiveData(val, depth + 1);
      } else if (typeof val === 'string') {
        sanitized[key] = val.replace(BEARER_REGEX, 'Bearer [REDACTED]');
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Standard structured log entry payload for SRE telemetry pipeline.
 * @requirements [HLR-SDK-303] [LLR-SDK-002] [SR-LOG-001]
 */
export interface LogEntry {
  severity: LogLevel;
  service: string;
  message: string;
  timestamp: string;
  source?: 'app' | 'browser' | 'docker' | 'db';
  traceId?: string;
  durationMs?: number;
  plainEnglishSummary?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Deterministic heuristic engine that translates technical logs into plain English summaries.
 * @requirements [HLR-SDK-303] [LLR-SDK-002]
 */
export function explainLog(entry: LogEntry): string {
  const msg = (entry.message || '').toLowerCase();
  const err = (entry.error?.message || '').toLowerCase();
  const text = `${msg} ${err}`;

  if (text.includes('sqlite_busy') || text.includes('database is locked')) {
    return 'Database is busy with another write transaction. Retrying automatically.';
  }
  if (text.includes('econnrefused') || text.includes('fetch failed')) {
    return `Cannot connect to ${entry.service}. The service might be starting or stopped.`;
  }
  if (text.includes('timeout') || text.includes('aborted')) {
    return `Operation on ${entry.service} took longer than expected and timed out.`;
  }
  if (text.includes('401') || text.includes('unauthorized') || text.includes('invalid token')) {
    return 'Authentication failed or session expired. Please re-login.';
  }
  if (text.includes('403') || text.includes('forbidden')) {
    return 'Access denied. Insufficient permissions for this resource.';
  }
  if (text.includes('404') || text.includes('not found')) {
    return 'Requested endpoint or resource was not found.';
  }
  if (text.includes('system_boot') || text.includes('initialized') || text.includes('online')) {
    return `Service ${entry.service} started successfully and is healthy.`;
  }
  if (entry.severity === 'ERROR' || entry.severity === 'FATAL') {
    return `An unexpected error occurred in ${entry.service}: ${entry.message}`;
  }
  if (entry.severity === 'WARN') {
    return `Warning reported in ${entry.service}: ${entry.message}`;
  }
  return `Normal activity in ${entry.service}.`;
}

/**
 * Enterprise SRE structured logger writing dual outputs (stdout JSON + rolling 5MB disk logs).
 * @requirements [HLR-SDK-303] [LLR-SDK-002] [LLR-SUB-004]
 */
export class ForgeLogger {
  private logDir: string | null = null;

  constructor(private serviceName: string, customLogDir?: string) {
    if (customLogDir) {
      this.logDir = customLogDir;
    }
  }

  public setLogDir(dir: string) {
    this.logDir = dir;
  }

  private appendToDisk(filename: string, entry: LogEntry) {
    if (typeof process === 'undefined' || !this.logDir) return;
    try {
      const fs = require('node:fs');
      const path = require('node:path');
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      const targetFile = path.join(this.logDir, filename);
      const line = JSON.stringify(entry) + '\n';
      fs.appendFileSync(targetFile, line, 'utf8');

      // Rolling rotation check if > 5MB
      try {
        const stats = fs.statSync(targetFile);
        if (stats.size > 5 * 1024 * 1024) {
          const backup1 = `${targetFile}.1`;
          const backup2 = `${targetFile}.2`;
          if (fs.existsSync(backup1)) fs.renameSync(backup1, backup2);
          fs.renameSync(targetFile, backup1);
        }
      } catch {}
    } catch {}
  }

  private log(
    severity: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    err?: Error | unknown,
    source: 'app' | 'browser' | 'docker' | 'db' = 'app',
    traceId?: string
  ) {
    const sanitizedMeta = meta ? (redactSensitiveData(meta) as Record<string, unknown>) : undefined;
    const sanitizedMessage = typeof message === 'string' ? (redactSensitiveData(message) as string) : message;

    let errorObj: { name: string; message: string; stack?: string } | undefined;
    if (err instanceof Error) {
      errorObj = {
        name: err.name,
        message: String(redactSensitiveData(err.message)),
        stack: err.stack ? String(redactSensitiveData(err.stack)) : undefined,
      };
    } else if (err && typeof err === 'object') {
      const e = err as any;
      errorObj = {
        name: e.name || 'Error',
        message: String(redactSensitiveData(e.message || JSON.stringify(e))),
        stack: e.stack ? String(redactSensitiveData(e.stack)) : undefined,
      };
    } else if (err !== undefined && err !== null) {
      errorObj = {
        name: 'Error',
        message: String(redactSensitiveData(String(err))),
      };
    }

    const entry: LogEntry = {
      severity,
      service: this.serviceName,
      source,
      traceId,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      metadata: sanitizedMeta,
      error: errorObj,
    };
    entry.plainEnglishSummary = explainLog(entry);

    // 1. Output to local TTY console
    if (typeof process !== 'undefined' && process.stdout?.isTTY && process.env.NODE_ENV !== 'production') {
      const color =
        severity === 'ERROR' || severity === 'FATAL'
          ? '\x1b[31m'
          : severity === 'WARN'
          ? '\x1b[33m'
          : '\x1b[36m';
      console.log(
        `${color}[${entry.timestamp}] [${entry.severity}] [${entry.service}]\x1b[0m ${entry.message}`,
        sanitizedMeta ? JSON.stringify(sanitizedMeta) : ''
      );
      if ((err as any)?.stack) console.error((err as any).stack);
    } else if (typeof console !== 'undefined') {
      console.log(JSON.stringify(entry));
    }

    // 2. Colocated isolated disk write
    const logFilename = source === 'db' ? 'db.log' : source === 'browser' ? 'browser.log' : 'app.log';
    this.appendToDisk(logFilename, entry);

    // 3. Ship to DevCenter real-time log stream
    if (this.serviceName !== 'dev-dashboard' && this.serviceName !== 'telemetry-engine') {
      const devPort = process.env.DEV_DASHBOARD_PORT || 3002;
      const ingestUrls = [
        `http://localhost:${devPort}/api/logs/ingest`,
        `http://dev-dashboard:${devPort}/api/logs/ingest`,
      ];
      const payload = JSON.stringify(entry);
      for (const u of ingestUrls) {
        fetch(u, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          signal: AbortSignal.timeout(200),
        }).catch(() => {});
      }
    }
  }

  public debug(msg: string, meta?: Record<string, unknown>, traceId?: string) {
    this.log('DEBUG', msg, meta, undefined, 'app', traceId);
  }
  public info(msg: string, meta?: Record<string, unknown>, traceId?: string) {
    this.log('INFO', msg, meta, undefined, 'app', traceId);
  }
  public warn(msg: string, meta?: Record<string, unknown>, traceId?: string) {
    this.log('WARN', msg, meta, undefined, 'app', traceId);
  }
  public error(msg: string, err?: Error | unknown, meta?: Record<string, unknown>, traceId?: string) {
    if (err && !(err instanceof Error) && typeof err === 'object' && !('message' in err) && !meta) {
      this.log('ERROR', msg, err as Record<string, unknown>, undefined, 'app', traceId);
    } else {
      this.log('ERROR', msg, meta, err, 'app', traceId);
    }
  }
  public fatal(msg: string, err?: Error | unknown, meta?: Record<string, unknown>, traceId?: string) {
    if (err && !(err instanceof Error) && typeof err === 'object' && !('message' in err) && !meta) {
      this.log('FATAL', msg, err as Record<string, unknown>, undefined, 'app', traceId);
    } else {
      this.log('FATAL', msg, meta, err, 'app', traceId);
    }
  }

  public logDbQuery(sql: string, durationMs: number, err?: Error, traceId?: string) {
    const isSlow = durationMs > 10;
    const severity: LogLevel = err ? 'ERROR' : isSlow ? 'WARN' : 'DEBUG';
    const msg = `${isSlow ? '⚠️ SLOW SQL ' : 'SQL '}(${durationMs}ms): ${sql}`;
    this.log(severity, msg, { sql, durationMs }, err, 'db', traceId);
  }

  public logBrowserEvent(
    severity: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    err?: Error,
    traceId?: string
  ) {
    this.log(severity, message, meta, err, 'browser', traceId);
  }
}

/**
 * Factory creating a structured ForgeLogger instance for an application service.
 * @requirements [HLR-SDK-303] [LLR-SDK-002]
 */
export function createLogger(serviceName: string, customLogDir?: string): ForgeLogger {
  return new ForgeLogger(serviceName, customLogDir);
}
