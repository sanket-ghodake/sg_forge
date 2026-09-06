/**
 * @forge/auth/test/integration - 4-Pillar Observability & Telemetry Tests (Tier 2)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { authTelemetry } from '../../src/backend/telemetry';
import { handleBrowserLog } from '../../src/backend/api-handlers';

describe('Tier 2 Integration: 4-Pillar Observability Engine', () => {
  it('Pillar 1: Dual-Probe Health (livez & readyz) returns operational metrics', () => {
    // Arrange & Act
    const health = authTelemetry.getHealthStatus(3004);

    // Assert
    expect(health.status).toBe('ok');
    expect(health.livez).toBe(true);
    expect(health.readyz).toBe(true);
    expect(health.vitals.memoryUsedMb).toBeGreaterThan(0);
    expect(health.database.connected).toBe(true);
    expect(health.database.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('Pillar 2: Browser Telemetry Bridge forwards and records client logs', async () => {
    // Arrange
    const clientLogReq = new Request('http://localhost:3004/api/logs/browser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        level: 'WARN',
        message: 'Client-side network latency spike',
        metadata: { latencyMs: 420 },
      }),
    });

    // Act
    const res = await handleBrowserLog(clientLogReq);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');

    const recentLogs = authTelemetry.getRecentLogs(10, 'browser');
    expect(recentLogs.length).toBeGreaterThan(0);
    expect(recentLogs[0].message).toContain('latency spike');
    expect(recentLogs[0].source).toBe('browser');
  });

  it('Pillar 3 & 4: In-memory ring buffer captures backend, db, and docker logs with plain English summaries', () => {
    // Arrange & Act
    authTelemetry.recordLog('docker', 'INFO', '[SYSTEM_BOOT] Container started');
    authTelemetry.recordLog('db', 'DEBUG', 'Query executed: SELECT 1');
    authTelemetry.recordLog('app', 'INFO', 'Handled request /api/v1/auth/login');

    const allLogs = authTelemetry.getRecentLogs(20);

    // Assert
    expect(allLogs.length).toBeGreaterThanOrEqual(3);
    const appEntry = allLogs.find((l) => l.source === 'app');
    const dockerEntry = allLogs.find((l) => l.source === 'docker');

    expect(appEntry).toBeDefined();
    expect(dockerEntry).toBeDefined();
    expect(dockerEntry?.plainEnglishSummary).toBeDefined();
  });
});
