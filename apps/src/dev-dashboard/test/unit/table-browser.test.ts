/**
 * @forge/dev-dashboard - Unit Tests: Table Browser & Schema Extraction (3A Pattern)
 * Enterprise SRE & Astryx Enterprise Standard
 */

import { describe, expect, it } from 'bun:test';
import { platformDb } from '../../src/db';

describe('Tier 1 Unit: Table Browser & Schema Engine', () => {
  it('Arrange, Act, Assert: getTableSchema returns column metadata for apps_registry', () => {
    // Arrange
    const dbName = 'platform_core.db';
    const tableName = 'apps_registry';

    // Act
    const result = platformDb.getTableSchema(dbName, tableName);

    // Assert
    expect(result.error).toBeUndefined();
    expect(Array.isArray(result.columns)).toBe(true);
    expect(result.columns.length).toBeGreaterThan(0);
    const colNames = result.columns.map((c) => c.name);
    expect(colNames).toContain('id');
    expect(colNames).toContain('name');
    expect(colNames).toContain('port');
    expect(colNames).toContain('ingress_path');
  });

  it('Arrange, Act, Assert: getTableDdl returns CREATE TABLE statement', () => {
    // Arrange
    const dbName = 'platform_core.db';
    const tableName = 'apps_registry';

    // Act
    const result = platformDb.getTableDdl(dbName, tableName);

    // Assert
    expect(result.error).toBeUndefined();
    expect(result.ddl).toContain('CREATE TABLE apps_registry');
    expect(Array.isArray(result.indexes)).toBe(true);
  });

  it('Arrange, Act, Assert: getTableRows returns paginated rows and total count', () => {
    // Arrange
    const dbName = 'platform_core.db';
    const tableName = 'apps_registry';

    // Act
    const result = platformDb.getTableRows(dbName, tableName, 1, 5);

    // Assert
    expect(result.error).toBeUndefined();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.totalCount).toBeGreaterThan(0);
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeLessThanOrEqual(5);
  });

  it('Arrange, Act, Assert: runIntegrityCheck verifies database health', () => {
    // Arrange
    const dbName = 'platform_core.db';

    // Act
    const result = platformDb.runIntegrityCheck(dbName);

    // Assert
    expect(result.error).toBeUndefined();
    expect(result.integrity).toContain('ok');
    expect(result.foreignKeyErrors.length).toBe(0);
    expect(result.success).toBe(true);
  });
});
