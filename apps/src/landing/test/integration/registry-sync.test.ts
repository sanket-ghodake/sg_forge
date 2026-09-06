/**
 * @forge/landing - Tier 2 Integration: Environment Registry Synchronization
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { loadServiceRegistry } from '@forge/sdk';
import { startLandingServer } from '../../src/server';

describe('Tier 2 Integration: Landing Dynamic Registry Synchronization', () => {
  it('serves dynamic catalog containing all services registered in .env', async () => {
    // Arrange
    const server = startLandingServer(0);
    const services = loadServiceRegistry();

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      for (const s of services) {
        expect(html).toContain(s.name);
      }
    } finally {
      server.stop();
    }
  });
});
