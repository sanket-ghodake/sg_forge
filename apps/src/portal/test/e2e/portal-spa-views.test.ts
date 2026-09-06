/**
 * @forge/portal - Tier 5 E2E: Full SPA Views & Interactive Ecosystem
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { signJwt, startAuthServer } from '@forge/auth';
import { startPortalServer } from '../../src/server';

describe('Tier 5 E2E: Full SPA Views & Interactive Ecosystem', () => {
  let authServer: any = null;
  const AUTH_TEST_PORT = 3295;

  beforeAll(async () => {
    process.env.AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    process.env.TEST_AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    authServer = startAuthServer(AUTH_TEST_PORT);
  });

  afterAll(() => {
    if (authServer) {
      authServer.stop(true);
    }
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.TEST_AUTH_SERVICE_URL;
  });

  it('renders all 10 interactive SPA views inside the unified portal layout', async () => {
    // Arrange
    const testPort = 3192;
    const server = startPortalServer(testPort);

    const token = signJwt({
      sub: 'usr_admin_test',
      email: 'admin@forge.internal',
      display_name: 'Test Administrator',
      principal_type: 'ADMIN',
      org_id: 'org-test',
      roles: ['roles/employee', 'roles/super_admin'],
      permissions: ['portal.workspace.access', 'portal.admin.access'],
      token_version: 1,
    });

    try {
      // Act
      const res = await fetch(`http://localhost:${testPort}/portal`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const html = await res.text();

      // Assert: Status 200 OK
      expect(res.status).toBe(200);

      // Assert: All 9 views rendered
      expect(html).toContain('id="view-canvas"');
      expect(html).toContain('id="view-apps"');
      expect(html).toContain('id="view-profile"');
      expect(html).toContain('id="view-notifications"');
      expect(html).toContain('id="view-admin-members"');
      expect(html).toContain('id="view-admin-apps"');
      expect(html).toContain('id="view-admin-org"');
      expect(html).toContain('id="view-admin-audit"');
      expect(html).toContain('id="view-admin-settings"');

      // Assert: Interactive elements and modals present
      expect(html).toContain('id="portal-search-modal"');
      expect(html).toContain('id="modal-invite-member"');
      expect(html).toContain('id="modal-request-access"');
      expect(html).toContain('canvas-pan-surface');
      expect(html).toContain('apps-catalog-grid');
    } finally {
      server.stop(true);
    }
  });

  it('serves dynamic JSON API endpoints for apps and members with valid session', async () => {
    // Arrange
    const testPort = 3193;
    const server = startPortalServer(testPort);

    const token = signJwt({
      sub: 'usr_member_test',
      email: 'member@forge.internal',
      display_name: 'Regular Member',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      // Act: Apps API
      const appsRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/apps`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const appsJson = await appsRes.json();

      // Assert
      expect(appsRes.status).toBe(200);
      expect(appsJson.ok).toBe(true);
      expect(Array.isArray(appsJson.data)).toBe(true);
      expect(appsJson.marketplace.length).toBeGreaterThan(0);

      // Act: Members API
      const membersRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/members`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const membersJson = await membersRes.json();

      // Assert
      expect(membersRes.status).toBe(200);
      expect(membersJson.ok).toBe(true);
      expect(Array.isArray(membersJson.data)).toBe(true);
      expect(membersJson.data.length).toBeGreaterThan(0);

      // Act: Canvas Tree API
      const treeRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/canvas/tree?max_depth=5`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const treeJson = await treeRes.json();

      // Assert
      expect(treeRes.status).toBe(200);
      expect(treeJson.ok).toBe(true);
      expect(treeJson.data).toBeDefined();
      expect(treeJson.data.maxRenderedDepth).toBe(5);
      expect(typeof treeJson.data.totalEmployees).toBe('number');
    } finally {
      server.stop(true);
    }
  });

  it('serves dynamic JSON API endpoints for live notifications, company events, mark-read, and preferences', async () => {
    // Arrange
    const testPort = 3194;
    const server = startPortalServer(testPort);

    const token = signJwt({
      sub: 'usr_member_test_02',
      email: 'member2@forge.internal',
      display_name: 'Alex Laurent',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    try {
      // Act: Live Notifications API
      const notifsRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/notifications`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const notifsJson = await notifsRes.json();

      // Assert
      expect(notifsRes.status).toBe(200);
      expect(notifsJson.ok).toBe(true);
      expect(Array.isArray(notifsJson.data)).toBe(true);

      // Act: Company Events API
      const eventsRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/events`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      const eventsJson = await eventsRes.json();

      // Assert
      expect(eventsRes.status).toBe(200);
      expect(eventsJson.ok).toBe(true);
      expect(Array.isArray(eventsJson.data)).toBe(true);
      expect(eventsJson.data.length).toBeGreaterThan(0);

      // Act: Mark all read
      const markReadRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/notifications/mark-read`, {
        method: 'POST',
        headers: { Cookie: `forge_session=${token}` },
      });
      const markReadJson = await markReadRes.json();
      expect(markReadJson.ok).toBe(true);

      // Act: Save delivery preference
      const prefRes = await fetch(`http://localhost:${testPort}/portal/api/v1/portal/preferences`, {
        method: 'POST',
        headers: {
          Cookie: `forge_session=${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pref: 'morning-digest' }),
      });
      const prefJson = await prefRes.json();
      expect(prefJson.ok).toBe(true);
    } finally {
      server.stop(true);
    }
  });
});
