/**
 * @forge/app-telemetry - Tier 2 Integration: Telemetry Dual-Probe Health & Database
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { startTelemetryServer } from '../../src/server';

describe('Tier 2 Integration: Telemetry Dedicated Database & Dual Probes [LLR-DB-002] [SR-TURSO-001] [HLR-TEL-002] [LLR-TEL-001.2]', () => {
  it('Arrange, Act, Assert: serves telemetry health probe with memory statistics and dual-probe signals', async () => {
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
      expect(json.livez).toBe(true);
      expect(json.readyz).toBe(true);
      expect(typeof json.memoryMb).toBe('number');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: serves /api/stream/metrics endpoint streaming active performance statistics', async () => {
    const server = startTelemetryServer(0);

    try {
      const res = await fetch(`http://localhost:${server.port}/api/stream/metrics`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('STREAM_OK');
      expect(typeof json.cpuPercent).toBe('number');
      expect(typeof json.memoryMb).toBe('number');
    } finally {
      server.stop();
    }
  });
});
