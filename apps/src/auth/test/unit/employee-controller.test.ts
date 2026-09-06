import { describe, it, expect, beforeEach } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import { employeeController } from '../../src/backend/employee-controller';
import { getOrgTree } from '../../src/backend/org-tree-service';
import { seedAuthDatabase } from '../../src/db/seed';

describe('Tier 1 Unit: EmployeeController & OrgTreeService (@forge/auth) [LLR-DB-005]', () => {
  beforeEach(() => {
    seedAuthDatabase();
  });

  it('should list employees with pagination and department metadata', () => {
    const res = employeeController.listEmployees({ limit: 10 });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
    expect(Array.isArray(res.departments)).toBe(true);
    expect(res.items[0]).toHaveProperty('email');
    expect(res.items[0]).toHaveProperty('display_name');
    expect(res.items[0]).toHaveProperty('roles');
  });

  it('should create an employee and assign reporting manager', () => {
    const timestamp = Date.now();
    const testEmail = `test.employee.${timestamp}@forge.internal`;

    const superadmin = employeeController.listEmployees({ search: 'superadmin' }).items[0];
    expect(superadmin).toBeDefined();

    const created = employeeController.createEmployee({
      display_name: 'Test Engineer',
      email: testEmail,
      job_title: 'Software Engineer II',
      employee_code: `EMP-${timestamp}`,
      manager_id: superadmin.id,
      role: 'roles/employee',
    });

    expect(created.id).toBeDefined();
    expect(created.email).toBe(testEmail);

    const hierarchy = employeeController.getEmployeeHierarchy(created.id);
    expect(hierarchy).not.toBeNull();
    expect(hierarchy!.managementChain.length).toBeGreaterThan(0);
    expect(hierarchy!.managementChain[0].id).toBe(superadmin.id);
  });

  it('should construct hierarchical org tree with depth bounding', () => {
    const brand = loadBrandConfig();
    const expectedOrgName = brand.orgName || brand.name || 'SG Forge Enterprise';
    const tree = getOrgTree({ maxDepth: 5 });
    expect(tree.organizationName).toBe(expectedOrgName);
    expect(tree.totalEmployees).toBeGreaterThan(0);
    expect(tree.root).not.toBeNull();
    expect(tree.root!.level).toBe(1);
    expect(Array.isArray(tree.divisions)).toBe(true);
  });
});
