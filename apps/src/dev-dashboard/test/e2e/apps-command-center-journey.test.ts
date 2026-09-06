/**
 * @forge/dev-dashboard - Forge Apps Command Center Journey E2E Test (2026 LTS)
 * End-to-end HTTP verification of the Forge Apps Command Center lifecycle and operations.
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startDevDashboardServer } from '../../src/server';

describe('E2E: Dev Dashboard Forge Apps Command Center Journey', () => {
  const TEST_PORT = 3295;
  let server: any;
  const timestamp = Date.now();
  const testAppId = `e2e-app-${timestamp}`;
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

  beforeAll(() => {
    server = startDevDashboardServer(TEST_PORT);
  });

  afterAll(() => {
    if (server) server.stop(true);
  });

  it('1. Fetches enriched apps list and fleet overview via HTTP API', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps`, {
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.apps)).toBe(true);
    expect(data.apps.length).toBeGreaterThan(0);
    expect(data.overview).toBeDefined();
    expect(data.overview.totalApps).toBeGreaterThan(0);
  });

  it('2. Fetches next available port via HTTP API', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps/next-port`, {
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(typeof data.port).toBe('number');
    expect(data.port).toBeGreaterThanOrEqual(8088);
  });

  it('3. Registers a new micro-app via HTTP POST /api/apps/register', async () => {
    const payload = {
      id: testAppId,
      name: 'E2E Logistics Micro-App',
      port: 8195,
      ingress_path: `/apps/${testAppId}`,
      category: 'Operations & Logistics',
      access_role: 'Finance / Manager',
      autoProvisionDb: true,
      persistToEnv: false,
      scaffoldTemplate: false,
    };

    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps/register`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.id).toBe(testAppId);
  });

  it('4. Deep inspects the registered app via HTTP GET /api/apps/inspect', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps/inspect?id=${testAppId}`, {
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.app.id).toBe(testAppId);
    expect(data.database.exists).toBe(true);
    expect(data.health).toBeDefined();
  });

  it('5. Updates micro-app configuration via HTTP POST /api/apps/update', async () => {
    const updatePayload = {
      id: testAppId,
      updates: {
        name: 'E2E Logistics Suite (Updated)',
        status: 'maintenance',
        storage_quota_mb: 120,
      },
    };

    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps/update`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(updatePayload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify inspection reflects update
    const inspectRes = await fetch(`http://localhost:${TEST_PORT}/api/apps/inspect?id=${testAppId}`, {
      headers: AUTH_HEADERS,
    });
    const inspectData = await inspectRes.json();
    expect(inspectData.app.name).toBe('E2E Logistics Suite (Updated)');
    expect(inspectData.app.status).toBe('maintenance');
    expect(inspectData.app.storage_quota_mb).toBe(120);
  });

  it('6. Deregisters the micro-app via HTTP POST /api/apps/delete', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/apps/delete`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ id: testAppId, deleteDb: true }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify app is no longer present
    const inspectRes = await fetch(`http://localhost:${TEST_PORT}/api/apps/inspect?id=${testAppId}`, {
      headers: AUTH_HEADERS,
    });
    expect(inspectRes.status).toBe(404);
  });
});
