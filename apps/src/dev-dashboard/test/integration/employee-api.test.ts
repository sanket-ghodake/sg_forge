/**
 * @forge/dev-dashboard - Employee API Integration Tests (2026 LTS)
 * Tests employee creation, retrieval, updates, hierarchy calculation, and batch imports.
 */

import { afterAll, describe, expect, it } from 'bun:test';
import { employeeController, seedAuthDatabase } from '@forge/auth';

describe('Integration: Employee Controller & Database Operations', () => {
  afterAll(() => {
    seedAuthDatabase(true);
  });
  const testEmail = `test.employee.${Date.now()}@forge.internal`;
  let createdUserId = '';

  it('1. Lists existing employees and returns department taxonomy', () => {
    // Act
    const result = employeeController.listEmployees({ limit: 10 });

    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe('number');
    expect(Array.isArray(result.departments)).toBe(true);
  });

  it('2. Creates a new employee atomically across users and profiles tables', () => {
    // Arrange
    const payload = {
      display_name: 'Integration Test Engineer',
      email: testEmail,
      job_title: 'Staff QA Architect',
      employee_code: 'QA-9901',
      role: 'roles/employee',
      status: 'ACTIVE' as const,
    };

    // Act
    const created = employeeController.createEmployee(payload);
    createdUserId = created.id;

    // Assert
    expect(created.id).toBeDefined();
    expect(created.email).toBe(testEmail);
    expect(created.display_name).toBe(payload.display_name);

    // Verify retrieval
    const list = employeeController.listEmployees({ search: testEmail });
    expect(list.items.length).toBe(1);
    expect(list.items[0].job_title).toBe(payload.job_title);
    expect(list.items[0].employee_code).toBe(payload.employee_code);
  });

  it('3. Updates employee profile, status, and role bindings', () => {
    expect(createdUserId).toBeTruthy();

    // Act
    const updateRes = employeeController.updateEmployee(createdUserId, {
      display_name: 'Integration Test Engineer (Updated)',
      job_title: 'Principal QA Architect',
      status: 'SUSPENDED',
    });

    // Assert
    expect(updateRes.status).toBe('ok');

    const list = employeeController.listEmployees({ search: testEmail });
    expect(list.items[0].display_name).toBe('Integration Test Engineer (Updated)');
    expect(list.items[0].job_title).toBe('Principal QA Architect');
    expect(list.items[0].status).toBe('SUSPENDED');
  });

  it('4. Computes scoped hierarchy and management chain', () => {
    // Act
    const hierarchy = employeeController.getEmployeeHierarchy(createdUserId);

    // Assert
    expect(hierarchy).toBeDefined();
    expect(hierarchy?.user.id).toBe(createdUserId);
    expect(Array.isArray(hierarchy?.managementChain)).toBe(true);
    expect(Array.isArray(hierarchy?.directReports)).toBe(true);
  });

  it('5. Revokes active user sessions by incrementing token version', () => {
    // Act
    const revokeRes = employeeController.revokeSessions(createdUserId);

    // Assert
    expect(revokeRes.status).toBe('ok');
    const list = employeeController.listEmployees({ search: testEmail });
    expect(list.items[0].token_version).toBeGreaterThanOrEqual(2);
  });

  it('6. Executes Batch Import in Dry-Run mode without writing to database', () => {
    // Arrange
    const dryRunRecords = [
      {
        display_name: 'Dry Run Person 1',
        email: `dryrun.1.${Date.now()}@forge.internal`,
        job_title: 'Analyst',
      },
      {
        display_name: 'Dry Run Person 2',
        email: 'invalid-email-format',
      },
    ];

    // Act
    const summary = employeeController.batchImport(dryRunRecords, { dryRun: true });

    // Assert
    expect(summary.dryRun).toBe(true);
    expect(summary.valid).toBe(1);
    expect(summary.invalid).toBe(1);
    expect(summary.errors.length).toBe(1);

    // Verify person 1 was not persisted
    const list = employeeController.listEmployees({ search: dryRunRecords[0].email });
    expect(list.items.length).toBe(0);
  });

  it('7. Executes Batch Import in Commit mode and auto-creates departments', () => {
    // Arrange
    const timestamp = Date.now();
    const records = [
      {
        display_name: 'Elena Rostova Batch',
        email: `batch.elena.${timestamp}@forge.internal`,
        job_title: 'Staff Architect',
        department: `New Dept ${timestamp}`,
        role: 'roles/employee',
      },
      {
        display_name: 'Marcus Vance Batch',
        email: `batch.marcus.${timestamp}@forge.internal`,
        job_title: 'Senior Engineer',
        department: `New Dept ${timestamp}`,
        manager_email: `batch.elena.${timestamp}@forge.internal`,
        role: 'roles/employee',
      },
    ];

    // Act
    const summary = employeeController.batchImport(records, {
      autoCreateDepartments: true,
      duplicateAction: 'update',
      dryRun: false,
    });

    // Assert
    expect(summary.valid).toBe(2);
    expect(summary.invalid).toBe(0);

    const list = employeeController.listEmployees({ search: `batch.elena.${timestamp}` });
    expect(list.items.length).toBe(1);
    expect(list.items[0].display_name).toBe('Elena Rostova Batch');
  });

  it('8. Computes complete organizational tree graph with roots and reports', () => {
    // Arrange & Act
    const tree = employeeController.getFullOrgTree();

    // Assert
    expect(tree.roots).toBeDefined();
    expect(Array.isArray(tree.roots)).toBe(true);
    expect(tree.total).toBeGreaterThan(0);
    // Every root should have display_name and children array
    if (tree.roots.length > 0) {
      expect(tree.roots[0].display_name).toBeDefined();
      expect(Array.isArray(tree.roots[0].children)).toBe(true);
    }
  });

  it('9. Executes bulk actions across multiple employees', () => {
    // Arrange
    const timestamp = Date.now();
    const email1 = `bulk1.${timestamp}@forge.internal`;
    const email2 = `bulk2.${timestamp}@forge.internal`;
    const created1 = employeeController.createEmployee({
      email: email1,
      display_name: 'Bulk User 1',
      job_title: 'Software Engineer',
    });
    const created2 = employeeController.createEmployee({
      email: email2,
      display_name: 'Bulk User 2',
      job_title: 'Product Designer',
    });

    // Act - Suspend both
    const suspendResult = employeeController.bulkAction('suspend', [created1.id, created2.id]);
    expect(suspendResult.processed).toBe(2);

    // Verify status updated
    const user1 = employeeController.listEmployees({ search: email1 }).items[0];
    expect(user1).toBeDefined();
    expect(user1.status).toBe('SUSPENDED');

    // Act - Revoke sessions
    const revokeResult = employeeController.bulkAction('revoke_sessions', [created1.id, created2.id]);
    expect(revokeResult.processed).toBe(2);

    // Act - Activate both
    const activateResult = employeeController.bulkAction('activate', [created1.id, created2.id]);
    expect(activateResult.processed).toBe(2);
    const user1Active = employeeController.listEmployees({ search: email1 }).items[0];
    expect(user1Active).toBeDefined();
    expect(user1Active.status).toBe('ACTIVE');
  });
});
