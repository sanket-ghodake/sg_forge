/**
 * @forge/types - Tier 5 E2E: Package Export & TypeScript Compilation Stability
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Tier 5 E2E: Package Manifest & Export Parity', () => {
  it('Arrange, Act, Assert: verifies package.json export definitions are intact', () => {
    // Arrange
    const pkgPath = join(import.meta.dir, '..', '..', 'package.json');
    expect(existsSync(pkgPath)).toBe(true);

    // Act
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

    // Assert
    expect(pkg.name).toBe('@forge/types');
    expect(pkg.main || pkg.exports).toBeDefined();
  });
});
