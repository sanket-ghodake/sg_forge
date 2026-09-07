/**
 * @forge-apps/code - Tier 5 E2E: Server Lifecycle & Bootstrap Test
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '../../src/lib/sdk';
import { startCodeServer } from '../../src/server';

describe('Tier 5 E2E: Code Workstation Server Bootstrap [HLR-CODE-701]', () => {
  it('Arrange, Act, Assert: successfully boots server and responds to health and authenticated routes', async () => {
    const server = startCodeServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_e2e_code');

    try {
      // 1. Health check probe
      const healthRes = await fetch(`http://localhost:${server.port}/health`);
      expect(healthRes.status).toBe(200);

      // 2. Authenticated UI view
      const uiRes = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(uiRes.status).toBe(200);
      const html = await uiRes.text();
      expect(html).toContain('astryx-container');
    } finally {
      server.stop();
    }
  });
});
