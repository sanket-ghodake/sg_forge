/**
 * @forge/auth/test/security - Enterprise HTTP Security Headers (Tier 3)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { applySecurityHeaders, SECURITY_HEADERS } from '../../src/backend/security-headers';

describe('Tier 3 Security: HTTP Security Headers & Ingress Shield [LLR-AUTH-007]', () => {
  it('should inject mandatory HSTS, CSP, X-Frame-Options: DENY, and nosniff headers', () => {
    // 1. Arrange: Raw unprotected response
    const rawRes = new Response(JSON.stringify({ status: 'ok' }), { status: 200 });

    // 2. Act: Apply security headers
    const securedRes = applySecurityHeaders(rawRes);

    // 3. Assert
    expect(securedRes.headers.get('Strict-Transport-Security')).toBe(
      SECURITY_HEADERS['Strict-Transport-Security']
    );
    expect(securedRes.headers.get('X-Frame-Options')).toBe('DENY');
    expect(securedRes.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(securedRes.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(securedRes.headers.get('Permissions-Policy')).toBe(
      SECURITY_HEADERS['Permissions-Policy']
    );
    expect(securedRes.headers.get('Content-Security-Policy')).toBeDefined();
  });
});
