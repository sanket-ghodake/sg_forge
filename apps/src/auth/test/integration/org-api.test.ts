import { describe, it, expect, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { signJwt } from '../../src/backend/crypto';
import {
  handleGetOrgTree,
  handleListEmployees,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleBatchImport,
} from '../../src/backend/api-org-handlers';

describe('Tier 2 Integration: Org & Employee REST Handlers (@forge/auth) [LLR-AUTH-003]', () => {
  beforeEach(() => {
    seedAuthDatabase();
  });

  it('handleGetOrgTree returns valid tree JSON', () => {
    const req = new Request('http://localhost:3004/api/v1/auth/org/tree?max_depth=5');
    const res = handleGetOrgTree(req);
    expect(res.status).toBe(200);
  });

  it('handleListEmployees returns paginated employee list', () => {
    const req = new Request('http://localhost:3004/api/v1/auth/org/employees?limit=10');
    const res = handleListEmployees(req);
    expect(res.status).toBe(200);
  });

  it('handleCreateEmployee creates an employee with admin context', async () => {
    const adminToken = signJwt({
      sub: 'usr-admin-test',
      email: 'admin@forge.internal',
      roles: ['roles/super_admin'],
    });

    const timestamp = Date.now();
    const req = new Request('http://localhost:3004/api/v1/auth/org/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        display_name: 'Integration Dev',
        email: `dev.${timestamp}@forge.internal`,
        job_title: 'Full Stack Engineer',
      }),
    });

    const res = await handleCreateEmployee(req);
    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.ok).toBe(true);
    expect(body.employee.email).toBe(`dev.${timestamp}@forge.internal`);
  });

  it('handleBatchImport processes bulk employee imports', async () => {
    const adminToken = signJwt({
      sub: 'usr-admin-test',
      email: 'admin@forge.internal',
      roles: ['roles/super_admin'],
    });

    const timestamp = Date.now();
    const records = [
      {
        display_name: 'Batch User 1',
        email: `batch.user1.${timestamp}@forge.internal`,
        job_title: 'Product Designer',
        department: 'Design Studio',
      },
      {
        display_name: 'Batch User 2',
        email: `batch.user2.${timestamp}@forge.internal`,
        job_title: 'Design Lead',
        department: 'Design Studio',
        manager_email: `batch.user1.${timestamp}@forge.internal`,
      },
    ];

    const req = new Request('http://localhost:3004/api/v1/auth/org/employees/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ records, options: { dryRun: false } }),
    });

    const res = await handleBatchImport(req);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.ok).toBe(true);
    expect(body.summary.created).toBe(2);
  });
});
