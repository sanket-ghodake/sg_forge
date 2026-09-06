/**
 * Custom Landing - Tier 5 E2E Test Suite
 * Asserts real Bun server instantiation, socket binding, and shutdown
 */

import { describe, expect, it } from 'bun:test';
import { startServer } from '../../src/server';

describe('Tier 5 E2E: Server Socket Lifecycle', () => {
  it('Arrange, Act, Assert: binds to ephemeral port, serves HTTP traffic, and cleanly stops', async () => {
    // Arrange: bind to ephemeral port (0)
    const server = startServer(0);
    expect(server.port).toBeGreaterThan(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      const body = (await res.json()) as { status: string; service: string };

      // Assert
      expect(res.status).toBe(200);
      expect(body.status).toBe('pass');
      expect(body.service).toBe('landing-custom');
    } finally {
      // Teardown
      server.stop(true);
    }
  });
});
