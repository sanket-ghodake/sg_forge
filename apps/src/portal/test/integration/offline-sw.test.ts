/**
 * @forge/portal - Tier 2 Integration: Service Worker & Offline Fallback Endpoints (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert)
 * Dynamic Ephemeral Port Allocation (Zero Port Hardcoding)
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startPortalServer } from '../../src/server';

describe('Tier 2 Integration: Portal Offline Service Worker Endpoints', () => {
  let portalServer: ReturnType<typeof startPortalServer>;

  beforeAll(() => {
    // Dynamic Ephemeral Port 0 (Zero hardcoded ports)
    portalServer = startPortalServer(0);
  });

  afterAll(() => {
    portalServer.stop(true);
  });

  it('Arrange, Act, Assert: Portal serves /sw.js publicly without requiring auth session', async () => {
    // Arrange
    const swUrl = `http://localhost:${portalServer.port}/sw.js`;

    // Act
    const res = await fetch(swUrl);
    const text = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/javascript');
    expect(res.headers.get('Service-Worker-Allowed')).toBe('/');
    expect(text).toContain("addEventListener('fetch'");
    expect(text).toContain('__offline_error.html');
  });

  it('Arrange, Act, Assert: Portal serves /__offline_error.html publicly with Astryx markup', async () => {
    // Arrange
    const offlineUrl = `http://localhost:${portalServer.port}/__offline_error.html`;

    // Act
    const res = await fetch(offlineUrl);
    const html = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(res.headers.get('X-Forge-Offline-Asset')).toBe('cached-screen');
    expect(html).toContain('503');
    expect(html).toContain('System Under Maintenance');
    expect(html).toContain('astryx');
  });
});

