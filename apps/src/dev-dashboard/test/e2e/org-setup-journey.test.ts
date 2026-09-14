/**
 * @forge/dev-dashboard - E2E Tests: Organization Setup Complete Lifecycle Journey (3A Pattern)
 * Real HTTP server verification of Organization Setup, Dynamic Tiers, Departments, and Auto-EID flow.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startDevDashboardServer } from '../../src/server';
import { startAuthServer, seedAuthDatabase } from '@forge/auth';

describe('Tier 5 E2E: Organization Setup Complete Lifecycle Journey', () => {
  const TEST_PORT = 3380;
  const AUTH_TEST_PORT = 3381;
  let server: any;
  let authServer: any;

  const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer password123',
  };

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

  let newTypeId = '';
  let newDeptId = '';
  let generatedEid = '';

  it('Step 1: Admin fetches initial organization setup via Dev Dashboard proxy', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/org-setup`, {
      headers: AUTH_HEADERS,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.organization).toBeDefined();
    expect(Array.isArray(data.nodeTypes)).toBe(true);
    expect(Array.isArray(data.nodes)).toBe(true);
  });

  it('Step 2: Admin configures legal entity, branding, and timezone', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/org-setup/profile`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        name: 'Apex Global Technologies',
        domain: 'apex-global.internal',
        brand_name: 'Apex Studio',
        brand_tagline: 'High-Performance Engineering',
        timezone: 'America/New_York',
        contact_email: 'ops@apex-global.internal',
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.organization.name).toBe('Apex Global Technologies');
    expect(data.organization.timezone).toBe('America/New_York');
  });

  it('Step 3: Admin configures custom EID prefix (APEX) and padding (4 digits)', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/org-setup/eid-config`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        prefix: 'APEX',
        padding: 4,
        counter: 500,
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.preview).toBe('APEX-0501');
  });

  it('Step 4: Admin creates a dynamic Hierarchy Level Tier (Business Unit)', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/org-setup/node-types`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        name: 'Business Unit',
        level_order: 1,
        description: 'Primary corporate division',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.nodeType.name).toBe('Business Unit');
    newTypeId = data.nodeType.id;
  });

  it('Step 5: Admin creates a Department Unit (Cloud Operations) under the new tier', async () => {
    expect(newTypeId).toBeTruthy();
    const res = await fetch(`http://localhost:${TEST_PORT}/api/org-setup/nodes`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        name: 'Cloud Operations',
        code: 'CLOUD-OPS',
        type_id: newTypeId,
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.node.name).toBe('Cloud Operations');
    expect(data.node.path).toBe('/cloud-operations');
    newDeptId = data.node.id;
  });

  it('Step 6: Admin clicks Auto-Generate EID in Add Member workflow and creates new employee', async () => {
    expect(newDeptId).toBeTruthy();

    // 1. Next EID allocation call
    const eidRes = await fetch(`http://localhost:${TEST_PORT}/api/org-setup/eid/next`, {
      method: 'POST',
      headers: AUTH_HEADERS,
    });
    expect(eidRes.status).toBe(200);
    const eidData = await eidRes.json();
    expect(eidData.eid).toBe('APEX-0501');
    generatedEid = eidData.eid;

    // 2. Add employee with this EID and newly created department
    const timestamp = Date.now();
    const empRes = await fetch(`http://localhost:${TEST_PORT}/api/employees`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({
        display_name: 'Sophia Williams',
        email: `sophia.cloud.${timestamp}@apex-global.internal`,
        job_title: 'Cloud Systems Architect',
        employee_code: generatedEid,
        org_node_id: newDeptId,
        role: 'roles/employee',
        status: 'ACTIVE',
      }),
    });
    expect(empRes.status).toBe(201);
    const empData = await empRes.json();
    expect(empData.employee?.id || empData.id).toBeDefined();

    // 3. Verify member appears in directory under the new department
    const listRes = await fetch(`http://localhost:${TEST_PORT}/api/employees?departmentId=${encodeURIComponent(newDeptId)}`, {
      headers: AUTH_HEADERS,
    });
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    const match = listData.items.find((i: any) => i.employee_code === generatedEid);
    expect(match).toBeDefined();
    expect(match.display_name).toBe('Sophia Williams');
    expect(match.department_name).toBe('Cloud Operations');
  });
});
