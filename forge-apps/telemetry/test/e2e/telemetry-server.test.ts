/**
 * @forge/app-telemetry - Tier 5 E2E: Server Lifecycle & Astryx UI
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startTelemetryServer } from '../../src/server';

describe('Tier 5 E2E: Telemetry Full Server Bootstrap [HLR-TEL-801] [LLR-SUB-004]', () => {
  it('Arrange, Act, Assert: serves telemetry dashboard with Astryx header and database badge on ephemeral port', async () => {
    // Arrange: Start on ephemeral port 0
    const server = startTelemetryServer(0);

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/`);
      const html = await res.text();

      // Assert
      expect(res.status).toBe(200);
      expect(html).toContain('Live Telemetry Dashboard');
      expect(html).toContain('telemetry_turso.db');
      expect(html).toContain('PUBLIC DASHBOARD');
    } finally {
      server.stop();
    }
  });
});
