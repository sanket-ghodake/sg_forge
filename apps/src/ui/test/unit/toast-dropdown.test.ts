/**
 * @forge/ui - Tier 1 Unit: Toast Notifications & Dropdown Positioning Engine
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getAstryxToastScript, getAstryxDropdownScript } from '../../src/index';

describe('Tier 1 Unit: Astryx Toast & Dropdown Engine [LLR-UI-003] [LLR-UI-004]', () => {
  it('generates valid Astryx toast script with helper methods', () => {
    // Arrange & Act
    const script = getAstryxToastScript();

    // Assert
    expect(script).toContain('window.astryxToast');
    expect(script).toContain('window.astryxToast.show');
    expect(script).toContain('window.astryxToast.success');
    expect(script).toContain('window.astryxToast.error');
    expect(script).toContain('window.astryxToast.warning');
    expect(script).toContain('window.astryxToast.info');
    expect(script).toContain('astryx-toast-container');
  });

  it('generates valid Astryx dropdown script with viewport bounds detection', () => {
    // Arrange & Act
    const script = getAstryxDropdownScript();

    // Assert
    expect(script).toContain('astryxPositionDropdown');
    expect(script).toContain('drop-up');
    expect(script).toContain('align-right');
  });
});
