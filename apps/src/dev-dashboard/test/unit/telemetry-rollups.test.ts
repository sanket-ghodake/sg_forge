import { describe, expect, it } from 'bun:test';
import { TelemetryDatabaseManager } from '../../src/db/telemetry-db';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync, existsSync } from 'node:fs';

describe('Tier 1 Unit: Telemetry Rollup & Storage Engine [LLR-TEL-001] [HLR-DEV-501]', () => {
  const testDbPath = join(tmpdir(), `test_tel_${Date.now()}.db`);
  const telDb = new TelemetryDatabaseManager(testDbPath);

  it('Arrange, Act, Assert: records granular traffic event and retrieves summary', () => {
    // 1. Arrange: Record 5 sample traffic events
    telDb.recordTrafficEvent({
      app_id: 'portal',
      path: '/portal',
      method: 'GET',
      status_code: 200,
      duration_ms: 1.2,
      client_ip: '140.82.121.4',
      visitor_id: 'vis_user1',
      bytes_transferred: 1024,
    });

    telDb.recordTrafficEvent({
      app_id: 'portal',
      path: '/api/data',
      method: 'POST',
      status_code: 200,
      duration_ms: 2.4,
      client_ip: '140.82.121.4',
      visitor_id: 'vis_user1',
      bytes_transferred: 2048,
    });

    telDb.recordTrafficEvent({
      app_id: 'auth',
      path: '/api/login',
      method: 'POST',
      status_code: 401,
      duration_ms: 3.1,
      client_ip: '88.99.14.22',
      visitor_id: 'vis_user2',
      bytes_transferred: 512,
    });

    // 2. Act: Query 24h summary
    const summary = telDb.getMetricsSummary('24h', 'all');

    // 3. Assert: Verify KPIs
    expect(summary.totalRequests).toBe(3);
    expect(summary.uniqueVisitors).toBe(2);
    expect(summary.totalBytes).toBe(3584);
    expect(summary.statusBreakdown.s2xx).toBe(2);
    expect(summary.statusBreakdown.s4xx).toBe(1);
    expect(summary.statusBreakdown.successRatePct).toBe(66.7);
    expect(summary.p50LatencyMs).toBeGreaterThan(0);
  });

  it('Arrange, Act, Assert: computes time series buckets properly', () => {
    const buckets = telDb.getTimeSeriesBuckets('24h', 'all');
    expect(Array.isArray(buckets)).toBe(true);
    expect(buckets.length).toBeGreaterThan(0);
    const lastBucket = buckets[buckets.length - 1];
    expect(lastBucket).toHaveProperty('totalRequests');
    expect(lastBucket).toHaveProperty('p50LatencyMs');
  });

  it('Arrange, Act, Assert: computes dimensional breakdowns properly', () => {
    const breakdowns = telDb.getBreakdowns('24h', 'all');
    expect(Array.isArray(breakdowns.topRoutes)).toBe(true);
    expect(breakdowns.topRoutes.length).toBeGreaterThan(0);
    expect(breakdowns.topRoutes[0].label).toBeDefined();
  });

  it('Arrange, Act, Assert: filters inspector events with search query', () => {
    const allEvents = telDb.getInspectorEvents(10);
    expect(allEvents.length).toBe(3);

    const filtered = telDb.getInspectorEvents(10, 'login');
    expect(filtered.length).toBe(1);
    expect(filtered[0].path).toBe('/api/login');
  });

  // Cleanup test database
  try {
    if (existsSync(testDbPath)) unlinkSync(testDbPath);
  } catch {}
});
