/**
 * @forge/app-telemetry/test/unit - Telemetry Metric Aggregator Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { telemetryDb } from '../../src/db';

describe('Tier 1 Unit: Telemetry Metrics Engine [HLR-TEL-001] [LLR-TEL-001.1]', () => {
  it('Arrange, Act, Assert: records and retrieves telemetry snapshot in isolated database', () => {
    // Arrange
    const snapId = `snap_${Date.now()}`;
    const cpu = 14.5;
    const memory = 128.4;
    const now = Date.now();

    // Act
    telemetryDb.run(
      'INSERT INTO telemetry_snapshots (id, cpu_percent, memory_mb, active_services, timestamp) VALUES (?, ?, ?, ?, ?);',
      [snapId, cpu, memory, 8, now]
    );

    const record = telemetryDb
      .query('SELECT * FROM telemetry_snapshots WHERE id = ?;')
      .get(snapId) as any;

    // Assert
    expect(record).toBeDefined();
    expect(record.id).toBe(snapId);
    expect(record.cpu_percent).toBe(14.5);
    expect(record.memory_mb).toBe(128.4);
    expect(record.active_services).toBe(8);

    // Cleanup
    telemetryDb.run('DELETE FROM telemetry_snapshots WHERE id = ?;', [snapId]);
  });
});
