/**
 * @forge/dev-dashboard - Route Not Found Integration Test (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies that invalid UI subpaths return Astryx 404 HTML.
 */

import { describe, expect, it } from 'bun:test';
import { startDevDashboardServer } from '../../src/server';

describe('Tier 2 Integration: Dev Dashboard 404 Route Boundary [HLR-DEV-501]', () => {
  it('returns HTTP 404 with Astryx HTML for invalid UI subpaths', async () => {
    // Arrange
    const server = startDevDashboardServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/unregistered-dev-subpath`, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('Developer Dashboard');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('returns HTTP 404 RFC 7807 JSON for invalid API endpoints', async () => {
    // Arrange
    const server = startDevDashboardServer(0);
    const port = server.port;

    try {
      // Act: Unmatched API route with authenticated operator session
      const res = await fetch(`http://localhost:${port}/api/invalid-endpoint`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer password123',
        },
      });
      const json = await res.json();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('application/problem+json');
      expect(json.status).toBe(404);
    } finally {
      server.stop(true);
    }
  });
});
