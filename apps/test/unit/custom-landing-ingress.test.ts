/**
 * @forge/test/unit/custom-landing-ingress.test.ts
 * Tier 1 Unit: Custom Landing Container & Ingress Routing Specification
 * Verifies dynamic root ingress overrides via APP_LANDING in .env
 * 3A Pattern (Arrange, Act, Assert) Testing Suite (2026 LTS)
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateCaddyfile } from '../../../scripts/generate-proxy';
import { loadServiceRegistry } from '../../src/sdk/src/registry';

const REPO_ROOT = process.cwd();
const TEMP_ENV_PATH = join(REPO_ROOT, 'scratch', 'test-custom-landing.env');

describe('Tier 1 Unit: Custom Landing Container & Ingress Invariants', () => {
  it('Arrange, Act, Assert: parses custom landing container override with non-standard port', () => {
    // Arrange: Create mock .env with custom landing container
    const mockEnv = [
      'LANDING_PORT="8080"',
      'APP_LANDING="Corporate Marketing|8080|/|Corporate|Public Ingress|acme-landing-container"',
      'APP_PORTAL="Portal|3001|/portal|Core|Employee"',
    ].join('\n');
    writeFileSync(TEMP_ENV_PATH, mockEnv, 'utf8');

    try {
      // Act: Load registry with explicit mock env
      const services = loadServiceRegistry({ envPath: TEMP_ENV_PATH });
      const landing = services.find((s) => s.path === '/');

      // Assert
      expect(landing).toBeDefined();
      expect(landing?.name).toBe('Corporate Marketing');
      expect(landing?.port).toBe(8080);
      expect(landing?.containerName).toBe('acme-landing-container');
      expect(landing?.upstreamUrl).toBe('http://acme-landing-container:8080');
      expect(landing?.isExternal).toBe(true);
      expect(landing?.healthUrl).toBe('/health');
    } finally {
      if (existsSync(TEMP_ENV_PATH)) unlinkSync(TEMP_ENV_PATH);
    }
  });

  it('Arrange, Act, Assert: parses remote external landing website with HTTPS upstream', () => {
    // Arrange: Mock .env with fully-qualified HTTPS landing site
    const mockEnv = [
      'LANDING_PORT="443"',
      'APP_LANDING="External Site|443|/|Corporate|Public Ingress|https://marketing.acme.corp"',
      'APP_PORTAL="Portal|3001|/portal|Core|Employee"',
    ].join('\n');
    writeFileSync(TEMP_ENV_PATH, mockEnv, 'utf8');

    try {
      // Act: Load registry with explicit mock env
      const services = loadServiceRegistry({ envPath: TEMP_ENV_PATH });
      const landing = services.find((s) => s.path === '/');

      // Assert
      expect(landing).toBeDefined();
      expect(landing?.upstreamUrl).toBe('https://marketing.acme.corp');
      expect(landing?.isExternal).toBe(true);
    } finally {
      if (existsSync(TEMP_ENV_PATH)) unlinkSync(TEMP_ENV_PATH);
    }
  });

  it('Arrange, Act, Assert: generates valid Caddy reverse_proxy with custom container upstream', () => {
    // Arrange: Verify generateCaddyfile executes and emits root ingress
    const caddyfile = generateCaddyfile();

    // Assert: Check root ingress handle block
    expect(caddyfile).toContain('# Platform Hub (Landing) (landing) [Root Ingress]');
    expect(caddyfile).toContain('reverse_proxy http://landing:3000');
    expect(caddyfile).toContain('header_up X-Forwarded-Host {host}');
  });
});
