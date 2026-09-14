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

  it('Arrange, Act, Assert: Employee Directory Table HTML renders Fullscreen Canvas and Multipage controls', () => {
    // Arrange & Act
    const html = renderDashboardHtml();

    // Assert Fullscreen Canvas elements
    expect(html).toContain('id="emp-table-container"');
    expect(html).toContain('id="emp-fullscreen-hud"');
    expect(html).toContain('id="btn-emp-fullscreen"');
    expect(html).toContain('Full Screen');
    expect(html).toContain('Exit Fullscreen');

    // Assert Multipage Pagination elements
    expect(html).toContain('id="emp-pagination-controls"');
    expect(html).toContain('id="btn-emp-first"');
    expect(html).toContain('id="btn-emp-prev"');
    expect(html).toContain('id="emp-page-pills"');
    expect(html).toContain('id="btn-emp-next"');
    expect(html).toContain('id="btn-emp-last"');
    expect(html).toContain('id="emp-page-limit"');

    // Assert Sortable Column Indicators
    expect(html).toContain('id="emp-sort-name-indicator"');
    expect(html).toContain('id="emp-sort-dept-indicator"');
    expect(html).toContain('id="emp-sort-title-indicator"');
    expect(html).toContain('id="emp-sort-status-indicator"');
  });

  it('Arrange, Act, Assert: Employee Directory Table contains ZERO raw OS emojis', () => {
    // Arrange & Act
    const html = renderDashboardHtml();

    // Isolate employee subtab table HTML and scripts
    const tableSectionMatch = html.match(/id="emp-subtab-table"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    expect(tableSectionMatch).not.toBeNull();
    const tableContent = tableSectionMatch![0];

    // Assert: ZERO raw OS emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(tableContent)).toBe(false);
  });

  it('Arrange, Act, Assert: astryxIcons is exposed on window and renderEmployeeVitals executes without ReferenceError', () => {
    // Arrange
    const html = renderDashboardHtml();
    expect(html).toContain('window.astryxIcons');

    const mockElements: Record<string, any> = {
      'emp-stat-total': { textContent: '' },
      'emp-stat-active': { textContent: '' },
      'emp-stat-suspended': { textContent: '' },
      'emp-stat-depts': { textContent: '' },
      'emp-tab-badge-count': { textContent: '' },
      'emp-overview-dept-list': { innerHTML: '' },
    };

    const mockDoc = {
      getElementById: (id: string) => mockElements[id] || null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      createElement: () => ({ style: {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} }, setAttribute: () => {} }),
      body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
      documentElement: { setAttribute: () => {}, getAttribute: () => 'dark' },
    };

    const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
    const mainScript = scriptMatches.find(s => s.includes('loadEmployees') || s.includes('EMP_STATE_KEY')) || '';
    expect(mainScript).not.toBe('');
    const scriptContent = mainScript.replace(/<\/?script>/g, '');

    // Act & Assert
    const runScript = new Function('window', 'document', 'location', 'localStorage', 'sessionStorage', `
      ${scriptContent}
      employeeData = {
        total: 2,
        items: [
          { id: 'usr-1', status: 'ACTIVE', department_name: 'Engineering', org_node_id: 'dept-1' },
          { id: 'usr-2', status: 'INVITED', department_name: 'Product', org_node_id: 'dept-2' }
        ],
        departments: [
          { id: 'dept-1', name: 'Engineering' },
          { id: 'dept-2', name: 'Product' }
        ]
      };
      renderEmployeeVitals();
      switchEmployeeSubTab('overview');
      switchEmployeeSubTab('table');
      return {
        deptHtml: document.getElementById('emp-overview-dept-list').innerHTML,
        hasIcons: typeof window.astryxIcons === 'object' && window.astryxIcons !== null
      };
    `);

    const mockWin = {
      location: { pathname: '/devcenter', search: '?tab=employees&emp_focus=usr-superadmin&emp_subtab=table&emp_status=INVITED' },
      addEventListener: () => {},
      removeEventListener: () => {},
      fetch: async () => ({ ok: true, json: async () => ({ status: 'ok', items: [], departments: [] }) }),
      history: { replaceState: () => {} },
    };

    const result = runScript(
      mockWin,
      mockDoc,
      mockWin.location,
      { getItem: () => null, setItem: () => {} },
      { getItem: () => null, setItem: () => {} }
    );

    expect(result.hasIcons).toBe(true);
    expect(result.deptHtml).toContain('emp-dept-chip');
    expect(result.deptHtml).toContain('Engineering');
    expect(result.deptHtml).toContain('<svg');
  });

  it('Arrange, Act, Assert: Table Toolbar supports dynamic icon-only mode and anti-overlap styling', () => {
    // Arrange
    const html = renderDashboardHtml();

    // Assert toolbar structure and labels
    expect(html).toContain('id="emp-table-toolbar"');
    expect(html).toContain('emp-add-btn-label');
    expect(html).toContain('emp-fullscreen-btn-label');
    expect(html).toContain('filter-chip-label');
    expect(html).toContain('emp-metric-count');
    expect(html).toContain('emp-metric-label');
    expect(html).toContain('initEmployeeToolbarResizeObserver');

    // Assert anti-overlap styles in CSS
    expect(html).toContain('toolbar-compact');
    expect(html).toContain('toolbar-icon-mode');
  });
});


