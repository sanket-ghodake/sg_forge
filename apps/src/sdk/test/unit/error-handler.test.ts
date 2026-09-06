/**
 * @forge/sdk - Tier 1 Unit: RFC 7807 Error Handler Wrapper
 */

import { describe, expect, it } from 'bun:test';
import { createSafeHandler } from '../../src/error-handler';

describe('Tier 1 Unit: RFC 7807 Safe Handler Wrapper [LLR-SDK-004]', () => {
  it('should wrap successful handler and inject immutable x-trace-id header', async () => {
    const safeHandler = createSafeHandler('test-service', async (req, ctx) => {
      return Response.json({ ok: true, receivedTrace: ctx?.traceId });
    });

    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'x-trace-id': 'trace-12345' },
    });

    const res = await safeHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-trace-id')).toBe('trace-12345');

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.receivedTrace).toBe('trace-12345');
  });

  it('should catch unhandled exceptions and format standard RFC 7807 problem response', async () => {
    const safeHandler = createSafeHandler('test-service', async () => {
      throw new Error('Simulated internal failure');
    });

    const req = new Request('http://localhost:3000/api/crash');
    const res = await safeHandler(req);

    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(res.headers.get('x-trace-id')).toBeDefined();

    const body = await res.json();
    expect(body.title).toBe('Internal Server Error');
    expect(body.status).toBe(500);
    expect(body.service).toBe('test-service');
    expect(body.traceId).toBeDefined();
  });

  it('should render Astryx 500 HTML error page when browser requests text/html on UI route', async () => {
    const safeHandler = createSafeHandler('portal', async () => {
      throw new Error('Simulated UI crash');
    });

    const req = new Request('http://localhost:3000/portal/dashboard', {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'x-trace-id': 'trace-html-500',
      },
    });
    const res = await safeHandler(req);

    expect(res.status).toBe(500);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('x-trace-id')).toBe('trace-html-500');

    const html = await res.text();
    expect(html).toContain('500 Internal Server Error');
    expect(html).toContain('trace-html-500');
    expect(html).toContain('portal');
  });
});
