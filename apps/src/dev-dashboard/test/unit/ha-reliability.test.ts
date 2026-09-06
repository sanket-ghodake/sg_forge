/**
 * @forge/dev-dashboard - 24/7 High-Availability & Reliability Diagnostics Unit Tests (2026 LTS)
 * Enterprise SRE Standards: Arrange, Act, Assert testing for OS detection, persistence, restart policies, and autoheal.
 */

import { describe, expect, it } from 'bun:test';
import { hostController } from '../../src/backend/host-controller';

describe('Tier 1 Unit: 24/7 High-Availability & Persistence Telemetry', () => {
  it('Arrange, Act, Assert: getHighAvailabilityReport returns structured environment & reliability metrics', () => {
    // Arrange
    const startTime = Date.now();

    // Act
    const report = hostController.getHighAvailabilityReport();

    // Assert
    expect(report).toBeDefined();
    expect(report.timestamp).toBeGreaterThanOrEqual(startTime);
    expect(typeof report.environment.osType).toBe('string');
    expect(typeof report.environment.osName).toBe('string');
    expect(typeof report.environment.hostname).toBe('string');
    expect(typeof report.environment.hostUptimeSeconds).toBe('number');
    expect(typeof report.environment.processUptimeSeconds).toBe('number');

    // Repo Invariants
    expect(report.repoInvariants.restartPolicy).toContain('unless-stopped');
    expect(report.repoInvariants.restartPolicyStatus).toBe('active');
    expect(report.repoInvariants.healthProbesStatus).toBe('active');
    expect(report.repoInvariants.autohealStatus).toBe('configured');
    expect(typeof report.repoInvariants.freeSpaceMb).toBe('number');

    // Host Requirements
    expect(report.hostRequirements.dockerLiveRestoreStatus).toBe('recommended');
    expect(typeof report.hostRequirements.systemdServiceAvailable).toBe('boolean');
    expect(['ubuntu', 'wsl', 'macos', 'windows']).toContain(report.hostRequirements.platformGuideKey);
  });
});
