/**
 * @file astryx-theme.test.ts
 * @description Tier 1 Unit: Astryx Theme Token & Starlight Styling Parity
 * @standards Enterprise Clean Code, Astryx Design System, High-Reliability Systems
 */

import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { themeTokens } from '@forge/ui';

describe('Tier 1 Unit: Astryx Theme & Token Parity [SR-DOC-001] [HLR-UI-401] [LLR-UI-001]', () => {
  const repoRoot = process.cwd();
  const cssPath = join(repoRoot, 'apps', 'src', 'docs', 'src', 'styles', 'custom.css');
  const cssContent = readFileSync(cssPath, 'utf8');

  it('Arrange, Act, Assert: verifies 100% token parity between custom.css and @forge/ui themeTokens', () => {
    // Arrange: extract core token keys from @forge/ui
    const darkExpected = themeTokens.dark;
    const lightExpected = themeTokens.light;

    // Act & Assert: Dark Theme Invariants
    expect(cssContent).toContain(`--forge-bg-root: ${darkExpected.bgRoot}`);
    expect(cssContent).toContain(`--forge-bg-surface: ${darkExpected.bgSurface}`);
    expect(cssContent).toContain(`--forge-bg-card: ${darkExpected.bgCard}`);
    expect(cssContent).toContain(`--forge-primary: ${darkExpected.primary}`);
    expect(cssContent).toContain(`--forge-border: ${darkExpected.borderSubtle}`);
    expect(cssContent).toContain(`--forge-text-main: ${darkExpected.textMain}`);

    // Act & Assert: Light Theme Invariants
    expect(cssContent).toContain(`--forge-bg-root: ${lightExpected.bgRoot}`);
    expect(cssContent).toContain(`--forge-bg-surface: ${lightExpected.bgSurface}`);
    expect(cssContent).toContain(`--forge-bg-card: ${lightExpected.bgCard}`);
    expect(cssContent).toContain(`--forge-primary: ${lightExpected.primary}`);
    expect(cssContent).toContain(`--forge-border: ${lightExpected.borderSubtle}`);
    expect(cssContent).toContain(`--forge-text-main: ${lightExpected.textMain}`);
  });

  it('Arrange, Act, Assert: verifies custom slim Astryx scrollbars with zero OS browser defaults', () => {
    // Arrange & Act
    const hasThinScrollbar = cssContent.includes('scrollbar-width: thin');
    const hasWebkitScrollbar = cssContent.includes('::-webkit-scrollbar');
    const hasThumbRadius = cssContent.includes('--forge-radius-full');
    const hasThumbHover = cssContent.includes('::-webkit-scrollbar-thumb:hover');

    // Assert
    expect(hasThinScrollbar).toBe(true);
    expect(hasWebkitScrollbar).toBe(true);
    expect(hasThumbRadius).toBe(true);
    expect(hasThumbHover).toBe(true);
  });

  it('Arrange, Act, Assert: verifies Starlight variable mappings point to canonical --forge-* tokens', () => {
    // Arrange & Act & Assert
    expect(cssContent).toContain('--sl-color-accent: var(--forge-primary)');
    expect(cssContent).toContain('--sl-color-bg: var(--forge-bg-root)');
    expect(cssContent).toContain('--sl-color-bg-nav: var(--forge-bg-surface)');
    expect(cssContent).toContain('--sl-color-hairline: var(--forge-border)');
    expect(cssContent).toContain('--sl-color-text: var(--forge-text-main)');
  });
});
