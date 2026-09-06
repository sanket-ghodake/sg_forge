/**
 * Tier 4 Contract: Operational Probes Schema
 * @requirements [SR-DOC-001] [HLR-HUB-601]
 */

import { describe, expect, it } from 'bun:test';
import { createDocsHandler } from '../../src/server';

describe('Tier 4 Contract: Health & Readiness Probes [SR-DOC-001] [HLR-HUB-601]', () => {
  it('Arrange, Act, Assert: GET /health returns valid operational contract', async () => {
    // Arrange
    const handler = createDocsHandler();
    const req = new Request('http://localhost:3005/health');

    // Act
    const res = await handler(req);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('docs');
    expect(typeof data.port).toBe('number');
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.timestamp).toBe('string');
  });

  it('Arrange, Act, Assert: GET /ready returns valid readiness contract', async () => {
    // Arrange
    const handler = createDocsHandler();
    const req = new Request('http://localhost:3005/ready');

    // Act
    const res = await handler(req);
    const data = await res.json();

    // Assert
    expect([200, 503]).toContain(res.status);
    expect(data.service).toBe('docs');
    expect(typeof data.ready).toBe('boolean');
  });
});
