/**
 * @forge/platform - Chaos & Fault Injection: Uncaught Error Handling & RFC 7807 Boundaries
 * Tests error boundary recovery and problem details compliance under unexpected faults.
 */

import { describe, expect, it } from 'bun:test';
import { createSafeHandler } from '@forge/sdk';

describe('Chaos & Fault Injection: RFC 7807 Enterprise Problem Boundaries', () => {
  it('should intercept chaotic unhandled exceptions and emit RFC 7807 application/problem+json', async () => {
    // 1. Arrange: Create a deliberately faulty route handler
    const faultyHandler = createSafeHandler('chaos-service', async (req) => {
      const url = new URL(req.url);
      if (url.searchParams.get('chaos') === 'throw') {
        throw new Error('Simulated Chaos Engineering Outage!');
      }
      return Response.json({ success: true });
    });

    const traceId = crypto.randomUUID();

    // 2. Act: Trigger the simulated fault
    const req = new Request('http://localhost:3000/api/fault?chaos=throw', {
      headers: { 'x-trace-id': traceId },
    });

    const response = await faultyHandler(req);

    // 3. Assert: Verify RFC 7807 Problem JSON structure
    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(response.headers.get('x-trace-id')).toBe(traceId);

    const problem = await response.json();
    expect(problem.type).toBe('https://forge.internal/errors/internal-server-error');
    expect(problem.title).toBe('Internal Server Error');
    expect(problem.status).toBe(500);
    expect(problem.service).toBe('chaos-service');
    expect(problem.traceId).toBe(traceId);
    expect(problem.timestamp).toBeDefined();
  });
});
