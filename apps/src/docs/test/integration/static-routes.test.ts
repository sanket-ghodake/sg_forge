/**
 * Tier 2 Integration: Static Asset Routes & Caching
 * @requirements [SR-DOC-001] [HLR-HUB-601] [LLR-SDK-005]
 */

import { describe, expect, it } from 'bun:test';
import { createDocsHandler } from '../../src/server';

describe('Tier 2 Integration: Static Routes & Ingress Normalization [SR-DOC-001] [HLR-HUB-601]', () => {
  it('Arrange, Act, Assert: serves documentation home page on /docs', async () => {
    // Arrange
    const handler = createDocsHandler();
    const req = new Request('http://localhost:3005/docs');

    // Act
    const res = await handler(req);

    // Assert
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');

    const html = await res.text();
    // Astryx Header & Brand
    expect(html).toContain('astryx-theme-toggle-btn');
    expect(html).toContain('SG FORGE');
    expect(html).toContain('DOCS');
    // Astryx Tooltips & Head Shield Script
    expect(html).toContain('initAstryxUniversalTooltips');
    expect(html).toContain('forge:v1:platform:theme');
    // Astryx Header Controls
    expect(html).toContain('astryx-controls');
  });

  it('Arrange, Act, Assert: returns 304 Not Modified when ETag matches', async () => {
    // Arrange
    const handler = createDocsHandler();
    const initialReq = new Request('http://localhost:3005/docs');
    const initialRes = await handler(initialReq);

    if (initialRes.status === 200) {
      const etag = initialRes.headers.get('etag');
      expect(etag).not.toBeNull();

      // Act
      const cachedReq = new Request('http://localhost:3005/docs', {
        headers: { 'if-none-match': etag! },
      });
      const cachedRes = await handler(cachedReq);

      // Assert
      expect(cachedRes.status).toBe(304);
    }
  });

  it('Arrange, Act, Assert: returns structured 404 response for non-existent routes', async () => {
    // Arrange
    const handler = createDocsHandler();
    const req = new Request('http://localhost:3005/docs/non-existent-document-xyz');

    // Act
    const res = await handler(req);

    // Assert
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain('404');
  });
});
