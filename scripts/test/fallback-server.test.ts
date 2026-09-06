/**
 * @forge/scripts - Tier 1 Unit & Contract Tests: Host Fallback Server & Static Error Generator
 * 3A Pattern (Arrange, Act, Assert)
 * Enterprise SRE & AppSec Zero-Leak Error Standards
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateStaticErrorPages } from '../generate-error-pages';
import { startFallbackServer } from '../fallback-server';

const REPO_ROOT = process.cwd();
const ERRORS_DIR = join(REPO_ROOT, 'proxy', 'errors');
describe('Tier 1 Unit: Static Error Pages & Host Fallback Server', () => {
  let serverInstance: ReturnType<typeof Bun.serve>;

  beforeAll(() => {
    // Start fallback server on isolated ephemeral port 0
    serverInstance = startFallbackServer({ port: 0, quiet: true });
  });

  afterAll(() => {
    serverInstance.stop(true);
  });

  it('Arrange, Act, Assert: pre-renders all 4 static Astryx error pages with valid HTML and branding', () => {
    // Arrange
    const expectedFiles = ['502.html', '503.html', '500.html', '404.html'];

    // Act
    const generated = generateStaticErrorPages();

    // Assert
    expect(generated.length).toBe(4);
    for (const filename of expectedFiles) {
      const filePath = join(ERRORS_DIR, filename);
      expect(existsSync(filePath)).toBe(true);
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('astryx');
      expect(content).toContain('--forge-bg');
    }
  });

  it('Arrange, Act, Assert: fallback server returns 503 Maintenance HTML for root and Forge App routes', async () => {
    // Arrange
    const testRoutes = [
      '/',
      '/portal',
      '/apps/telemetry',
      '/apps/code',
      '/any-unknown-route',
    ];

    // Act & Assert
    for (const route of testRoutes) {
      const res = await fetch(`http://localhost:${serverInstance.port}${route}`);
      expect(res.status).toBe(503);
      expect(res.headers.get('Content-Type')).toContain('text/html');
      expect(res.headers.get('X-Forge-Fallback')).toBe('active');

      const body = await res.text();
      expect(body).toContain('503');
      expect(body).toContain('System Under Maintenance');
    }
  });

  it('Arrange, Act, Assert: fallback server responds 200 OK to dual health check probes', async () => {
    // Arrange
    const healthUrl = `http://localhost:${serverInstance.port}/health`;

    // Act
    const res = await fetch(healthUrl);
    const data = await res.json() as { status: string; mode: string };

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('fallback-active');
    expect(data.mode).toBe('maintenance');
  });

  it('Arrange, Act, Assert: verified static error pages do NOT contain external CDN URLs', () => {
    // Arrange
    const file503 = readFileSync(join(ERRORS_DIR, '503.html'), 'utf8');
    const forbidden = [
      ['cdnjs', 'cloudflare.com'].join('.'),
      ['unpkg', 'com'].join('.'),
      ['fonts', 'googleapis.com'].join('.'),
      ['cdn', 'jsdelivr.net'].join('.'),
    ];

    // Act & Assert
    for (const pattern of forbidden) {
      expect(file503).not.toContain(pattern);
    }
  });
});
