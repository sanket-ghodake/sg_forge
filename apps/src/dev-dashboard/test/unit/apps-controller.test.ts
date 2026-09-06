/**
 * @forge/dev-dashboard - Apps Controller Unit Tests (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert) unit testing for port allocation, validation, and metadata enrichment.
 */

import { describe, expect, it } from 'bun:test';
import { appsController } from '../../src/backend/apps-controller';
import { platformDb } from '../../src/db';

describe('Unit: AppsController & Dynamic Registry Logic', () => {
  it('1. Calculates a non-conflicting available port >= 8088', () => {
    // Arrange & Act
    const port = appsController.getNextAvailablePort();

    // Assert
    expect(typeof port).toBe('number');
    expect(port).toBeGreaterThanOrEqual(8088);
    expect(port).toBeLessThan(65535);
  });

  it('2. Computes enriched apps list with health status and DB sizes', () => {
    // Arrange & Act
    const enriched = appsController.getEnrichedAppsList();

    // Assert
    expect(Array.isArray(enriched)).toBe(true);
    expect(enriched.length).toBeGreaterThan(0);
    const sample = enriched[0];
    expect(sample).toHaveProperty('id');
    expect(sample).toHaveProperty('name');
    expect(sample).toHaveProperty('healthStatus');
    expect(sample).toHaveProperty('dbSizeBytes');
    expect(sample).toHaveProperty('openIssuesCount');
  });

  it('3. Computes fleet overview vitals summary', () => {
    // Arrange & Act
    const overview = appsController.getFleetOverview();

    // Assert
    expect(overview).toHaveProperty('totalApps');
    expect(overview).toHaveProperty('runningApps');
    expect(overview).toHaveProperty('stoppedApps');
    expect(overview).toHaveProperty('totalDbStorageBytes');
    expect(overview).toHaveProperty('categories');
    expect(overview).toHaveProperty('roleBreakdown');
    expect(overview.totalApps).toBeGreaterThan(0);
  });

  it('4. Rejects invalid app registration payloads with descriptive errors', () => {
    // Arrange: Missing ID
    expect(() => {
      appsController.registerApp({
        id: '',
        name: 'Invalid App',
        port: 8099,
        ingress_path: '/apps/invalid',
        category: 'Test',
        access_role: 'General',
      });
    }).toThrow(/App ID must be at least 2/);

    // Arrange: Invalid Port
    expect(() => {
      appsController.registerApp({
        id: 'invalid-port-app',
        name: 'Invalid Port App',
        port: 99999,
        ingress_path: '/apps/invalid-port',
        category: 'Test',
        access_role: 'General',
      });
    }).toThrow(/Port must be between 1024 and 65535/);
  });

  it('5. Inspects existing app and returns full diagnostic bundle', () => {
    // Arrange: Use landing or portal
    const apps = platformDb.getAppsRegistry();
    const first = apps[0];

    // Act
    const details = appsController.inspectApp(first.id);

    // Assert
    expect(details).not.toBeNull();
    expect(details?.app.id).toBe(first.id);
    expect(details?.health).toHaveProperty('status');
    expect(details?.database).toHaveProperty('path');
    expect(details?.database).toHaveProperty('sizeBytes');
    expect(typeof details?.openIssuesCount).toBe('number');
  });
});
