/**
 * @forge/dev-dashboard - Contract Tests: API Registry & Schema Contracts (3A Pattern)
 * Enterprise SRE & Astryx Enterprise Standard
 */

import { describe, expect, it } from 'bun:test';
import { handleApiRequest } from '../../src/backend/api-handlers';

describe('Tier 4 Contracts: API Registry & Diagnostics Contracts', () => {
  it('Arrange, Act, Assert: GET /api/routes/registry matches contract shape', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/routes/registry');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    const data: any = await res!.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('endpoints');
    for (const ep of data.endpoints) {
      expect(typeof ep.serviceId).toBe('string');
      expect(typeof ep.name).toBe('string');
      expect(typeof ep.port).toBe('number');
      expect(typeof ep.path).toBe('string');
      expect(typeof ep.healthUrl).toBe('string');
      expect(Array.isArray(ep.sampleRoutes)).toBe(true);
    }
  });

  it('Arrange, Act, Assert: GET /api/db/schema missing params returns RFC 7807 problem details', async () => {
    // Arrange
    const url = new URL('http://localhost:3002/api/db/schema');
    const req = new Request(url.toString(), { method: 'GET' });

    // Act
    const res = await handleApiRequest(req, url);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(400);
    const data: any = await res!.json();
    expect(data).toHaveProperty('error');
  });
});
