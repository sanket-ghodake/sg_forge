/**
 * @forge/dev-dashboard - Tier 1 Unit: Stream Resilience & Sleep/Wake Auto-Recovery
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { getDashboardScripts } from '../../src/frontend/ui-scripts';
import { getLogDashboardScripts } from '../../src/frontend/ui-log-scripts';
import { telemetryEngine } from '../../src/backend/telemetry';

describe('Tier 1 Unit: Telemetry Stream Resilience & Auto-Recovery', () => {
  it('registers visibilitychange, online, and focus lifecycle listeners in ui-scripts', () => {
    // Arrange & Act
    const scripts = getDashboardScripts();

    // Assert: Verifies OS sleep/wake and network reconnection listeners are present
    expect(scripts).toContain("document.addEventListener('visibilitychange'");
    expect(scripts).toContain("window.addEventListener('online'");
    expect(scripts).toContain("window.addEventListener('focus'");
    expect(scripts).toContain('function refreshActiveTab()');
    expect(scripts).toContain('reconnectSSE()');
  });

  it('implements self-healing auto-reconnect watchdog in ui-log-scripts', () => {
    // Arrange & Act
    const logScripts = getLogDashboardScripts();

    // Assert: Verifies self-healing auto-reconnect logic and debounce locks
    expect(logScripts).toContain('isReconnecting');
    expect(logScripts).toContain('Date.now() - lastSseEventTime > 20000');
    expect(logScripts).toContain('Auto-Healing Stream...');
    expect(logScripts).toContain('function reconnectSSE()');
    expect(logScripts).toContain('loadActiveTabLogs()');
  });

  it('emits keepalive ping frames and system vitals on the telemetry engine', () => {
    // Arrange
    let capturedFrames: string[] = [];
    const mockController = {
      enqueue: (data: Uint8Array) => {
        capturedFrames.push(new TextDecoder().decode(data));
      },
    } as any;

    // Act
    telemetryEngine.registerSSEClient(mockController);
    telemetryEngine.broadcastPing();
    telemetryEngine.broadcastVitalsTick();
    telemetryEngine.removeSSEClient(mockController);

    // Assert
    expect(capturedFrames.length).toBeGreaterThanOrEqual(3); // init + ping + vitals
    expect(capturedFrames.some(f => f.startsWith(': ping'))).toBe(true);
    expect(capturedFrames.some(f => f.includes('event: vitals'))).toBe(true);
  });
});
