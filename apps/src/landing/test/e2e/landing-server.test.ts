/**
 * @forge/landing - Tier 5 E2E: Server Lifecycle & Astryx Discovery Catalog
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import { startLandingServer } from '../../src/server';

describe('Tier 5 E2E: Landing Discovery Hub & Universal Route Directory', () => {
  it('serves dynamic Astryx landing page with cards and responsive grid', async () => {
    // Arrange
    const brand = loadBrandConfig();
    const server = startLandingServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('PLATFORM HUB');
      expect(html).toContain(brand.name);
      expect(html).toContain('astryx-card');
      expect(html).toContain('astryx-grid');
      expect(html).toContain('Enterprise Workspace & Micro-App Engine');
    } finally {
      server.stop();
    }
  });
});
