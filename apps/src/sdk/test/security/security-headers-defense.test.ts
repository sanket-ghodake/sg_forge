/**
 * @forge/sdk - Tier 3 Security: Air-Gapped Headers & CSP Enforcement
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import {
  AIR_GAPPED_CSP,
  AIR_GAPPED_SECURITY_HEADERS,
  applySecurityHeaders,
} from '../../src/security-headers';

describe('Tier 3 Security: Air-Gapped Security Headers & CSP Engine [LLR-SDK-003]', () => {
  it('Arrange, Act, Assert: injects all mandatory security headers into bare response', () => {
    // Arrange
    const bareResponse = new Response('OK', { status: 200 });

    // Act
    const secured = applySecurityHeaders(bareResponse);

    // Assert
    expect(secured.headers.get('Strict-Transport-Security')).toBe(AIR_GAPPED_SECURITY_HEADERS['Strict-Transport-Security']);
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(secured.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(secured.headers.get('Permissions-Policy')).toContain('geolocation=()');
  });

  it('Arrange, Act, Assert: preserves existing headers while injecting security defaults', () => {
    // Arrange
    const originalRes = new Response('{"data":1}', {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'X-Custom-Trace': 'trace-123' },
    });

    // Act
    const secured = applySecurityHeaders(originalRes);

    // Assert
    expect(secured.status).toBe(201);
    expect(secured.headers.get('Content-Type')).toBe('application/json');
    expect(secured.headers.get('X-Custom-Trace')).toBe('trace-123');
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('Arrange, Act, Assert: allows custom header overrides without dropping base security', () => {
    // Arrange
    const baseRes = new Response('OK', { status: 200 });

    // Act
    const secured = applySecurityHeaders(baseRes, {
      'X-Content-Type-Options': 'nosniff',
      'X-Custom-Tag': 'secure-node',
    });

    // Assert
    expect(secured.headers.get('X-Custom-Tag')).toBe('secure-node');
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
