/**
 * @forge/test - Air-Gapped Compliance & Zero External Network Isolation Suite (2026 LTS)
 * Tier 3 Security & Verification Standard:
 * - Invariant 1: Zero External Network URLs, Third-Party CDNs, Fonts or Telemetry Trackers
 * - Invariant 2: Universal Air-Gapped Content Security Policy (CSP) & HTTP Security Headers
 * - Invariant 3: Offline Reverse Proxy Gateway Generation (Local PKI / Zero ACME)
 */

import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  AIR_GAPPED_CSP,
  AIR_GAPPED_SECURITY_HEADERS,
  applySecurityHeaders,
  createSafeHandler,
} from '../../src/sdk/src';
import { generateCaddyfile } from '../../../scripts/generate-proxy';

const REPO_ROOT = join(__dirname, '../../..');

function getSourceFiles(dir: string): string[] {
  let results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (
        entry.startsWith('.') ||
        entry === 'node_modules' ||
        entry === 'dist' ||
        entry === 'graphify-out' ||
        entry === 'portables'
      ) {
        continue;
      }
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getSourceFiles(fullPath));
      } else if (
        ['.ts', '.tsx', '.js', '.jsx', '.css', '.html'].some((ext) =>
          entry.endsWith(ext)
        )
      ) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

describe('Tier 3 Security: 100% Air-Gapped Compliance & Zero Data Leakage [SR-SEC-001] [HLR-NET-001] [HLR-NET-002]', () => {
  it('Arrange, Act, Assert: asserts ZERO external CDNs, fonts, or third-party telemetry in source files', () => {
    // Arrange
    const targetDirs = [
      join(REPO_ROOT, 'apps', 'src'),
      join(REPO_ROOT, 'forge-apps'),
      join(REPO_ROOT, 'scripts'),
    ];
    const sourceFiles = targetDirs.flatMap((dir) => getSourceFiles(dir));

    expect(sourceFiles.length).toBeGreaterThan(10);

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

    const violations: Array<{ file: string; pattern: string }> = [];

    // Act
    for (const filePath of sourceFiles) {
      const content = readFileSync(filePath, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push({ file: filePath, pattern: pattern.toString() });
        }
      }
    }

    // Assert
    expect(violations).toEqual([]);
  });

  it('Arrange, Act, Assert: enforces strict Content-Security-Policy denying external connections', () => {
    // Arrange
    const rawResponse = new Response(JSON.stringify({ status: 'active' }), {
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const secured = applySecurityHeaders(rawResponse);

    // Assert
    const csp = secured.headers.get('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("font-src 'self' data:");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("object-src 'none'");

    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(secured.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('Arrange, Act, Assert: createSafeHandler automatically wraps service responses with air-gapped headers', async () => {
    // Arrange
    const handler = createSafeHandler('test-air-gap-service', async () => {
      return Response.json({ success: true });
    });
    const req = new Request('http://localhost/test-air-gap');

    // Act
    const res = await handler(req);

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBe(AIR_GAPPED_CSP);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('x-trace-id')).toBeDefined();
  });

  it('Arrange, Act, Assert: generateCaddyfile configures offline-safe proxy with internal TLS & zero ACME lookups', () => {
    // Arrange
    const origHttps = process.env.ENABLE_HTTPS;
    const origCert = process.env.TLS_CERT_PATH;
    const origKey = process.env.TLS_KEY_PATH;
    process.env.ENABLE_HTTPS = 'true';
    delete process.env.TLS_CERT_PATH;
    delete process.env.TLS_KEY_PATH;

    try {
      // Act
      const caddyfile = generateCaddyfile();

      // Assert
      expect(caddyfile).toContain('tls internal');
      expect(caddyfile).toContain('Content-Security-Policy');
      expect(caddyfile).toContain('100% Air-Gapped');
      expect(caddyfile).toContain('handle_errors');
      expect(caddyfile).toContain('/etc/caddy/errors');
      expect(caddyfile).not.toContain('acme');
      expect(caddyfile).not.toContain('letsencrypt');
    } finally {
      if (origHttps !== undefined) {
        process.env.ENABLE_HTTPS = origHttps;
      } else {
        delete process.env.ENABLE_HTTPS;
      }
      if (origCert !== undefined) {
        process.env.TLS_CERT_PATH = origCert;
      } else {
        delete process.env.TLS_CERT_PATH;
      }
      if (origKey !== undefined) {
        process.env.TLS_KEY_PATH = origKey;
      } else {
        delete process.env.TLS_KEY_PATH;
      }
      generateCaddyfile();
    }
  });
});
