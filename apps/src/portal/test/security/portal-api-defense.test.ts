/**
 * @forge/portal - Tier 3 Security: Portal API CSRF & Rate Limit Defense
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { createInternalServiceToken } from '@forge/sdk';
import { startPortalServer } from '../../src/server';
import { checkPortalRateLimit, resetRateLimitBuckets, sanitizeEmployeeDirectory } from '../../src/backend/security-middleware';

describe('Tier 3 Security: Portal API CSRF & Rate Limit Defense', () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it('Arrange, Act, Assert: blocks cross-site mutating requests with 403 Forbidden problem JSON', async () => {
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_csrf_tester');

    try {
      // Act: Attempt state mutation with cross-site fetch metadata
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/tokens`, {
        method: 'POST',
        headers: {
          Cookie: `forge_session=${token}`,
          'Sec-Fetch-Site': 'cross-site',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Cross Site Attack' }),
      });

      // Assert
      expect(res.status).toBe(403);
      const json: any = await res.json();
      expect(json.title).toBe('Forbidden');
      expect(json.detail).toContain('CSRF');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: allows same-origin mutating requests with valid credentials', async () => {
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_legit_tester');

    try {
      // Act: Legitimate request with same-origin metadata
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/tokens`, {
        method: 'POST',
        headers: {
          Cookie: `forge_session=${token}`,
          'Sec-Fetch-Site': 'same-origin',
          'Content-Type': 'application/json',
          'X-Forge-Action': '1',
        },
        body: JSON.stringify({ name: 'Legitimate Developer Token' }),
      });

      // Assert: Token creation succeeds
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.ok).toBe(true);
      expect(json.data.token).toBeDefined();
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: sliding-window rate limiter returns 429 when threshold exceeded', () => {
    const testKey = 'test_user_rate_limit';
    const limit = 5;

    // Act: 5 allowed requests
    for (let i = 0; i < limit; i++) {
      const res = checkPortalRateLimit(testKey, limit, 60);
      expect(res).toBeNull();
    }

    // 6th request triggers rate limit
    const blockedRes = checkPortalRateLimit(testKey, limit, 60);
    expect(blockedRes).not.toBeNull();
    expect(blockedRes!.status).toBe(429);
    expect(blockedRes!.headers.get('Retry-After')).toBeDefined();
  });

  it('Arrange, Act, Assert: masks employee PII for standard roles and reveals for privileged roles', () => {
    // Arrange
    const sampleMembers = [
      { id: 'usr_1', name: 'Alice Smith', email: 'alice.smith@enterprise.internal', phone: '+1-555-0100', salary: 150000 },
      { id: 'usr_2', name: 'Bob Jones', email: 'bob@enterprise.internal', phone: '+1-555-0101', salary: 120000 },
    ];

    // Act 1: Standard employee caller
    const masked = sanitizeEmployeeDirectory(sampleMembers, ['roles/employee']);

    // Assert 1: Email masked and sensitive fields undefined
    expect(masked[0].email).toBe('a*****h@enterprise.internal');
    expect(masked[0].phone).toBeUndefined();
    expect(masked[0].salary).toBeUndefined();
    expect(masked[1].email).toBe('b*b@enterprise.internal');

    // Act 2: Admin caller
    const unmasked = sanitizeEmployeeDirectory(sampleMembers, ['roles/admin']);

    // Assert 2: Raw data preserved
    expect(unmasked[0].email).toBe('alice.smith@enterprise.internal');
    expect(unmasked[0].phone).toBe('+1-555-0100');
    expect(unmasked[0].salary).toBe(150000);
  });
});

