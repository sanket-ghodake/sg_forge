/**
 * @forge/dev-dashboard - Apps Lifecycle & Operations Integration Tests (2026 LTS)
 * 3A Pattern integration testing for registration, inspection, update, and deletion via REST handlers.
 */

import { describe, expect, it } from 'bun:test';
import { handleApiRequest } from '../../src/backend/api-handlers';
import { platformDb } from '../../src/db';

describe('Integration: Forge Apps Lifecycle & Developer Operations', () => {
  const testAppId = `test-app-${Date.now()}`;
  const testAppName = 'Integration Test Micro-App';
  const testPort = 8199;

  it('1. GET /api/apps returns enriched apps and fleet overview', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/apps', { method: 'GET' });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);

    const data = await res?.json();

    // Assert
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.apps)).toBe(true);
    expect(data.overview).toHaveProperty('totalApps');
    expect(data.overview).toHaveProperty('runningApps');
  });

  it('2. GET /api/apps/next-port returns next available port', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/apps/next-port', { method: 'GET' });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(200);
    const data = await res?.json();

    // Assert
    expect(data.status).toBe('ok');
    expect(typeof data.port).toBe('number');
    expect(data.port).toBeGreaterThanOrEqual(8088);
  });

  it('3. POST /api/apps/register registers a new micro-app with dedicated Turso DB', async () => {
    // Arrange
    const payload = {
      id: testAppId,
      name: testAppName,
      port: testPort,
      ingress_path: `/apps/${testAppId}`,
      category: 'Finance & Operations',
      access_role: 'Finance / Manager',
      autoProvisionDb: true,
      persistToEnv: false,
      scaffoldTemplate: false,
    };

    const req = new Request('http://localhost:3002/api/apps/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(201);
    const data = await res?.json();

    // Assert
    expect(data.success).toBe(true);
    expect(data.id).toBe(testAppId);

    // Verify in DB
    const dbRecord = platformDb.getAppById(testAppId);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.name).toBe(testAppName);
    expect(dbRecord?.port).toBe(testPort);
  });

  it('4. GET /api/apps/inspect returns detailed diagnostics for the registered app', async () => {
    // Arrange
    const req = new Request(`http://localhost:3002/api/apps/inspect?id=${testAppId}`, { method: 'GET' });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(200);
    const data = await res?.json();

    // Assert
    expect(data.status).toBe('ok');
    expect(data.app.id).toBe(testAppId);
    expect(data.database.exists).toBe(true);
    expect(data.health).toBeDefined();
  });

  it('5. POST /api/apps/update modifies app configuration and status', async () => {
    // Arrange
    const updatePayload = {
      id: testAppId,
      updates: {
        name: 'Updated Test App Name',
        status: 'maintenance',
        storage_quota_mb: 100,
      },
    };

    const req = new Request('http://localhost:3002/api/apps/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(200);
    const data = await res?.json();

    // Assert
    expect(data.success).toBe(true);
    const updatedRecord = platformDb.getAppById(testAppId);
    expect(updatedRecord?.name).toBe('Updated Test App Name');
    expect(updatedRecord?.status).toBe('maintenance');
    expect(updatedRecord?.storage_quota_mb).toBe(100);
  });

  it('6. POST /api/apps/toggle-status toggles app between disabled and active states', async () => {
    // Arrange: Toggle to disabled
    const req1 = new Request('http://localhost:3002/api/apps/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: testAppId }),
    });
    const url1 = new URL(req1.url);

    // Act 1
    const res1 = await handleApiRequest(req1, url1);
    expect(res1?.status).toBe(200);
    const data1 = await res1?.json();

    // Assert 1: App is now disabled
    expect(data1.success).toBe(true);
    expect(data1.status).toBe('disabled');
    const disabledRecord = platformDb.getAppById(testAppId);
    expect(disabledRecord?.status).toBe('disabled');

    // Arrange: Toggle back to active
    const req2 = new Request('http://localhost:3002/api/apps/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: testAppId }),
    });
    const url2 = new URL(req2.url);

    // Act 2
    const res2 = await handleApiRequest(req2, url2);
    expect(res2?.status).toBe(200);
    const data2 = await res2?.json();

    // Assert 2: App is restored to active
    expect(data2.success).toBe(true);
    expect(data2.status).toBe('active');
    const activeRecord = platformDb.getAppById(testAppId);
    expect(activeRecord?.status).toBe('active');
  });

  it('7. POST /api/apps/delete deregisters the micro-app and cleans up', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/apps/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: testAppId, deleteDb: true }),
    });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(200);
    const data = await res?.json();

    // Assert
    expect(data.success).toBe(true);
    const deletedRecord = platformDb.getAppById(testAppId);
    expect(deletedRecord).toBeNull();
  });
});
