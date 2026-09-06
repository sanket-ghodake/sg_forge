/**
 * @forge/dev-dashboard - Tier 5 E2E: Full Server Lifecycle & HTML UI Rendering
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import { startDevDashboardServer } from '../../src';

describe('Tier 5 E2E: Dev Dashboard Server & UI Rendering', () => {
  it('serves dynamic Astryx HTML, dual-probe health checks, and 1-Click Latency Benchmark', async () => {
    // Arrange
    const brand = loadBrandConfig();
    const server = startDevDashboardServer(0);

    try {
      // Act 1: Dual-Probe Health Check (Public)
      const healthRes = await fetch(`http://localhost:${server.port}/health`);
      const healthJson: any = await healthRes.json();

      expect(healthRes.status).toBe(200);
      expect(healthJson.status).toBe('ok');

      // Act 2: Unauthenticated Astryx HTML UI entrypoint renders Login Screen
      const unauthRes = await fetch(`http://localhost:${server.port}/`);
      const unauthHtml = await unauthRes.text();

      expect(unauthRes.status).toBe(200);
      expect(unauthHtml).toContain(brand.name);
      expect(unauthHtml).toContain('Developer Dashboard Sign In');
      expect(unauthHtml).toContain('Single-Operator Session Enforced');

      // Act 3: Authenticate operator via /api/auth/login
      const loginRes = await fetch(`http://localhost:${server.port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'password123' }),
      });
      expect(loginRes.status).toBe(200);
      const loginData: any = await loginRes.json();
      expect(loginData.status).toBe('ok');
      const sessionCookie = `dev_session=${loginData.sessionToken}`;

      // Act 4: Authenticated Astryx HTML UI entrypoint renders Full Dashboard
      const authHtmlRes = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: sessionCookie },
      });
      const authHtml = await authHtmlRes.text();

      expect(authHtmlRes.status).toBe(200);
      expect(authHtml).toContain(brand.name);
      expect(authHtml).toContain('Developer Dashboard & Diagnostics');
      expect(authHtml).toContain('sb-global-header');
      expect(authHtml).toContain('dashboard-watchdog');

      // Act 5: Authenticated 1-Click HTTP Latency Benchmark
      const benchRes = await fetch(`http://localhost:${server.port}/api/benchmark`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
      });
      const benchJson: any = await benchRes.json();

      expect(benchRes.status).toBe(200);
      expect(benchJson.status).toBe('ok');
      expect(benchJson.samples).toBe(15);
      expect(benchJson.p50Ms).toBeDefined();
    } finally {
      server.stop();
    }
  });
});
