/**
 * Custom Landing - Tier 2 Integration Test Suite
 * Asserts full request lifecycle and fallback behavior
 */

import { describe, expect, it } from 'bun:test';
import { createLandingHandler } from '../../src/server';

describe('Tier 2 Integration: Routing & Lifecycle', () => {
  it('Arrange, Act, Assert: dispatches live requests and handles unknown routes with 404', async () => {
    // Arrange
    const handler = createLandingHandler();

    // Act
    const resRoot = await handler(new Request('http://localhost:3000/'));
    const resNotFound = await handler(new Request('http://localhost:3000/unknown-path-xyz'));

    // Assert
    expect(resRoot.status).toBe(200);
    expect(resNotFound.status).toBe(404);
    const notFoundText = await resNotFound.text();
    expect(notFoundText).toContain('404');
    expect(notFoundText).toContain('Page Not Found');
  });
});
