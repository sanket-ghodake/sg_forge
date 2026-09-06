/**
 * @forge/auth - Tier 1 Unit Test: Scoped Employee Hierarchy Engine
 * Verifies linear upward management traversal and downward subordinate isolation.
 */

import { describe, expect, it, beforeAll } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { getScopedHierarchyData } from '../../src/backend/hierarchy';
import { handleScopedHierarchy } from '../../src/backend/api-handlers';

describe('Tier 1 Unit: Scoped Employee Hierarchy Engine [LLR-AUTH-003]', () => {
  beforeAll(() => {
    seedAuthDatabase(true);
  });

  it('should resolve linear upward management chain for a nested engineer', () => {
    // Aditi Sharma (usr-alice-eng) -> Rohan Kulkarni (usr-bob-lead) -> Rajesh Sharma (usr-superadmin)
    const hierarchy = getScopedHierarchyData('usr-alice-eng');

    expect(hierarchy).not.toBeNull();
    expect(hierarchy?.status).toBe('SUCCESS');
    expect(hierarchy?.employee.id).toBe('usr-alice-eng');
    expect(hierarchy?.employee.displayName).toContain('Aditi Sharma');
    expect(hierarchy?.employee.departmentName).toBe('Backend & Infrastructure Squad');

    // Management Chain Upwards
    expect(hierarchy?.managementChain.length).toBe(2);
    expect(hierarchy?.managementChain[0].id).toBe('usr-bob-lead');
    expect(hierarchy?.managementChain[0].level).toBe(1);
    expect(hierarchy?.managementChain[0].displayName).toContain('Rohan Kulkarni');
    expect(hierarchy?.managementChain[1].id).toBe('usr-superadmin');
    expect(hierarchy?.managementChain[1].level).toBe(2);

    // Direct Reports (Aditi manages Amitabh & Neha)
    expect(hierarchy?.directReports.length).toBe(2);
    expect(hierarchy?.summary.isTopLevel).toBe(false);
    expect(hierarchy?.summary.totalManagersAbove).toBe(2);
  });

  it('should resolve direct reports downwards for a team lead', () => {
    // Rohan Kulkarni (usr-bob-lead) manages Aditi, Tanvi, and Meera
    const hierarchy = getScopedHierarchyData('usr-bob-lead');

    expect(hierarchy).not.toBeNull();
    expect(hierarchy?.employee.id).toBe('usr-bob-lead');
    expect(hierarchy?.directReports.length).toBe(3);
    expect(hierarchy?.directReports[0].id).toBe('usr-alice-eng');
    expect(hierarchy?.directReports[0].displayName).toContain('Aditi Sharma');

    // Upward chain for Rohan
    expect(hierarchy?.managementChain.length).toBe(1);
    expect(hierarchy?.managementChain[0].id).toBe('usr-superadmin');
  });

  it('should identify top-level executive with zero managers above', () => {
    // SuperAdmin (usr-superadmin) is CTO at root
    const hierarchy = getScopedHierarchyData('usr-superadmin');

    expect(hierarchy).not.toBeNull();
    expect(hierarchy?.employee.id).toBe('usr-superadmin');
    expect(hierarchy?.managementChain.length).toBe(0);
    expect(hierarchy?.summary.isTopLevel).toBe(true);
    expect(hierarchy?.directReports.length).toBeGreaterThan(0);
  });

  it('should support lookup by email', () => {
    const hierarchy = getScopedHierarchyData('alice.eng@forge.internal');
    expect(hierarchy).not.toBeNull();
    expect(hierarchy?.employee.id).toBe('usr-alice-eng');
  });

  it('should return null for non-existent employee identifier', () => {
    const hierarchy = getScopedHierarchyData('usr-does-not-exist');
    expect(hierarchy).toBeNull();
  });

  it('should handle REST endpoint query parameters correctly', async () => {
    const req = new Request('http://auth:3004/api/v1/auth/hierarchy?user_id=usr-alice-eng');
    const resp = await handleScopedHierarchy(req);

    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data.status).toBe('SUCCESS');
    expect(data.employee.id).toBe('usr-alice-eng');
    expect(data.managementChain.length).toBe(2);
  });
});
