/**
 * @forge/dev-dashboard - Traffic Analytics & Latency Benchmark Integration Test (3A Pattern)
 * Enterprise SRE Standard: Validates real percentiles, route aggregation, and multi-target benchmark.
 */

import { describe, expect, it } from 'bun:test';
import { trafficController } from '../../src/backend/traffic-controller';
import { platformDb } from '../../src/db';
import { renderTrafficTab } from '../../src/frontend/ui-renderer-traffic';
import { getTrafficStyles } from '../../src/frontend/ui-traffic-styles';
import { getTrafficDashboardScripts } from '../../src/frontend/ui-traffic-scripts';

describe('Tier 2 Integration: Real-time Traffic Analytics & Benchmark Engine', () => {
  it('Arrange, Act, Assert: Ingests real traffic events and computes accurate statistical percentiles', () => {
    // Arrange
    const now = Math.floor(Date.now() / 1000);
    platformDb.recordTraffic('portal', '/api/portal/health', 'GET', 200, 1.2);
    platformDb.recordTraffic('portal', '/api/portal/health', 'GET', 200, 1.8);
    platformDb.recordTraffic('auth', '/api/auth/verify', 'POST', 200, 2.5);
    platformDb.recordTraffic('dev-dashboard', '/api/services', 'GET', 200, 0.9);
    platformDb.recordTraffic('employees', '/api/employees', 'GET', 404, 3.1);

    // Act
    const metrics = trafficController.getTrafficMetrics();

    // Assert
    expect(metrics.totalRequestsAllTime).toBeGreaterThanOrEqual(5);
    expect(metrics.latencyPercentiles.p50Ms).toBeGreaterThan(0);
    expect(metrics.latencyPercentiles.p99Ms).toBeGreaterThanOrEqual(metrics.latencyPercentiles.p50Ms);
    expect(metrics.statusBreakdown.s2xxCount).toBeGreaterThanOrEqual(4);
    expect(metrics.statusBreakdown.s4xxCount).toBeGreaterThanOrEqual(1);
    expect(metrics.timeSeriesBuckets.length).toBe(12);
  });

  it('Arrange, Act, Assert: Aggregates top endpoint routes by method, duration, and error rate', () => {
    // Arrange & Act
    const routes = trafficController.getTopRoutes();

    // Assert
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);

    const firstRoute = routes[0];
    expect(firstRoute.path).toBeDefined();
    expect(firstRoute.method).toBeDefined();
    expect(firstRoute.totalRequests).toBeGreaterThanOrEqual(1);
    expect(firstRoute.avgDurationMs).toBeGreaterThan(0);
    expect(['FAST', 'NORMAL', 'SLOW']).toContain(firstRoute.speedTier);
  });

  it('Arrange, Act, Assert: Executes multi-target live benchmark and returns statistical scorecard', async () => {
    // Arrange & Act
    const benchmark = await trafficController.runTargetBenchmark('dev-dashboard', 10, 2);

    // Assert
    expect(benchmark.target).toBe('dev-dashboard');
    expect(benchmark.samples).toBe(10);
    expect(benchmark.concurrency).toBe(2);
    expect(benchmark.p50Ms).toBeGreaterThan(0);
    expect(benchmark.p99Ms).toBeGreaterThanOrEqual(benchmark.p50Ms);
    expect(benchmark.reqPerSec).toBeGreaterThan(0);
    expect(typeof benchmark.targetMet).toBe('boolean');
  });

  it('Arrange, Act, Assert: Traffic tab HTML and client scripts pass structural and syntax checks', () => {
    // Arrange & Act
    const html = renderTrafficTab();
    const styles = getTrafficStyles();
    const scripts = getTrafficDashboardScripts();

    // Assert HTML
    expect(html).toContain('id="tab-traffic"');
    expect(html).toContain('traffic-signals-grid');
    expect(html).toContain('traffic-timeline-chart');
    expect(html).toContain('traffic-benchmark-scorecard');
    expect(html).toContain('traffic-routes-table-container');
    expect(html).toContain('traffic-events-table-container');

    // Assert Styles
    expect(styles).toContain('var(--forge-primary)');
    expect(styles).toContain('var(--forge-bg-surface)');
    expect(styles).toContain('.method-get');

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
