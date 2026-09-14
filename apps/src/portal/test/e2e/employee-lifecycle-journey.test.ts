/**
 * @forge/portal - Tier 5 E2E: Full Employee Lifecycle Journey (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite.
 * Verifies real network endpoints: onboarding -> app discovery -> access request ->
 * delegated approval -> notification delivery -> batch CSV ingestion.
 * @requirements [HLR-PORTAL-201] [HLR-AUTH-004] [LLR-PORTAL-005] [SR-GATE-001]
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { signJwt, startAuthServer } from '@forge/auth';
import { startPortalServer } from '../../src/server';

describe('Tier 5 E2E: Complete Employee Lifecycle & App Access Journey', () => {
  let authServer: any = null;
  let portalServer: any = null;
  const AUTH_TEST_PORT = 3297;
  const PORTAL_TEST_PORT = 3197;

  beforeAll(async () => {
    process.env.AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    process.env.TEST_AUTH_SERVICE_URL = `http://localhost:${AUTH_TEST_PORT}`;
    authServer = startAuthServer(AUTH_TEST_PORT);
    portalServer = startPortalServer(PORTAL_TEST_PORT);
  });

  afterAll(() => {
    if (portalServer) portalServer.stop();
    if (authServer) authServer.stop(true);
    delete process.env.AUTH_SERVICE_URL;
    delete process.env.TEST_AUTH_SERVICE_URL;
  });

  it('runs complete lifecycle: invite -> request access -> approve -> notification -> batch import', async () => {
    const adminToken = signJwt({
      sub: 'usr_e2e_admin',
      email: 'admin.e2e@forge.internal',
      display_name: 'E2E Admin Lead',
      principal_type: 'ADMIN',
      org_id: 'org-test',
      roles: ['roles/employee', 'roles/admin'],
      permissions: ['portal.workspace.access', 'portal.admin.access'],
      token_version: 1,
    });

    const newEmpEmail = `alex.e2e.${Date.now()}@forge.internal`;

    // ── Phase 1: Admin invites new employee with reporting manager & title ──
    const inviteRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/members/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `forge_session=${adminToken}`,
      },
      body: JSON.stringify({
        email: newEmpEmail,
        name: 'Alex Rivera',
        title: 'Backend Systems Engineer',
        department_id: 'Engineering',
        role: 'roles/employee',
      }),
    });
    expect(inviteRes.status).toBe(200);
    const inviteData = await inviteRes.json();
    expect(inviteData.ok).toBe(true);
    const newEmpId = inviteData.data.employee?.id || inviteData.data.id;
    expect(newEmpId).toBeDefined();

    // ── Phase 2: Employee logs in & discovers app catalog ──
    const employeeToken = signJwt({
      sub: newEmpId,
      email: newEmpEmail,
      display_name: 'Alex Rivera',
      principal_type: 'EMPLOYEE',
      org_id: 'org-test',
      roles: ['roles/employee'],
      permissions: ['portal.workspace.access'],
      token_version: 1,
    });

    const catalogRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/apps`, {
      headers: { Cookie: `forge_session=${employeeToken}` },
    });
    expect(catalogRes.status).toBe(200);
    const catalogData = await catalogRes.json();
    expect(catalogData.ok).toBe(true);
    // Restricted apps are shown in marketplace for this employee
    expect(catalogData.marketplace.some((a: any) => a.id === 'telemetry')).toBe(true);

    // ── Phase 3: Employee requests access to restricted telemetry app ──
    const requestRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/apps/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `forge_session=${employeeToken}`,
      },
      body: JSON.stringify({
        appId: 'telemetry',
        appName: 'Telemetry Hub',
        reasonType: 'Incident Response & On-Call Duty',
        notes: 'Required for platform reliability monitoring',
      }),
    });
    expect(requestRes.status).toBe(200);
    const requestData = await requestRes.json();
    expect(requestData.ok).toBe(true);
    const requestId = requestData.data.id;
    expect(requestId).toBeDefined();

    // ── Phase 4: Admin views pending queue and approves access ──
    const pendingRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/apps/requests/pending`, {
      headers: { Cookie: `forge_session=${adminToken}` },
    });
    expect(pendingRes.status).toBe(200);
    const pendingData = await pendingRes.json();
    expect(pendingData.data.some((r: any) => r.id === requestId)).toBe(true);

    const approveRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/apps/requests/decide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `forge_session=${adminToken}`,
      },
      body: JSON.stringify({
        requestId: requestId,
        decision: 'APPROVED',
        reason: 'Authorized for on-call rotation',
      }),
    });
    expect(approveRes.status).toBe(200);
    const approveData = await approveRes.json();
    expect(approveData.status).toBe('APPROVED');

    // ── Phase 5: Employee verifies notification of approval ──
    const notifRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/notifications`, {
      headers: { Cookie: `forge_session=${employeeToken}` },
    });
    expect(notifRes.status).toBe(200);
    const notifData = await notifRes.json();
    const approvedNotif = notifData.data.find((n: any) => n.title === 'App Access Approved');
    expect(approvedNotif).toBeDefined();
    expect(approvedNotif.message).toContain('Telemetry Hub');

    // ── Phase 6: Admin performs batch CSV dry-run and ingestion ──
    const sampleCsv = `display_name,email,job_title,department,manager_email,role
Jordan Lee,jordan.batch.${Date.now()}@forge.internal,Staff SRE,Engineering,${newEmpEmail},roles/employee
Taylor Swift,taylor.batch.${Date.now()}@forge.internal,Data Architect,Data,,roles/employee`;

    // 6a. Dry-Run validation
    const dryRunRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/members/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `forge_session=${adminToken}`,
      },
      body: JSON.stringify({
        csv_data: sampleCsv,
        dry_run: true,
      }),
    });
    expect(dryRunRes.status).toBe(200);
    const dryRunData = await dryRunRes.json();
    expect(dryRunData.ok).toBe(true);
    expect(dryRunData.valid_count).toBe(2);

    // 6b. Real ingestion
    const realImportRes = await fetch(`http://localhost:${PORTAL_TEST_PORT}/api/v1/portal/members/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `forge_session=${adminToken}`,
      },
      body: JSON.stringify({
        csv_data: sampleCsv,
        dry_run: false,
      }),
    });
    expect(realImportRes.status).toBe(200);
    const realImportData = await realImportRes.json();
    expect(realImportData.ok).toBe(true);
    expect(realImportData.imported_count).toBe(2);
  });
});
