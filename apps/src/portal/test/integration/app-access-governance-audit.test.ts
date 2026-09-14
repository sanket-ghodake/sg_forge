/**
 * @forge/portal - App Access Governance & Real-Time Security Audit Tests (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite.
 *
 * Verifies:
 * 1. Duplicate request prevention (PENDING and APPROVED blocking)
 * 2. Approved app transition into My Active Apps catalog
 * 3. App Admin Cross-App Isolation (App A admin cannot view or decide App B requests)
 * 4. App Admin Entitled Users discovery and dynamic revocation
 * 5. Offboarded employee handling (USER_INACTIVE status transition)
 * 6. Admin turnover & dynamic pending request rerouting
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-003] [SR-RBAC-001]
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken, getDatabaseClient } from '@forge/sdk';
import { startPortalServer } from '../../src/server';
import {
  createAppAccessRequest,
  getUserApprovedAppIds,
  markEmployeeRequestsInactive,
} from '../../src/backend/app-requests-service';
import { getAppActiveUsers, revokeUserAppAccess } from '../../src/backend/app-users-service';
import { getPortalApps } from '../../src/frontend/ui-apps-data';
import { addAppAdmin, removeAppAdmin } from '../../src/backend/app-governance-service';

describe('Tier 2 Integration: App Access Governance & Invariant Audit', () => {
  it('Arrange, Act, Assert: Prevents duplicate requests for PENDING and APPROVED states', () => {
    // Arrange: Ephemeral employee identity
    const db = getDatabaseClient('portal.db');
    const empId = `usr_dedup_${Date.now()}`;
    const empEmail = `${empId}@forge.internal`;
    const appId = 'billing';

    try {
      // Act 1: First request succeeds
      const firstReq = createAppAccessRequest({
        userId: empId,
        userEmail: empEmail,
        appId,
        appName: 'Finance & Treasury',
        reasonType: 'Quarterly Audit Review',
      });
      expect(firstReq).not.toBeNull();
      expect(firstReq?.status).toBe('PENDING');

      // Assert 1: Duplicate PENDING request throws error
      expect(() => {
        createAppAccessRequest({
          userId: empId,
          userEmail: empEmail,
          appId,
          appName: 'Finance & Treasury',
          reasonType: 'Duplicate Try',
        });
      }).toThrow(/already have an active request pending review/);

      // Act 2: Simulate approval
      db.run('UPDATE portal_app_access_requests SET status = "APPROVED" WHERE id = ?', [firstReq!.id]);

      // Assert 2: Duplicate request on APPROVED state throws error
      expect(() => {
        createAppAccessRequest({
          userId: empId,
          userEmail: empEmail,
          appId,
          appName: 'Finance & Treasury',
          reasonType: 'Post-Approval Try',
        });
      }).toThrow(/already have approved active access/);
    } finally {
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [empId]);
    }
  });

  it('Arrange, Act, Assert: Approved app dynamically activates in My Active Apps catalog', () => {
    // Arrange: Ephemeral user identity and approved app
    const db = getDatabaseClient('portal.db');
    const empId = `usr_catalog_${Date.now()}`;
    const empEmail = `${empId}@forge.internal`;
    const appId = 'telemetry';

    try {
      const req = createAppAccessRequest({
        userId: empId,
        userEmail: empEmail,
        appId,
        appName: 'Telemetry Hub',
        reasonType: 'SRE On-Call Duty',
      });
      db.run('UPDATE portal_app_access_requests SET status = "APPROVED" WHERE id = ?', [req!.id]);

      // Act: Retrieve approved app IDs and evaluate portal apps
      const approvedAppIds = getUserApprovedAppIds(empId);
      expect(approvedAppIds).toContain('telemetry');

      const { activeApps, marketplaceApps, allApps } = getPortalApps(['roles/employee'], {
        appBindings: approvedAppIds,
      });

      // Assert: App is in activeApps and has isRestricted false
      const telemetryActive = activeApps.find((a) => a.id === 'telemetry');
      expect(telemetryActive).toBeDefined();
      expect(telemetryActive?.isRestricted).toBe(false);

      // Assert: In allApps, telemetry is also marked not restricted
      const telemetryAll = allApps.find((a) => a.id === 'telemetry');
      expect(telemetryAll).toBeDefined();
      expect(telemetryAll?.isRestricted).toBe(false);
    } finally {
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [empId]);
    }
  });

  it('Arrange, Act, Assert: Enforces Cross-App Isolation for delegated App Admins', async () => {
    // Arrange: Server with 2 apps (telemetry, billing), and a delegated admin for telemetry only
    const server = startPortalServer(0);
    const db = getDatabaseClient('portal.db');
    const appAdminId = `usr_telemetry_admin_${Date.now()}`;
    const appAdminEmail = `telemetry.lead.${Date.now()}@forge.internal`;
    const employeeId = `usr_requester_${Date.now()}`;

    // App admin only has employee role, but is assigned to telemetry in portal_app_admins
    const adminToken = createInternalServiceToken(['roles/employee', 'roles/app_admin'], appAdminId);
    const empToken = createInternalServiceToken(['roles/employee'], employeeId);

    // Seed admin into portal_app_admins for telemetry ONLY
    db.run(
      `INSERT INTO portal_app_admins (id, app_id, user_id, user_name, user_email, user_title, user_dept, role_type, avatar_initial, assigned_by, assigned_at)
       VALUES (?, 'telemetry', ?, 'Telemetry Lead', ?, 'Lead SRE', 'Engineering', 'ADMIN', 'TL', 'test_setup', ?)`,
      [`adm_${Date.now()}`, appAdminId, appAdminEmail, Date.now()]
    );

    try {
      // 1. Employee creates access requests for telemetry AND billing
      const reqTelemetry = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `forge_session=${empToken}` },
        body: JSON.stringify({ appId: 'telemetry', appName: 'Telemetry Hub', reasonType: 'Core Job' }),
      });
      const telemetryData = await reqTelemetry.json();
      const telemetryReqId = telemetryData.data.id;

      const reqBilling = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `forge_session=${empToken}` },
        body: JSON.stringify({ appId: 'billing', appName: 'Finance & Treasury', reasonType: 'Audit' }),
      });
      const billingData = await reqBilling.json();
      const billingReqId = billingData.data.id;

      // 2. Act: Telemetry App Admin fetches pending requests
      const pendingRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/pending`, {
        headers: { Cookie: `forge_session=${adminToken}` },
      });
      expect(pendingRes.status).toBe(200);
      const pendingData = await pendingRes.json();

      // Assert: Telemetry admin SEES telemetry request, but CANNOT see billing request
      const hasTelemetry = pendingData.data.some((r: any) => r.id === telemetryReqId);
      const hasBilling = pendingData.data.some((r: any) => r.id === billingReqId);
      expect(hasTelemetry).toBe(true);
      expect(hasBilling).toBe(false);

      // 3. Act & Assert: Telemetry admin attempts to decide billing request -> 403 Forbidden
      const decideBilling = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `forge_session=${adminToken}` },
        body: JSON.stringify({ requestId: billingReqId, decision: 'APPROVE' }),
      });
      expect(decideBilling.status).toBe(403);
      const decideBillingBody = await decideBilling.json();
      expect(decideBillingBody.error).toMatch(/not designated as an administrator/);

      // 4. Act & Assert: Telemetry admin approves telemetry request -> 200 OK
      const decideTelemetry = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `forge_session=${adminToken}` },
        body: JSON.stringify({ requestId: telemetryReqId, decision: 'APPROVE' }),
      });
      expect(decideTelemetry.status).toBe(200);
    } finally {
      db.run('DELETE FROM portal_app_admins WHERE user_id = ?', [appAdminId]);
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [employeeId]);
    }
  });

  it('Arrange, Act, Assert: Lists active entitled users and supports access revocation', async () => {
    // Arrange: Ephemeral user with approved access to telemetry
    const db = getDatabaseClient('portal.db');
    const empId = `usr_active_${Date.now()}`;
    const empEmail = `active.user.${Date.now()}@forge.internal`;

    const req = createAppAccessRequest({
      userId: empId,
      userEmail: empEmail,
      appId: 'telemetry',
      appName: 'Telemetry Hub',
      reasonType: 'Incident Responder',
    });
    db.run('UPDATE portal_app_access_requests SET status = "APPROVED" WHERE id = ?', [req!.id]);

    try {
      // Act 1: Query active users for telemetry
      const usersBefore = getAppActiveUsers('telemetry');
      const found = usersBefore.find((u) => u.userId === empId);
      expect(found).toBeDefined();
      expect(found?.userEmail).toBe(empEmail);
      expect(found?.grantedAt).toBeGreaterThan(0);

      // Act 2: Revoke access
      const adminId = `usr_gov_admin_${Date.now()}`;
      const revoked = revokeUserAppAccess('telemetry', empId, adminId, { notes: 'Role reassignment' });
      expect(revoked.ok).toBe(true);
      expect(revoked.revokedCount).toBe(1);

      // Assert: User no longer in active users list
      const usersAfter = getAppActiveUsers('telemetry');
      const foundAfter = usersAfter.find((u) => u.userId === empId);
      expect(foundAfter).toBeUndefined();

      // Assert: App no longer in user's approved apps
      const approvedApps = getUserApprovedAppIds(empId);
      expect(approvedApps).not.toContain('telemetry');
    } finally {
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [empId]);
    }
  });

  it('Arrange, Act, Assert: Handles offboarded employee by transitioning requests to USER_INACTIVE', async () => {
    // Arrange: Employee with multiple requests across apps and admin assignment
    const db = getDatabaseClient('portal.db');
    const empId = `usr_offboard_${Date.now()}`;
    const empEmail = `offboard.${Date.now()}@forge.internal`;

    const req1 = createAppAccessRequest({
      userId: empId,
      userEmail: empEmail,
      appId: 'telemetry',
      appName: 'Telemetry Hub',
      reasonType: 'Platform Team',
    });
    const req2 = createAppAccessRequest({
      userId: empId,
      userEmail: empEmail,
      appId: 'billing',
      appName: 'Finance & Treasury',
      reasonType: 'FinOps',
    });
    db.run('UPDATE portal_app_access_requests SET status = "APPROVED" WHERE id = ?', [req1!.id]);

    // Also assign as an admin of telemetry
    await addAppAdmin('telemetry', {
      userId: empId,
      userName: 'Departing Admin',
      userEmail: empEmail,
      userTitle: 'Lead',
      userDept: 'Engineering',
      roleType: 'ADMIN',
      avatarInitial: 'DA',
    }, 'system');

    try {
      // Act: Offboard employee
      const result = markEmployeeRequestsInactive(empId);
      expect(result.invalidatedPending + result.revokedApproved).toBeGreaterThanOrEqual(2);

      // Assert 1: All requests for this user are now USER_INACTIVE or REVOKED_INACTIVE
      const requests = db.query<any, [string]>('SELECT status FROM portal_app_access_requests WHERE user_id = ?').all(empId);
      for (const r of requests) {
        expect(['USER_INACTIVE', 'REVOKED_INACTIVE']).toContain(r.status);
      }

      // Assert 2: User has zero approved apps
      const approvedApps = getUserApprovedAppIds(empId);
      expect(approvedApps.length).toBe(0);

      // Assert 3: Removed from portal_app_admins
      const adminRecord = db.query<any, [string]>('SELECT id FROM portal_app_admins WHERE user_id = ?').get(empId);
      expect(adminRecord).toBeNull();
    } finally {
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [empId]);
      db.run('DELETE FROM portal_app_admins WHERE user_id = ?', [empId]);
    }
  });

  it('Arrange, Act, Assert: Dynamically reroutes pending requests when app admins change', async () => {
    // Arrange: An app with Admin A and a pending request
    const db = getDatabaseClient('portal.db');
    const adminAId = `usr_admin_a_${Date.now()}`;
    const adminAEmail = `admin.a.${Date.now()}@forge.internal`;
    const adminBId = `usr_admin_b_${Date.now()}`;
    const adminBEmail = `admin.b.${Date.now()}@forge.internal`;
    const requesterId = `usr_req_turnover_${Date.now()}`;

    await addAppAdmin('billing', {
      userId: adminAId,
      userName: 'Admin Alpha',
      userEmail: adminAEmail,
      userTitle: 'Finance Lead',
      userDept: 'Finance',
      roleType: 'ADMIN',
      avatarInitial: 'AA',
    }, 'system');

    const pendingReq = createAppAccessRequest({
      userId: requesterId,
      userEmail: `${requesterId}@forge.internal`,
      appId: 'billing',
      appName: 'Finance & Treasury',
      reasonType: 'Billing Inspection',
    });

    try {
      // Act 1: Admin Turnover occurs — Admin B is appointed, Admin A is removed
      await addAppAdmin('billing', {
        userId: adminBId,
        userName: 'Admin Beta',
        userEmail: adminBEmail,
        userTitle: 'New Finance Lead',
        userDept: 'Finance',
        roleType: 'PRIMARY_OWNER',
        avatarInitial: 'AB',
      }, 'system');
      removeAppAdmin('billing', adminAId, 'system');

      // Assert 1: Outgoing Admin A has no pending requests for billing
      const fromA = db.query<any, [string, string]>(
        `SELECT r.id FROM portal_app_access_requests r
         WHERE r.status = 'PENDING' AND (
           r.app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
         )`
      ).all(adminAId, adminAEmail);
      expect(fromA.some((r) => r.id === pendingReq!.id)).toBe(false);

      // Assert 2: Incoming Admin B immediately inherits all pending requests (including prior requests)
      const fromB = db.query<any, [string, string]>(
        `SELECT r.id FROM portal_app_access_requests r
         WHERE r.status = 'PENDING' AND (
           r.app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
         )`
      ).all(adminBId, adminBEmail);
      expect(fromB.some((r) => r.id === pendingReq!.id)).toBe(true);
    } finally {
      db.run('DELETE FROM portal_app_access_requests WHERE user_id = ?', [requesterId]);
      db.run('DELETE FROM portal_app_admins WHERE user_id IN (?, ?)', [adminAId, adminBId]);
    }
  });
});
