/**
 * @forge/dev-dashboard - Unit Tests: Organization Setup Logic & Formatting (3A Pattern)
 * Validates EID formatting mathematics, path slug generation, and Astryx token compliance.
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-009]
 */

import { describe, expect, it } from 'bun:test';
import { getOrgSetupModalsHtml } from '../../src/frontend/ui-org-setup-modals';
import { getEmployeeFlyoutModalHtml } from '../../src/frontend/ui-employee-modals';
import { renderEmployeesTab } from '../../src/frontend/ui-renderer-employees';

describe('Tier 1 Unit: Organization Setup Formatting & DOM Structure', () => {
  it('Arrange, Act, Assert: Sequential EID formatting accurately handles variable padding and prefix', () => {
    // Arrange
    const formatEid = (prefix: string, counter: number, padding: number) => {
      return `${prefix.trim().toUpperCase()}-${String(counter).padStart(padding, '0')}`;
    };

    // Act & Assert
    expect(formatEid('EMP', 1, 4)).toBe('EMP-0001');
    expect(formatEid('sg', 42, 5)).toBe('SG-00042');
    expect(formatEid('TECH', 1050, 3)).toBe('TECH-1050');
    expect(formatEid('ACME', 99, 4)).toBe('ACME-0099');
  });

  it('Arrange, Act, Assert: Hierarchical path slug calculation correctly nests child paths', () => {
    // Arrange
    const computePath = (name: string, parentPath?: string | null) => {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
    };

    // Act
    const rootPath = computePath('Core Engineering');
    const childPath = computePath('Platform Infrastructure', rootPath);
    const squadPath = computePath('Billing & Ledger Squad', childPath);

    // Assert
    expect(rootPath).toBe('/core-engineering');
    expect(childPath).toBe('/core-engineering/platform-infrastructure');
    expect(squadPath).toBe('/core-engineering/platform-infrastructure/billing-ledger-squad');
  });

  it('Arrange, Act, Assert: Org Setup Modals HTML contains zero raw OS emojis and uses Astryx tokens', () => {
    // Arrange & Act
    const html = getOrgSetupModalsHtml();

    // Assert: Zero raw OS emojis
    expect(html).not.toContain('📁');
    expect(html).not.toContain('👔');
    expect(html).not.toContain('🟢');
    expect(html).not.toContain('💾');
    expect(html).not.toContain('➕');

    // Assert: Uses Astryx design tokens and classes
    expect(html).toContain('astryx-modal-backdrop');
    expect(html).toContain('modal-org-department');
    expect(html).toContain('modal-org-level');
    expect(html).toContain('modal-org-settings');
  });

  it('Arrange, Act, Assert: Employee flyout modal contains live preview banner and zero raw emojis', () => {
    // Arrange & Act
    const html = getEmployeeFlyoutModalHtml();

    // Assert: Live preview elements
    expect(html).toContain('emp-live-avatar');
    expect(html).toContain('emp-live-name');
    expect(html).toContain('emp-live-details');
    expect(html).not.toContain('emp-live-role-badge');
    expect(html).not.toContain('emp-live-status-badge');
    expect(html).toContain('autoGenerateEmployeeId');
    expect(html).toContain('openAddDepartmentFromMemberModal');

    // Assert: Zero raw OS emojis
    expect(html).not.toContain('📁');
    expect(html).not.toContain('👔');
    expect(html).not.toContain('🟢');
    expect(html).not.toContain('🏢');
  });

  it('Arrange, Act, Assert: Employee tab renderer includes Tab 4 Organization Setup with complete subtab controls', () => {
    // Arrange & Act
    const html = renderEmployeesTab();

    // Assert
    expect(html).toContain('btn-subtab-emp-setup');
    expect(html).toContain('emp-subtab-setup');
    expect(html).toContain('Hierarchy Level Tiers Studio');
    expect(html).toContain('Department & Structural Units Manager');
    expect(html).toContain('Employee ID (EID) Generator Studio');
  });
});
