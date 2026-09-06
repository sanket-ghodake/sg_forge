/**
 * @forge/dev-hub - Tier 1 Unit: SDK Metadata & Documentation Rendering
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { renderDevHubHtml } from '../../src/frontend/hub-view';

describe('Tier 1 Unit: Developer Hub Metadata Specs & Views', () => {
  it('Arrange, Act, Assert: renders developer hub documentation with SDK specifications', () => {
    // Act
    const html = renderDevHubHtml();

    // Assert: Check structure, AST, and Astryx components
    expect(html).toBeDefined();
    expect(html).toContain('astryx-container');
    expect(html).toContain('Developer Hub');
    expect(html).toContain('@forge/sdk');
    expect(html).toContain('createLogger');
    expect(html).toContain('authGuard');
  });
});
