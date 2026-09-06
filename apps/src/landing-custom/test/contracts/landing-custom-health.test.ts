/**
 * Custom Landing - Tier 4 Contract Test Suite
 * Asserts /health endpoint response schema contract
 */

import { describe, expect, it } from 'bun:test';
import { createLandingHandler } from '../../src/server';

describe('Tier 4 Contract: Health Endpoint Schema', () => {
  it('Arrange, Act, Assert: /health returns expected schema and fields', async () => {
    // Arrange
    const handler = createLandingHandler();
    const req = new Request('http://localhost:3000/health');

    // Act
    const res = await handler(req);
    const body = (await res.json()) as Record<string, unknown>;

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(body).toHaveProperty('status', 'pass');
    expect(body).toHaveProperty('service', 'landing-custom');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
  });
});
