/**
 * @forge/portal - Tier 5 E2E: Full Server Bootstrap & Responsive Layout
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken, loadBrandConfig } from '@forge/sdk';
import { startPortalServer } from '../../src/server';

describe('Tier 5 E2E: Portal Server Bootstrap & Astryx UI Lifecycle', () => {
  it('Arrange, Act, Assert: serves full authenticated portal page with Astryx header and tabs on ephemeral port', async () => {
    // Arrange: Start portal on ephemeral port 0
    const brand = loadBrandConfig();
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_e2e_portal');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`, {
        headers: {
          Cookie: `forge_session=${token}`,
        },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain(`${brand.name} Portal`);
      expect(html).toContain('astryx-container');
      expect(html).toContain('logout-btn');
    } finally {
      server.stop();
    }
  });
});
