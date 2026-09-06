/**
 * @forge/auth/test/integration - Database Schema & Org Hierarchy (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { getAuthDb } from '../../src/db/db';
import { seedAuthDatabase } from '../../src/db/seed';

describe('Tier 2 Integration: Database Schema & Org Tree [LLR-DB-003]', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should seed generic organization and dynamic node types', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const org = db.query('SELECT * FROM auth_organizations LIMIT 1;').get() as any;
    const nodeTypes = db.query('SELECT * FROM auth_org_node_types ORDER BY level_order ASC;').all() as any[];

    // Assert
    expect(org).toBeDefined();
    expect(org.domain).toBe('forge.internal');
    expect(nodeTypes.length).toBeGreaterThanOrEqual(4);
    expect(nodeTypes.map((t) => t.name)).toContain('DIVISION');
    expect(nodeTypes.map((t) => t.name)).toContain('DEPARTMENT');
  });

  it('should seed hierarchical org nodes with materialized paths', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const nodes = db.query('SELECT * FROM auth_org_nodes ORDER BY path ASC;').all() as any[];

    // Assert
    expect(nodes.length).toBeGreaterThanOrEqual(4);
    const engNode = nodes.find((n) => n.code === 'ENG-CORE');
    expect(engNode).toBeDefined();
    expect(engNode.path).toContain('/root/tech/eng-core');
  });

  it('should verify test personas are seeded with default password and forced reset flag', () => {
    // Arrange
    const db = getAuthDb();

    // Act
    const users = db.query('SELECT * FROM auth_users;').all() as any[];
    const superadmin = users.find((u) => u.email === 'superadmin@forge.internal');
    const alice = users.find((u) => u.email === 'alice.eng@forge.internal');

    // Assert
    expect(users.length).toBeGreaterThanOrEqual(5);
    expect(superadmin).toBeDefined();
    expect(superadmin.must_change_password).toBe(1);
    expect(superadmin.principal_type).toBe('ADMIN');
    expect(alice.principal_type).toBe('EMPLOYEE');
  });
});
