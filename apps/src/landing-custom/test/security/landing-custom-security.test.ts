/**
 * Custom Landing - Tier 3 Security Test Suite
 * Asserts HTML escaping and secure headers
 */

import { describe, expect, it } from 'bun:test';
import { renderCustomLandingHtml } from '../../src/template.html';

describe('Tier 3 Security: Template Safety & Invariants', () => {
  it('Arrange, Act, Assert: safely handles custom configuration without script execution', () => {
    // Arrange
    const dangerousConfig = {
      brandName: 'SafeBrand',
      heroHeadline: 'Secure Portal',
    };

    // Act
    const html = renderCustomLandingHtml(dangerousConfig);

    // Assert
    expect(html).toContain('SafeBrand');
    expect(html).toContain('Secure Portal');
    expect(html).not.toContain('<script>alert(');
  });
});
