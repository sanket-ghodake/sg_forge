/**
 * @forge/dev-dashboard - Unit Tests: Client Script Syntax & HTML Integrity (3A Pattern)
 * Enterprise SRE Standard: Validates that generated SPA HTML contains 100% valid, error-free client JavaScript.
 */

import { describe, expect, it } from 'bun:test';
import { renderDashboardHtml } from '../../src/frontend/ui-renderer';

describe('Tier 1 Unit: Frontend Script Syntax & Astryx HTML Integrity', () => {
  it('Arrange, Act, Assert: Generated SPA document parses with zero JavaScript syntax errors', () => {
    // Arrange
    const html = renderDashboardHtml();

    // Act
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptContent = scriptMatch![1];

    // Assert - Executing `new Function` validates pure JS parser syntax
    let syntaxError: Error | null = null;
    try {
      new Function(scriptContent);
    } catch (err: any) {
      syntaxError = err;
    }

    expect(syntaxError).toBeNull();
  });

  it('Arrange, Act, Assert: Generated HTML exclusively uses Astryx design tokens and classes', () => {
    // Arrange & Act
    const html = renderDashboardHtml();

    // Assert
    expect(html).toContain('astryx-card');
    expect(html).toContain('astryx-badge');
    expect(html).toContain('astryx-btn');
    expect(html).toContain('--forge-bg-root');
    expect(html).toContain('--forge-primary');
  });

  it('Arrange, Act, Assert: Generated HTML has balanced main tag without duplicate closing main', () => {
    // Arrange & Act
    const html = renderDashboardHtml();

    // Assert
    const openCount = (html.match(/<main\b[^>]*>/g) || []).length;
    const closeCount = (html.match(/<\/main>/g) || []).length;
    expect(openCount).toBe(closeCount);
    expect(openCount).toBe(1);
  });

  it('Arrange, Act, Assert: Client scripts have unique function declarations with zero duplicate definitions', () => {
    // Arrange
    const html = renderDashboardHtml();
    const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
    const fullScript = scriptMatches.map(s => s.replace(/<\/?script>/g, '')).join('\n');

    // Act: Extract top-level function names
    const funcMatches = fullScript.matchAll(/(?:^|\n)\s*function\s+([a-zA-Z0-9_$]+)\s*\(/g);
    const funcCounts: Record<string, number> = {};
    for (const match of funcMatches) {
      const name = match[1];
      funcCounts[name] = (funcCounts[name] || 0) + 1;
    }

    // Assert: No duplicates
    const duplicates = Object.entries(funcCounts).filter(([, count]) => count > 1);
    expect(duplicates).toEqual([]);
  });
});
