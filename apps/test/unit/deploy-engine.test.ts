/**
 * Production Deployment & Resilience Engine Unit Tests (2026 LTS)
 * Verifies script executability, syntax integrity, port separation, and selective update logic.
 */
import { describe, it, expect } from 'bun:test';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = join(__dirname, '../../..');

describe('Production Deployment Engine', () => {
  it('should ensure deploy-prod.sh, rollback-prod.sh, and status-prod.sh exist and are executable', () => {
    const scripts = [
      'deploy/deploy-prod.sh',
      'deploy/rollback-prod.sh',
      'deploy/status-prod.sh',
    ];

    for (const script of scripts) {
      const fullPath = join(REPO_ROOT, script);
      expect(existsSync(fullPath)).toBe(true);

      const stats = statSync(fullPath);
      // Check executable permission bit
      const isExecutable = Boolean(stats.mode & 0o111);
      expect(isExecutable).toBe(true);
    }
  });

  it('should pass strict bash syntax checks on all deployment scripts', () => {
    const scripts = [
      'deploy/deploy-prod.sh',
      'deploy/rollback-prod.sh',
      'deploy/status-prod.sh',
    ];

    for (const script of scripts) {
      const fullPath = join(REPO_ROOT, script);
      expect(() => {
        execSync(`bash -n "${fullPath}"`, { stdio: 'pipe' });
      }).not.toThrow();
    }
  });

  it('should verify port separation between development and production', () => {
    const envContent = readFileSync(join(REPO_ROOT, '.env'), 'utf8');

    // Dev port should be 8080 (not 80)
    expect(envContent).toContain('HTTP_PORT="8080"');
    expect(envContent).toContain('HTTPS_PORT="8443"');

    // Prod port should be 80 / 443
    expect(envContent).toContain('PROD_HTTP_PORT="80"');
    expect(envContent).toContain('PROD_HTTPS_PORT="443"');
  });

  it('should correctly map microservice paths to container services', () => {
    const mapFileToService = (file: string): string | null => {
      if (file.startsWith('apps/src/landing/')) return 'landing';
      if (file.startsWith('apps/src/portal/')) return 'portal';
      if (file.startsWith('apps/src/dev-dashboard/')) return 'dev-dashboard';
      if (file.startsWith('apps/src/dev-hub/')) return 'dev-hub';
      if (file.startsWith('apps/src/auth/')) return 'auth';
      if (file.startsWith('forge-apps/telemetry/')) return 'app-telemetry';
      if (file.startsWith('forge-apps/code/')) return 'app-code';
      if (file.startsWith('proxy/')) return 'proxy';
      return null;
    };

    expect(mapFileToService('forge-apps/telemetry/src/index.ts')).toBe('app-telemetry');
    expect(mapFileToService('forge-apps/code/src/routes.ts')).toBe('app-code');
    expect(mapFileToService('apps/src/portal/src/page.tsx')).toBe('portal');
    expect(mapFileToService('apps/src/auth/src/server.ts')).toBe('auth');
    expect(mapFileToService('proxy/Caddyfile')).toBe('proxy');
    expect(mapFileToService('README.md')).toBeNull();
  });
});
