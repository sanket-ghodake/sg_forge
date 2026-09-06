/**
 * @forge/dev-dashboard - Tier 5 E2E Tests: Developer Dashboard User Journey (3A Pattern)
 * Testing for Truth: Verifies live HTTP server responses, SPA document delivery, and command palette capabilities.
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { type Server } from 'bun';
import { loadBrandConfig } from '@forge/sdk';
import { handleApiRequest } from '../../src/backend/api-handlers';
import { renderDashboardHtml } from '../../src/frontend/ui-renderer';

describe('Tier 5 E2E: Developer Dashboard Live Server & Endpoints', () => {
  let server: any;
  const TEST_PORT = 3102;
  const BASE_URL = `http://localhost:${TEST_PORT}`;

  beforeAll(() => {
    server = Bun.serve({
      port: TEST_PORT,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === '/' || url.pathname === '/devcenter') {
          return new Response(renderDashboardHtml(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        const apiRes = await handleApiRequest(req, url);
        if (apiRes) return apiRes;
        return new Response('Not Found', { status: 404 });
      },
    });
  });

  afterAll(() => {
    server?.stop(true);
  });

  it('Arrange, Act, Assert: GET / serves SPA document with Command Palette and Table Browser markup', async () => {
    // Act
    const brand = loadBrandConfig();
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(html).toContain(`${brand.name} - Developer Dashboard`);
    expect(html).toContain('cmd-palette-modal');
    expect(html).toContain('tab-database');
    expect(html).toContain('connect-db-modal');
    expect(html).toContain('api-registry-modal');
  });

  it('Arrange, Act, Assert: GET /api/services returns real microservice fleet health', async () => {
    // Act
    const res = await fetch(`${BASE_URL}/api/services`);
    const data: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.services)).toBe(true);
    expect(data.summary).toHaveProperty('totalServices');
  });

  it('Arrange, Act, Assert: GET /api/db/list returns active SQLite databases', async () => {
    // Act
    const res = await fetch(`${BASE_URL}/api/db/list`);
    const data: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.databases)).toBe(true);
    const names = data.databases.map((d: any) => d.name);
    expect(names).toContain('platform_core.db');
  });
});
