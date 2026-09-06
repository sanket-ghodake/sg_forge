/**
 * @forge/dev-hub - Tier 4 Contract: Health & Operational Probe Contracts
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startDevHubServer } from '../../src/server';

describe('Tier 4 Contract: Dev Hub Operational Probes', () => {
  it('returns valid JSON contract on /health', async () => {
    // Arrange
    const server = startDevHubServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      const json: any = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.status).toBe('ok');
      expect(json.service).toBe('dev-hub');
      expect(typeof json.port).toBe('number');
      expect(typeof json.uptime).toBe('number');
    } finally {
      server.stop();
    }
  });
});
