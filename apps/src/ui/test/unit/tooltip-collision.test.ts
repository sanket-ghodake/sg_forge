/**
 * @forge/ui - Tier 1 Unit: Astryx Universal Tooltip & Collision Detection
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getAstryxTooltipScript } from '../../src/tooltip';

describe('Tier 1 Unit: Astryx Tooltip & Viewport Engine [LLR-UI-002] [HLR-UI-402]', () => {
  it('Arrange, Act, Assert: generates universal tooltip script with auto-flip collision detection', () => {
    // Act
    const script = getAstryxTooltipScript();

    // Assert: Must implement auto-flip calculation and horizontal boundary clamp
    expect(script).toContain('function initAstryxUniversalTooltips()');
    expect(script).toContain('astryx-global-tooltip');
    expect(script).toContain('window.innerHeight');
    expect(script).toContain('window.innerWidth');
    expect(script).toContain('requestAnimationFrame');
    expect(script).toContain('astryx-floating-tooltip');
  });

  it('Arrange, Act, Assert: tooltip script safely handles SSR environment when window is undefined', () => {
    // Act
    const script = getAstryxTooltipScript();

    // Assert
    expect(script).toContain("typeof window === 'undefined'");
  });
});
