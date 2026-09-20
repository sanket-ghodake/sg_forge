/**
 * forge-apps/telemetry - Route Not Found Integration Test (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies that invalid subpaths return 404 with portable Astryx UI or RFC 7807 JSON.
 */

import { describe, expect, it } from 'bun:test';
import { startTelemetryServer } from '../../src/server';

describe('Tier 2 Integration: Telemetry 404 Route Boundary [HLR-TEL-801]', () => {
  it('returns HTTP 404 with Astryx HTML for invalid UI subpaths', async () => {
    // Arrange
    const server = startTelemetryServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/apps/telemetry/invalid-subpath`, {
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Live Telemetry Dashboard');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('returns HTTP 404 with RFC 7807 JSON for API requests', async () => {
    // Arrange
    const server = startTelemetryServer(0);
    const port = server.port;

    try {
      // Act
      const res = await fetch(`http://localhost:${port}/api/invalid-endpoint`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('application/problem+json');
      expect(data.status).toBe(404);
      expect(data.title).toBe('Not Found');
    } finally {
      server.stop(true);
    }
  });
});
