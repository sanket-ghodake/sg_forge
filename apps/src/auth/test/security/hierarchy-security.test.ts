/**
 * @forge/auth - Tier 3 Security & Negative Assertion: Hierarchical Manager Detection API
 * Verifies authentication gates, anti-tamper, SQL injection defense, and RFC 7807 compliance.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-012]
 */

import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { startAuthServer } from '../../src/server';

describe('Tier 3 Security: Manager Detection Invariant & Boundary Tests [LLR-AUTH-012]', () => {
  let server: any;
  let port: number;

  beforeAll(() => {
    seedAuthDatabase(true);
    server = startAuthServer(0);
    port = server.port;
  });

  afterAll(() => {
    if (server) {
      server.stop(true);
    }
  });

  it('rejects unauthenticated access to /me/is-manager with RFC 7807 401 Unauthorized', async () => {
    // Act
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/me/is-manager`);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(body.title).toBe('Unauthorized');
    expect(body.status).toBe(401);
    expect(body.detail).toContain('Authentication required');
    expect(body.type).toContain('rfc7807');
  });

  it('rejects forged/tampered JWT on /me/is-manager with 401 Unauthorized', async () => {
    // Act: Send an arbitrary signature token
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItYm9iLWxlYWQifQ.fake_signature_hex';
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/me/is-manager`, {
      headers: {
        Authorization: `Bearer ${forgedToken}`,
      },
    });
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(401);
    expect(body.title).toBe('Unauthorized');
    expect(body.detail).toContain('Invalid or expired session token');
  });

  it('returns RFC 7807 404 Not Found for non-existent employee ID without leaking internal tables', async () => {
    // Act
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/usr-does-not-exist-9999/is-manager`);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(body.title).toBe('Not Found');
    expect(body.status).toBe(404);
    expect(body.detail).toContain('was not found in organizational hierarchy');
  });

  it('safely handles SQL injection vectors in route parameters without execution or leakage', async () => {
    // Act: Attempt classical SQL injection strings
    const maliciousId = encodeURIComponent("' OR '1'='1' --");
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/${maliciousId}/is-manager`);
    const body: any = await res.json();

    // Assert: Parameterization ensures it is treated as a literal ID lookup and returns 404, never 500 or 200
    expect(res.status).toBe(404);
    expect(body.title).toBe('Not Found');
    expect(body.detail).toContain('was not found in organizational hierarchy');
  });

  it('rejects POST requests to is-manager endpoint with 405 Method Not Allowed', async () => {
    // Act
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/usr-bob-lead/is-manager`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Assert
    expect(res.status).toBe(405);
  });
});
