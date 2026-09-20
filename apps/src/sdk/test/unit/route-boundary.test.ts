/**
 * @forge/sdk - Route Boundary Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 * Validates Stripe/Cloudflare content negotiation, RFC 7807 problem details, and Astryx 404 HTML.
 */

import { describe, expect, it } from 'bun:test';
import { renderRouteNotFound, renderStatusError, isApiRequest } from '../../src/route-boundary';

describe('Tier 1 Unit: Route Boundary Content Negotiation [LLR-SDK-004]', () => {
  it('identifies API vs Browser requests correctly', () => {
    // Arrange
    const apiReq1 = new Request('http://localhost:3000/api/v1/users');
    const apiReq2 = new Request('http://localhost:3000/users', {
      headers: { 'Accept': 'application/json' },
    });
    const htmlReq1 = new Request('http://localhost:3000/users', {
      headers: { 'Accept': 'text/html,application/xhtml+xml' },
    });
    const htmlReq2 = new Request('http://localhost:3000/users');

    // Act & Assert
    expect(isApiRequest(apiReq1)).toBe(true);
    expect(isApiRequest(apiReq2)).toBe(true);
    expect(isApiRequest(htmlReq1)).toBe(false);
    expect(isApiRequest(htmlReq2)).toBe(false);
  });

  it('renders RFC 7807 JSON for API 404 requests with trace ID and no-store headers', async () => {
    // Arrange
    const req = new Request('http://localhost:3000/api/v1/unknown-endpoint', {
      headers: { 'x-trace-id': 'trace-test-123' },
    });

    // Act
    const res = renderRouteNotFound({ req, appName: 'Portal Service' });
    const json = await res.json();

    // Assert
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-trace-id')).toBe('trace-test-123');
    expect(json.type).toBe('https://tools.ietf.org/html/rfc7807');
    expect(json.title).toBe('Not Found');
    expect(json.status).toBe(404);
    expect(json.detail).toContain('/api/v1/unknown-endpoint');
    expect(json.traceId).toBe('trace-test-123');
  });

  it('renders Astryx HTML for browser navigation 404 requests', async () => {
    // Arrange
    const req = new Request('http://localhost:3000/some/unknown/page', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'x-trace-id': 'trace-browser-456',
      },
    });

    // Act
    const res = renderRouteNotFound({
      req,
      appName: 'Developer Dashboard',
      primaryActionText: 'Return to Dashboard',
      primaryActionHref: '/devcenter',
    });
    const html = await res.text();

    // Assert
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-trace-id')).toBe('trace-browser-456');
    expect(html).toContain('404');
    expect(html).toContain('Page Not Found');
    expect(html).toContain('Developer Dashboard');
    expect(html).toContain('Return to Dashboard');
    expect(html).toContain('trace-browser-456');
    expect(html).not.toMatch(/[⚠️🔍🔒🛡️⏳⚡🔌🛠️]/);
  });

  it('renders generic status errors (e.g. 405, 504) with proper content negotiation', async () => {
    // Arrange: API 405
    const apiReq = new Request('http://localhost:3000/api/read-only', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    const apiRes = renderStatusError({ req: apiReq, statusCode: 405, appName: 'Hub Service' });
    const apiJson = await apiRes.json();

    expect(apiRes.status).toBe(405);
    expect(apiJson.status).toBe(405);

    // Arrange: Browser 504
    const htmlReq = new Request('http://localhost:3000/heavy-report', {
      headers: { 'Accept': 'text/html' },
    });
    const htmlRes = renderStatusError({ req: htmlReq, statusCode: 504, appName: 'Hub Service' });
    const html = await htmlRes.text();

    expect(htmlRes.status).toBe(504);
    expect(html).toContain('504');
    expect(html).toContain('Gateway Timeout');
  });
});
