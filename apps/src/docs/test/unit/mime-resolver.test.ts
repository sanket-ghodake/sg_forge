/**
 * Tier 1 Unit: MIME Resolver & Safe Path Resolution
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */

import { describe, expect, it } from 'bun:test';
import { getMimeType, loadDocsConfig, resolveStaticDistDir } from '../../src/config';
import { resolveSafeFilePath } from '../../src/server';

describe('Tier 1 Unit: Docs Configuration & Path Resolution [SR-DOC-001] [LLR-SDK-005]', () => {
  it('Arrange, Act, Assert: correctly identifies standard static asset MIME types', () => {
    // Arrange
    const testCases: [string, string][] = [
      ['index.html', 'text/html; charset=utf-8'],
      ['styles/custom.css', 'text/css; charset=utf-8'],
      ['pagefind/pagefind.js', 'application/javascript; charset=utf-8'],
      ['diagram.svg', 'image/svg+xml; charset=utf-8'],
      ['pagefind/pagefind.wasm', 'application/wasm'],
      ['favicon.png', 'image/png'],
      ['unknown.xyz', 'application/octet-stream'],
    ];

    // Act & Assert
    for (const [path, expectedMime] of testCases) {
      expect(getMimeType(path)).toBe(expectedMime);
    }
  });

  it('Arrange, Act, Assert: loads default docs runtime configuration', () => {
    // Arrange & Act
    const config = loadDocsConfig();

    // Assert
    expect(config.port).toBeGreaterThan(0);
    expect(config.basePath).toBe('/docs');
    expect(typeof config.staticDir).toBe('string');
    expect(config.version).toBe('2.0.0');
  });

  it('Arrange, Act, Assert: safely normalizes clean relative paths', () => {
    // Arrange
    const distDir = resolveStaticDistDir();

    // Act
    const resolved = resolveSafeFilePath(distDir, '/');

    // Assert
    // If apps/src/docs/dist exists, it should resolve to index.html
    if (resolved) {
      expect(resolved.endsWith('index.html')).toBe(true);
    }
  });
});
