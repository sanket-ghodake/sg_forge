/**
 * @forge/scripts - Tier 1 Integration & Dispatcher Tests: run.sh & Modular CLI Ecosystem
 * 3A Pattern (Arrange, Act, Assert) - 100% Deterministic & Safe Execution
 * Big Tech Clean Architecture & Verification Gate Standard
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = process.cwd();
const RUN_SH = join(REPO_ROOT, 'run.sh');

// Helper to spawn run.sh commands with timeout and capture output
function runCli(args: string[], env: Record<string, string> = {}): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync([RUN_SH, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    code: proc.exitCode,
    stdout: proc.stdout ? Buffer.from(proc.stdout).toString('utf8') : '',
    stderr: proc.stderr ? Buffer.from(proc.stderr).toString('utf8') : '',
  };
}

describe('Tier 1: run.sh Modular CLI Orchestrator & Command Dispatcher [SR-GATE-001] [LLR-SUB-007]', () => {
  // --------------------------------------------------------------------------
  // 1. Dispatcher & Help Subsystem
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh default or help flags render full CLI documentation banner', () => {
    // Arrange
    const testFlags = [[], ['help'], ['-h'], ['--help']];

    for (const flags of testFlags) {
      // Act
      const res = runCli(flags);

      // Assert
      expect(res.code).toBe(0);
      expect(res.stdout).toContain('Platform Orchestrator');
      expect(res.stdout).toContain('Usage: ./run.sh <command> [options]');
      expect(res.stdout).toContain('Core Development & Testing:');
      expect(res.stdout).toContain('Docker Lifecycle & Modular Profiles');
      expect(res.stdout).toContain('Quality, Security & Toolchain:');
    }
  });

  it('Arrange, Act, Assert: invalid command exits non-zero and points to help', () => {
    // Arrange
    const invalidCmd = 'non-existent-command-xyz';

    // Act
    const res = runCli([invalidCmd]);

    // Assert
    expect(res.code).not.toBe(0);
    expect(res.stderr).toContain('Unknown command');
    expect(res.stderr).toContain('./run.sh help');
  });

  // --------------------------------------------------------------------------
  // 2. Portable Wrappers & Bug Fix Verification (ctop & repomix)
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: portables/bin/ctop executes cleanly without syntax errors', () => {
    // Act
    const res = runCli(['ctop', '-v']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ctop version');
  });

  it('Arrange, Act, Assert: run.sh top alias dispatches to ctop', () => {
    // Act
    const res = runCli(['top', '-v']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ctop version');
  });

  it('Arrange, Act, Assert: run.sh docker ctop dispatches correctly', () => {
    // Act
    const res = runCli(['docker', 'ctop', '-v']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ctop version');
  });

  it('Arrange, Act, Assert: repomix --help prints usage and prevents accidental --help file creation', () => {
    // Arrange: Ensure no stray file exists
    const strayFile = join(REPO_ROOT, '--help');

    // Act
    const res = runCli(['pack', '--help']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Repomix');
    expect(existsSync(strayFile)).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 3. Core Development Commands
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh doctor performs comprehensive pre-flight diagnostics', () => {
    // Act
    const res = runCli(['doctor']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Running Pre-Flight Diagnostics');
    expect(res.stdout).toContain('Bun Runtime:');
    expect(res.stdout).toContain('Host OS & Architecture:');
    expect(res.stdout).toContain('Diagnostics Completed.');
  });

  it('Arrange, Act, Assert: run.sh sync-ignores --check verifies ignore files and gitattributes', () => {
    // Act
    const res = runCli(['sync-ignores', '--check']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toMatch(/Synchronized \d+ ignore files/);
  });

  it('Arrange, Act, Assert: run.sh sync-proxy generates valid Caddyfile with defined routes', () => {
    // Act
    const res = runCli(['sync-proxy']);

    // Assert
    expect(res.code).toBe(0);
    const caddyfile = join(REPO_ROOT, 'proxy', 'Caddyfile');
    expect(existsSync(caddyfile)).toBe(true);
    const content = readFileSync(caddyfile, 'utf8');
    expect(content).toContain('forge_gateway');
  });

  it('Arrange, Act, Assert: run.sh logo-status reports git skip-worktree status of brand assets', () => {
    // Act
    const res = runCli(['logo-status']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Brand Lock Status');
  });

  it('Arrange, Act, Assert: run.sh create-app prints usage guidelines when called with --help', () => {
    // Act
    const res = runCli(['create-app', '--help']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Micro-App Generator');
    expect(res.stdout).toContain('Usage:');
  });

  // --------------------------------------------------------------------------
  // 4. Quality, Security & Toolchain Commands
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh licenses verifies OSI permissive dependency compliance', () => {
    // Act
    const res = runCli(['licenses']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('permissive OSI licenses');
  });

  it('Arrange, Act, Assert: run.sh contracts validates OpenAPI 3.1 schema specification', () => {
    // Act
    const res = runCli(['contracts']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('No results with a severity of \'error\' found');
  });

  it('Arrange, Act, Assert: run.sh complexity runs Lizard cyclomatic complexity scan', () => {
    // Act
    const res = runCli(['complexity']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Complexity Auditor');
  });

  it('Arrange, Act, Assert: run.sh check-pkg validates legitimate npm packages', () => {
    // Act
    const res = runCli(['check-pkg', 'react']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('APPROVED');
  });

  it('Arrange, Act, Assert: run.sh lint checks AST formatting with Biome', () => {
    // Act
    const res = runCli(['lint']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Biome');
  });

  it('Arrange, Act, Assert: run.sh deadcode audits monorepo exports with Knip', () => {
    // Act
    const res = runCli(['deadcode']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Knip');
  });

  it('Arrange, Act, Assert: run.sh secrets audits repo for API credentials with Gitleaks', () => {
    // Act
    const res = runCli(['secrets']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Gitleaks');
  });

  it('Arrange, Act, Assert: run.sh shellcheck verifies bash safety patterns', () => {
    // Act
    const res = runCli(['shellcheck']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('ShellCheck');
  });

  it('Arrange, Act, Assert: run.sh semgrep validates AST security invariants', () => {
    // Act
    const res = runCli(['semgrep']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Semgrep');
  });

  it('Arrange, Act, Assert: run.sh a11y audits UI accessibility standards with Axe', () => {
    // Act
    const res = runCli(['a11y']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Axe');
  });

  it('Arrange, Act, Assert: run.sh benchmark --help prints autocannon latency runner options', () => {
    // Act
    const res = runCli(['benchmark', '--help']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('autocannon');
  });

  // --------------------------------------------------------------------------
  // 5. Docker Monitoring & Ergonomic Aliases
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh monitor --once renders single ANSI cluster metrics HUD frame', () => {
    // Act
    const res = runCli(['monitor', '--once']);

    expect(res.code).toBe(0);
    expect(res.stdout).toContain('CLUSTER MONITOR');
    expect(res.stdout.includes('Fleet Health:') || res.stdout.includes('Connecting to AG Dashboard')).toBe(true);
  });

  it('Arrange, Act, Assert: run.sh status outputs active Docker compose status', () => {
    // Act
    const res = runCli(['status']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Live Container Status:');
  });

  // --------------------------------------------------------------------------
  // 6. Production Ops & Storage Hardening
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh prod-status inspects gateway and deployment audit health', () => {
    // Act
    const res = runCli(['prod-status']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Production Diagnostics & Audit Status');
  });

  it('Arrange, Act, Assert: run.sh gen-key produces cryptographically secure AES key', () => {
    // Act
    const res = runCli(['gen-key']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('256-bit AES');
    expect(res.stdout).toContain('DATA_ENCRYPTION_KEY=');
  });

  it('Arrange, Act, Assert: run.sh backup-verify inspects backup archive integrity', () => {
    // Act
    const res = runCli(['backup-verify']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Inspecting backups');
  });

  it('Arrange, Act, Assert: run.sh harden securely tightens storage permissions', () => {
    // Act
    const res = runCli(['harden']);

    // Assert
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Hardening Database Storage Permissions');
  });

  // --------------------------------------------------------------------------
  // 7. Safety Invariants & Destructive Guards
  // --------------------------------------------------------------------------
  it('Arrange, Act, Assert: run.sh reset-db blocks in non-interactive mode without --force', () => {
    // Act
    const res = runCli(['reset-db']);

    // Assert: Must refuse to wipe databases non-interactively
    expect(res.code).not.toBe(0);
    expect(res.stdout).toContain('Non-interactive shell detected');
  });

  it('Arrange, Act, Assert: run.sh docker reset-data blocks accidental wipe in production', () => {
    // Act
    const res = runCli(['docker', 'reset-data'], { APP_ENV: 'production' });

    // Assert: Must block volume purge in production without explicit flag
    expect(res.code).not.toBe(0);
    expect(res.stdout).toContain('BLOCKED: APP_ENV is set to \'production\'');
  });

  it('Arrange, Act, Assert: run.sh docker dev blocks targeted startup for undeclared apps', () => {
    // Act
    const res = runCli(['docker', 'dev', 'app-template']);

    // Assert: Must block unconfigured apps and advise user
    expect(res.code).not.toBe(0);
    expect(res.stderr).toContain("Targeted service or app 'app-template' is not declared or active in .env");
  });
});
