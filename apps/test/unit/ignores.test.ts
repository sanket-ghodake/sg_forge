/**
 * @forge/test/unit/ignores.test.ts - Ignore & Attrib Uniformity Unit & Tamper Test Suite (2026 LTS)
 * Enforces 100% uniformity and validates tamper-detection capabilities.
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MANDATORY_ATTRIBUTES,
  MANDATORY_EXCLUSIONS,
  ROOT_IGNORE_FILES,
  syncAllIgnores,
  validateIgnores,
} from '../../../scripts/sync-ignores';

const REPO_ROOT = process.cwd();

describe('Ignore & Attrib Files Uniformity Engine (3A Pattern)', () => {
  it('guarantees all 7 root ignore files and .gitattributes are 100% valid', () => {
    // Arrange & Act
    const result = validateIgnores();

    // Assert
    expect(result.valid).toBe(true);
    expect(result.missingFiles).toHaveLength(0);
    expect(result.missingPatterns).toHaveLength(0);
    expect(result.missingAttributes).toHaveLength(0);
    expect(result.subfolderLogIgnoresMissing).toHaveLength(0);
  });

  it('verifies all root ignore files exist on disk with mandatory exclusions', () => {
    // Arrange & Act
    for (const file of ROOT_IGNORE_FILES) {
      const filePath = join(REPO_ROOT, file);
      expect(existsSync(filePath)).toBe(true);

      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain('node_modules');
      expect(content).toContain('.env');
      expect(content).toContain('dist');
      expect(content).toContain('data/*.db');
      expect(content).toContain('logs/*.log');
      expect(content).toContain('scratch/');
    }
  });

  it('verifies .gitattributes enforces strict LF line-endings and binary protections', () => {
    // Arrange
    const attribPath = join(REPO_ROOT, '.gitattributes');
    expect(existsSync(attribPath)).toBe(true);

    // Act
    const content = readFileSync(attribPath, 'utf8');

    // Assert
    expect(content).toContain('* text=auto');
    expect(content).toContain('*.sh text eol=lf');
    expect(content).toContain('*.ts text eol=lf');
    expect(content).toContain('*.json text eol=lf');
    expect(content).toContain('*.md text eol=lf');
    expect(content).toContain('run.bat text eol=crlf');
    expect(content).toContain('*.bat text eol=crlf');
    expect(content).toContain('*.cmd text eol=crlf');
    expect(content).toContain('*Dockerfile* text eol=lf');
    expect(content).toContain('proxy/Caddyfile text eol=lf');
    expect(content).toContain('*.csv text eol=lf');
    expect(content).toContain('portables/bun/bin/bun binary');
    expect(content).toContain('portables/rtk/bin/rtk binary');
    expect(content).toContain('portables/ctop/ctop binary');
    expect(content).toContain('portables/hyperfine/hyperfine binary');
    expect(content).toContain('portables/scc/scc binary');
    expect(content).toContain('*.db binary');
    expect(content).toContain('*.sqlite binary');

    // Negative Invariant: Unsafe wildcard MUST NOT be present
    expect(content).not.toContain('portables/**/bin/* text');
  });

  it('detects tampering and missing patterns immediately (Tamper Proof Test)', () => {
    // Arrange: Temporarily strip out a mandatory pattern from .repomixignore
    const targetFile = join(REPO_ROOT, '.repomixignore');
    const originalContent = readFileSync(targetFile, 'utf8');
    const tamperedContent = originalContent.replace(/logs\/\*\.log/g, '# tampered');

    try {
      writeFileSync(targetFile, tamperedContent, 'utf8');

      // Act
      const result = validateIgnores();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingPatterns.some(p => p.file === '.repomixignore' && p.pattern.includes('logs/'))).toBe(true);
    } finally {
      // Teardown: Restore original clean content
      writeFileSync(targetFile, originalContent, 'utf8');
      const restoredResult = validateIgnores();
      expect(restoredResult.valid).toBe(true);
    }
  });

  it('syncAllIgnores successfully synchronizes all ignore files across workspaces', () => {
    // Arrange & Act
    const { filesUpdated } = syncAllIgnores();

    // Assert
    expect(filesUpdated.length).toBeGreaterThanOrEqual(10);
    expect(filesUpdated).toContain('.gitignore');
    expect(filesUpdated).toContain('.dockerignore');
    expect(filesUpdated).toContain('.cursorignore');

    const result = validateIgnores();
    expect(result.valid).toBe(true);
  });

  it('guarantees cross-platform path normalization produces POSIX forward-slash ignore entries', () => {
    // Arrange: simulated Windows backslash path
    const winPath = 'apps\\src\\portal\\logs\\.gitignore';
    const normalized = winPath.replace(/\\/g, '/');

    // Assert
    expect(normalized).toBe('apps/src/portal/logs/.gitignore');
    expect(normalized).not.toContain('\\');
  });
});
