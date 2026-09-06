/**
 * Custom Landing - Tier 1 Unit Test Suite
 * 3A Pattern (Arrange, Act, Assert) Testing Suite (2026 LTS)
 */

import { describe, expect, it } from 'bun:test';
import { createLandingHandler } from '../../src/server';
import { renderCustomLandingHtml } from '../../src/template.html';

describe('Tier 1 Unit: Custom Landing Server & Template Invariants', () => {
  it('Arrange, Act, Assert: serves 200 OK with health status JSON on /health', async () => {
    // Arrange
    const handler = createLandingHandler();
    const req = new Request('http://localhost:3000/health');

    // Act
    const res = await handler(req);
    const data = (await res.json()) as { status: string; service: string };

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('pass');
    expect(data.service).toBe('landing-custom');
  });

  it('Arrange, Act, Assert: renders custom landing HTML with portal links on root path', async () => {
    // Arrange
    const handler = createLandingHandler();
    const req = new Request('http://localhost:3000/');

    // Act
    const res = await handler(req);
    const html = await res.text();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(html).toContain('Custom Landing');
    expect(html).toContain('href="/portal"');
    expect(html).toContain('href="/auth"');
  });

  it('Arrange, Act, Assert: renders custom configuration overrides in template generator', () => {
    // Arrange
    const customConfig = {
      brandName: 'Acme Space Corp',
      heroHeadline: 'Orbiting Software Excellence',
    };

    // Act
    const html = renderCustomLandingHtml(customConfig);

    // Assert
    expect(html).toContain('Acme Space Corp');
    expect(html).toContain('Orbiting Software Excellence');
  });

  it('Arrange, Act, Assert: returns 404 Not Found for unknown paths', async () => {
    // Arrange
    const handler = createLandingHandler();
    const req = new Request('http://localhost:3000/non-existent-page');

    // Act
    const res = await handler(req);

    // Assert
    expect(res.status).toBe(404);
  });
});
