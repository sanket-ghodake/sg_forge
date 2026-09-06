/**
 * @forge/dev-hub - Tier 5 E2E: Server Lifecycle & Astryx UI Playground
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startDevHubServer } from '../../src/server';

describe('Tier 5 E2E: Developer Hub Full Server Lifecycle', () => {
  it('serves developer hub layout with Astryx header and documentation cards', async () => {
    // Arrange
    const server = startDevHubServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('DEVELOPER GATEWAY');
      expect(html).toContain('astryx-card');
      expect(html).toContain('Forge SDK Contract');
      expect(html).toContain('Docker App Templates');
    } finally {
      server.stop();
    }
  });
});
