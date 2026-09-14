/**
 * @forge/portal - Application Access Policy Evaluator Unit Test (2026 LTS)
 * Verifies department gating, direct policy bindings, and CSV employee ingestion parsing.
 * @requirements [HLR-PORTAL-201] [HLR-AUTH-004] [LLR-PORTAL-005]
 */

import { describe, it, expect } from 'bun:test';
import { getPortalApps } from '../../src/frontend/ui-apps-data';
import { parseEmployeeCsv } from '@forge/auth/backend/employee-import';

describe('Tier 1 Unit: Application Access Policy Evaluator', () => {
  it('correctly grants access based on direct policy bindings (userContext.appBindings)', () => {
    // Arrange: Employee with baseline employee role without direct bindings
    const baseline = getPortalApps(['roles/employee']);
    const isTelemetryRestrictedBefore = baseline.marketplaceApps.some((a) => a.id === 'telemetry');
    expect(isTelemetryRestrictedBefore).toBe(true);

    // Act: Evaluate with direct approved binding for 'telemetry'
    const granted = getPortalApps(['roles/employee'], {
      appBindings: ['telemetry'],
    });

    // Assert: 'telemetry' is now active and not in marketplace
    const telemetryInActive = granted.activeApps.find((a) => a.id === 'telemetry');
    const telemetryInMarketplace = granted.marketplaceApps.find((a) => a.id === 'telemetry');
    expect(telemetryInActive).toBeDefined();
    expect(telemetryInActive?.isRestricted).toBe(false);
    expect(telemetryInMarketplace).toBeUndefined();
  });

  it('correctly grants access based on department match', () => {
    // Arrange & Act: User belonging to Infrastructure department
    const infraUserCatalog = getPortalApps(['roles/employee'], {
      department: 'Infrastructure',
    });

    // Assert: Telemetry app has departmentOwner "Infrastructure & SRE", so Infra employee receives access
    const telemetryApp = infraUserCatalog.activeApps.find((a) => a.id === 'telemetry');
    expect(telemetryApp).toBeDefined();
    expect(telemetryApp?.isRestricted).toBe(false);
  });

  it('keeps restricted apps in marketplace when neither role, department nor direct grant matches', () => {
    // Arrange & Act: Sales user without telemetry grant
    const salesUserCatalog = getPortalApps(['roles/employee'], {
      department: 'Sales',
      appBindings: ['code'],
    });

    // Assert: Telemetry remains restricted in marketplace
    const telemetryInMarketplace = salesUserCatalog.marketplaceApps.find((a) => a.id === 'telemetry');
    expect(telemetryInMarketplace).toBeDefined();
    expect(telemetryInMarketplace?.isRestricted).toBe(true);
  });

  it('parses CSV rosters with diverse headers and maps manager emails', () => {
    // Arrange
    const sampleCsv = `display_name,email,job_title,department,manager_email,role
Elena Rostova,elena@forge.internal,Chief Revenue Officer,Executive,,roles/admin
Marcus Thorne,marcus@forge.internal,VP Enterprise Sales,Sales,elena@forge.internal,roles/manager
Aria Stark,aria@forge.internal,Account Exec,Sales,marcus@forge.internal,roles/employee`;

    // Act
    const { records, errors } = parseEmployeeCsv(sampleCsv);

    // Assert
    expect(errors.length).toBe(0);
    expect(records.length).toBe(3);
    expect(records[0].display_name).toBe('Elena Rostova');
    expect(records[0].email).toBe('elena@forge.internal');
    expect(records[1].manager_email).toBe('elena@forge.internal');
    expect(records[2].manager_email).toBe('marcus@forge.internal');
  });

  it('neutralizes CSV formula injection attempts', () => {
    // Arrange: Malicious CSV with spreadsheet formulas in email/names
    const maliciousCsv = `name,email,title,department
"=CMD('calc')",=calc@forge.internal,Engineer,Tech
Normal User,+malicious@forge.internal,Analyst,Finance`;

    // Act
    const { records } = parseEmployeeCsv(maliciousCsv);

    // Assert: The leading formula characters (=, +) are stripped from email
    expect(records.length).toBe(2);
    expect(records[0].email).not.toStartWith('=');
    expect(records[1].email).not.toStartWith('+');
    expect(records[0].email).toBe('calc@forge.internal');
    expect(records[1].email).toBe('malicious@forge.internal');
  });

  it('handles empty or malformed CSV rows gracefully', () => {
    // Arrange: CSV missing email column
    const invalidCsv = `name,title,department\nAlice,Manager,Product`;

    // Act
    const { records, errors } = parseEmployeeCsv(invalidCsv);

    // Assert
    expect(records.length).toBe(0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error).toContain('missing mandatory email column');
  });
});
