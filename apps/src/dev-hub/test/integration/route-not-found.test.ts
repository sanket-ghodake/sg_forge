/**
 * @forge/dev-hub - Route Not Found Integration Test (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies that invalid subpaths on Developer Hub return Astryx 404 HTML.
 */

import { describe, expect, it } from 'bun:test';
import { startDevHubServer } from '../../src/server';

describe('Tier 2 Integration: Dev Hub 404 Route Boundary [HLR-HUB-601]', () => {
  it('returns HTTP 404 with Astryx HTML for invalid subpaths', async () => {
    // Arrange
    const server = startDevHubServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/unregistered-subpath`, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('Developer Hub');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('returns HTTP 200 for valid root /', async () => {
    // Arrange
    const server = startDevHubServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
    } finally {
      server.stop(true);
    }
  });
});
