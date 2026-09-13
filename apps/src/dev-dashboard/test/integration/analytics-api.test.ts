import { describe, expect, it } from 'bun:test';
import { handleAnalyticsApi } from '../../src/backend/api-analytics-handlers';
import { analyticsController } from '../../src/backend/analytics-controller';

describe('Tier 2 Integration: Vercel-Style Analytics REST API [LLR-TEL-001] [HLR-DEV-501]', () => {
  it('Arrange, Act, Assert: GET /api/analytics/overview returns standard schema', async () => {
    // 1. Arrange: Record test requests
    analyticsController.recordLiveRequest({
      appId: 'portal',
      path: '/portal/dashboard',
      method: 'GET',
      statusCode: 200,
      durationMs: 1.4,
      clientIp: '140.82.121.4',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0',
    });

    // 2. Act: Call overview endpoint
    const req = new Request('http://localhost:3002/api/analytics/overview?range=24h');
    const res = await handleAnalyticsApi('/api/analytics/overview', req, new URL(req.url));

    // 3. Assert
    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.status).toBe('ok');
    expect(data.data.totalRequests).toBeGreaterThanOrEqual(1);
    expect(data.data.throughputRps).toBeDefined();
    expect(data.data.p50LatencyMs).toBeDefined();
  });

  it('Arrange, Act, Assert: GET /api/analytics/timeseries returns bucketed time series', async () => {
    const req = new Request('http://localhost:3002/api/analytics/timeseries?range=24h');
    const res = await handleAnalyticsApi('/api/analytics/timeseries', req, new URL(req.url));

    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.buckets)).toBe(true);
    expect(data.buckets.length).toBeGreaterThan(0);
  });

  it('Arrange, Act, Assert: GET /api/analytics/breakdowns returns 6 dimensional breakdowns', async () => {
    const req = new Request('http://localhost:3002/api/analytics/breakdowns?range=24h');
    const res = await handleAnalyticsApi('/api/analytics/breakdowns', req, new URL(req.url));

    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.status).toBe('ok');
    expect(data.breakdowns).toHaveProperty('topRoutes');
    expect(data.breakdowns).toHaveProperty('countries');
    expect(data.breakdowns).toHaveProperty('operatingSystems');
    expect(data.breakdowns).toHaveProperty('browsers');
    expect(data.breakdowns).toHaveProperty('devices');
    expect(data.breakdowns).toHaveProperty('referrers');
  });

  it('Arrange, Act, Assert: GET /api/analytics/inspector returns client machine and IP details', async () => {
    const req = new Request('http://localhost:3002/api/analytics/inspector?limit=25');
    const res = await handleAnalyticsApi('/api/analytics/inspector', req, new URL(req.url));

    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.events)).toBe(true);
    expect(data.events.length).toBeGreaterThan(0);

    const firstEvent = data.events[0];
    expect(firstEvent).toHaveProperty('clientIp');
    expect(firstEvent).toHaveProperty('countryName');
    expect(firstEvent).toHaveProperty('os');
    expect(firstEvent).toHaveProperty('browser');
    expect(firstEvent).toHaveProperty('screenRes');
  });

  it('Arrange, Act, Assert: POST /api/analytics/collect ingests client-side beacon', async () => {
    const beacon = {
      service: 'portal',
      path: '/portal/settings',
      machine: {
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 2,
        hardwareConcurrency: 8,
        deviceMemoryGb: 16,
        language: 'en-US',
        colorScheme: 'dark',
      },
      vitals: {
        ttfbMs: 25,
        lcpMs: 310,
        cls: 0.02,
      },
    };

    const req = new Request('http://localhost:3002/api/analytics/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Real-IP': '88.99.14.22',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0',
      },
      body: JSON.stringify(beacon),
    });

    const res = await handleAnalyticsApi('/api/analytics/collect', req, new URL(req.url));
    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.ingested).toBe(true);
  });

  it('Arrange, Act, Assert: POST /api/analytics/seed-historical seeds 365 days of data', async () => {
    const req = new Request('http://localhost:3002/api/analytics/seed-historical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 365 }),
    });

    const res = await handleAnalyticsApi('/api/analytics/seed-historical', req, new URL(req.url));
    expect(res?.status).toBe(200);
    const data = await res?.json();
    expect(data.success).toBe(true);
    expect(data.rollupsSeeded).toBeGreaterThan(300);
  });

  it('Arrange, Act, Assert: GET /api/analytics/export streams CSV format', async () => {
    const req = new Request('http://localhost:3002/api/analytics/export?range=24h');
    const res = await handleAnalyticsApi('/api/analytics/export', req, new URL(req.url));

    expect(res?.status).toBe(200);
    expect(res?.headers.get('Content-Type')).toContain('text/csv');
    const text = await res?.text();
    expect(text?.startsWith('Timestamp,Service,Method,Path')).toBe(true);
  });

  it('Arrange, Act, Assert: excludes liveness probes when category=user and includes them with category=all', async () => {
    // 1. Arrange: Record a probe and a user request
    analyticsController.recordLiveRequest({
      appId: 'dev-dashboard',
      path: '/health',
      method: 'GET',
      statusCode: 200,
      durationMs: 0.1,
      clientIp: '127.0.0.1',
      userAgent: 'kube-probe/1.28',
    });

    analyticsController.recordLiveRequest({
      appId: 'dev-dashboard',
      path: '/devcenter',
      method: 'GET',
      statusCode: 200,
      durationMs: 2.1,
      clientIp: '24.120.45.10',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0',
    });

    // 2. Act: Fetch inspector with category=probe
    const reqProbe = new Request('http://localhost:3002/api/analytics/inspector?category=probe&limit=10');
    const resProbe = await handleAnalyticsApi('/api/analytics/inspector', reqProbe, new URL(reqProbe.url));
    const dataProbe = await resProbe?.json();

    // 3. Assert: All returned events should have category === 'probe'
    expect(dataProbe.events.length).toBeGreaterThanOrEqual(1);
    for (const ev of dataProbe.events) {
      expect(ev.category).toBe('probe');
    }

    // 4. Act: Fetch inspector with category=user
    const reqUser = new Request('http://localhost:3002/api/analytics/inspector?category=user&limit=10');
    const resUser = await handleAnalyticsApi('/api/analytics/inspector', reqUser, new URL(reqUser.url));
    const dataUser = await resUser?.json();

    // 5. Assert: No probe events should be present in user category
    for (const ev of dataUser.events) {
      expect(ev.category).toBe('user');
      expect(ev.path).not.toBe('/health');
    }
  });
});
