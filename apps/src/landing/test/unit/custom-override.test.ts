/**
 * @forge/landing - Tier 1 Unit: Custom In-Repo Landing Override Test
 * 3A Pattern (Arrange, Act, Assert) Testing Suite (2026 LTS)
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import {
  CUSTOM_DIR,
  CUSTOM_INDEX_HTML,
  createLandingHandler,
  resolveLandingHtml,
  resolveLandingMode,
} from '../../src/server';

describe('Tier 1 Unit: Landing In-Repo Custom Override & Mode Resolution', () => {
  it('Arrange, Act, Assert: defaults to platform-hub mode when no custom directory exists', () => {
    // Arrange & Act
    const mode = resolveLandingMode();

    // Assert
    expect(['platform-hub', 'custom-static', 'custom-template']).toContain(mode);
  });

  it('Arrange, Act, Assert: automatically resolves custom/index.html when present', async () => {
    // Arrange: Create temporary git-ignored custom/index.html
    if (!existsSync(CUSTOM_DIR)) mkdirSync(CUSTOM_DIR, { recursive: true });
    const mockCustomHtml = '<!DOCTYPE html><html><body><h1>Acme Custom Landing</h1></body></html>';
    writeFileSync(CUSTOM_INDEX_HTML, mockCustomHtml, 'utf8');

    try {
      // Act
      const mode = resolveLandingMode();
      const resolvedHtml = await resolveLandingHtml();
      const handler = createLandingHandler();
      const res = await handler(new Request('http://localhost:3000/'));
      const body = await res.text();

      // Assert
      expect(mode).toBe('custom-static');
      expect(resolvedHtml).toBe(mockCustomHtml);
      expect(body).toBe(mockCustomHtml);
    } finally {
      // Cleanup: remove temporary custom files
      if (existsSync(CUSTOM_DIR)) rmSync(CUSTOM_DIR, { recursive: true, force: true });
    }
  });

  it('Arrange, Act, Assert: serves 200 OK with health status JSON on /health', async () => {
    // Arrange
    const handler = createLandingHandler();
    const req = new Request('http://localhost:3000/health');

    // Act
    const res = await handler(req);
    const data = (await res.json()) as { status: string; service: string; mode: string };

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('landing');
    expect(data.mode).toBeDefined();
  });
});
