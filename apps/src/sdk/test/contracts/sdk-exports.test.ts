/**
 * @forge/sdk - Tier 4 Contract: Public SDK Export Stability
 * Verifies all public symbols and functions are exported cleanly.
 */

import { describe, expect, it } from 'bun:test';
import * as ForgeSdk from '../../src/index';

describe('Tier 4 Contract: Public SDK Export Stability', () => {
  it('should export all essential foundation functions and classes', () => {
    // 1. Logger & Redaction
    expect(typeof ForgeSdk.createLogger).toBe('function');
    expect(typeof ForgeSdk.redactSensitiveData).toBe('function');
    expect(typeof ForgeSdk.explainLog).toBe('function');
    expect(typeof ForgeSdk.ForgeLogger).toBe('function');

    // 2. Error Handler
    expect(typeof ForgeSdk.createSafeHandler).toBe('function');

    // 3. Auth Guard
    expect(typeof ForgeSdk.authGuard).toBe('function');
    expect(typeof ForgeSdk.verifySessionToken).toBe('function');

    // 4. Directory & Hierarchy Client
    expect(typeof ForgeSdk.fetchOrgDirectory).toBe('function');
    expect(typeof ForgeSdk.getScopedHierarchy).toBe('function');
    expect(typeof ForgeSdk.getMyHierarchy).toBe('function');
    expect(typeof ForgeSdk.isManagerOf).toBe('function');

    // 5. Service Registry
    expect(typeof ForgeSdk.loadServiceRegistry).toBe('function');

    // 6. Client & Browser Bridge
    expect(typeof ForgeSdk.ForgeClient).toBe('function');
    expect(typeof ForgeSdk.initBrowserLogBridge).toBe('function');
  });
});
