/**
 * @forge/test/unit/security-audit-hooks.test.ts - Security Audit Hook & Commit Integration Test Suite
 * SG Forge 2026 Engineering Standards (Enterprise Engineering Baseline)
 *
 * Verifies that:
 * 1. Pre-commit hooks (.git/hooks/pre-commit and .agents/hooks/pre-commit.sh) stage logs/security.
 * 2. Post-commit hooks (.git/hooks/post-commit and .agents/hooks/post-commit.sh) detect and auto-amend logs/security.
 * 3. Centralized security audit logger supports 'commit' mode and maintains structured records.
 * 4. Commit reports in logs/reports/ integrate security audit references.
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { recordSecurityAudit } from '../../../scripts/log-security-audit';

const REPO_ROOT = process.cwd();

describe('Security Audit Git Hook & Ledger Integration (3A Pattern)', () => {
  it('verifies .git/hooks/pre-commit stages logs/security automatically', () => {
    // Arrange
    const hookPath = join(REPO_ROOT, '.git', 'hooks', 'pre-commit');
    expect(existsSync(hookPath)).toBe(true);

    // Act
    const content = readFileSync(hookPath, 'utf8');

    // Assert
    expect(content).toContain('git add');
    expect(content).toContain('"$REPO_ROOT/logs/security"');
  });

  it('verifies .agents/hooks/pre-commit.sh stages logs/security automatically', () => {
    // Arrange
    const hookPath = join(REPO_ROOT, '.agents', 'hooks', 'pre-commit.sh');
    expect(existsSync(hookPath)).toBe(true);

    // Act
    const content = readFileSync(hookPath, 'utf8');

    // Assert
    expect(content).toContain('git add');
    expect(content).toContain('"$REPO_ROOT/logs/security"');
  });

  it('verifies .git/hooks/post-commit operates in clean read-only zero-generation mode', () => {
    // Arrange
    const hookPath = join(REPO_ROOT, '.git', 'hooks', 'post-commit');
    expect(existsSync(hookPath)).toBe(true);

    // Act
    const content = readFileSync(hookPath, 'utf8');

    // Assert
    expect(content).toContain('ZERO file generation in post-commit');
    expect(content).not.toContain('git commit --amend');
  });

  it('verifies .agents/hooks/post-commit.sh operates in clean read-only zero-generation mode', () => {
    // Arrange
    const hookPath = join(REPO_ROOT, '.agents', 'hooks', 'post-commit.sh');
    expect(existsSync(hookPath)).toBe(true);

    // Act
    const content = readFileSync(hookPath, 'utf8');

    // Assert
    expect(content).toContain('ZERO file generation in post-commit');
    expect(content).not.toContain('git commit --amend');
  });

  it('verifies recordSecurityAudit records commit mode accurately', () => {
    // Arrange
    const tempTestDir = join(REPO_ROOT, 'apps', 'data', 'test-isolated', `audit-test-${Date.now()}`);
    mkdirSync(tempTestDir, { recursive: true });
    const testTarget = 'test-commit-target';
    const testSummary = 'Commit-level test security audit verification';

    try {
      // Act
      const record = recordSecurityAudit({
        mode: 'commit',
        target: testTarget,
        status: 'PASSED',
        findingsCount: 0,
        summary: testSummary,
        baseDir: tempTestDir,
      });

      // Assert
      expect(record.mode).toBe('commit');
      expect(record.target).toBe(testTarget);
      expect(record.status).toBe('PASSED');
      expect(record.reportFile).toContain('_commit.md');

      // Verify written file in isolated dir
      const writtenFiles = readdirSync(tempTestDir, { recursive: true }) as string[];
      const writtenMd = writtenFiles.find(f => f.endsWith('_commit.md'));
      expect(writtenMd).toBeDefined();
      const reportContent = readFileSync(join(tempTestDir, writtenMd!), 'utf8');
      expect(reportContent).toContain('Commit-level test security audit verification');
      expect(reportContent).toContain('Execution Mode**: commit');
      expect(existsSync(join(tempTestDir, 'LATEST_AUDIT.md'))).toBe(true);
      expect(existsSync(join(tempTestDir, 'audit.jsonl'))).toBe(true);
    } finally {
      rmSync(tempTestDir, { recursive: true, force: true });
    }
  });


  it('verifies scripts/log-commit.ts references security audit ledger', () => {
    // Arrange
    const logCommitPath = join(REPO_ROOT, 'scripts', 'log-commit.ts');
    expect(existsSync(logCommitPath)).toBe(true);

    // Act
    const content = readFileSync(logCommitPath, 'utf8');

    // Assert
    expect(content).toContain('SECURITY_AUDIT_JSONL_PATH');
    expect(content).toContain('recordSecurityAudit');
    expect(content).toContain('logs/security/LATEST_AUDIT.md');
  });
});
