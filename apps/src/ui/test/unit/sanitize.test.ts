/**
 * @forge/ui - Tier 1 Unit: Sanitization & Local URL Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { escapeHtml, sanitizeLocalUrl } from '../../src/sanitize';

describe('Tier 1 Unit: Sanitization & URL Verification', () => {
  it('escapes dangerous HTML characters to prevent XSS', () => {
    // Arrange
    const raw = '<script>alert("XSS & test")</script>\'';

    // Act
    const escaped = escapeHtml(raw);

    // Assert
    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS &amp; test&quot;)&lt;/script&gt;&#39;');
    expect(escaped).not.toContain('<script>');
  });

  it('handles null, undefined, and empty values gracefully in escapeHtml', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml('')).toBe('');
  });

  it('validates and allows safe relative paths', () => {
    expect(sanitizeLocalUrl('/portal')).toBe('/portal');
    expect(sanitizeLocalUrl('/admin/settings')).toBe('/admin/settings');
    expect(sanitizeLocalUrl('/portal?tab=security')).toBe('/portal?tab=security');
  });

  it('blocks open redirect attack vectors and falls back to default', () => {
    expect(sanitizeLocalUrl('https://evil.com')).toBe('/portal');
    expect(sanitizeLocalUrl('http://evil.com')).toBe('/portal');
    expect(sanitizeLocalUrl('//evil.com')).toBe('/portal');
    expect(sanitizeLocalUrl('javascript:alert(1)')).toBe('/portal');
    expect(sanitizeLocalUrl('/')).toBe('/portal');
    expect(sanitizeLocalUrl(null)).toBe('/portal');
  });
});
