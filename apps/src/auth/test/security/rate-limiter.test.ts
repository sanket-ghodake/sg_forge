/**
 * @forge/auth/test/security - Anti-Brute-Force & Sliding Window Tests (Tier 3)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { handleLogin } from '../../src/backend/api-handlers';
import { clearAllRateLimits, checkRateLimit, recordFailedAttempt, resetAttempts } from '../../src/backend/rate-limiter';

describe('Tier 3 Security: Anti-Brute-Force Rate Limiting [LLR-AUTH-005]', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
    clearAllRateLimits();
  });

  it('should block rapid credential stuffing attacks with HTTP 429 after 5 failed attempts', async () => {
    // 1. Arrange: Send 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      const badReq = new Request('http://localhost:3004/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
        body: JSON.stringify({
          email: 'target.victim@forge.internal',
          password: `BadAttempt${i}!`,
        }),
      });
      const res = await handleLogin(badReq);
      expect(res.status).toBe(401);
    }

    // 2. Act: 6th attempt (even with correct password)
    const blockedReq = new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
      body: JSON.stringify({
        email: 'target.victim@forge.internal',
        password: 'password123',
      }),
    });
    const blockedRes = await handleLogin(blockedReq);
    const blockedData = await blockedRes.json();

    // 3. Assert: Blocked by rate limiter shield
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('retry-after')).toBeDefined();
    expect(blockedData.title).toBe('Too Many Requests');
  });

  it('should completely clear both IP and email attempt buckets when clearAllRateLimits is called', () => {
    // 1. Arrange: Record 5 failed attempts for specific IP and email
    const ip = '192.168.1.100';
    const email = 'user.victim@example.com';
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip, email);
    }
    const blockedState = checkRateLimit(ip, email);
    expect(blockedState.isBlocked).toBe(true);
    expect(blockedState.remainingAttempts).toBe(0);

    // 2. Act: Invoke clearAllRateLimits
    clearAllRateLimits();

    // 3. Assert: Both IP and email tracking are completely cleared
    const clearedState = checkRateLimit(ip, email);
    expect(clearedState.isBlocked).toBe(false);
    expect(clearedState.remainingAttempts).toBe(5);
  });
});
