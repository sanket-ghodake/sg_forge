/**
 * @forge/landing - Tier 2 Integration: Service Worker & Offline Fallback Endpoints (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert)
 * Dynamic Ephemeral Port Allocation (Zero Port Hardcoding)
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startLandingServer } from '../../src/server';

describe('Tier 2 Integration: Landing Offline Service Worker Endpoints', () => {
  let landingServer: ReturnType<typeof startLandingServer>;

  beforeAll(() => {
    // Dynamic Ephemeral Port 0 (Zero hardcoded ports)
    landingServer = startLandingServer(0);
  });

  afterAll(() => {
    landingServer.stop(true);
  });

  it('Arrange, Act, Assert: Landing serves /sw.js publicly on dynamic port', async () => {
    // Arrange
    const swUrl = `http://localhost:${landingServer.port}/sw.js`;

    // Act
    const res = await fetch(swUrl);
    const text = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/javascript');
    expect(text).toContain('sg-forge-offline');
  });

  it('Arrange, Act, Assert: Landing serves /__offline_error.html publicly on dynamic port', async () => {
    // Arrange
    const offlineUrl = `http://localhost:${landingServer.port}/__offline_error.html`;

    // Act
    const res = await fetch(offlineUrl);
    const html = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(html).toContain('System Under Maintenance');
    expect(html).toContain('--forge-bg');
  });
});
