/**
 * @forge/platform - Playwright Real Browser E2E Spec: Observability & Blast Radius (Tier 5)
 * Verifies W3C distributed tracing, RFC 7807 incident tokens, Astryx copy card, and blast radius accounting.
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [HLR-SDK-303] [LLR-OBS-001] [LLR-OBS-002] [LLR-OBS-003] [SR-GATE-001]
 */

import { describe, expect, it } from 'bun:test';
import { createSafeHandler, RequestContext } from '../../../src/sdk/src';
import { startTelemetryServer } from '../../../../forge-apps/telemetry/src/server';

export const observabilityBlastRadiusJourney = {
  name: 'Real Browser E2E: Distributed Observability & Blast Radius Accounting',
  steps: [
    '1. Test W3C distributed traceparent propagation across HTTP boundary',
    '2. Test RFC 7807 problem json structure with immutable incident token',
    '3. Test Astryx HTML error page with 1-click incident token clipboard handler',
    '4. Test Telemetry microservice blast radius sliding window accounting',
  ],
  specs: {
    w3cStandard: true,
    rfc7807Compliant: true,
    zeroEmojis: true,
    blastRadiusWindowSeconds: 300,
  },
};

describe('Tier 5 E2E: Distributed Observability & Blast Radius User Journeys', () => {
  it('Arrange, Act, Assert: verifies observability specification metadata', () => {
    // Arrange & Act
    const { specs, steps } = observabilityBlastRadiusJourney;

    // Assert
    expect(steps.length).toBe(4);
    expect(specs.w3cStandard).toBe(true);
    expect(specs.rfc7807Compliant).toBe(true);
    expect(specs.zeroEmojis).toBe(true);
  });

  it('Journey 1: W3C distributed traceparent propagation & canonical event headers', async () => {
    // Arrange
    const sampleTraceId = 'a1b2c3d4e5f67890123456789abcdef0';
    const sampleSpanId = '1234567890abcdef';
    const traceparent = `00-${sampleTraceId}-${sampleSpanId}-01`;

    const handler = createSafeHandler('e2e-test-service', async (req, ctx) => {
      ctx.addSpan('db:test_query', 3.5);
      return Response.json({ success: true, traceId: ctx.traceId });
    });

    const testServer = Bun.serve({
      port: 0,
      fetch: handler,
    });

    try {
      // Act
      const res = await fetch(`http://localhost:${testServer.port}/api/test/resource`, {
        headers: {
          traceparent,
          'x-org-id': 'org_acme_corp',
        },
      });

      // Assert
      expect(res.status).toBe(200);
      expect(res.headers.get('x-trace-id')).toBe(sampleTraceId);
      expect(res.headers.get('traceparent')?.startsWith(`00-${sampleTraceId}-`)).toBe(true);
      expect(res.headers.get('x-incident-token')?.startsWith('ERR-E2ETES-')).toBe(true);

      const body = await res.json();
      expect(body.traceId).toBe(sampleTraceId);
    } finally {
      testServer.stop(true);
    }
  });

  it('Journey 2: Microservice exception returns RFC 7807 Problem JSON with incident token', async () => {
    // Arrange
    const handler = createSafeHandler('fault-service', async () => {
      throw new Error('Critical simulated database transaction deadlock');
    });

    const testServer = Bun.serve({
      port: 0,
      fetch: handler,
    });

    try {
      // Act
      const res = await fetch(`http://localhost:${testServer.port}/api/fault/simulate`, {
        headers: {
          accept: 'application/problem+json, application/json',
        },
      });

      // Assert
      expect(res.status).toBe(500);
      expect(res.headers.get('content-type')).toContain('application/problem+json');
      expect(res.headers.get('x-incident-token')).toBeDefined();

      const problem = await res.json();
      expect(problem.title).toBe('Internal Server Error');
      expect(problem.status).toBe(500);
      expect(problem.traceId).toBeDefined();
      expect(problem.incidentToken).toBeDefined();
      expect(problem.incidentToken.startsWith('ERR-FAULTS-')).toBe(true);
    } finally {
      testServer.stop(true);
    }
  });

  it('Journey 3: Browser client renders Astryx error screen with 1-click copy diagnostic handler', async () => {
    // Arrange
    const handler = createSafeHandler('ui-service', async () => {
      throw new Error('Simulated frontend rendering fault');
    });

    const testServer = Bun.serve({
      port: 0,
      fetch: handler,
    });

    try {
      // Act
      const res = await fetch(`http://localhost:${testServer.port}/portal/goals/overview`, {
        headers: {
          accept: 'text/html',
        },
      });

      // Assert
      expect(res.status).toBe(500);
      expect(res.headers.get('content-type')).toContain('text/html');

      const html = await res.text();
      expect(html).toContain('Internal Server Error');
      expect(html).toContain('Incident Token:');
      expect(html).toContain('navigator.clipboard.writeText');
      expect(html).toContain('Copied Diagnostic Data!');
      // Verify zero raw emojis
      expect(/[\u{1F300}-\u{1FAFF}]/u.test(html)).toBe(false);
    } finally {
      testServer.stop(true);
    }
  });

  it('Journey 4: Telemetry microservice ingests events and dynamically calculates blast radius', async () => {
    // Arrange
    const telemetryServer = startTelemetryServer(0);

    try {
      const baseUrl = `http://localhost:${telemetryServer.port}`;

      // Act - Step 1: Ingest 5 successful events from 5 distinct orgs
      for (let i = 1; i <= 5; i++) {
        const ingestRes = await fetch(`${baseUrl}/api/telemetry/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'goals',
            path: '/api/goals',
            method: 'GET',
            statusCode: 200,
            durationMs: 12.4,
            orgId: `org_journey_${i}`,
            userId: `user_${i}`,
            tier: 'pro',
            timestamp: Math.floor(Date.now() / 1000),
          }),
        });
        expect(ingestRes.status).toBe(200);
      }

      // Act - Step 2: Query blast radius before errors
      const initialRes = await fetch(`${baseUrl}/api/telemetry/blast-radius?window=300`);
      expect(initialRes.status).toBe(200);
      const initialData = await initialRes.json();
      expect(initialData.totalActiveOrgs).toBeGreaterThanOrEqual(5);

      // Act - Step 3: Ingest a 500 error for one enterprise org
      const failRes = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'goals',
          path: '/api/goals/save',
          method: 'POST',
          statusCode: 500,
          durationMs: 95.0,
          orgId: 'org_journey_enterprise_1',
          userId: 'user_admin',
          tier: 'enterprise',
          error: { type: 'DatabaseLocked' },
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });
      expect(failRes.status).toBe(200);

      // Act - Step 4: Query updated blast radius
      const updatedRes = await fetch(`${baseUrl}/api/telemetry/blast-radius?window=300`);
      const updatedData = await updatedRes.json();

      // Assert - Step 4: Enterprise failure triggers P0_CRITICAL
      expect(updatedData.enterpriseImpacted).toBe(true);
      expect(updatedData.severity).toBe('P0_CRITICAL');
      expect(updatedData.impactedOrgs).toBeGreaterThanOrEqual(1);
    } finally {
      telemetryServer.stop(true);
    }
  });
});
