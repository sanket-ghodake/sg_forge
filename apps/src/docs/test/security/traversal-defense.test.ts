/**
 * Tier 3 Security: Directory Traversal & Null Byte Defense
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */

import { describe, expect, it } from 'bun:test';
import { resolveStaticDistDir } from '../../src/config';
import { createDocsHandler, resolveSafeFilePath } from '../../src/server';

describe('Tier 3 Security: Ingress Hardening & Traversal Defense [SR-DOC-001] [LLR-SDK-005]', () => {
  it('Arrange, Act, Assert: strictly blocks path traversal escape sequences', () => {
    // Arrange
    const distDir = resolveStaticDistDir();
    const dotDot = '..';
    const maliciousPaths = [
      [dotDot, dotDot, dotDot, dotDot, 'etc', 'passwd'].join('/'),
      [dotDot, dotDot, dotDot, 'windows', 'system32'].join('\\'),
      [dotDot, dotDot, dotDot, 'package.json'].join('/'),
      ['', dotDot, dotDot, dotDot, dotDot, 'etc', 'shadow'].join('/'),
      ['.', dotDot, dotDot, dotDot, '.env'].join('/'),
    ];

    // Act & Assert
    for (const badPath of maliciousPaths) {
      const resolved = resolveSafeFilePath(distDir, badPath);
      expect(resolved).toBeNull();
    }
  });

  it('Arrange, Act, Assert: strictly blocks null-byte poison injections', () => {
    // Arrange
    const distDir = resolveStaticDistDir();
    const nullBytePaths = [
      'index.html\0.png',
      '/docs/index.html%00.jpg',
      '..%00/secret.txt',
    ];

    // Act & Assert
    for (const badPath of nullBytePaths) {
      const resolved = resolveSafeFilePath(distDir, badPath);
      expect(resolved).toBeNull();
    }
  });

  it('Arrange, Act, Assert: HTTP handler rejects traversal attempts with 404', async () => {
    // Arrange
    const handler = createDocsHandler();
    const escapeUrl = 'http://localhost:3005/docs/' + '..'.repeat(4) + '/etc/passwd';
    const req = new Request(escapeUrl);

    // Act
    const res = await handler(req);

    // Assert
    expect(res.status).toBe(404);
  });
});
