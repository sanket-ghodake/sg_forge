/**
 * @forge/dev-dashboard - Tier 2 Integration: Realtime Telemetry Pipeline & SSE
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { telemetryEngine, startDevDashboardServer } from '../../src';

describe('Tier 2 Integration: Telemetry Pipeline & Log Stream', () => {
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

  it('ingests, stores, and filters logs via REST endpoints', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act: Ingest log
      const ingestRes = await fetch(`http://localhost:${server.port}/api/logs/ingest`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          service: 'test-service-ingest',
          severity: 'WARN',
          message: 'Telemetry integration warning test',
          source: 'unit-test',
          traceId: 'trace-integ-456',
        }),
      });
      const ingestJson: any = await ingestRes.json();

      // Assert ingest
      expect(ingestRes.status).toBe(200);
      expect(ingestJson.status).toBe('ok');

      // Act: Query recent logs
      const queryRes = await fetch(`http://localhost:${server.port}/api/logs/recent?service=test-service-ingest`, {
        headers: AUTH_HEADERS,
      });
      const queryJson: any = await queryRes.json();

      // Assert query
      expect(queryRes.status).toBe(200);
      expect(queryJson.status).toBe('ok');
      expect(queryJson.logs.length).toBeGreaterThan(0);
      expect(queryJson.logs[queryJson.logs.length - 1].message).toBe('Telemetry integration warning test');
    } finally {
      server.stop();
    }
  });

  it('ingests background telemetry logs without requiring operator session authentication', async () => {
    // Arrange: Cluster service forwarding log with NO auth headers
    const server = startDevDashboardServer(0);

    try {
      // Act: Unauthenticated log ingest
      const res = await fetch(`http://localhost:${server.port}/api/logs/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'auth-service',
          severity: 'INFO',
          message: 'User logged in successfully',
          source: 'app',
          traceId: 'trace-unauth-789',
        }),
      });
      const json: any = await res.json();

      // Assert: Must succeed with 200 OK
      expect(res.status).toBe(200);
      expect(json.status).toBe('ok');
    } finally {
      server.stop();
    }
  });

  it('manages SSE client connections and dispatches broadcast stream', () => {
    // Arrange
    let sentData = '';
    const decoder = new TextDecoder();
    const mockController: any = {
      enqueue: (chunk: Uint8Array | string) => {
        sentData += typeof chunk === 'string' ? chunk : decoder.decode(chunk);
      },
      close: () => {},
    };

    // Act
    telemetryEngine.registerSSEClient(mockController);
    telemetryEngine.pushLog('sse-service', 'INFO', 'SSE broadcast message');

    // Assert
    expect(sentData).toContain('SSE broadcast message');

    // Cleanup
    telemetryEngine.removeSSEClient(mockController);
  });
});
