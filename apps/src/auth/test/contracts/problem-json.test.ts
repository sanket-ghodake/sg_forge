/**
 * @forge/auth/test/contracts - RFC 7807 Problem Details Contract (Tier 4)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { handleLogin } from '../../src/backend/api-handlers';

describe('Tier 4 Contract: RFC 7807 Problem Details for HTTP APIs', () => {
  it('should return standard application/problem+json response on bad request', async () => {
    // 1. Arrange: Malformed login request with missing password
    const malformedReq = new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@forge.internal' }),
    });

    // 2. Act
    const res = await handleLogin(malformedReq);
    const contentType = res.headers.get('content-type');
    const data = await res.json();

    // 3. Assert RFC 7807 Compliance
    expect(res.status).toBe(400);
    expect(contentType).toContain('application/problem+json');
    expect(data.type).toBe('https://tools.ietf.org/html/rfc7807');
    expect(data.title).toBe('Bad Request');
    expect(data.status).toBe(400);
    expect(typeof data.detail).toBe('string');
  });
});
