/**
 * @forge/dev-dashboard - Tier 1 Unit: Vitals & Ring-Buffer Telemetry Engine
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { telemetryEngine, servicesController } from '../../src';

describe('Tier 1 Unit: Vitals & Telemetry Engine [HLR-DEV-501]', () => {
  it('calculates accurate system vitals with CPU load and memory metrics', () => {
    // Arrange & Act
    const vitals = telemetryEngine.getSystemVitals();

    // Assert
    expect(vitals.totalMemBytes).toBeGreaterThan(0);
    expect(vitals.freeMemBytes).toBeGreaterThan(0);
    expect(vitals.memPercent).toBeGreaterThanOrEqual(0);
    expect(vitals.memPercent).toBeLessThanOrEqual(100);
    expect(vitals.physicalHostTotalBytes).toBeGreaterThanOrEqual(vitals.totalMemBytes);
    expect(['native', 'wsl2', 'docker', 'cgroup']).toContain(vitals.virtualizationType || 'native');
    expect(vitals.virtualizationNote).toBeDefined();
    expect(vitals.cpuCount).toBeGreaterThan(0);
    expect(Array.isArray(vitals.cpuLoad)).toBe(true);
    expect(vitals.hostUptimeSeconds).toBeGreaterThan(0);
  });

  it('aggregates services vitals summary for the 4 Golden Cards', () => {
    // Arrange & Act
    const summary = servicesController.getServicesVitalsSummary();

    // Assert
    expect(summary.totalServices).toBeGreaterThan(0);
    expect(summary.onlineCount).toBeGreaterThanOrEqual(0);
    expect(summary.sloAvailabilityPercent).toBeGreaterThanOrEqual(0);
    expect(summary.sloAvailabilityPercent).toBeLessThanOrEqual(100);
    expect(summary.avgCpuPercent).toBeGreaterThanOrEqual(0);
    expect(summary.storageSizeBytes).toBeGreaterThan(0);
    expect(summary.autoVacuum).toBe('ACTIVE');
  });

  it('pushes, retrieves, and limits logs within in-memory ring buffer', () => {
    // Arrange
    const serviceName = 'unit-vitals-test';
    const logMsg = 'Ring buffer test message';

    // Act
    telemetryEngine.pushLog(serviceName, 'INFO', logMsg, 'app', 'trace-123', { tag: 'test' });
    const logs = telemetryEngine.getRecentLogs(5, serviceName);

    // Assert
    expect(logs.length).toBeGreaterThan(0);
    const last = logs[logs.length - 1];
    expect(last.service).toBe(serviceName);
    expect(last.message).toBe(logMsg);
    expect(last.traceId).toBe('trace-123');
  });
});
