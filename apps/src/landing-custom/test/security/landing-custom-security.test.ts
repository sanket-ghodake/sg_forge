/**
 * Custom Landing - Tier 3 Security Test Suite
 * Asserts HTML escaping and secure headers
 */

import { describe, expect, it } from 'bun:test';
import { createLandingHandler, resolveCustomAsset } from '../../src/server';
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

  it('Arrange, Act, Assert: strictly rejects path traversal attempts targeting custom assets', async () => {
    // Arrange
    const handler = createLandingHandler();
    const maliciousPaths = [
      '/custom/../../package.json',
      '/custom/%2e%2e/%2e%2e/package.json',
      '/custom/..%2f..%2fpackage.json',
      ['/custom', '..', '..', '..', 'etc', 'passwd'].join('/'),
    ];

    // Act & Assert
    for (const path of maliciousPaths) {
      const asset = resolveCustomAsset(path);
      expect(asset).toBeNull();

      const req = new Request(`http://localhost:3000${path}`);
      const res = await handler(req);
      // Traversal paths must return 404 and never leak package.json or system contents
      expect(res.status).toBe(404);
      const text = await res.text();
      expect(text).not.toContain('"@forge/landing-custom"');
    }
  });
});
