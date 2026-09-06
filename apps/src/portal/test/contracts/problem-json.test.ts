/**
 * @forge/portal - Tier 4 Contract: Dual-Probe Healthcheck & Response Contracts
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startPortalServer } from '../../src/server';

describe('Tier 4 Contract: Portal Endpoints & Healthcheck Schema', () => {
  it('Arrange, Act, Assert: returns valid operational contract on /health probe', async () => {
    // Arrange: Start portal on ephemeral port 0
    const server = startPortalServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      const json: any = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.status).toBe('ok');
      expect(json.service).toBe('portal');
      expect(typeof json.port).toBe('number');
      expect(typeof json.uptime).toBe('number');
    } finally {
      server.stop();
    }
  });
});
