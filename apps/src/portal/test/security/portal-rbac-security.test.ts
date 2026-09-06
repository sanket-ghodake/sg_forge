/**
 * @forge/portal - Tier 3 Security Test: RBAC, Privilege Escalation Defense, and Server-Side HTML Gating
 * Enforces Zero-Trust role verification, prevents horizontal/vertical privilege escalation,
 * and verifies that administrative templates are never leaked to non-admin users.
 */

import { describe, expect, it } from 'bun:test';
import { signJwt } from '@forge/auth';
import { startPortalServer } from '../../src/server';
import { renderPortalHtml } from '../../src/frontend/ui-renderer';

describe('Tier 3 Security: RBAC & Server-Side Security Boundaries [HLR-PORTAL-202] [LLR-SUB-006]', () => {
  const TEST_PORT = 3195;

  it('privilege escalation defense: regular employees cannot invite new members (403 Forbidden)', async () => {
    const server = startPortalServer(TEST_PORT);
    const employeeToken = signJwt({
      sub: 'usr_emp_01',
      email: 'employee@forge.internal',
      display_name: 'Regular Employee',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      const res = await fetch(`http://localhost:${TEST_PORT}/portal/api/v1/portal/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${employeeToken}`,
        },
        body: JSON.stringify({
          email: 'newuser@forge.internal',
          name: 'Attacker Invite',
          role: 'roles/employee',
        }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    } finally {
      server.stop();
    }
  });

  it('vertical privilege escalation defense: department admin cannot grant super_admin role (403 Forbidden)', async () => {
    const server = startPortalServer(TEST_PORT);
    const deptAdminToken = signJwt({
      sub: 'usr_dept_admin',
      email: 'deptadmin@forge.internal',
      display_name: 'Dept Admin',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee', 'roles/admin'], // Has admin, but NOT super_admin
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      const res = await fetch(`http://localhost:${TEST_PORT}/portal/api/v1/portal/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${deptAdminToken}`,
        },
        body: JSON.stringify({
          email: 'escalated@forge.internal',
          name: 'Privilege Escalation Target',
          role: 'roles/super_admin', // Attempting to grant super_admin
        }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Super Admin');
    } finally {
      server.stop();
    }
  });

  it('data privacy: regular employees cannot inspect security & audit stream (403 Forbidden)', async () => {
    const server = startPortalServer(TEST_PORT);
    const employeeToken = signJwt({
      sub: 'usr_emp_02',
      email: 'employee2@forge.internal',
      display_name: 'Employee 2',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      const res = await fetch(`http://localhost:${TEST_PORT}/portal/api/v1/portal/audit`, {
        method: 'GET',
        headers: {
          Cookie: `forge_session=${employeeToken}`,
        },
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    } finally {
      server.stop();
    }
  });

  it('server-side gating: non-admin HTML output never contains admin templates or views', () => {
    const employeeContext = {
      id: 'usr_emp_regular',
      email: 'regular@forge.internal',
      displayName: 'Regular Staff',
      roles: ['roles/employee'],
      isAdmin: false,
    };

    const html = renderPortalHtml(employeeContext);

    // Workspace views MUST be present
    expect(html).toContain('id="view-canvas"');
    expect(html).toContain('id="view-apps"');
    expect(html).toContain('id="view-profile"');
    expect(html).toContain('id="view-notifications"');

    // Admin views MUST NOT be present in the server HTML response
    expect(html).not.toContain('id="view-admin-members"');
    expect(html).not.toContain('id="view-admin-apps"');
    expect(html).not.toContain('id="view-admin-org"');
    expect(html).not.toContain('id="view-admin-audit"');
    expect(html).not.toContain('id="view-admin-settings"');
  });

  it('method safety: invalid HTTP verbs return 405 Method Not Allowed', async () => {
    const server = startPortalServer(TEST_PORT);
    const adminToken = signJwt({
      sub: 'usr_admin_01',
      email: 'admin@forge.internal',
      display_name: 'Admin',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee', 'roles/admin'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      // GET on invite endpoint
      const res1 = await fetch(`http://localhost:${TEST_PORT}/portal/api/v1/portal/members/invite`, {
        method: 'GET',
        headers: { Cookie: `forge_session=${adminToken}` },
      });
      expect(res1.status).toBe(405);

      // GET on token revoke endpoint
      const res2 = await fetch(`http://localhost:${TEST_PORT}/portal/api/v1/portal/tokens/revoke`, {
        method: 'GET',
        headers: { Cookie: `forge_session=${adminToken}` },
      });
      expect(res2.status).toBe(405);
    } finally {
      server.stop();
    }
  });
});
