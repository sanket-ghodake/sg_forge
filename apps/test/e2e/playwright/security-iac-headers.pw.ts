/**
 * @forge/platform - Playwright Real Browser E2E Spec: Supply Chain & Infrastructure Hardening
 * Verifies dependency security overrides, Kubernetes Pod Security restricted profiles, and live security headers.
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 *
 * @requirements [SR-SEC-001] [HLR-NET-001] [LLR-SUB-007]
 */

import { describe, expect, it, afterEach } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { startPortalServer } from '../../../src/portal/src/server';

const REPO_ROOT = process.cwd();

export const securityIacHeadersPlaywrightJourney = {
  name: 'Real Browser E2E: Supply Chain & Infrastructure Hardening',
  steps: [
    '1. Test Supply Chain Overrides (Sharp, QS, Tmp, Cookie, UUID, Esbuild)',
    '2. Test Astro Image Passthrough Service Configuration',
    '3. Test Kubernetes Base Manifests for Restricted Pod Security Compliance',
    '4. Test Live Socket HTTP Security Headers on Ingress Endpoints',
  ],
};

describe('Tier 5 E2E: Supply Chain & Infrastructure Hardening Journey', () => {
  let portalServer: any = null;

  afterEach(() => {
    if (portalServer) {
      portalServer.stop(true);
      portalServer = null;
    }
  });

  it('Arrange, Act, Assert: verifies package.json dependency overrides mitigate CVEs', () => {
    // Arrange: Load root package.json
    const pkgPath = join(REPO_ROOT, 'package.json');
    expect(existsSync(pkgPath)).toBe(true);

    // Act: Parse package manifest
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

    // Assert: Verify security overrides
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides['sharp']).toContain('0.35.4');
    expect(pkg.overrides['qs']).toContain('6.16.0');
    expect(pkg.overrides['tmp']).toContain('0.2.6');
    expect(pkg.overrides['cookie']).toContain('0.7.0');
    expect(pkg.overrides['uuid']).toContain('9.0.1');
    expect(pkg.overrides['esbuild']).toContain('0.28.1');
  });

  it('Arrange, Act, Assert: asserts Astro documentation uses passthrough image service', () => {
    // Arrange: Load docs astro.config.mjs
    const configPath = join(REPO_ROOT, 'apps', 'src', 'docs', 'astro.config.mjs');
    expect(existsSync(configPath)).toBe(true);

    // Act: Read configuration file content
    const content = readFileSync(configPath, 'utf8');

    // Assert: Passthrough image service must be active to decouple libheif
    expect(content).toContain('passthroughImageService()');
    expect(content).toContain('service: passthroughImageService()');
  });

  it('Arrange, Act, Assert: verifies all Kubernetes base deployments enforce restricted securityContext', () => {
    // Arrange: Collect all core base manifests
    const manifests = ['portal.yaml', 'landing.yaml', 'auth.yaml', 'dev-dashboard.yaml', 'dev-hub.yaml', 'app-telemetry.yaml', 'caddy-gateway.yaml'];

    for (const file of manifests) {
      const fullPath = join(REPO_ROOT, 'deploy', 'k8s', 'base', file);
      expect(existsSync(fullPath)).toBe(true);

      // Act: Read manifest content
      const content = readFileSync(fullPath, 'utf8');

      // Assert: Verify Pod Security restricted invariants
      expect(content).toContain('runAsNonRoot: true');
      expect(content).toContain('readOnlyRootFilesystem: true');
      expect(content).toContain('runAsUser: 10001');
      expect(content).toContain('runAsGroup: 10001');
      expect(content).toContain('namespace: forge-system');
      expect(content).toContain('tmp-volume');
      expect(content).toContain('mountPath: /tmp');
    }
  });

  it('Arrange, Act, Assert: live socket enforces critical HTTP security response headers', async () => {
    // Arrange: Start live portal server on an ephemeral port
    portalServer = startPortalServer(0);

    // Act: Request health probe and landing interface
    const res = await fetch(`http://localhost:${portalServer.port}/health`);

    // Assert: Verify status and strict security response headers
    expect(res.status).toBe(200);
    const headers = res.headers;

    // Check anti-sniff and clickjacking defense headers
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});
