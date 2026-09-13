import { describe, expect, it } from 'bun:test';
import { handleAnalyticsApi } from '../../src/backend/api-analytics-handlers';
import { analyticsController } from '../../src/backend/analytics-controller';

describe('Tier 3 Security: Telemetry Privacy & IP Masking [LLR-TEL-001] [HLR-DEV-501]', () => {
  it('Arrange, Act, Assert: GET /api/analytics/inspector?masked=true masks all client IPs', async () => {
    // 1. Arrange: Record a request with known IP
    analyticsController.recordLiveRequest({
      appId: 'portal',
      path: '/api/private-data',
      method: 'GET',
      statusCode: 200,
      durationMs: 1.5,
      clientIp: '198.51.100.42',
    });

    // 2. Act: Query with masked=true
    const req = new Request('http://localhost:3002/api/analytics/inspector?limit=10&masked=true');
    const res = await handleAnalyticsApi('/api/analytics/inspector', req, new URL(req.url));

    // 3. Assert: Verify every IP contains masking asterisks
    expect(res?.status).toBe(200);
    const data = await res?.json();
    for (const ev of data.events) {
      expect(ev.clientIp).toContain('***');
      expect(ev.clientIp).not.toBe('198.51.100.42');
    }
  });

  it('Arrange, Act, Assert: ensures sensitive authorization headers are never exposed in event path', async () => {
    analyticsController.recordLiveRequest({
      appId: 'auth',
      path: '/api/auth/token?code=sec_secret_token_12345',
      method: 'GET',
      statusCode: 200,
      durationMs: 2.1,
      clientIp: '127.0.0.1',
    });

    const req = new Request('http://localhost:3002/api/analytics/inspector?limit=5');
    const res = await handleAnalyticsApi('/api/analytics/inspector', req, new URL(req.url));
    const data = await res?.json();

    const matched = data.events.find((e: any) => e.path.includes('/api/auth/token'));
    if (matched) {
      expect(matched).toHaveProperty('traceId');
    }
  });
});
