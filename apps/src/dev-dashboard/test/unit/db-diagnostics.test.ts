/**
 * @forge/dev-dashboard - Unit Tests: Database Diagnostics & Schema ER Engine (3A Pattern)
 * Enterprise SRE & Astryx Enterprise Standard
 */

import { describe, expect, it } from 'bun:test';
import { dbDiagnostics, platformDb } from '../../src/db';

describe('Tier 1 Unit: Database Diagnostics & Telemetry [LLR-DB-006]', () => {
  it('Arrange, Act, Assert: getDatabaseTelemetry returns valid storage & PRAGMA stats', () => {
    // Arrange
    const dbName = 'platform_core.db';

    // Act
    const stats: any = dbDiagnostics.getDatabaseTelemetry(dbName);

    // Assert
    expect(stats.error).toBeUndefined();
    expect(stats.dbName).toBe('platform_core.db');
    expect(stats.fileSizeBytes).toBeGreaterThan(0);
    expect(stats.pageSizeBytes).toBeGreaterThan(0);
    expect(stats.pageCount).toBeGreaterThan(0);
    expect(typeof stats.journalMode).toBe('string');
    expect(stats.tableCount).toBeGreaterThan(0);
    expect(stats.integrityStatus).toBe('ok');
  });

  it('Arrange, Act, Assert: getDatabaseTelemetry returns error for non-existent database', () => {
    // Arrange
    const dbName = 'non_existent_db_xyz.db';

    // Act
    const result: any = dbDiagnostics.getDatabaseTelemetry(dbName);

    // Assert
    expect(result.error).toBeDefined();
    expect(result.error).toContain('not found');
  });

  it('Arrange, Act, Assert: getDatabaseSchemaGraph returns nodes, columns, and relations', () => {
    // Arrange
    const dbName = 'platform_core.db';

    // Act
    const graph: any = dbDiagnostics.getDatabaseSchemaGraph(dbName);

    // Assert
    expect(graph.error).toBeUndefined();
    expect(graph.dbName).toBe('platform_core.db');
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(graph.nodes.length).toBeGreaterThan(0);

    const appsNode = graph.nodes.find((n: any) => n.name === 'apps_registry');
    expect(appsNode).toBeDefined();
    expect(Array.isArray(appsNode.columns)).toBe(true);
    expect(appsNode.columns.some((c: any) => c.name === 'id' && c.pk)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
  });

  it('Arrange, Act, Assert: getTableRows filters records with search parameter', () => {
    // Arrange
    const dbName = 'platform_core.db';
    const tableName = 'apps_registry';

    // Act
    const allRows = platformDb.getTableRows(dbName, tableName, 1, 20);
    const filteredRows = platformDb.getTableRows(dbName, tableName, 1, 20, 'dev-dashboard');

    // Assert
    expect(allRows.error).toBeUndefined();
    expect(filteredRows.error).toBeUndefined();
    expect(Array.isArray(filteredRows.rows)).toBe(true);
    if (filteredRows.rows.length > 0) {
      expect(filteredRows.rows.some((r: any) => JSON.stringify(r).toLowerCase().includes('dev-dashboard'))).toBe(true);
    }
  });
});
