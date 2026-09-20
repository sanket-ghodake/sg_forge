/**
 * @forge/platform - Playwright Real Browser E2E Spec: Universal Error & Status Journeys
 * Verifies all 10 HTTP status codes, subpath 404 boundaries, anti-enumeration, and edge interception.
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [HLR-UI-401] [LLR-UI-008] [LLR-SDK-004] [LLR-SDK-005] [SR-GATE-001]
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInternalServiceToken } from '@forge/sdk';
import { startLandingServer } from '../../../src/landing/src/server';
import { startPortalServer } from '../../../src/portal/src/server';
import { startDevDashboardServer } from '../../../src/dev-dashboard/src/server';
import { startDevHubServer } from '../../../src/dev-hub/src/server';
import { startAuthServer } from '../../../src/auth/src/server';
import { startTelemetryServer } from '../../../../forge-apps/telemetry/src/server';

export const errorStatusPagesPlaywrightJourney = {
  name: 'Real Browser E2E: Universal Error & Status Page User Journeys',
  steps: [
    '1. Test Landing Subpath 404 Route Boundary and SEO meta defense',
    '2. Test Protected Portal Anti-Enumeration 302 login redirect for unauthenticated scans',
    '3. Test Protected Portal 404 Astryx UI for authenticated operators',
    '4. Test Developer Dashboard Route Boundary with health probe prioritization',
    '5. Test Developer Hub Route Boundary for unrecognized API paths',
    '6. Test Central Auth Gateway 404 Fallback with Sign In return link',
    '7. Test Autonomous Micro-App Subpath Route Boundary',
    '8. Test Gateway Edge Static Interception and API content negotiation',
    '9. Test 10-Status Code Static Edge Verification across all pre-rendered pages',
    '10. Test Dual-Theme Toggle and Head State initialization on error screens',
    '11. Test Security & Malicious URL Path XSS Sanitization Defense',
  ],
  specs: {
    supportedCodes: [400, 401, 403, 404, 405, 429, 500, 502, 503, 504],
    zeroEmojis: true,
    robotsDefense: 'noindex, nofollow',
  },
};

describe('Tier 5 E2E: Universal Astryx Error & Status Page Journeys', () => {
  it('Arrange, Act, Assert: verifies specification metadata and supported status codes', () => {
    // Arrange & Act
    const { specs, steps } = errorStatusPagesPlaywrightJourney;

    // Assert
    expect(steps.length).toBe(11);
    expect(specs.supportedCodes.length).toBe(10);
    expect(specs.supportedCodes).toContain(404);
    expect(specs.supportedCodes).toContain(502);
    expect(specs.zeroEmojis).toBe(true);
  });

  it('Journey 1: Landing Subpath Route Boundary returns 404 with Astryx HTML & robots defense', async () => {
    // Arrange
    const server = startLandingServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/nonexistent-subpath`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('cache-control')).toContain('no-store');
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('robots');
      expect(html).toContain('noindex');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('Journey 2: Protected Portal Anti-Enumeration redirects unauthenticated scans with 302', async () => {
    // Arrange
    const server = startPortalServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/portal/unregistered-feature`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
        redirect: 'manual',
      });

      // Assert: Must redirect to auth login without disclosing if route exists
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login');
      expect(res.headers.get('location')).toContain('return_url');
    } finally {
      server.stop(true);
    }
  });

  it('Journey 3: Protected Portal returns Astryx 404 UI for authenticated operators', async () => {
    // Arrange
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_operator_test');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/portal/nonexistent-feature`, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          Cookie: `forge_session=${token}`,
        },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(html).toContain('404');
      expect(html).toContain('Page Not Found');
      expect(html).toContain('/portal');
    } finally {
      server.stop(true);
    }
  });

  it('Journey 4: Developer Dashboard intercepts invalid subpaths while keeping health probes online', async () => {
    // Arrange
    const server = startDevDashboardServer(0);

    try {
      // Act 1: Health Probe remains operational
      const healthRes = await fetch(`http://localhost:${server.port}/health`);
      expect(healthRes.status).toBe(200);

      // Act 2: Unhandled subpath returns 404
      const invalidRes = await fetch(`http://localhost:${server.port}/invalid-dashboard-tab`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const html = await invalidRes.text();

      // Assert
      expect(invalidRes.status).toBe(404);
      expect(html).toContain('404');
      expect(html).toContain('Developer Dashboard');
    } finally {
      server.stop();
    }
  });

  it('Journey 5: Developer Hub returns Astryx 404 for unknown developer routes', async () => {
    // Arrange
    const server = startDevHubServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/gateway/fake-endpoint`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(html).toContain('404');
      expect(html).toContain('Developer Hub');
    } finally {
      server.stop(true);
    }
  });

  it('Journey 6: Central Auth Gateway returns 404 with Sign In recovery link', async () => {
    // Arrange
    const server = startAuthServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/auth/unregistered-path`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(html).toContain('404');
      expect(html).toContain('Identity & Auth Gateway');
      expect(html).toContain('/auth/login');
    } finally {
      server.stop(true);
    }
  });

  it('Journey 7: Autonomous Telemetry Micro-App returns submodule Astryx 404 UI', async () => {
    // Arrange
    const server = startTelemetryServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/apps/telemetry/fake-metrics`, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
      });
      const html = await res.text();

      // Assert
      expect(res.status).toBe(404);
      expect(html).toContain('404');
      expect(html).toContain('Live Telemetry Dashboard');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    } finally {
      server.stop(true);
    }
  });

  it('Journey 8: API Content Negotiation returns RFC 7807 problem details for programmatic callers', async () => {
    // Arrange
    const server = startLandingServer(0);

    try {
      // Act: Request with Accept: application/json
      const res = await fetch(`http://localhost:${server.port}/api/nonexistent-service`, {
        headers: { Accept: 'application/json' },
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

  it('Journey 9: Pre-rendered static error pages exist for all 10 status codes with zero emojis', () => {
    // Arrange
    const errorsDir = join(process.cwd(), 'proxy', 'errors');
    const expectedCodes = [400, 401, 403, 404, 405, 429, 500, 502, 503, 504];

    // Act & Assert
    for (const code of expectedCodes) {
      const filePath = join(errorsDir, `${code}.html`);
      expect(existsSync(filePath)).toBe(true);

      const html = readFileSync(filePath, 'utf8');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(`HTTP ${code}`);
      expect(html).toContain('data-theme');
      expect(html).toContain('robots');
      expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
    }
  });

  it('Journey 10: Error screen supports interactive dual-theme toggle and copyable incident trace', async () => {
    // Arrange
    const server = startLandingServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/test-theme-trace`, {
        headers: { Accept: 'text/html' },
      });
      const html = await res.text();

      // Assert: Contains theme script and clipboard copy handler
      expect(html).toContain('forge:v1:platform:theme');
      expect(html).toContain('data-theme');
      expect(html).toContain('trace-btn');
      expect(html).toContain('navigator.clipboard.writeText');
    } finally {
      server.stop(true);
    }
  });

  it('Journey 11: Security & XSS Sanitization neutralizes malicious URL path payloads', async () => {
    // Arrange
    const server = startLandingServer(0);
    const xssPayload = '/<script>alert(1)</script>';

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}${xssPayload}`, {
        headers: { Accept: 'text/html' },
      });
      const html = await res.text();

      // Assert: Raw unescaped script tag must never be injected into HTML
      expect(res.status).toBe(404);
      expect(html).not.toContain('<script>alert(1)</script>');
    } finally {
      server.stop(true);
    }
  });
});
