/**
 * @forge-apps/code - Network Audit & Telemetry Logger (2026 LTS)
 * Captures all ingress and outbound network traffic for the VS Code cloud microservice.
 * Strictly adheres to Enterprise SRE structured JSON logging and zero-PII standards.
 */

import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createLogger, redactSensitiveData } from './lib/sdk';

/**
 * NetworkDirection
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export type NetworkDirection = 'INGRESS' | 'OUTBOUND_BROWSER';

/**
 * NetworkLogRecord
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export interface NetworkLogRecord {
  timestamp: string;
  service: string;
  category: 'NETWORK_AUDIT';
  direction: NetworkDirection;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  userId: string;
  clientIp: string;
  userAgent?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

const LOG_DIR = join(import.meta.dir, '..', 'logs');
const NETWORK_LOG_FILE = join(LOG_DIR, 'network.log');
const logger = createLogger('code-network-audit', LOG_DIR);

function ensureLogDir(): void {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Sanitizes URLs to prevent token and password leakage in query parameters or auth headers.
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function sanitizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const sensitiveParams = ['token', 'access_token', 'code', 'secret', 'key', 'apiKey', 'password'];
    for (const param of sensitiveParams) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    }
    return parsed.toString();
  } catch {
    return rawUrl.replace(/(token|secret|key|code|password)=([^&]+)/gi, '$1=[REDACTED]');
  }
}

/**
 * Appends a structured audit event to forge-apps/code/logs/network.log
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function recordNetworkEvent(event: Omit<NetworkLogRecord, 'timestamp' | 'service' | 'category'>): NetworkLogRecord {
  ensureLogDir();

  const record: NetworkLogRecord = {
    timestamp: new Date().toISOString(),
    service: 'code-app',
    category: 'NETWORK_AUDIT',
    direction: event.direction,
    method: event.method.toUpperCase(),
    url: sanitizeUrl(event.url),
    status: event.status,
    durationMs: Math.max(0, Math.round(event.durationMs)),
    userId: event.userId || 'anonymous',
    clientIp: event.clientIp || '127.0.0.1',
    userAgent: event.userAgent || 'unknown',
    traceId: event.traceId,
    metadata: event.metadata ? (redactSensitiveData(event.metadata) as Record<string, unknown>) : undefined,
  };

  try {
    const jsonLine = JSON.stringify(record) + '\n';
    appendFileSync(NETWORK_LOG_FILE, jsonLine, 'utf8');
  } catch (err: any) {
    logger.warn(`Failed to write to network.log: ${err.message}`);
  }

  return record;
}

/**
 * Helper to record ingress HTTP requests handled by the code microservice.
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function auditIngressCall(
  req: Request,
  status: number,
  durationMs: number,
  userId?: string,
  traceId?: string
): NetworkLogRecord {
  const url = new URL(req.url);
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  return recordNetworkEvent({
    direction: 'INGRESS',
    method: req.method,
    url: url.pathname + url.search,
    status,
    durationMs,
    userId: userId || 'anonymous',
    clientIp,
    userAgent,
    traceId,
  });
}

/**
 * Ingests a batch of browser-reported outbound network calls from the VS Code workbench.
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function ingestBrowserTelemetry(
  events: Array<{
    url: string;
    method?: string;
    status?: number;
    durationMs?: number;
    initiatorType?: string;
    metadata?: Record<string, unknown>;
  }>,
  userId: string,
  clientIp: string,
  userAgent: string,
  traceId?: string
): number {
  let count = 0;
  for (const ev of events) {
    if (!ev || !ev.url) continue;

    recordNetworkEvent({
      direction: 'OUTBOUND_BROWSER',
      method: ev.method || 'GET',
      url: ev.url,
      status: ev.status ?? 200,
      durationMs: ev.durationMs ?? 0,
      userId,
      clientIp,
      userAgent,
      traceId,
      metadata: {
        initiatorType: ev.initiatorType || 'resource',
        ...ev.metadata,
      },
    });
    count++;
  }
  return count;
}
