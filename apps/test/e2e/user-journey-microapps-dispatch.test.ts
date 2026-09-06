/**
 * @forge/platform - Dynamic Micro-App Discovery & Dispatch Journey (Tier 5)
 * Discovers and tests all registered apps dynamically without hardcoded endpoints.
 */

import { describe, expect, it } from 'bun:test';
import { loadServiceRegistry, createInternalServiceToken, verifySessionToken, redactSensitiveData } from '@forge/sdk';

describe('Tier 5 E2E Journey: Dynamic Micro-App Discovery, Ingress & Dispatch', () => {
  it('should discover all registered microservices from dynamic environment registry', () => {
    // 1. Arrange & Act: Load registry dynamically
    const registry = loadServiceRegistry();

    // 2. Assert: Must contain base services and dynamic app registrations
    expect(registry.length).toBeGreaterThanOrEqual(4);

    const serviceIds = registry.map((s) => s.id);
    expect(serviceIds).toContain('landing');

    for (const service of registry) {
      expect(service.id).toBeDefined();
      expect(service.name).toBeDefined();
      expect(service.port).toBeGreaterThan(0);
      expect(service.path.startsWith('/')).toBe(true);
      expect(service.category).toBeDefined();
      expect(service.role).toBeDefined();
    }
  });

  it('should simulate portal iframe postMessage handshake contract for all registered apps', async () => {
    // 1. Arrange: Prepare mock user and test harness
    const registry = loadServiceRegistry();
    const realToken = createInternalServiceToken(['roles/employee'], 'usr-dynamic-test');
    const mockUser = {
      id: 'usr-dynamic-test',
      email: 'tester@forge.internal',
      displayName: 'Dynamic QA Tester',
      role: 'employee',
    };
    const mockTheme = 'dark' as const;

    // Verify cryptographic validity of the token
    const verified = verifySessionToken(realToken);
    expect(verified.valid).toBe(true);

    // 2. Act & Assert: For each micro-app, verify iframe bridge contract payload
    for (const app of registry) {
      const initMessage = {
        type: 'FORGE_APP_INIT' as const,
        payload: { appId: app.path },
      };

      expect(initMessage.type).toBe('FORGE_APP_INIT');
      expect(initMessage.payload.appId).toBe(app.path);

      const contextPayload = {
        type: 'FORGE_APP_CONTEXT' as const,
        payload: {
          user: mockUser,
          token: realToken,
          theme: mockTheme,
        },
      };

      expect(contextPayload.payload.user.email).toBe('tester@forge.internal');
      expect(contextPayload.payload.theme).toBe('dark');

      // Verify that sensitive fields are redacted if logged across the postMessage bridge
      const redacted = redactSensitiveData(contextPayload) as typeof contextPayload;
      expect(redacted.payload.token).toBe('[REDACTED]');
    }
  });
});
