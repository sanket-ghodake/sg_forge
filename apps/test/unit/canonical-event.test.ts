/**
 * @forge/sdk - Unit Test: Canonical Event & W3C Trace Context (Tier 1)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [HLR-SDK-303] [LLR-OBS-001] [LLR-OBS-002]
 */

import { describe, expect, it } from 'bun:test';
import {
  RequestContext,
  parseOrCreateTraceContext,
  formatTraceparent,
  generateIncidentToken,
  generateSpanId,
  generateTraceId,
} from '../../src/sdk/src/canonical-event';

describe('Tier 1 Unit: Canonical Event & W3C Trace Context Engine', () => {
  it('Arrange, Act, Assert: parses a valid W3C traceparent header correctly', () => {
    // Arrange
    const sampleTraceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    const sampleParentSpan = '00f067aa0ba902b7';
    const traceparentHeader = `00-${sampleTraceId}-${sampleParentSpan}-01`;

    // Act
    const ctx = parseOrCreateTraceContext(traceparentHeader);

    // Assert
    expect(ctx.version).toBe('00');
    expect(ctx.traceId).toBe(sampleTraceId);
    expect(ctx.parentSpanId).toBe(sampleParentSpan);
    expect(ctx.spanId).toHaveLength(16);
    expect(ctx.sampled).toBe(true);

    const formatted = formatTraceparent(ctx);
    expect(formatted.startsWith(`00-${sampleTraceId}-${ctx.spanId}-`)).toBe(true);
  });

  it('Arrange, Act, Assert: generates a fresh compliant 32-hex trace ID when header is missing or malformed', () => {
    // Arrange & Act
    const ctxFromNull = parseOrCreateTraceContext(null);
    const ctxFromGarbage = parseOrCreateTraceContext('invalid-traceparent-format');

    // Assert
    expect(ctxFromNull.traceId).toHaveLength(32);
    expect(ctxFromNull.spanId).toHaveLength(16);
    expect(ctxFromGarbage.traceId).toHaveLength(32);
    expect(ctxFromGarbage.spanId).toHaveLength(16);
  });

  it('Arrange, Act, Assert: generates an operator-friendly Incident Reference Token', () => {
    // Arrange
    const traceId = 'a1b2c3d4e5f67890123456789abcdef0';

    // Act
    const token = generateIncidentToken('portal-app', traceId);

    // Assert
    expect(token).toBe('ERR-PORTAL-A1B2C3');
    expect(token.startsWith('ERR-')).toBe(true);
  });

  it('Arrange, Act, Assert: accumulates execution spans and exports canonical wide event', () => {
    // Arrange
    const req = new Request('http://localhost:3000/api/goals/update', {
      method: 'POST',
      headers: {
        'x-org-id': 'org_enterprise_acme',
        'x-user-id': 'usr_sanket_99',
        'x-user-role': 'admin',
        'x-tenant-tier': 'enterprise',
      },
    });
    const ctx = new RequestContext('goals', req);

    // Act
    ctx.addSpan('db:query_user_permissions', 5.4, { query: 'SELECT * FROM users' });
    ctx.addSpan('db:update_goal_status', 12.1);
    ctx.addSpan('cache:invalidate_subgraph', 2.0);

    const canonical = ctx.toCanonicalEvent(200, 28.5);

    // Assert
    expect(canonical.schemaVersion).toBe('2026-09-LTS');
    expect(canonical.service).toBe('goals');
    expect(canonical.route).toBe('/api/goals/update');
    expect(canonical.method).toBe('POST');
    expect(canonical.statusCode).toBe(200);
    expect(canonical.durationMs).toBe(28.5);
    expect(canonical.tenant.orgId).toBe('org_enterprise_acme');
    expect(canonical.tenant.userId).toBe('usr_sanket_99');
    expect(canonical.tenant.tier).toBe('enterprise');

    // Check Metrics aggregation
    expect(canonical.metrics.spanCount).toBe(3);
    expect(canonical.metrics.dbQueryCount).toBe(2);
    expect(canonical.metrics.dbDurationMs).toBe(17.5);
    expect(canonical.spans).toHaveLength(3);
    expect(canonical.incidentToken.startsWith('ERR-GOALS-')).toBe(true);
  });
});
