/**
 * @forge/dev-hub - Tier 3 Security: Input Hardening & Content Security
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startDevHubServer } from '../../src/server';

describe('Tier 3 Security: Dev Hub Ingress Hardening', () => {
  it('renders static templates safely without evaluating arbitrary expressions', async () => {
    // Arrange
    const server = startDevHubServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('lang="en"');
      expect(html).toContain('viewport');
      expect(html).not.toContain('eval(');
    } finally {
      server.stop();
    }
  });
});
