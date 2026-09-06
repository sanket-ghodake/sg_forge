import { describe, it, expect, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { handleCreateEmployee, handleUpdateEmployee } from '../../src/backend/api-org-handlers';
import { signJwt } from '../../src/backend/crypto';

describe('Tier 3 Security: Employee Directory RBAC & Zero-Trust Invariants (@forge/auth) [HLR-AUTH-102]', () => {
  beforeEach(() => {
    seedAuthDatabase();
  });

  it('blocks unauthenticated requests from creating employees with HTTP 401', async () => {
    const req = new Request('http://localhost:3004/api/v1/auth/org/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name: 'Anonymous Hacker',
        email: 'anon@forge.internal',
        job_title: 'Attacker',
      }),
    });

    const res = await handleCreateEmployee(req);
    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.title).toBe('Unauthorized');
  });

  it('blocks non-admin users from creating employees with HTTP 403', async () => {
    const nonAdminToken = signJwt({
      sub: 'usr-employee-basic',
      email: 'regular.dev@forge.internal',
      roles: ['roles/employee'],
    });

    const req = new Request('http://localhost:3004/api/v1/auth/org/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nonAdminToken}`,
      },
      body: JSON.stringify({
        display_name: 'Hacked User',
        email: 'hacked@forge.internal',
        job_title: 'Hacker',
      }),
    });

    const res = await handleCreateEmployee(req);
    expect(res.status).toBe(403);
    const body: any = await res.json();
    expect(body.title).toBe('Forbidden');
  });

  it('allows super_admin users to create employees', async () => {
    const adminToken = signJwt({
      sub: 'usr-superadmin',
      email: 'superadmin@forge.internal',
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
        display_name: 'Approved User',
        email: `approved.${timestamp}@forge.internal`,
        job_title: 'Staff Security Engineer',
      }),
    });

    const res = await handleCreateEmployee(req);
    expect(res.status).toBe(201);
  });
});
