/**
 * @forge/portal - Tier 2 Integration: ASVS 5.0 Authentication Gate
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken, loadBrandConfig } from '@forge/sdk';
import { startPortalServer } from '../../src/server';

describe('Tier 2 Integration: Portal Auth Gate & JWT Session Validation', () => {
  it('Arrange, Act, Assert: authenticates valid JWT cookie and serves full portal workspace on ephemeral port', async () => {
    // Arrange: Start on ephemeral port 0
    const brand = loadBrandConfig();
    const server = startPortalServer(0);
    const validToken = createInternalServiceToken(['roles/employee'], 'usr_portal_test');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/portal`, {
        headers: {
          Cookie: `forge_session=${validToken}`,
        },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain(`${brand.name} Portal`);
      expect(html).toContain('portal-nav-item');
      expect(html).toContain('portal-sidebar');
    } finally {
      server.stop();
    }
  });
});
