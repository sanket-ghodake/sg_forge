/**
 * forge-apps/app-template - Route Not Found Integration Test (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies that invalid subpaths return 404 with Astryx error screen for authenticated users.
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '../../src/lib/sdk';
import { startTemplateServer } from '../../src/server';

describe('Tier 2 Integration: App Template 404 Route Boundary [HLR-APP-001]', () => {
  it('returns HTTP 404 with Astryx HTML for invalid UI subpaths when authenticated', async () => {
    // Arrange
    const server = startTemplateServer(0);
    const port = server.port;
    const token = createInternalServiceToken(['roles/employee'], 'usr_test_employee');

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/apps/template/unregistered`, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'Cookie': `forge_session=${token}`,
        },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Micro-App Template');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('redirects unauthenticated requests to login (anti-enumeration)', async () => {
    // Arrange
    const server = startTemplateServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/apps/template/unregistered`, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
        redirect: 'manual',
      });

      // Assert
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login');
    } finally {
      server.stop(true);
    }
  });
});
