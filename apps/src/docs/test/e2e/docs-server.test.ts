/**
 * Tier 5 E2E: Full Server Lifecycle & Socket Verification
 * @requirements [SR-DOC-001] [HLR-HUB-601]
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startDocsServer } from '../../src/server';

describe('Tier 5 E2E: Docs Server Full Lifecycle [SR-DOC-001] [HLR-HUB-601]', () => {
  let server: ReturnType<typeof startDocsServer>;
  const testPort = 3195;

  beforeAll(() => {
    server = startDocsServer(testPort);
  });

  afterAll(() => {
    if (server) {
      server.stop(true);
    }
  });

  it('Arrange, Act, Assert: serves live operational health probe over HTTP socket', async () => {
    // Arrange & Act
    const res = await fetch(`http://127.0.0.1:${testPort}/health`);
    const data = (await res.json()) as { status: string; service: string };

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('docs');
  });

  it('Arrange, Act, Assert: serves documentation base path over HTTP socket', async () => {
    // Arrange & Act
    const res = await fetch(`http://127.0.0.1:${testPort}/docs/`);

    // Assert
    expect([200, 404]).toContain(res.status);
    expect(res.headers.get('content-type')).toContain('text/html');
  });
});
