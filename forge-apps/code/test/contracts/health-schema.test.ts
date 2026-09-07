/**
 * @forge-apps/code - Tier 4 Contract: Health Schema Specification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startCodeServer } from '../../src/server';

describe('Tier 4 Contract: Code Microservice Health Schema [HLR-CODE-003]', () => {
  it('Arrange, Act, Assert: returns valid JSON health specification on /health', async () => {
    const server = startCodeServer(0);

    try {
      const res = await fetch(`http://localhost:${server.port}/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(typeof data.status).toBe('string');
      expect(typeof data.app).toBe('string');
      expect(typeof data.livez).toBe('boolean');
      expect(typeof data.readyz).toBe('boolean');
      expect(typeof data.uptime).toBe('number');
      expect(typeof data.memoryMb).toBe('number');
    } finally {
      server.stop();
    }
  });
});
