/**
 * @forge/dev-dashboard - Tier 1 Unit: Database Sandbox & Registry Engine
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { platformDb } from '../../src';

describe('Tier 1 Unit: Database Sandbox & Registry', () => {
  it('synchronizes and retrieves apps registry from platform_core.db', () => {
    // Arrange & Act
    platformDb.syncWithEnvRegistry();
    const apps = platformDb.getAppsRegistry();

    // Assert
    expect(Array.isArray(apps)).toBe(true);
    expect(apps.length).toBeGreaterThan(0);
    const landing = apps.find((a) => a.id === 'landing');
    expect(landing).toBeDefined();
    expect(landing?.port).toBe(3000);
  });

  it('safely executes SELECT queries in read-only sandbox mode', () => {
    // Arrange
    const query = 'SELECT id, name, port FROM apps_registry LIMIT 5';

    // Act
    const result = platformDb.executeQuery('platform_core.db', query, true);

    // Assert
    expect(result.error).toBeUndefined();
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('safely executes Common Table Expressions (WITH CTE) and queries with leading comments', () => {
    // Arrange: CTE query and commented query
    const cteQuery = `
      WITH core_apps AS (
        SELECT id, name, port FROM apps_registry WHERE port < 4000
      )
      SELECT * FROM core_apps;
    `;
    const commentedQuery = `
      -- SRE diagnostic query for apps count
      /* multi-line comment block */
      SELECT COUNT(*) as total_apps FROM apps_registry;
    `;
    const explainQuery = 'EXPLAIN QUERY PLAN SELECT id FROM apps_registry;';

    // Act
    const cteResult = platformDb.executeQuery('platform_core.db', cteQuery, true);
    const commentedResult = platformDb.executeQuery('platform_core.db', commentedQuery, true);
    const explainResult = platformDb.executeQuery('platform_core.db', explainQuery, true);

    // Assert
    expect(cteResult.error).toBeUndefined();
    expect(Array.isArray(cteResult.rows)).toBe(true);
    expect(commentedResult.error).toBeUndefined();
    expect(commentedResult.rows[0].total_apps).toBeGreaterThanOrEqual(1);
    expect(explainResult.error).toBeUndefined();
    expect(explainResult.rows.length).toBeGreaterThan(0);
  });

  it('optimizes database file with auto-vacuum & WAL checkpoint', () => {
    // Act
    const result = platformDb.optimizeDatabase('platform_core.db');

    // Assert
    expect(result.success).toBe(true);
  });
});
