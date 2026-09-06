/**
 * @forge/sdk - Tier 5 E2E: Unified SDK Lifecycle & Error Boundary Pipeline
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createLogger, createSafeHandler, getDatabaseClient, isTestEnvironment } from '../../src';

describe('Tier 5 E2E: SDK Full Runtime Lifecycle Pipeline [LLR-SDK-007]', () => {
  it('Arrange, Act, Assert: end-to-end request processing with safe handler, database client, and structured logger', async () => {
    // 1. Arrange: Initialize SDK services
    expect(isTestEnvironment()).toBe(true);

    const logger = createLogger('sdk-e2e-service');
    expect(logger).toBeDefined();

    // Isolated test database client
    const testDb = getDatabaseClient('test-sdk-lifecycle.db');
    testDb.run('CREATE TABLE IF NOT EXISTS sdk_e2e_ping (id TEXT PRIMARY KEY, val INTEGER);');
    testDb.run('INSERT OR REPLACE INTO sdk_e2e_ping VALUES (?, ?);', ['ping_1', Date.now()]);

    const row = testDb.query('SELECT * FROM sdk_e2e_ping WHERE id = ?;').get('ping_1') as { id: string; val: number };
    expect(row.id).toBe('ping_1');

    // 2. Act: Wrap request pipeline in createSafeHandler
    const handler = createSafeHandler('sdk-e2e-service', async (req: Request) => {
      const url = new URL(req.url);
      if (url.pathname === '/throw') {
        throw new Error('Synthetic unexpected lifecycle failure');
      }
      return Response.json({ status: 'ok', data: row });
    });

    const successReq = new Request('http://localhost:3000/data');
    const successRes = await handler(successReq);
    const successData = await successRes.json();

    // 3. Assert: Successful response
    expect(successRes.status).toBe(200);
    expect(successData.status).toBe('ok');
    expect(successData.data.id).toBe('ping_1');

    // 4. Act & Assert: Error boundary RFC 7807 problem details conversion
    const errorReq = new Request('http://localhost:3000/throw');
    const errorRes = await handler(errorReq);
    const errorData = await errorRes.json();

    expect(errorRes.status).toBe(500);
    expect(errorData.type).toContain('errors/internal-server-error');
    expect(errorData.traceId).toBeDefined();
    expect(errorData.title).toBeDefined();
  });
});
