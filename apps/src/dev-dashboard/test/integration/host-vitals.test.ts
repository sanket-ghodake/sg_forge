/**
 * @forge/dev-dashboard - Host Infrastructure & Cloud Vitals Integration Test (3A Pattern)
 * Enterprise SRE Host Telemetry Standard: Validates multi-core CPU, memory, disk statfs, and network interfaces.
 */

import { describe, expect, it } from 'bun:test';
import { hostController } from '../../src/backend/host-controller';
import { renderHostTab } from '../../src/frontend/ui-renderer-host';
import { getHostStyles } from '../../src/frontend/ui-host-styles';
import { getHostDashboardScripts } from '../../src/frontend/ui-host-scripts';

describe('Tier 2 Integration: Host Infrastructure & Cloud Diagnostics', () => {
  it('Arrange, Act, Assert: Collects real multi-core CPU, memory, disk statfs, and network diagnostics', () => {
    // Arrange & Act
    const report = hostController.getHostDiagnostics();

    // Assert System
    expect(report.system.hostname).toBeDefined();
    expect(report.system.platform).toBeDefined();
    expect(report.system.bunVersion).toBeDefined();
    expect(report.system.pid).toBeGreaterThan(0);

    // Assert CPU
    expect(report.cpu.coreCount).toBeGreaterThan(0);
    expect(Array.isArray(report.cpu.loadAvg)).toBe(true);
    expect(report.cpu.cores.length).toBe(report.cpu.coreCount);

    // Assert Memory
    expect(report.memory.totalBytes).toBeGreaterThan(0);
    expect(report.memory.usedPercent).toBeGreaterThanOrEqual(0);
    expect(report.memory.usedPercent).toBeLessThanOrEqual(100);
    expect(report.memory.physicalHostTotalBytes).toBeGreaterThanOrEqual(report.memory.totalBytes);
    expect(['native', 'wsl2', 'docker', 'cgroup']).toContain(report.memory.virtualizationType);
    expect(report.memory.virtualizationNote).toBeDefined();
    expect(report.memory.processRssBytes).toBeGreaterThan(0);

    // Assert Disk Storage (statfs)
    expect(report.storage.rootVolume.totalBytes).toBeGreaterThan(0);
    expect(report.storage.rootVolume.usedPercent).toBeGreaterThanOrEqual(0);
    expect(report.storage.dataVolume.totalBytes).toBeGreaterThan(0);

    // Assert Network Interfaces
    expect(Array.isArray(report.network.interfaces)).toBe(true);
    expect(report.network.interfaces.length).toBeGreaterThan(0);
  });

  it('Arrange, Act, Assert: Host HTML, Astryx styles, and client scripts pass syntax integrity', () => {
    // Arrange & Act
    const html = renderHostTab();
    const styles = getHostStyles();
    const scripts = getHostDashboardScripts();

    // Assert HTML
    expect(html).toContain('id="tab-host"');
    expect(html).toContain('host-vitals-grid');
    expect(html).toContain('host-cores-grid');
    expect(html).toContain('host-storage-grid');
    expect(html).toContain('host-network-table-container');

    // Assert Styles
    expect(styles).toContain('.gauge-circle-container');
    expect(styles).toContain('.gauge-fill-ring');
    expect(styles).toContain('.core-bar-track');

    // Assert Script Syntax
    let parseErr: Error | null = null;
    try {
      new Function(scripts);
    } catch (err: any) {
      parseErr = err;
    }
    expect(parseErr).toBeNull();
  });
});
