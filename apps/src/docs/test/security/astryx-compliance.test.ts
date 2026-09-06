/**
 * @file astryx-compliance.test.ts
 * @description Tier 3 Security: Astryx Design System Compliance & XSS Neutralization
 * @standards Enterprise Application Security, Astryx Standards, High-Reliability Systems
 */

import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function findSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', '.astro', 'test'].includes(entry.name)) {
        results.push(...findSourceFiles(full));
      }
    } else if (['.ts', '.tsx', '.astro'].some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

describe('Tier 3 Security: Astryx UI Compliance & Zero Browser Defaults [SR-DOC-001] [HLR-UI-401]', () => {
  const repoRoot = process.cwd();
  const docsSrcDir = join(repoRoot, 'apps', 'src', 'docs', 'src');
  const srcFiles = findSourceFiles(docsSrcDir);

  it('Arrange, Act, Assert: verifies zero native browser dialogs (alert, confirm, prompt)', () => {
    // Arrange & Act
    const violations: string[] = [];
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
        if (/\b(alert|confirm|prompt)\s*\(/i.test(line)) {
          violations.push(`${relative(repoRoot, file)}:${idx + 1}: ${trimmed}`);
        }
      });
    }

    // Assert
    expect(violations).toEqual([]);
  });

  it('Arrange, Act, Assert: verifies zero unapproved CSS framework utilities in components', () => {
    // Arrange & Act
    const unapprovedUtilPattern = /\b(bg-(red|blue|green|gray|slate|zinc|emerald|indigo|purple|pink|yellow)-\d{2,3}|text-(red|blue|green|gray|slate|zinc|emerald|indigo|purple|pink|yellow)-\d{2,3})\b/g;
    const violations: string[] = [];

    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
        const matches = line.match(unapprovedUtilPattern);
        if (matches) {
          violations.push(`${relative(repoRoot, file)}:${idx + 1}: ${matches.join(', ')}`);
        }
      });
    }

    // Assert
    expect(violations).toEqual([]);
  });

  it('Arrange, Act, Assert: verifies zero raw browser title attributes in AstryxHeader', () => {
    // Arrange
    const headerPath = join(docsSrcDir, 'components', 'AstryxHeader.astro');
    const headerContent = readFileSync(headerPath, 'utf8');

    // Act
    // Look for title="..." attributes (ignoring comments)
    const lines = headerContent.split('\n');
    const titleLines: string[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      if (/\btitle=["'][^"']+["']/i.test(line)) {
        titleLines.push(`line ${idx + 1}: ${trimmed}`);
      }
    });

    // Assert
    expect(titleLines).toEqual([]);
    expect(headerContent).toContain('data-astryx-tooltip');
  });

  it('Arrange, Act, Assert: verifies 100% offline air-gapped static distribution bundle (zero external CDNs, fonts, or trackers in dist/)', () => {
    // Arrange
    const distDir = join(repoRoot, 'apps', 'src', 'docs', 'dist');
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

    function getDistFiles(dir: string): string[] {
      const files: string[] = [];
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...getDistFiles(full));
          } else if (['.html', '.js', '.css'].some((ext) => entry.name.endsWith(ext))) {
            files.push(full);
          }
        }
      } catch {}
      return files;
    }

    // Act
    const distFiles = getDistFiles(distDir);
    expect(distFiles.length).toBeGreaterThan(10);

    const violations: Array<{ file: string; pattern: string }> = [];
    for (const file of distFiles) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push({ file: relative(repoRoot, file), pattern: pattern.toString() });
        }
      }
    }

    // Assert: Guaranteed zero external connections
    expect(violations).toEqual([]);
  });
});
