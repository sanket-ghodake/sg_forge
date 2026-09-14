/**
 * @forge/portal - Delegated App Access Decision Integration Test (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) Testing Suite.
 * Verifies pending inbox discovery, approval with IAM binding, rejection, and anti-self-approval invariant.
 * @requirements [HLR-PORTAL-201] [LLR-PORTAL-005] [SR-RBAC-001]
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '@forge/sdk';
import { startPortalServer } from '../../src/server';

describe('Tier 2 Integration: App Access Approval Lifecycle & Invariants', () => {
  it('Arrange, Act, Assert: Admin reviews and approves pending app access request', async () => {
    // Arrange: Ephemeral portal server, employee and admin tokens
    const server = startPortalServer(0);
    const employeeId = `usr_emp_${Date.now()}`;
    const adminId = `usr_admin_${Date.now()}`;
    const employeeToken = createInternalServiceToken(['roles/employee'], employeeId);
    const adminToken = createInternalServiceToken(['roles/employee', 'roles/admin'], adminId);

    try {
      // 1. Employee creates access request for telemetry app
      const reqRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${employeeToken}`,
        },
        body: JSON.stringify({
          appId: 'telemetry',
          appName: 'Telemetry Hub',
          reasonType: 'Daily Core Job Responsibility',
          notes: 'Observability monitoring for production sprint',
        }),
      });
      expect(reqRes.status).toBe(200);
      const reqBody = await reqRes.json();
      const requestId = reqBody.data.id;
      expect(requestId).toBeDefined();

      // 2. Admin queries pending access requests
      const pendingRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/pending`, {
        headers: { Cookie: `forge_session=${adminToken}` },
      });
      expect(pendingRes.status).toBe(200);
      const pendingBody = await pendingRes.json();
      expect(pendingBody.ok).toBe(true);
      const targetRequest = pendingBody.data.find((r: any) => r.id === requestId);
      expect(targetRequest).toBeDefined();
      expect(targetRequest.app_id).toBe('telemetry');

      // 3. Act: Admin approves the request
      const decideRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${adminToken}`,
        },
        body: JSON.stringify({
          requestId: requestId,
          decision: 'APPROVED',
          reason: 'Granted for observability role',
        }),
      });
      expect(decideRes.status).toBe(200);
      const decideBody = await decideRes.json();
      expect(decideBody.ok).toBe(true);
      expect(decideBody.status).toBe('APPROVED');

      // 4. Assert: Notification is now present in employee's notifications
      const notifRes = await fetch(`http://localhost:${server.port}/api/v1/portal/notifications`, {
        headers: { Cookie: `forge_session=${employeeToken}` },
      });
      expect(notifRes.status).toBe(200);
      const notifBody = await notifRes.json();
      const approvalNotif = notifBody.data.find((n: any) => n.title.includes('App Access Approved'));
      expect(approvalNotif).toBeDefined();
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: Enforces Anti-Self-Approval invariant (admin cannot approve own request)', async () => {
    // Arrange
    const server = startPortalServer(0);
    const adminSelfId = `usr_super_${Date.now()}`;
    const adminToken = createInternalServiceToken(['roles/employee', 'roles/admin'], adminSelfId);

    try {
      // 1. Admin creates an access request in their own name
      const reqRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${adminToken}`,
        },
        body: JSON.stringify({
          appId: 'telemetry',
          appName: 'Telemetry Hub',
          reasonType: 'Incident Investigation',
          notes: 'Self-requested elevated access',
        }),
      });
      expect(reqRes.status).toBe(200);
      const reqBody = await reqRes.json();
      const requestId = reqBody.data.id;

      // 2. Act: Same admin attempts to approve their own request
      const decideRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${adminToken}`,
        },
        body: JSON.stringify({
          requestId: requestId,
          decision: 'APPROVED',
          reason: 'Self-approving for urgent audit',
        }),
      });

      // 3. Assert: Request is rejected with HTTP 400 / error boundary
      expect(decideRes.status).toBe(400);
      const errorBody = await decideRes.json();
      expect(errorBody.ok).toBe(false);
      expect(errorBody.error).toContain('Anti-Self-Approval');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: Admin can reject a request with justification reason', async () => {
    // Arrange
    const server = startPortalServer(0);
    const employeeId = `usr_emp_rej_${Date.now()}`;
    const adminId = `usr_admin_rej_${Date.now()}`;
    const employeeToken = createInternalServiceToken(['roles/employee'], employeeId);
    const adminToken = createInternalServiceToken(['roles/employee', 'roles/admin'], adminId);

    try {
      // 1. Employee creates request
      const reqRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${employeeToken}`,
        },
        body: JSON.stringify({
          appId: 'telemetry',
          appName: 'Telemetry Hub',
          reasonType: 'Cross-Functional Project Support',
        }),
      });
      const reqBody = await reqRes.json();
      const requestId = reqBody.data.id;

      // 2. Act: Admin rejects request
      const decideRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${adminToken}`,
        },
        body: JSON.stringify({
          requestId: requestId,
          decision: 'REJECTED',
          reason: 'Insufficient business justification for external team',
        }),
      });

      // 3. Assert
      expect(decideRes.status).toBe(200);
      const decideBody = await decideRes.json();
      expect(decideBody.ok).toBe(true);
      expect(decideBody.status).toBe('REJECTED');

      // Rejection notification present for employee
      const notifRes = await fetch(`http://localhost:${server.port}/api/v1/portal/notifications`, {
        headers: { Cookie: `forge_session=${employeeToken}` },
      });
      const notifBody = await notifRes.json();
      const rejectionNotif = notifBody.data.find((n: any) => n.title.includes('App Access Declined'));
      expect(rejectionNotif).toBeDefined();
    } finally {
      server.stop();
    }
  });
});
