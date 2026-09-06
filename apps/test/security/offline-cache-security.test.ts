/**
 * @forge/test - Tier 3 Security: Air-Gapped Offline Cache & Service Worker Security (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert)
 * Invariants:
 * 1. Zero External CDNs, Tracking URLs, or Remote Dependencies in Service Worker & Offline Cache
 * 2. Strict Air-Gapped Content-Security-Policy (worker-src 'self')
 * 3. Scope Restriction & Safe Header Enforcement (Service-Worker-Allowed: /)
 */

import { describe, expect, it } from 'bun:test';
import {
  AIR_GAPPED_CSP,
  getServiceWorkerScript,
  handleServiceWorkerRequest,
} from '../../src/sdk/src';
import { renderAstryxSystemDownPage } from '../../src/ui/src';

describe('Tier 3 Security: Air-Gapped Offline Cache & Service Worker Security Invariants', () => {
  const forbiddenPatterns = [
    /fonts\.googleapis\.com/i,
    /fonts\.gstatic\.com/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    /cdn\.jsdelivr\.net/i,
    /cdnjs\.cloudflare\.com/i,
    /unpkg\.com/i,
    /sentry\.io/i,
    /segment\.io/i,
    /mixpanel\.com/i,
    /posthog\.com/i,
    /datadoghq\.com/i,
  ];

  it('Arrange, Act, Assert: asserts ZERO external CDNs or telemetry in generated Service Worker script', () => {
    // Arrange
    const swScript = getServiceWorkerScript();

    // Act & Assert
    for (const pattern of forbiddenPatterns) {
      expect(pattern.test(swScript)).toBe(false);
    }
  });

  it('Arrange, Act, Assert: asserts ZERO external CDNs or telemetry in pre-cached offline system down page', () => {
    // Arrange
    const offlineHtml = renderAstryxSystemDownPage({ brandName: 'Secure Air-Gap Org' });

    // Act & Assert
    for (const pattern of forbiddenPatterns) {
      expect(pattern.test(offlineHtml)).toBe(false);
    }
  });

  it('Arrange, Act, Assert: validates CSP includes worker-src self to enforce origin isolation', () => {
    // Arrange & Act
    const csp = AIR_GAPPED_CSP;

    // Assert
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("'wasm-unsafe-eval'");
  });

  it('Arrange, Act, Assert: validates Service-Worker-Allowed header prevents cross-origin scoping abuse', () => {
    // Arrange
    const req = new Request('http://localhost/sw.js');

    // Act
    const res = handleServiceWorkerRequest(req);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.headers.get('Service-Worker-Allowed')).toBe('/');
    expect(res!.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
