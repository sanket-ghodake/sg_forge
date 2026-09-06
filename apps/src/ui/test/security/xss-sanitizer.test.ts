/**
 * @forge/ui - Tier 3 Security: HTML Sanitization & Open-Redirect Defense
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { escapeHtml, sanitizeLocalUrl } from '../../src/sanitize';

describe('Tier 3 Security: UI Sanitizer & Redirection Defense', () => {
  it('Arrange, Act, Assert: prevents stored XSS by neutralizing script tags and event handlers', () => {
    // Arrange
    const dangerousInputs = [
      '<script>alert("pwnd")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=fetch("http://evil.com")>',
      '" onfocus="alert(1)" autofocus="',
      "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>",
    ];

    // Act & Assert
    for (const input of dangerousInputs) {
      const sanitized = escapeHtml(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('<svg');
      expect(sanitized).not.toContain('" onfocus=');
    }
  });

  it('Arrange, Act, Assert: blocks protocol-relative and external open-redirect attacks', () => {
    // Arrange
    const attackUrls = [
      '//evil.com/phish',
      'https://attacker.site/login',
      'http://malicious.org/callback',
      'javascript:alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>',
      '   //evil.com',
      '/\\evil.com',
    ];

    // Act & Assert
    for (const badUrl of attackUrls) {
      const safe = sanitizeLocalUrl(badUrl, '/portal');
      expect(safe).toBe('/portal');
    }
  });

  it('Arrange, Act, Assert: allows genuine internal relative paths', () => {
    // Arrange
    const legitimatePaths = [
      '/portal',
      '/apps/billing?tab=invoices',
      '/apps/expenses/review/42',
      '/devcenter',
    ];

    // Act & Assert
    for (const path of legitimatePaths) {
      const safe = sanitizeLocalUrl(path, '/fallback');
      expect(safe).toBe(path);
    }
  });
});
