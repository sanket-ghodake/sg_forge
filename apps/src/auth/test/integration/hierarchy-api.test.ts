/**
 * @forge/auth - Tier 2 Integration: Hierarchical Manager Detection API
 * 3A Pattern (Arrange, Act, Assert)
 * Verifies real HTTP routes for /api/v1/auth/hierarchy/:id/is-manager and /me/is-manager.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-012]
 */

import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { signJwt } from '../../src/backend/crypto';
import { startAuthServer } from '../../src/server';

describe('Tier 2 Integration: Hierarchical Manager Check API [LLR-AUTH-012]', () => {
  let server: any;
  let port: number;

  beforeAll(() => {
    seedAuthDatabase(true);
    server = startAuthServer(0);
    port = server.port;
  });

  afterAll(() => {
    if (server) {
      server.stop(true);
    }
  });

  it('should return isManager=true for lead with direct reports via route param', async () => {
    // Arrange: usr-bob-lead has 3 direct reports
    const url = `http://localhost:${port}/api/v1/auth/hierarchy/usr-bob-lead/is-manager`;

    // Act
    const res = await fetch(url);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-bob-lead');
    expect(body.isManager).toBe(true);
    expect(body.directReportsCount).toBe(3);
  });

  it('should return isManager=false for IC with 0 reports via route param', async () => {
    // Arrange: usr-amit-dev has 0 direct reports
    const url = `http://localhost:${port}/api/v1/auth/hierarchy/usr-amit-dev/is-manager`;

    // Act
    const res = await fetch(url);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-amit-dev');
    expect(body.isManager).toBe(false);
    expect(body.directReportsCount).toBe(0);
  });

  it('should support reverse-proxy prefix /auth/api/v1/auth/hierarchy/:id/is-manager', async () => {
    // Arrange
    const url = `http://localhost:${port}/auth/api/v1/auth/hierarchy/usr-alice-eng/is-manager`;

    // Act
    const res = await fetch(url);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-alice-eng');
    expect(body.isManager).toBe(true);
    expect(body.directReportsCount).toBe(2);
  });

  it('should support query param ?user_id=... on /hierarchy/is-manager', async () => {
    // Arrange
    const url = `http://localhost:${port}/api/v1/auth/hierarchy/is-manager?user_id=usr-bob-lead`;

    // Act
    const res = await fetch(url);
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-bob-lead');
    expect(body.isManager).toBe(true);
  });

  it('should resolve /me/is-manager using Bearer authorization token', async () => {
    // Arrange: mint token for Alice (manager)
    const token = signJwt({
      sub: 'usr-alice-eng',
      email: 'alice.eng@forge.internal',
      display_name: 'Aditi Sharma',
      principal_type: 'EMPLOYEE',
      org_id: 'org-sg-forge-global',
    });

    // Act
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/me/is-manager`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-alice-eng');
    expect(body.isManager).toBe(true);
    expect(body.directReportsCount).toBe(2);
  });

  it('should resolve /me/is-manager using session cookie', async () => {
    // Arrange: mint token for Amit (IC, not a manager)
    const token = signJwt({
      sub: 'usr-amit-dev',
      email: 'amit.dev@forge.internal',
      display_name: 'Amit Verma',
      principal_type: 'EMPLOYEE',
      org_id: 'org-sg-forge-global',
    });

    // Act
    const res = await fetch(`http://localhost:${port}/api/v1/auth/hierarchy/me/is-manager`, {
      headers: {
        Cookie: `forge_session=${token}`,
      },
    });
    const body: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(body.status).toBe('SUCCESS');
    expect(body.userId).toBe('usr-amit-dev');
    expect(body.isManager).toBe(false);
    expect(body.directReportsCount).toBe(0);
  });
});
