/**
 * @forge/sdk - Tier 1 Unit: Service Registry Loader
 */

import { describe, expect, it } from 'bun:test';
import { loadServiceRegistry } from '../../src/registry';

describe('Tier 1 Unit: Service Registry Loader [LLR-SDK-001] [HLR-SDK-301]', () => {
  it('should load default landing hub and registered apps from environment', () => {
    const services = loadServiceRegistry();

    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);

    const landing = services.find((s) => s.id === 'landing');
    expect(landing).toBeDefined();
    expect(landing?.path).toBe('/');
    expect(landing?.isPublic).toBe(true);

    const portal = services.find((s) => s.id === 'portal');
    if (portal) {
      expect(portal.path).toBe('/portal');
      expect(portal.port).toBe(3001);
    }
  });
});
