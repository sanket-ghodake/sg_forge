/**
 * @forge/landing - Tier 4 Contract: Dual-Probe Health Contract
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startLandingServer } from '../../src/server';

describe('Tier 4 Contract: Landing Health Probe Schema', () => {
  it('returns valid JSON health specification on /health', async () => {
    // Arrange
    const server = startLandingServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      const json: any = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.status).toBe('ok');
      expect(json.service).toBe('landing');
      expect(typeof json.port).toBe('number');
      expect(typeof json.uptime).toBe('number');
    } finally {
      server.stop();
    }
  });
});
