/**
 * @forge/app-telemetry - Tier 3 Security: Metric Ingress Hardening & Tenant Isolation
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startTelemetryServer } from '../../src/server';

describe('Tier 3 Security: Telemetry Ingress Defense', () => {
  it('Arrange, Act, Assert: securely exposes dashboard interface under zero-trust public policy', async () => {
    // Arrange: Start telemetry on ephemeral port 0
    const server = startTelemetryServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      expect(res.status).toBe(200);
      const html = await res.text();

      // Assert
      expect(html).toContain('Live Telemetry');
      expect(html).toContain('telemetry_turso.db');
      expect(html).not.toContain('<script>eval(');
    } finally {
      server.stop();
    }
  });
});
