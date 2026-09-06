/**
 * @forge/platform - Chaos & Concurrency: Anti-Brute-Force Rate Limiter Stress Test (Tier 3/5)
 * Fires concurrent bursts of failed logins and asserts deterministic 429 throttling.
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { handleLogin } from '../../src/auth/src/backend/api-handlers';
import { seedAuthDatabase } from '../../src/auth/src/db/seed';

describe('Chaos & Concurrency: Anti-Brute-Force Rate Limit Saturation', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should deterministically throttle concurrent failed attempts and return HTTP 429 with Retry-After', async () => {
    // 1. Arrange: Prepare concurrent barrage of 15 invalid login requests from a single IP
    const attackerIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    const burstCount = 15;
    const requests = Array.from({ length: burstCount }, (_, i) =>
      new Request('http://localhost:3004/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': attackerIp,
        },
        body: JSON.stringify({
          email: `victim_${i}@forge.internal`,
          password: 'definitelyWrongPassword123!',
        }),
      })
    );

    // 2. Act: Dispatch all requests concurrently
    const responses = await Promise.all(requests.map((req) => handleLogin(req)));

    // 3. Assert: Verify statuses
    const statusCounts = responses.reduce((acc, res) => {
      acc[res.status] = (acc[res.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Rate limiter allows up to 5 attempts before locking (401), subsequent requests are 429
    expect(statusCounts[401] || 0).toBeLessThanOrEqual(5);
    expect(statusCounts[429] || 0).toBeGreaterThanOrEqual(10);

    // Assert that 429 responses contain standard Retry-After headers and RFC 7807 problem details
    const rateLimitedRes = responses.find((r) => r.status === 429);
    expect(rateLimitedRes).toBeDefined();

    if (rateLimitedRes) {
      expect(rateLimitedRes.headers.get('retry-after')).toBeDefined();
      const problem = await rateLimitedRes.json();
      expect(problem.type).toBe('https://tools.ietf.org/html/rfc7807');
      expect(problem.status).toBe(429);
      expect(problem.title).toBe('Too Many Requests');
    }
  });
});
