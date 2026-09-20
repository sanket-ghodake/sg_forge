/**
 * @forge/sdk - Enterprise Canonical Event & Context Propagation Engine (2026 LTS)
 * Tech-Giant Standard:
 * - W3C Distributed Trace Context (00-{trace_id}-{span_id}-{flags})
 * - Multi-tenant high-cardinality request context accumulator
 * - Single wide JSON canonical log line emission upon request termination
 * - Zero external dependencies (pure Bun & standard Web APIs)
 */

import { redactSensitiveData } from './logger';

/**
 * W3C Trace Context specification representation.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export interface W3cTraceContext {
  version: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  flags: string;
  sampled: boolean;
}

/**
 * Wide Canonical Request Event Schema (Stripe / Honeycomb single-event pattern).
 * @requirements [HLR-SDK-303] [LLR-OBS-001] [SR-LOG-001]
 */
export interface CanonicalRequestEvent {
  schemaVersion: '2026-09-LTS';
  timestamp: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceparent: string;
  incidentToken: string;
  service: string;
  route: string;
  method: string;
  statusCode: number;
  durationMs: number;
  tenant: {
    orgId?: string;
    userId?: string;
    userRole?: string;
    tier?: string;
  };
  metrics: {
    spanCount: number;
    dbQueryCount: number;
    dbDurationMs: number;
  };
  spans: Array<{
    name: string;
    durationMs: number;
    error?: string;
  }>;
  error?: {
    type?: string;
    message?: string;
  };
}

/**
 * Internal span record within request execution.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export interface ExecutionSpan {
  name: string;
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generates a clean, 16-hexadecimal random span identifier.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a clean, 32-hexadecimal random trace identifier.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a human-friendly, short Incident Reference Token for user support.
 * Example: ERR-PORTAL-A7F29B
 * @requirements [HLR-SDK-303] [LLR-OBS-002]
 */
export function generateIncidentToken(service: string, traceId: string): string {
  const cleanService = (service || 'SRV').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  const cleanTrace = (traceId || '000000').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return `ERR-${cleanService}-${cleanTrace}`;
}

/**
 * Parses a standard W3C traceparent header or creates a fresh trace context.
 * Format: 00-{32_hex_trace_id}-{16_hex_parent_id}-{2_hex_flags}
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export function parseOrCreateTraceContext(header?: string | null): W3cTraceContext {
  if (header && typeof header === 'string') {
    const parts = header.trim().split('-');
    if (parts.length === 4 && parts[0] === '00' && parts[1].length === 32 && parts[2].length === 16) {
      return {
        version: parts[0],
        traceId: parts[1].toLowerCase(),
        parentSpanId: parts[2].toLowerCase(),
        spanId: generateSpanId(),
        flags: parts[3],
        sampled: (parseInt(parts[3], 16) & 1) === 1,
      };
    }
  }

  const traceId = generateTraceId();
  const spanId = generateSpanId();
  return {
    version: '00',
    traceId,
    spanId,
    flags: '01',
    sampled: true,
  };
}

/**
 * Formats a W3cTraceContext into standard W3C traceparent header string.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export function formatTraceparent(ctx: W3cTraceContext): string {
  return `${ctx.version}-${ctx.traceId}-${ctx.spanId}-${ctx.flags}`;
}

/**
 * Request Context accumulator for tracking distributed operations and multi-tenant metadata.
 * @requirements [HLR-SDK-303] [LLR-OBS-001]
 */
export class RequestContext {
  public readonly traceContext: W3cTraceContext;
  public readonly traceId: string;
  public readonly spanId: string;
  public readonly incidentToken: string;
  public readonly service: string;
  public readonly route: string;
  public readonly method: string;
  public orgId?: string;
  public userId?: string;
  public userRole?: string;
  public tier?: string;

  private readonly spans: ExecutionSpan[] = [];

  constructor(service: string, req: Request) {
    const rawTraceparent = req.headers.get('traceparent');
    const rawCustomTraceId = req.headers.get('x-trace-id') || req.headers.get('x-request-id');

    if (rawTraceparent && rawTraceparent.includes('-')) {
      this.traceContext = parseOrCreateTraceContext(rawTraceparent);
      this.traceId = this.traceContext.traceId;
    } else if (rawCustomTraceId) {
      this.traceId = rawCustomTraceId;
      this.traceContext = {
        version: '00',
        traceId: rawCustomTraceId.length === 32 ? rawCustomTraceId : generateTraceId(),
        spanId: generateSpanId(),
        flags: '01',
        sampled: true,
      };
    } else {
      this.traceContext = parseOrCreateTraceContext(null);
      this.traceId = this.traceContext.traceId;
    }

    this.spanId = this.traceContext.spanId;
    this.incidentToken = generateIncidentToken(service, this.traceId);
    this.service = service;

    const url = new URL(req.url);
    this.route = url.pathname;
    this.method = req.method;

    this.extractTenantHeaders(req);
  }

  private extractTenantHeaders(req: Request): void {
    this.orgId = req.headers.get('x-org-id') || undefined;
    this.userId = req.headers.get('x-user-id') || undefined;
    this.userRole = req.headers.get('x-user-role') || undefined;
    this.tier = req.headers.get('x-tenant-tier') || undefined;
  }

  public setTenantContext(orgId?: string, userId?: string, userRole?: string, tier?: string): void {
    if (orgId) this.orgId = orgId;
    if (userId) this.userId = userId;
    if (userRole) this.userRole = userRole;
    if (tier) this.tier = tier;
  }

  public addSpan(name: string, durationMs: number, metadata?: Record<string, unknown>, error?: string): void {
    this.spans.push({
      name,
      durationMs: Number(durationMs.toFixed(2)),
      error,
      metadata: metadata ? (redactSensitiveData(metadata) as Record<string, unknown>) : undefined,
    });
  }

  public getSpans(): readonly ExecutionSpan[] {
    return this.spans;
  }

  public toCanonicalEvent(
    statusCode: number,
    totalDurationMs: number,
    errorDetails?: { type?: string; message?: string }
  ): CanonicalRequestEvent {
    let dbQueryCount = 0;
    let dbDurationMs = 0;

    for (const span of this.spans) {
      if (span.name.toLowerCase().startsWith('db') || span.name.toLowerCase().includes('query')) {
        dbQueryCount++;
        dbDurationMs += span.durationMs;
      }
    }

    return {
      schemaVersion: '2026-09-LTS',
      timestamp: new Date().toISOString(),
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.traceContext.parentSpanId,
      traceparent: formatTraceparent(this.traceContext),
      incidentToken: this.incidentToken,
      service: this.service,
      route: this.route,
      method: this.method,
      statusCode,
      durationMs: Number(totalDurationMs.toFixed(2)),
      tenant: {
        orgId: this.orgId,
        userId: this.userId,
        userRole: this.userRole,
        tier: this.tier,
      },
      metrics: {
        spanCount: this.spans.length,
        dbQueryCount,
        dbDurationMs: Number(dbDurationMs.toFixed(2)),
      },
      spans: this.spans.map((s) => ({
        name: s.name,
        durationMs: s.durationMs,
        error: s.error,
      })),
      error: errorDetails
        ? {
            type: errorDetails.type,
            message: typeof errorDetails.message === 'string'
              ? (redactSensitiveData(errorDetails.message) as string)
              : undefined,
          }
        : undefined,
    };
  }
}
