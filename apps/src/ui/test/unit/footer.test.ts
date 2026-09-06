/**
 * @forge/ui - Tier 1 Unit: Astryx Footer Component
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getAstryxFooterHtml } from '../../src';

describe('Tier 1 Unit: Astryx Footer Component', () => {
  it('Arrange, Act, Assert: renders compliant footer with copyright, current year, and org name', () => {
    // Arrange
    const currentYear = new Date().getFullYear();
    const orgName = 'Acme Corp';

    // Act
    const footerHtml = getAstryxFooterHtml({ orgName });

    // Assert
    expect(footerHtml).toContain('class="astryx-footer"');
    expect(footerHtml).toContain('&copy;');
    expect(footerHtml).toContain(String(currentYear));
    expect(footerHtml).toContain('Acme Corp');
    expect(footerHtml).toContain('All rights reserved.');
  });

  it('Arrange, Act, Assert: allows customizing secondaryText and year', () => {
    // Arrange & Act
    const footerHtml = getAstryxFooterHtml({
      orgName: 'SG Global',
      year: 2026,
      secondaryText: 'Custom Enterprise Portal',
    });

    // Assert
    expect(footerHtml).toContain('&copy; 2026 SG Global. All rights reserved.');
    expect(footerHtml).toContain('Custom Enterprise Portal');
  });

  it('Arrange, Act, Assert: defaults to environment variable or fallback when orgName is omitted', () => {
    // Arrange & Act
    const footerHtml = getAstryxFooterHtml();

    // Assert
    expect(footerHtml).toContain('&copy;');
    expect(footerHtml).toContain('All rights reserved.');
  });
});
