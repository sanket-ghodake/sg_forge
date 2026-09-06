/**
 * @forge/test/unit/ingress-protocols.test.ts
 * Tier 1 Unit Test: Independent Ingress Protocol Governance (HTTP/HTTPS)
 *
 * Verifies flexible port enablement / blocking via ENABLE_HTTP and ENABLE_HTTPS.
 * Follows 3A Pattern (Arrange, Act, Assert) & Enterprise Clean Architecture standard.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { generateCaddyfile } from '../../../scripts/generate-proxy';

describe('Tier 1 Unit: Independent Ingress Protocol Governance', () => {
  const origHttp = process.env.ENABLE_HTTP;
  const origHttps = process.env.ENABLE_HTTPS;
  const origCert = process.env.TLS_CERT_PATH;
  const origKey = process.env.TLS_KEY_PATH;

  beforeEach(() => {
    process.env.TLS_CERT_PATH = '/etc/caddy/certs/cert.pem';
    process.env.TLS_KEY_PATH = '/etc/caddy/certs/key.pem';
  });

  afterEach(() => {
    if (origHttp !== undefined) process.env.ENABLE_HTTP = origHttp;
    else delete process.env.ENABLE_HTTP;

    if (origHttps !== undefined) process.env.ENABLE_HTTPS = origHttps;
    else delete process.env.ENABLE_HTTPS;

    if (origCert !== undefined) process.env.TLS_CERT_PATH = origCert;
    else delete process.env.TLS_CERT_PATH;

    if (origKey !== undefined) process.env.TLS_KEY_PATH = origKey;
    else delete process.env.TLS_KEY_PATH;

    // Restore standard Caddyfile
    generateCaddyfile();
  });

  it('Arrange, Act, Assert: default environment generates dual-stack (both HTTP and HTTPS listeners)', () => {
    // Arrange
    process.env.ENABLE_HTTP = 'true';
    process.env.ENABLE_HTTPS = 'true';

    // Act
    const caddyfile = generateCaddyfile();

    // Assert
    expect(caddyfile).toContain('http://:80');
    expect(caddyfile).toContain('http://:8080');
    expect(caddyfile).toContain('https://:443');
    expect(caddyfile).toContain('https://:8443');
    expect(caddyfile).toContain('import forge_gateway');
    expect(caddyfile).toContain('tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem');
  });

  it('Arrange, Act, Assert: ENABLE_HTTP="false" blocks HTTP listeners and serves HTTPS-only', () => {
    // Arrange: Disable HTTP, keep HTTPS enabled
    process.env.ENABLE_HTTP = 'false';
    process.env.ENABLE_HTTPS = 'true';

    // Act
    const caddyfile = generateCaddyfile();

    // Assert: Only HTTPS bindings should exist
    expect(caddyfile).not.toContain('http://:80');
    expect(caddyfile).not.toContain('http://:8080');
    expect(caddyfile).toContain('https://:443');
    expect(caddyfile).toContain('https://:8443');
    expect(caddyfile).toContain('tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem');
    expect(caddyfile).toContain('import forge_gateway');
  });

  it('Arrange, Act, Assert: ENABLE_HTTPS="false" blocks HTTPS listeners and serves HTTP-only', () => {
    // Arrange: Keep HTTP, disable HTTPS
    process.env.ENABLE_HTTP = 'true';
    process.env.ENABLE_HTTPS = 'false';

    // Act
    const caddyfile = generateCaddyfile();

    // Assert: Only HTTP bindings should exist
    expect(caddyfile).toContain('http://:80');
    expect(caddyfile).toContain('http://:8080');
    expect(caddyfile).not.toContain('https://:443');
    expect(caddyfile).not.toContain('https://:8443');
    expect(caddyfile).not.toContain('tls /etc/caddy/certs/cert.pem');
  });

  it('Arrange, Act, Assert: disabling both protocols safely falls back to HTTP to avoid dead gateway', () => {
    // Arrange: Intentionally misconfigure both as false
    process.env.ENABLE_HTTP = 'false';
    process.env.ENABLE_HTTPS = 'false';

    // Act
    const caddyfile = generateCaddyfile();

    // Assert: Fallback to HTTP prevents container black-hole
    expect(caddyfile).toContain('http://:80');
    expect(caddyfile).toContain('http://:8080');
    expect(caddyfile).not.toContain('https://:443');
  });
});
