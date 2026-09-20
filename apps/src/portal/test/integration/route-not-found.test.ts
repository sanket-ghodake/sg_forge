/**
 * @forge/portal - Route Not Found & 404 Boundary Integration Test (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies that invalid/unregistered subpaths on Portal return Astryx 404 HTML for authenticated sessions
 * and 302 login redirect for unauthenticated sessions (anti-enumeration boundary).
 */

import { describe, expect, it } from 'bun:test';
import { startPortalServer } from '../../src/server';
import { createInternalServiceToken } from '@forge/sdk';

describe('Tier 2 Integration: Portal Subpath 404 & Route Boundary [LLR-PORTAL-201]', () => {
  it('returns 302 login redirect for unauthenticated requests to invalid subpaths (anti-enumeration)', async () => {
    // Arrange
    const server = startPortalServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/some-invalid-subpath`, {
        redirect: 'manual',
      });

      // Assert
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login?return_url=');
    } finally {
      server.stop(true);
    }
  });

  it('returns HTTP 404 with Astryx HTML for authenticated requests to invalid subpaths', async () => {
    // Arrange
    const server = startPortalServer(0);
    const port = server.port;

    const token = createInternalServiceToken(['roles/employee'], 'usr-tester-404');

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/nonexistent-portal-route`, {
        headers: {
          'Cookie': `forge_session=${token}`,
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('Workspace Portal');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('returns HTTP 200 for authenticated requests to valid portal root /', async () => {
    // Arrange
    const server = startPortalServer(0);
    const port = server.port;

    const token = createInternalServiceToken(['roles/employee'], 'usr-tester-200');

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/`, {
        headers: {
          'Cookie': `forge_session=${token}`,
        },
      });

      // Assert
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
    } finally {
      server.stop(true);
    }
  });
});
