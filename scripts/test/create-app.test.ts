/**
 * @forge/scripts - Tier 1 Unit Test: 1-Command App Generator
 */

import { describe, expect, it } from 'bun:test';
import { createApp } from '../create-app';
import { generateCaddyfile } from '../generate-proxy';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Tier 1 Unit: 1-Command Micro-App Generator [SR-SUB-001] [LLR-SUB-001]', () => {
  it('should reject invalid application names', () => {
    const res = createApp({ appName: '   ' });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid application name');
  });

  it('should successfully scaffold a new test micro-app and clean up', () => {
    const testAppName = 'unit-test-scaffold-demo';
    const appDir = join(process.cwd(), 'forge-apps', testAppName);
    const envPath = join(process.cwd(), '.env');

    if (existsSync(appDir)) rmSync(appDir, { recursive: true, force: true });

    try {
      const res = createApp({
        appName: testAppName,
        displayName: 'Unit Test Scaffold Demo',
        category: 'Test Category',
        role: 'Employee / Admin',
      });

      expect(res.success).toBe(true);
      expect(res.port).toBeGreaterThanOrEqual(8080);
      expect(res.ingressPath).toBe(`/apps/${testAppName}`);
      expect(existsSync(appDir)).toBe(true);
      expect(existsSync(join(appDir, 'src', 'server.ts'))).toBe(true);
      expect(existsSync(join(appDir, 'src', 'db', 'index.ts'))).toBe(true);
      expect(existsSync(join(appDir, 'package.json'))).toBe(true);
    } finally {
      if (existsSync(appDir)) rmSync(appDir, { recursive: true, force: true });

      // Clean up .env and .env.example
      for (const file of ['.env', '.env.example']) {
        const p = join(process.cwd(), file);
        if (existsSync(p)) {
          let env = readFileSync(p, 'utf8');
          env = env
            .split('\n')
            .filter((line) => !line.includes('APP_UNIT_TEST_SCAFFOLD_DEMO='))
            .join('\n');
          writeFileSync(p, env, 'utf8');
        }
      }
      generateCaddyfile();
    }
  });
});
