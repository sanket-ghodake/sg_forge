/**
 * @forge/portal - Tier 3 Security: Session Interception & Unauthenticated Redirection
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startPortalServer } from '../../src/server';

describe('Tier 3 Security: Portal Access Defense & Redirection', () => {
  it('Arrange, Act, Assert: redirects unauthenticated requests to /auth/login with return_url preservation', async () => {
    // Arrange: Start portal on ephemeral port 0
    const server = startPortalServer(0);

    try {
      // Act: Unauthenticated fetch with redirect manual mode
      const res = await fetch(`http://localhost:${server.port}/portal`, {
        redirect: 'manual',
      });

      // Assert
      expect(res.status).toBe(302);
      const location = res.headers.get('location');
      expect(location).toContain('/auth/login');
      expect(location).toContain('return_url=');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: rejects tampered and forged JWT tokens with 302 login redirect', async () => {
    // Arrange: Start portal on ephemeral port 0
    const server = startPortalServer(0);
    const tamperedToken = 'eyJhbGciOiJFZERTQTE5In0.eyJzdWIiOiJoYWNrZXIifQ.invalidsignature';

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/portal`, {
        headers: {
          Cookie: `forge_session=${tamperedToken}`,
        },
        redirect: 'manual',
      });

      // Assert
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login');
    } finally {
      server.stop();
    }
  });
});
