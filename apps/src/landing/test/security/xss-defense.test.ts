/**
 * @forge/landing - Tier 3 Security: HTML Sanitization & Injection Defense
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startLandingServer } from '../../src/server';

describe('Tier 3 Security: Landing Ingress & Security Headers', () => {
  it('serves secure HTML markup with responsive viewport and valid lang attribute', async () => {
    // Arrange
    const server = startLandingServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('lang="en"');
      expect(html).toContain('viewport');
      expect(html).not.toContain('<script>alert(');
    } finally {
      server.stop();
    }
  });
});
