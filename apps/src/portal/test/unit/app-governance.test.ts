/**
 * @forge/portal - Application Governance & Administration Unit Tests (2026 LTS)
 * 3A Pattern: Arrange, Act, Assert.
 * Verifies App Admins roster, policy CRUD, safety invariants, and modal components.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { describe, it, expect } from 'bun:test';
import {
  getAppGovernance,
  addAppAdmin,
  removeAppAdmin,
  updateAppPolicy,
  getAppAccessRequestsHistory,
} from '../../src/backend/app-governance-service';
import { renderAppGovernanceModal } from '../../src/frontend/ui-admin-apps-governance-modal';
import { renderAppRequestHistoryModal } from '../../src/frontend/ui-admin-apps-history-modal';
import { handleAppGovernanceRoutes } from '../../src/backend/app-governance-routes';

describe('Application Governance & Administrator Management Service', () => {
  it('Arrange, Act, Assert: retrieves initial seeded governance data for telemetry app', () => {
    // Arrange
    const appId = 'telemetry';

    // Act
    const gov = getAppGovernance(appId);

    // Assert
    expect(gov).toBeDefined();
    expect(gov.appId).toBe('telemetry');
    expect(gov.policy.departmentOwner).toBe('Infrastructure & SRE');
    expect(gov.policy.accessMode).toBe('REQUEST_REQUIRED');
    expect(gov.policy.requireJustification).toBe(true);
    expect(gov.admins.length).toBeGreaterThanOrEqual(2);

    const alex = gov.admins.find((a) => a.userName === 'Alex Rivera');
    expect(alex).toBeDefined();
    expect(alex?.roleType).toBe('PRIMARY_OWNER');
    expect(alex?.avatarInitial).toBe('AR');
  });

  it('Arrange, Act, Assert: appoints a new application administrator', async () => {
    // Arrange
    const appId = 'telemetry';
    const newAdmin = {
      userId: 'usr_test_sarah',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah.jenkins@forge.internal',
      userTitle: 'Lead DevOps Engineer',
      userDept: 'Infrastructure & SRE',
      roleType: 'ADMIN' as const,
      avatarInitial: 'SJ',
    };

    // Act
    const appointed = await addAppAdmin(appId, newAdmin, 'super_admin_actor');
    const updatedGov = getAppGovernance(appId);

    // Assert
    expect(appointed.userId).toBe('usr_test_sarah');
    expect(appointed.userName).toBe('Sarah Jenkins');

    const found = updatedGov.admins.find((a) => a.userId === 'usr_test_sarah');
    expect(found).toBeDefined();
    expect(found?.userTitle).toBe('Lead DevOps Engineer');
  });

  it('Arrange, Act, Assert: updates application access policy and SLA', () => {
    // Arrange
    const appId = 'billing';
    const policyUpdates = {
      accessMode: 'RESTRICTED' as const,
      slaHours: 48,
      requireJustification: true,
      departmentOwner: 'Treasury & Financial Ops',
    };

    // Act
    const updated = updateAppPolicy(appId, policyUpdates, 'admin_actor', false);
    const refreshedGov = getAppGovernance(appId);

    // Assert
    expect(updated.accessMode).toBe('RESTRICTED');
    expect(updated.slaHours).toBe(48);
    expect(refreshedGov.policy.departmentOwner).toBe('Treasury & Financial Ops');
  });

  it('Arrange, Act, Assert: allows Super Admin to update infrastructure ports and gateway routing', () => {
    // Arrange
    const appId = 'telemetry';
    const infraUpdates = {
      ingressPath: '/metrics-gateway',
      internalPort: 3999,
      status: 'ONLINE' as const,
    };

    // Act - Super Admin
    const superAdminResult = updateAppPolicy(appId, infraUpdates, 'super_admin_actor', true);

    // Assert
    expect(superAdminResult.ingressPath).toBe('/metrics-gateway');
    expect(superAdminResult.internalPort).toBe(3999);

    // Act - Non-Super Admin attempting port change
    const regularAdminResult = updateAppPolicy(appId, { internalPort: 9999 }, 'regular_admin', false);
    // Port should remain 3999 because regular admin cannot change ports
    expect(regularAdminResult.internalPort).toBe(3999);
  });

  it('Arrange, Act, Assert: enforces safety invariant blocking removal of the last administrator', () => {
    // Arrange
    const appId = 'expenses';
    const gov = getAppGovernance(appId);

    // Remove until 1 remains
    const currentAdmins = [...gov.admins];
    while (currentAdmins.length > 1) {
      const toRemove = currentAdmins.pop()!;
      removeAppAdmin(appId, toRemove.userId, 'admin_actor');
    }

    const lastAdmin = currentAdmins[0];

    // Act & Assert
    expect(() => {
      removeAppAdmin(appId, lastAdmin.userId, 'admin_actor');
    }).toThrow('Safety Invariant');
  });

  it('Arrange, Act, Assert: renders application governance modal markup with all enterprise tabs', () => {
    // Arrange & Act
    const modalHtml = renderAppGovernanceModal();

    // Assert
    expect(modalHtml).toContain('id="modal-app-governance"');
    expect(modalHtml).toContain('data-target="gov-tab-admins"');
    expect(modalHtml).toContain('data-target="gov-tab-policy"');
    expect(modalHtml).toContain('data-target="gov-tab-infra"');
    expect(modalHtml).toContain('data-target="gov-tab-metrics"');
    expect(modalHtml).toContain('id="app-gov-admins-list"');
    expect(modalHtml).toContain('id="btn-assign-gov-admin"');
    expect(modalHtml).toContain('id="btn-save-gov-policy"');
    expect(modalHtml).toContain('Zero-Trust Anti-Self-Approval Active');
  });

  it('Arrange, Act, Assert: queries application access requests and computes status counts', () => {
    // Arrange
    const options = { status: 'ALL', limit: 10 };

    // Act
    const history = getAppAccessRequestsHistory(options);

    // Assert
    expect(history).toBeDefined();
    expect(Array.isArray(history.requests)).toBe(true);
    expect(typeof history.counts.all).toBe('number');
    expect(typeof history.counts.pending).toBe('number');
    expect(typeof history.counts.approved).toBe('number');
    expect(typeof history.counts.rejected).toBe('number');
  });

  it('Arrange, Act, Assert: renders application access request history modal markup', () => {
    // Arrange & Act
    const modalHtml = renderAppRequestHistoryModal();

    // Assert
    expect(modalHtml).toContain('id="modal-app-request-history"');
    expect(modalHtml).toContain('data-history-filter="ALL"');
    expect(modalHtml).toContain('data-history-filter="PENDING"');
    expect(modalHtml).toContain('data-history-filter="APPROVED"');
    expect(modalHtml).toContain('data-history-filter="REJECTED"');
    expect(modalHtml).toContain('id="app-history-search-input"');
    expect(modalHtml).toContain('id="app-history-app-select"');
    expect(modalHtml).toContain('id="app-history-stream"');
  });

  it('Arrange, Act, Assert: route handler guards request history with admin permissions', async () => {
    // Arrange
    const url = new URL('http://localhost:3001/api/v1/portal/apps/requests/history');
    const req = new Request(url, { method: 'GET' });

    // Act 1: Unauthorized user
    const unauthResponse = await handleAppGovernanceRoutes(req, url, {
      authenticated: true,
      user: { id: 'usr_emp', email: 'emp@forge.internal', roles: ['roles/employee'] },
    });

    // Assert 1
    expect(unauthResponse).not.toBeNull();
    expect(unauthResponse?.status).toBe(403);

    // Act 2: Authorized Admin
    const adminResponse = await handleAppGovernanceRoutes(req, url, {
      authenticated: true,
      user: { id: 'usr_admin', email: 'admin@forge.internal', roles: ['roles/admin'] },
    });

    // Assert 2
    expect(adminResponse).not.toBeNull();
    expect(adminResponse?.status).toBe(200);
    const json = await adminResponse?.json();
    expect(json.ok).toBe(true);
    expect(json.data.counts).toBeDefined();
  });
});

