/**
 * @forge/sdk - Tier 1 Unit: External Upstream & Remote Service Ingress Test
 */

import { describe, expect, it } from 'bun:test';
import { loadServiceRegistry } from '../../src/registry';

describe('Tier 1 Unit: External Service & Remote Ingress Resolution [LLR-SDK-005]', () => {
  it('should resolve standard container upstreams and custom external hosts', () => {
    const services = loadServiceRegistry();
    const telemetry = services.find((s) => s.id === 'telemetry');

    expect(telemetry).toBeDefined();
    expect(telemetry?.upstreamUrl).toContain(':8087');
    expect(telemetry?.path).toBe('/apps/telemetry');
  });
});
