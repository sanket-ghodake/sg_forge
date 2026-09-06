/**
 * @forge/ui - Tier 1 Unit: Astryx Header Component & Token Generator
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getAstryxHeaderHtml, astryxIcons, themeTokens, getAstryxStyles } from '../../src';

describe('Tier 1 Unit: Astryx Header & Design Tokens [LLR-UI-005]', () => {
  it('Arrange, Act, Assert: renders accessible header with application title and subtitle', () => {
    // Arrange & Act
    const headerHtml = getAstryxHeaderHtml('EXPENSES', 'FINANCE OPERATIONS');

    // Assert
    expect(headerHtml).toContain('class="astryx-header"');
    expect(headerHtml).toContain('EXPENSES');
    expect(headerHtml).toContain('FINANCE OPERATIONS');
    expect(headerHtml).toContain('astryx-theme-toggle');
  });

  it('Arrange, Act, Assert: verifies SVG icon registry returns clean path vectors', () => {
    // Arrange & Act
    const shieldIcon = astryxIcons.shield;
    const settingsIcon = astryxIcons.settings;

    // Assert
    expect(shieldIcon).toContain('<svg');
    expect(shieldIcon).toContain('currentColor');
    expect(settingsIcon).toContain('<svg');
  });

  it('Arrange, Act, Assert: defines consistent dark and light mode color variables', () => {
    // Assert: Dark mode tokens
    expect(themeTokens.dark.primary).toBeDefined();
    expect(themeTokens.dark.bgRoot).toBeDefined();
    expect(themeTokens.dark.borderSubtle).toBeDefined();

    // Assert: Light mode tokens
    expect(themeTokens.light.primary).toBeDefined();
    expect(themeTokens.light.bgRoot).toBeDefined();
    expect(themeTokens.light.borderSubtle).toBeDefined();

    // Verify css styles contain base variables
    const styles = getAstryxStyles();
    expect(styles).toContain('--forge-primary');
    expect(styles).toContain('--forge-bg-root');
    expect(styles).toContain('--forge-border');
  });
});
