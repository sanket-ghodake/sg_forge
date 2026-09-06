/**
 * @forge/dev-dashboard - Tier 2 Integration: Services Lifecycle & Rolling Sparklines
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { servicesController } from '../../src';

describe('Tier 2 Integration: Services Lifecycle Controller', () => {
  it('collects dual-probe indicators and historical rolling sparklines', () => {
    // Arrange & Act
    const statuses = servicesController.getAllHealthStatuses();

    // Assert
    expect(statuses.length).toBeGreaterThan(0);
    const first = statuses[0];
    expect(first.livez).toBeDefined();
    expect(first.readyz).toBeDefined();
    expect(Array.isArray(first.cpuSparkline)).toBe(true);
    expect(Array.isArray(first.ramSparkline)).toBe(true);
    expect(first.cpuSparkline.length).toBeGreaterThan(0);
    expect(first.ramSparkline.length).toBeGreaterThan(0);
  });

  it('manages service lifecycle toggles (start / stop / restart)', async () => {
    // Arrange & Act - Toggle Stop
    const stopResult = await servicesController.toggleService('landing', 'stop');
    expect(stopResult.success).toBe(true);

    // Act - Toggle Start
    const startResult = await servicesController.toggleService('landing', 'start');
    expect(startResult.success).toBe(true);

    // Act - Restart
    const restartResult = await servicesController.restartService('landing');
    expect(restartResult.success).toBe(true);
  });
});
