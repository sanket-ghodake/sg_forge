/**
 * @forge-apps/code - Tier 2 Integration: Health Check Probe & Signal Isolation
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startCodeServer } from '../../src/server';

describe('Tier 2 Integration: Code Microservice Health Probes', () => {
  it('responds with operational livez and readyz signals on /health', async () => {
    // Arrange: Boot server on ephemeral port
    const server = startCodeServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      expect(res.status).toBe(200);

      const data = await res.json();

      // Assert
      expect(data.status).toBe('ok');
      expect(data.app).toBe('code');
      expect(data.livez).toBe(true);
      expect(data.readyz).toBe(true);
    } finally {
      server.stop();
    }
  });
});
