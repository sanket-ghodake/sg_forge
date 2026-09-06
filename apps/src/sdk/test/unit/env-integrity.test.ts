/**
 * @forge/sdk - Tier 1 Unit: Environment & Registry Integrity Guardrail (2026 LTS)
 * Enforces 12-Factor Configuration, Zero-Trust Parity, and Port Mapping Integrity
 * between .env, .env.example, and the Declarative Service Registry.
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadServiceRegistry } from '../../src/registry';

const REPO_ROOT = process.cwd();

function parseEnvKeys(filePath: string): Set<string> {
  const keys = new Set<string>();
  if (!existsSync(filePath)) return keys;
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      keys.add(trimmed.slice(0, eqIdx).trim());
    }
  }
  return keys;
}

function parseEnvMap(filePath: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!existsSync(filePath)) return map;
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      let v = trimmed.slice(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      map[k] = v;
    }
  }
  return map;
}

describe('Tier 1 Unit: Environment & Service Registry Integrity', () => {
  const envPath = join(REPO_ROOT, '.env');
  const examplePath = join(REPO_ROOT, '.env.example');

  it('Arrange, Act, Assert: verifies 100% key parity between .env and .env.example', () => {
    // Arrange
    const envKeys = parseEnvKeys(envPath);
    const exampleKeys = parseEnvKeys(examplePath);

    // Act: Calculate symmetric differences
    const missingInExample = Array.from(envKeys).filter((k) => !exampleKeys.has(k));
    const missingInActive = Array.from(exampleKeys).filter((k) => !envKeys.has(k));

    // Assert
    expect(missingInExample).toEqual([]);
    expect(missingInActive).toEqual([]);
  });

  it('Arrange, Act, Assert: guarantees obsolete dead variables are pruned', () => {
    // Arrange
    const envKeys = parseEnvKeys(envPath);
    const exampleKeys = parseEnvKeys(examplePath);

    // Act & Assert
    expect(envKeys.has('PROJECT_NAME')).toBe(false);
    expect(exampleKeys.has('PROJECT_NAME')).toBe(false);
  });

  it('Arrange, Act, Assert: verifies core standalone base ports match their APP_* registry entries', () => {
    // Arrange
    const envMap = parseEnvMap(envPath);
    const corePortMappings: Array<{ portVar: string; appVar: string }> = [
      { portVar: 'LANDING_PORT', appVar: 'APP_LANDING' },
      { portVar: 'PORTAL_PORT', appVar: 'APP_PORTAL' },
      { portVar: 'DEV_DASHBOARD_PORT', appVar: 'APP_DEVCENTER' },
      { portVar: 'DEV_HUB_PORT', appVar: 'APP_GATEWAY' },
      { portVar: 'AUTH_PORT', appVar: 'APP_AUTH' },
    ];

    // Act & Assert
    for (const mapping of corePortMappings) {
      const standalonePort = envMap[mapping.portVar];
      const appLine = envMap[mapping.appVar];

      expect(standalonePort).toBeDefined();
      expect(appLine).toBeDefined();

      const parts = (appLine || '').split('|');
      const registryPort = parts[1]?.trim();

      expect(registryPort).toBe(standalonePort);
    }
  });

  it('Arrange, Act, Assert: verifies all registered services parse with valid ports and ingress paths', () => {
    // Arrange
    const services = loadServiceRegistry();

    // Act & Assert
    expect(services.length).toBeGreaterThanOrEqual(7);

    for (const s of services) {
      expect(s.port).toBeGreaterThanOrEqual(80);
      expect(s.port).toBeLessThanOrEqual(65535);
      expect(s.path.startsWith('/')).toBe(true);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.category.length).toBeGreaterThan(0);
      expect(s.role.length).toBeGreaterThan(0);
    }
  });

  it('Arrange, Act, Assert: validates token expiry variables parse as positive numbers', () => {
    // Arrange
    const envMap = parseEnvMap(envPath);

    // Act
    const accessExpiry = Number(envMap.JWT_ACCESS_TOKEN_EXPIRY_SECONDS);
    const refreshExpiry = Number(envMap.JWT_REFRESH_TOKEN_EXPIRY_SECONDS);
    const absoluteSessionMax = Number(envMap.AUTH_ABSOLUTE_SESSION_MAX_SECONDS);

    // Assert
    expect(accessExpiry).toBeGreaterThan(0);
    expect(refreshExpiry).toBeGreaterThan(0);
    expect(absoluteSessionMax).toBeGreaterThan(0);
    expect(refreshExpiry).toBeGreaterThan(accessExpiry);
    expect(absoluteSessionMax).toBeGreaterThan(accessExpiry);
  });
});
