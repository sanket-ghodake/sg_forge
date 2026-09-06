/**
 * @forge/dev-dashboard - Overview Redesign Verification Test (3A Pattern)
 * Validates the new Developer-First Overview Page UI, topology pipeline, 4 golden vitals, and console split layout.
 */

import { describe, expect, it } from 'bun:test';
import { renderDashboardHtml } from '../../src/frontend/ui-renderer';
import { renderOverviewTab } from '../../src/frontend/ui-renderer-overview';
import { getOverviewStyles } from '../../src/frontend/ui-overview-styles';
import { getOverviewDashboardScripts } from '../../src/frontend/ui-overview-scripts';

describe('Tier 5 E2E & Component Verification: Redesigned Overview Page', () => {
  it('Arrange, Act, Assert: Overview tab renders all 6 core developer components', () => {
    // Arrange
    const overviewHtml = renderOverviewTab();

    // Act & Assert
    // 1. Hero Health Banner
    expect(overviewHtml).toContain('overview-hero-card');
    expect(overviewHtml).toContain('overview-cluster-status');
    expect(overviewHtml).toContain('overview-cluster-icon');
    expect(overviewHtml).toContain('runFleetBenchmark()');
    expect(overviewHtml).toContain('runOverviewHealthProbe()');
    expect(overviewHtml).toContain('flushTelemetryBuffer()');

    // 2. 4 Golden Vitals Cards
    expect(overviewHtml).toContain('overview-vitals-grid');
    expect(overviewHtml).toContain('vital-latency-val');
    expect(overviewHtml).toContain('vital-ram-val');
    expect(overviewHtml).toContain('vital-ram-bar');
    expect(overviewHtml).toContain('vital-events-val');
    expect(overviewHtml).toContain('vital-db-val');

    // 3. Interactive Topology Architecture Pipeline
    expect(overviewHtml).toContain('overview-topology-section');
    expect(overviewHtml).toContain('overview-topology-pipeline');
    expect(overviewHtml).toContain('1. Ingress');
    expect(overviewHtml).toContain('2. Frontend SPA');
    expect(overviewHtml).toContain('3. Platform APIs');
    expect(overviewHtml).toContain('4. Micro-Apps');
    expect(overviewHtml).toContain('5. Data & Logs');

    // 4. High-Density Active Services Matrix
    expect(overviewHtml).toContain('overview-services-fleet-grid');

    // 5. Split-Screen Operations Console
    expect(overviewHtml).toContain('overview-console-grid');
    expect(overviewHtml).toContain('overview-terminal');
    expect(overviewHtml).toContain('console-terminal-card');
    expect(overviewHtml).toContain('console-radar-card');
    expect(overviewHtml).toContain('radar-db-name');
    expect(overviewHtml).toContain('runOverviewQuickSql()');

    // 6. Environment Cheatsheet Strip
    expect(overviewHtml).toContain('overview-env-strip');
    expect(overviewHtml).toContain('Bun v1.3.14 (LTS)');
  });

  it('Arrange, Act, Assert: Overview scripts pass pure JavaScript syntax parsing', () => {
    // Arrange
    const scripts = getOverviewDashboardScripts();

    // Act
    let parseError: Error | null = null;
    try {
      new Function(scripts);
    } catch (err: any) {
      parseError = err;
    }

    // Assert
    expect(parseError).toBeNull();
  });

  it('Arrange, Act, Assert: Overview Astryx CSS strictly uses --forge-* tokens and viewport containment', () => {
    // Arrange
    const styles = getOverviewStyles();

    // Act & Assert
    expect(styles).toContain('var(--forge-bg-surface)');
    expect(styles).toContain('var(--forge-primary)');
    expect(styles).toContain('var(--forge-border)');
    expect(styles).toContain('var(--forge-text-main)');
    expect(styles).toContain('var(--forge-text-muted)');
    expect(styles).toContain('@media (max-width:');
  });

  it('Arrange, Act, Assert: Complete SPA document includes redesigned Overview tab', () => {
    // Arrange & Act
    const fullHtml = renderDashboardHtml();

    // Assert
    expect(fullHtml).toContain('id="tab-overview"');
    expect(fullHtml).toContain('overview-hero-card');
    expect(fullHtml).toContain('overview-topology-pipeline');
    expect(fullHtml).toContain('overview-services-fleet-grid');
    expect(fullHtml).toContain('overview-console-grid');
  });
});
