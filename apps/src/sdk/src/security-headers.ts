/**
 * @forge/sdk - Universal Air-Gapped Security & CSP Headers (2026 LTS)
 * OWASP Top 10, ASVS 5.0 & Zero-Trust Air-Gapped Isolation Engine.
 * Enforces strict browser-level sandboxing, blocking all external network, script, font, and telemetry calls.
 */

/**
 * Strict Air-Gapped Content Security Policy blocking external outbound network requests.
 * @requirements [SR-SEC-001] [LLR-AUTH-007]
 */
export const AIR_GAPPED_CSP: string = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Standard HTTP hardening security headers for zero-trust air-gapped isolation.
 * @requirements [SR-SEC-001] [LLR-AUTH-007]
 */
export const AIR_GAPPED_SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'Content-Security-Policy': AIR_GAPPED_CSP,
};

/**
 * Applies strict air-gapped security headers to any outgoing HTTP response.
 * Preserves existing response headers and body stream.
 * @requirements [SR-SEC-001] [LLR-AUTH-007]
 */
export function applySecurityHeaders(
  res: Response,
  customHeaders?: Record<string, string>
): Response {
  const headers = new Headers(res.headers);

  // Apply canonical air-gapped security headers if not already set
  for (const [key, value] of Object.entries(AIR_GAPPED_SECURITY_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  // Apply any custom header overrides
  if (customHeaders) {
    for (const [key, value] of Object.entries(customHeaders)) {
      headers.set(key, value);
    }
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
