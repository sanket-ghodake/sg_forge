/**
 * @forge/app-telemetry - Tier 4 Contract: Health & Problem Contracts
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startTelemetryServer } from '../../src/server';

describe('Tier 4 Contract: Telemetry Health Probe Schema [HLR-TEL-003] [LLR-TEL-002.1]', () => {
  it('Arrange, Act, Assert: returns valid JSON health specification on /health', async () => {
    // Arrange: Start on ephemeral port 0
    const server = startTelemetryServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/health`);
      const json: any = await res.json();

      // Assert
      expect(res.status).toBe(200);
      expect(json.status).toBe('ok');
      expect(json.app).toBe('telemetry');
      expect(typeof json.livez).toBe('boolean');
      expect(typeof json.readyz).toBe('boolean');
      expect(typeof json.uptime).toBe('number');
    } finally {
      server.stop();
    }
  });
});
