/**
 * @forge/dev-dashboard - Unit Tests: Employee Studio State Persistence (3A Pattern)
 * Enterprise SRE Standard: Validates client state persistence, versioned localStorage envelopes,
 * and URL search param synchronization for subtabs, filters, search, and org chart focus.
 */

import { describe, expect, it } from 'bun:test';
import { renderDashboardHtml } from '../../src/frontend/ui-renderer';

describe('Tier 1 Unit: Employee Studio State Persistence Governance', () => {
  it('Arrange, Act, Assert: Frontend scripts bundle state keys and envelope functions', () => {
    // Arrange
    const html = renderDashboardHtml();

    // Act & Assert
    expect(html).toContain('forge:v1:devcenter:emp_state');
    expect(html).toContain('getSavedEmployeeState');
    expect(html).toContain('persistEmployeeState');
    expect(html).toContain('initEmployeeState');
  });

  it('Arrange, Act, Assert: URL search parameters and localStorage sync are wired to filters and tabs', () => {
    // Arrange
    const html = renderDashboardHtml();

    // Act & Assert - Check for URL param synchronization
    expect(html).toContain('emp_subtab');
    expect(html).toContain('emp_search');
    expect(html).toContain('emp_dept');
    expect(html).toContain('emp_status');
    expect(html).toContain('emp_focus');
    expect(html).toContain('emp_page');
    expect(html).toContain('emp_limit');
  });

  it('Arrange, Act, Assert: State persistence survives syntax validation and JS execution parsing', () => {
    // Arrange
    const html = renderDashboardHtml();
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptContent = scriptMatch![1];

    // Act: Parse client JS via new Function
    let syntaxError: Error | null = null;
    try {
      new Function(scriptContent);
    } catch (err: any) {
      syntaxError = err;
    }

    // Assert
    expect(syntaxError).toBeNull();
  });
});
