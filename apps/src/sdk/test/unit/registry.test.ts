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

  it('Arrange, Act, Assert: explicitly commented APP_* keys are never resurrected by process.env', () => {
    // Arrange: Create a temporary env file with a commented out APP_MOCK
    const tempEnv = '/tmp/test-commented.env';
    const content = '# APP_MOCK="Mock App|8999|/apps/mock|Tools|General|app-mock"\n';
    require('node:fs').writeFileSync(tempEnv, content, 'utf8');

    // Act: Set process.env.APP_MOCK and load with explicit envPath
    process.env.APP_MOCK = 'Mock App|8999|/apps/mock|Tools|General|app-mock';
    const services = loadServiceRegistry({ envPath: tempEnv });

    // Assert: APP_MOCK must not be included
    const mockApp = services.find((s) => s.id === 'mock');
    expect(mockApp).toBeUndefined();

    // Cleanup
    delete process.env.APP_MOCK;
    try { require('node:fs').unlinkSync(tempEnv); } catch {}
  });
});

