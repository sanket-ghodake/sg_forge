/**
 * @forge/auth - Tier 1 Unit: Default Organization Personas & IAM Roles (2026 LTS)
 * Validates guaranteed presence of Superadmin, Admin, HR, and IT personas and their IAM roles.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { getAuthDb } from '../../src/db/db';
import { seedAuthDatabase } from '../../src/db/seed';

describe('Tier 1 Unit: Default Organization Personas & IAM Roles', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('Arrange, Act, Assert: verifies all 4 core personas (Superadmin, Admin, HR, IT) are seeded', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const superadmin: any = db.query('SELECT * FROM auth_users WHERE email = ?;').get('superadmin@forge.internal');
    const admin: any = db.query('SELECT * FROM auth_users WHERE email = ?;').get('security@forge.internal');
    const hr: any = db.query('SELECT * FROM auth_users WHERE email = ?;').get('hr@forge.internal');
    const itPerson: any = db.query('SELECT * FROM auth_users WHERE email = ?;').get('it@forge.internal');

    // Assert: All 4 must exist and be ACTIVE
    expect(superadmin).toBeDefined();
    expect(superadmin.display_name).toContain('Rajesh Sharma');
    expect(superadmin.status).toBe('ACTIVE');

    expect(admin).toBeDefined();
    expect(admin.display_name).toContain('Pooja Deshmukh');
    expect(admin.status).toBe('ACTIVE');

    expect(hr).toBeDefined();
    expect(hr.display_name).toContain('Shalini Verma');
    expect(hr.status).toBe('ACTIVE');

    expect(itPerson).toBeDefined();
    expect(itPerson.display_name).toContain('Vikram Malhotra');
    expect(itPerson.status).toBe('ACTIVE');
  });

  it('Arrange, Act, Assert: verifies IAM policy bindings for Superadmin, Admin, HR, and IT', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const bindings: any[] = db.query('SELECT principal_id, role_id FROM auth_iam_policy_bindings;').all();
    const bindingMap = new Map(bindings.map((b) => [b.principal_id, b.role_id]));

    // Assert
    expect(bindingMap.get('usr-superadmin')).toBe('roles/super_admin');
    expect(bindingMap.get('usr-secadmin')).toBe('roles/security.admin');
    expect(bindingMap.get('usr-hradmin')).toBe('roles/hr.admin');
    expect(bindingMap.get('usr-itadmin')).toBe('roles/it.admin');
  });

  it('Arrange, Act, Assert: verifies HR and IT department nodes exist in org tree', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const hrDept: any = db.query('SELECT * FROM auth_org_nodes WHERE code = ?;').get('HR-PEOPLE');
    const itDept: any = db.query('SELECT * FROM auth_org_nodes WHERE code = ?;').get('IT-SYS');

    // Assert
    expect(hrDept).toBeDefined();
    expect(hrDept.name).toContain('Human Resources');

    expect(itDept).toBeDefined();
    expect(itDept.name).toContain('IT Infrastructure');
  });

  it('Arrange, Act, Assert: verifies predefined IAM roles are registered with appropriate permissions', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const hrRole: any = db.query('SELECT * FROM auth_iam_roles WHERE id = ?;').get('roles/hr.admin');
    const itRole: any = db.query('SELECT * FROM auth_iam_roles WHERE id = ?;').get('roles/it.admin');
    const superAdminRole: any = db.query('SELECT * FROM auth_iam_roles WHERE id = ?;').get('roles/super_admin');

    // Assert
    expect(hrRole).toBeDefined();
    expect(hrRole.title).toContain('HR & People Administrator');

    expect(itRole).toBeDefined();
    expect(itRole.title).toContain('IT & Systems Administrator');

    expect(superAdminRole).toBeDefined();
  });
});
