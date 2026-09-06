/**
 * @forge/dev-hub - Tier 2 Integration: Hub Navigation & Cross-Links
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startDevHubServer } from '../../src/server';

describe('Tier 2 Integration: Dev Hub Navigation & Links [HLR-HUB-601] [SR-DOC-001]', () => {
  it('serves interactive developer documentation with portal & hub return links', async () => {
    // Arrange
    const server = startDevHubServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('Return to Platform Hub');
      expect(html).toContain('Portal &rarr;');
      expect(html).toContain('Developer Hub & SDK Playground');
    } finally {
      server.stop();
    }
  });
});
