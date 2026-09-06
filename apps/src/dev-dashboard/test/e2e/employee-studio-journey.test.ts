/**
 * @forge/dev-dashboard - Employee Studio Journey E2E Test (2026 LTS)
 * End-to-end HTTP verification of employee endpoints and bulk import lifecycle.
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startDevDashboardServer } from '../../src/server';
import { startAuthServer, seedAuthDatabase } from '@forge/auth';

describe('E2E: Dev Dashboard Employee Studio Journey', () => {
  const TEST_PORT = 3290;
  let server: any;
  let authServer: any;
  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

  const AUTH_TEST_PORT = 3291;

  beforeAll(() => {
    process.env.AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    process.env.TEST_AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    authServer = startAuthServer(AUTH_TEST_PORT);
    server = startDevDashboardServer(TEST_PORT);
  });

  afterAll(() => {
    if (server) server.stop(true);
    if (authServer) authServer.stop(true);
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.TEST_AUTH_SERVICE_URL;
    seedAuthDatabase(true);
  });

  it('1. Fetches employee directory via HTTP API', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees`, {
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('2. Bulk imports employees via HTTP POST /api/employees/import', async () => {
    const timestamp = Date.now();
    const payload = {
      records: [
        {
          display_name: 'E2E Journey Lead',
          email: `e2e.lead.${timestamp}@forge.internal`,
          job_title: 'Lead Architect',
          role: 'roles/super_admin',
        },
        {
          display_name: 'E2E Journey Member',
          email: `e2e.member.${timestamp}@forge.internal`,
          job_title: 'Software Engineer',
          manager_email: `e2e.lead.${timestamp}@forge.internal`,
          role: 'roles/employee',
        },
      ],
      options: {
        autoCreateDepartments: true,
        duplicateAction: 'update',
        dryRun: false,
      },
    };

    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees/import`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.summary.valid).toBe(2);
  });

  it('3. Streams CSV export of employee directory', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees/export?format=csv`, {
      headers: { Authorization: 'Bearer password123' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    const text = await res.text();
    expect(text).toContain('display_name');
    expect(text).toContain('email');
  });

  it('4. Creates a new employee profile via HTTP POST /api/employees', async () => {
    const timestamp = Date.now();
    const payload = {
      display_name: 'E2E Created Employee',
      email: `e2e.created.${timestamp}@forge.internal`,
      job_title: 'Full Stack Engineer',
      employee_code: `E2E-${timestamp.toString().slice(-4)}`,
      role: 'roles/employee',
      status: 'ACTIVE',
    };

    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.employee.id).toBeDefined();
    expect(json.employee.display_name).toBe(payload.display_name);

    // 5. Updates the created employee profile via HTTP POST /api/employees/update
    const updateRes = await fetch(`http://localhost:${TEST_PORT}/api/employees/update`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        id: json.employee.id,
        display_name: 'E2E Created Employee (Promoted)',
        job_title: 'Staff Engineer',
        role: 'roles/super_admin',
        status: 'ACTIVE',
      }),
    });

    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.status).toBe('ok');

    // 6. Validates updated employee appears in directory
    const listRes = await fetch(`http://localhost:${TEST_PORT}/api/employees?search=${encodeURIComponent(payload.email)}`, {
      headers: AUTH_HEADERS,
    });
    const listJson = await listRes.json();
    expect(listJson.items.length).toBe(1);
    expect(listJson.items[0].display_name).toBe('E2E Created Employee (Promoted)');
    expect(listJson.items[0].job_title).toBe('Staff Engineer');
  });

  it('7. Fetches complete Interactive Org Chart Tree via HTTP GET /api/employees/tree', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees/tree`, {
      headers: { Authorization: 'Bearer password123' },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(Array.isArray(json.roots)).toBe(true);
    expect(json.total).toBeGreaterThan(0);
  });

  it('8. Executes Multi-Row Bulk Actions via HTTP POST /api/employees/bulk-action', async () => {
    const listRes = await fetch(`http://localhost:${TEST_PORT}/api/employees?limit=2`, {
      headers: AUTH_HEADERS,
    });
    const listJson = await listRes.json();
    const userIds = listJson.items.map((i: any) => i.id);

    const res = await fetch(`http://localhost:${TEST_PORT}/api/employees/bulk-action`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        action: 'revoke',
        userIds,
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.processed).toBe(userIds.length);
  });
});
