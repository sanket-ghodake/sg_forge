/**
 * @forge/dev-dashboard - Apps API Schema & Contract Tests (2026 LTS)
 * 3A Pattern contract validation for /api/apps endpoints and RFC 7807 error responses.
 */

import { describe, expect, it } from 'bun:test';
import { handleApiRequest } from '../../src/backend/api-handlers';

describe('Contracts: Forge Apps API Schema & Error Contracts', () => {
  it('1. GET /api/apps matches standard schema contract', async () => {
    // Arrange
    const req = new Request('http://localhost:3002/api/apps', { method: 'GET' });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(200);
    const data = await res?.json();

    // Assert: contract fields
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('apps');
    expect(data).toHaveProperty('overview');

    if (data.apps.length > 0) {
      const app = data.apps[0];
      expect(typeof app.id).toBe('string');
      expect(typeof app.name).toBe('string');
      expect(typeof app.port).toBe('number');
      expect(typeof app.ingress_path).toBe('string');
      expect(typeof app.category).toBe('string');
      expect(typeof app.access_role).toBe('string');
    }
  });

  it('2. POST /api/apps/register with missing parameters returns 400 error', async () => {
    // Arrange: empty payload
    const req = new Request('http://localhost:3002/api/apps/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(400);
    const data = await res?.json();

    // Assert
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });

  it('3. GET /api/apps/inspect with missing ID returns 400 error', async () => {
    // Arrange: missing ?id=
    const req = new Request('http://localhost:3002/api/apps/inspect', { method: 'GET' });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(400);
    const data = await res?.json();

    // Assert
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Missing app id');
  });

  it('4. POST /api/apps/delete with non-existent ID returns error', async () => {
    // Arrange: non-existent id
    const req = new Request('http://localhost:3002/api/apps/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'non-existent-app-xyz-999' }),
    });
    const url = new URL(req.url);

    // Act
    const res = await handleApiRequest(req, url);
    expect(res?.status).toBe(400);
    const data = await res?.json();

    // Assert
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('not found');
  });
});
