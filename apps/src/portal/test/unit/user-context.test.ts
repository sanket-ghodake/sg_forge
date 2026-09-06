/**
 * @forge/portal - Tier 1 Unit: User Context & Role-Based App Clearance
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getPortalApps } from '../../src/frontend/ui-apps-data';

describe('Tier 1 Unit: Portal User Context & Role Clearance', () => {
  it('Arrange, Act, Assert: restricts privileged apps for standard employee roles', () => {
    // Arrange: User with only standard employee roles
    const employeeRoles = ['roles/employee'];

    // Act
    const { activeApps, marketplaceApps } = getPortalApps(employeeRoles);

    // Assert: Both Telemetry and Code require elevated permissions so they appear in marketplace for standard employee
    expect(marketplaceApps.length).toBeGreaterThanOrEqual(1);
    const marketplaceIds = marketplaceApps.map((a) => a.id);
    expect(marketplaceIds).toContain('telemetry');
    expect(marketplaceIds).toContain('code');
  });

  it('Arrange, Act, Assert: grants full active access to admin role', () => {
    // Arrange: User with admin role
    const adminRoles = ['roles/employee', 'roles/admin'];

    // Act
    const { activeApps } = getPortalApps(adminRoles);

    // Assert: Both apps are now actively unlocked
    const activeIds = activeApps.map((a) => a.id);
    expect(activeIds).toContain('telemetry');
    expect(activeIds).toContain('code');
  });

  it('Arrange, Act, Assert: unlocks all restricted apps for super_admin role', () => {
    // Arrange: Superadmin
    const superRoles = ['roles/super_admin'];

    // Act
    const { activeApps, marketplaceApps } = getPortalApps(superRoles);

    // Assert: All registered apps are active
    const activeIds = activeApps.map((a) => a.id);
    expect(activeIds).toContain('telemetry');
    expect(activeIds).toContain('code');
    expect(marketplaceApps.length).toBe(0);
  });
});
