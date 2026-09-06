/**
 * @forge/landing - Tier 2 Integration: 404 Route Defense & Astryx Error Rendering
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { startLandingServer } from '../../src/server';

describe('Tier 2 Integration: Landing Hub Catch-All & 404 Page Verification', () => {
  it('serves 200 OK for root landing page /', async () => {
    const server = startLandingServer(0);
    try {
      const res = await fetch(`http://localhost:${server.port}/`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Enterprise Workspace');
    } finally {
      server.stop(true);
    }
  });

  it('serves Astryx 404 Not Found error page for arbitrary unknown paths like /adf', async () => {
    const server = startLandingServer(0);
    try {
      const res = await fetch(`http://localhost:${server.port}/adf`);
      expect(res.status).toBe(404);
      const html = await res.text();
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('/adf');
      expect(html).toContain('Return to Platform Hub');
    } finally {
      server.stop(true);
    }
  });
});
