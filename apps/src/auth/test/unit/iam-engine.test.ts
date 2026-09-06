/**
 * @forge/auth/test/unit - GCP-Style IAM Engine Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { hasPermission, evaluateUserPermissions } from '../../src/backend/iam-engine';

describe('Tier 1 Unit: GCP-Style IAM Engine', () => {
  const orgId = 'org-sg-forge-global';

  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should grant full wildcard access to Organization Administrator (SuperAdmin)', () => {
    // Arrange
    const superAdminId = 'usr-superadmin';

    // Act
    const canManageAll = hasPermission(superAdminId, orgId, 'auth.users.write');
    const canAccessBilling = hasPermission(superAdminId, orgId, 'billing.invoices.manage');
    const canAccessPortal = hasPermission(superAdminId, orgId, 'portal.workspace.access');

    // Assert
    expect(canManageAll).toBe(true);
    expect(canAccessBilling).toBe(true);
    expect(canAccessPortal).toBe(true);
  });

  it('should restrict standard employee to authorized permissions', () => {
    // Arrange
    const employeeId = 'usr-alice-eng';

    // Act
    const canAccessPortal = hasPermission(employeeId, orgId, 'portal.workspace.access');
    const canManageIAM = hasPermission(employeeId, orgId, 'iam.roles.grant');

    // Assert
    expect(canAccessPortal).toBe(true);
    expect(canManageIAM).toBe(false);
  });

  it('should resolve effective permissions list for user', () => {
    // Arrange & Act
    const context = evaluateUserPermissions('usr-superadmin', orgId);

    // Assert
    expect(context.roles.length).toBeGreaterThan(0);
    expect(context.roles).toContain('roles/super_admin');
  });
});
