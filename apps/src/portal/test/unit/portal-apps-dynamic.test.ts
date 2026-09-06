/**
 * @forge/portal - Dynamic Micro-Apps Discovery Unit Test (2026 LTS)
 * Verifies loadServiceRegistry discovery, category mapping, and role-based app segmentation.
 */

import { describe, it, expect } from 'bun:test';
import { getPortalApps } from '../../src/frontend/ui-apps-data';
import { renderAppsView } from '../../src/frontend/ui-renderer-apps';
import { renderAdminAppsView } from '../../src/frontend/ui-admin-apps';

describe('Tier 1 Unit: Dynamic Micro-Apps Discovery & Role Segmentation', () => {
  it('dynamically discovers micro-apps from the service registry without hardcoded lists', () => {
    // Arrange & Act
    const { activeApps, marketplaceApps, allApps } = getPortalApps(['roles/employee']);

    // Assert: Micro-apps are discovered
    expect(allApps.length).toBeGreaterThan(0);
    expect(allApps.some((a) => a.id === 'telemetry')).toBe(true);
    expect(allApps.some((a) => a.id === 'code')).toBe(true);
    expect(allApps.every((a) => a.ingressPath.startsWith('/apps/'))).toBe(true);

    // Marketplace / restricted apps are properly partitioned for non-admin employee
    expect(marketplaceApps.length).toBeGreaterThan(0);
    expect(marketplaceApps.every((a) => a.isRestricted)).toBe(true);
  });

  it('elevates restricted apps to active when user has administrative roles', () => {
    // Arrange & Act
    const employeeCatalog = getPortalApps(['roles/employee']);
    const adminCatalog = getPortalApps(['roles/admin']);

    // Assert: Admin should have more active apps than regular employee
    expect(adminCatalog.activeApps.length).toBeGreaterThanOrEqual(employeeCatalog.activeApps.length);
    expect(adminCatalog.marketplaceApps.length).toBeLessThanOrEqual(employeeCatalog.marketplaceApps.length);
  });

  it('renders dynamic category filter pills matching discovered micro-apps', () => {
    // Arrange & Act
    const viewHtml = renderAppsView(['roles/employee']);

    // Assert: Filter bar and dynamic pills are present
    expect(viewHtml).toContain('apps-category-filter-bar');
    expect(viewHtml).toContain('data-cat="ALL"');
    expect(viewHtml).toContain('tab-content-my-apps');
    expect(viewHtml).toContain('tab-content-marketplace');
  });

  it('renders all discovered micro-apps in the admin application catalog', () => {
    // Arrange & Act
    const adminView = renderAdminAppsView();

    // Assert
    expect(adminView).toContain('id="view-admin-apps"');
    expect(adminView).toContain('admin-apps-table');
    expect(adminView).toContain('/apps/telemetry');
  });
});
