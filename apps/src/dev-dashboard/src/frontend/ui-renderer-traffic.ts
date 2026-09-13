/**
 * @forge/dev-dashboard - Vercel-Style True Telemetry & 1-Year Observability Tab (2026 LTS)
 * Enterprise Standard: Golden Signals, Machine Info, Client IP Geolocation, 1-Year Rollup Visualizer.
 * @requirements [HLR-DEV-501] [LLR-TEL-001] [HLR-UI-401] [LLR-UI-001]
 */

import { astryxIcons } from '@forge/ui';

export function renderTrafficTab(): string {
  return `
    <!-- Tab 7: Vercel-Style True Telemetry & Observability Studio -->
    <section id="tab-traffic" class="tab-pane">
      
      <!-- 1. Header Command Card with Time Range & Controls -->
      <div class="traffic-header-card">
        <div>
          <h2 style="font-size: 1.15rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 700; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.traffic}</span>
            True Telemetry & Web Observability Studio
            <span class="astryx-micro-pill" style="color: var(--forge-success); border-color: rgba(16,185,129,0.3);">LIVE 1-YEAR ENGINE</span>
          </h2>
          <p style="color: var(--forge-text-muted); font-size: 0.8rem; margin: 0;">
            Real-time client IP capture, machine specifications, browser/OS demographics, and 1-year historical rollups inspired by Vercel.
          </p>
        </div>

        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <!-- Traffic Category Filter Pills -->
          <div class="telemetry-category-picker" id="telemetry-category-pills">
            <button class="category-pill active" data-category="user" onclick="setTelemetryCategory('user')" title="Real human visitors and external client traffic (probes excluded)">👤 End Users</button>
            <button class="category-pill" data-category="all" onclick="setTelemetryCategory('all')" title="Entire infrastructure request volume">🌐 All Traffic</button>
            <button class="category-pill" data-category="mesh" onclick="setTelemetryCategory('mesh')" title="Internal service-to-service calls and liveness health checks">⚙️ Internal &amp; Probes</button>
          </div>

          <!-- Time Range Selector Pills -->
          <div class="telemetry-range-picker" id="telemetry-range-pills">
            <button class="range-pill active" data-range="24h" onclick="setTelemetryRange('24h')">24 Hours</button>
            <button class="range-pill" data-range="7d" onclick="setTelemetryRange('7d')">7 Days</button>
            <button class="range-pill" data-range="30d" onclick="setTelemetryRange('30d')">30 Days</button>
            <button class="range-pill" data-range="90d" onclick="setTelemetryRange('90d')">90 Days</button>
            <button class="range-pill" data-range="1y" onclick="setTelemetryRange('1y')">1 Year (365d)</button>
          </div>

          <!-- Service Scope Selector -->
          <select id="telemetry-app-filter" class="form-input" style="height: 28px; padding: 0.15rem 1.4rem 0.15rem 0.55rem; font-size: 0.74rem;" onchange="onTelemetryAppChange(this.value)">
            <option value="all">All Services (Global)</option>
            <option value="portal">Portal SPA</option>
            <option value="dev-dashboard">Dev Dashboard</option>
            <option value="auth">Auth & Directory</option>
            <option value="landing">Landing Hub</option>
            <option value="code">Cloud VS Code</option>
          </select>

          <!-- Privacy IP Masking Toggle -->
          <button class="astryx-btn btn-outline" id="btn-toggle-mask-ip" style="padding: 0.28rem 0.6rem; font-size: 0.74rem;" onclick="toggleIpMasking()" title="Toggle Raw Client IP vs Anonymized Masked IP">
            👁️ Raw IP
          </button>

          <!-- Developer 1-Year Backfill Seeder -->
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.6rem; font-size: 0.74rem;" onclick="promptSeedHistorical()" title="Seed 365 days of realistic historical telemetry data">
            ⚡ Seed 1-Year
          </button>

          <!-- Export CSV -->
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.6rem; font-size: 0.74rem;" onclick="exportTelemetryCsv()">
            ${astryxIcons.download} Export CSV
          </button>
        </div>
      </div>

      <!-- 2. 5 Golden Telemetry KPI Scorecards (Vercel-Style) -->
      <div class="traffic-signals-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <!-- KPI 1: Unique Visitors -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Unique Visitors</span>
            <span class="astryx-micro-pill" style="color: var(--forge-primary);">AUDITED</span>
          </div>
          <div class="signal-main-val">
            <span id="tel-kpi-visitors">--</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">users</span>
          </div>
          <div class="signal-subtext">
            <span>Client Fingerprints:</span>
            <strong style="color: var(--forge-text-main);" id="tel-kpi-visitor-ratio">Active cohort</strong>
          </div>
        </div>

        <!-- KPI 2: Total Request Volume -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Request Volume</span>
            <span class="astryx-micro-pill" id="traffic-signal-velocity">ACTIVE</span>
          </div>
          <div class="signal-main-val">
            <span id="tel-kpi-requests">--</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);" id="tel-kpi-rps-unit">total</span>
          </div>
          <div class="signal-subtext">
            <span>Throughput:</span>
            <strong style="color: var(--forge-text-main);" id="tel-kpi-rps">-- req/sec</strong>
          </div>
        </div>

        <!-- KPI 3: Latency Spectrum (p50 / p99) -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Speed & Latency</span>
            <span class="astryx-micro-pill" style="color: var(--forge-success);" id="traffic-signal-slo">SLO &lt;2ms</span>
          </div>
          <div class="signal-main-val">
            <span id="tel-kpi-p50">--</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">ms (p50)</span>
          </div>
          <div class="signal-subtext">
            <span>Tail Percentiles:</span>
            <strong style="color: var(--forge-text-main);" id="tel-kpi-p99">p90: -- • p99: --</strong>
          </div>
        </div>

        <!-- KPI 4: Reliability & Success Rate -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Reliability Rate</span>
            <span class="astryx-micro-pill" style="color: var(--forge-success);" id="traffic-signal-status-pill">100% OK</span>
          </div>
          <div class="signal-main-val">
            <span id="tel-kpi-success-rate">100.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">% (2xx/3xx)</span>
          </div>
          <div class="signal-subtext">
            <span>Fault Incidents:</span>
            <strong style="color: var(--forge-text-muted);" id="tel-kpi-err-count">4xx: 0 • 5xx: 0</strong>
          </div>
        </div>

        <!-- KPI 5: Bandwidth & Data Transfer -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Data Transferred</span>
            <span class="astryx-micro-pill">NETWORK</span>
          </div>
          <div class="signal-main-val">
            <span id="tel-kpi-bandwidth">--</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);" id="tel-kpi-bandwidth-unit">KB</span>
          </div>
          <div class="signal-subtext">
            <span>Average Payload:</span>
            <strong style="color: var(--forge-text-main);" id="tel-kpi-bandwidth-avg">-- KB / req</strong>
          </div>
        </div>
      </div>

      <!-- 3. Multi-Metric Interactive SVG Timeline (Vercel-Style) -->
      <div class="traffic-timeline-section">
        <div class="timeline-header">
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
              <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.topology}</span>
              Traffic & Observability Timeline
            </h3>
            <!-- Metric Series Toggle -->
            <div class="chart-metric-toggles" id="chart-metric-toggles">
              <button class="metric-btn active" data-metric="requests" onclick="setChartMetric('requests')">Requests</button>
              <button class="metric-btn" data-metric="visitors" onclick="setChartMetric('visitors')">Unique Visitors</button>
              <button class="metric-btn" data-metric="latency" onclick="setChartMetric('latency')">p50 Latency</button>
              <button class="metric-btn" data-metric="bandwidth" onclick="setChartMetric('bandwidth')">Bandwidth</button>
            </div>
          </div>
          <div class="timeline-legend" id="chart-legend-container">
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-success);"></span> 2xx Success</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-primary);"></span> 3xx Redirect</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-accent);"></span> 4xx / 5xx Fault</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-primary); border-radius: 0; width: 12px; height: 2px;"></span> Metric Trend</div>
          </div>
        </div>
        <div class="timeline-chart-container" id="traffic-timeline-chart" style="min-height: 140px; position: relative;">
          <!-- Dynamically generated interactive SVG -->
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--forge-text-muted); font-size: 0.78rem;">
            Loading real-time time-series telemetry...
          </div>
        </div>
      </div>

      <!-- 4. Vercel-Style 6-Card Dimensional Insight Grid -->
      <div class="telemetry-insights-grid">
        <!-- Insight Card 1: Top Pages & Routes -->
        <div class="insight-card" id="traffic-routes-table-container">
          <div class="insight-card-header">
            <h4>${astryxIcons.services} Top Pages & Routes</h4>
            <span class="astryx-micro-pill" id="count-top-routes">0 routes</span>
          </div>
          <div class="insight-list" id="insight-top-routes">
            <div class="insight-loading">Loading routes...</div>
          </div>
        </div>

        <!-- Insight Card 2: Geographic Distribution -->
        <div class="insight-card">
          <div class="insight-card-header">
            <h4>${astryxIcons.host} Geographic Distribution</h4>
            <span class="astryx-micro-pill" id="count-countries">0 countries</span>
          </div>
          <div class="insight-list" id="insight-countries">
            <div class="insight-loading">Loading countries...</div>
          </div>
        </div>

        <!-- Insight Card 3: Operating Systems -->
        <div class="insight-card">
          <div class="insight-card-header">
            <h4>${astryxIcons.terminal} Operating Systems</h4>
            <span class="astryx-micro-pill" id="count-os">0 systems</span>
          </div>
          <div class="insight-list" id="insight-os">
            <div class="insight-loading">Loading operating systems...</div>
          </div>
        </div>

        <!-- Insight Card 4: Browsers & Engines -->
        <div class="insight-card">
          <div class="insight-card-header">
            <h4>${astryxIcons.apps} Browsers & Clients</h4>
            <span class="astryx-micro-pill" id="count-browsers">0 browsers</span>
          </div>
          <div class="insight-list" id="insight-browsers">
            <div class="insight-loading">Loading browsers...</div>
          </div>
        </div>

        <!-- Insight Card 5: Device Categories -->
        <div class="insight-card">
          <div class="insight-card-header">
            <h4>${astryxIcons.topology} Device Types</h4>
            <span class="astryx-micro-pill">HARDWARE</span>
          </div>
          <div class="insight-list" id="insight-devices">
            <div class="insight-loading">Loading devices...</div>
          </div>
        </div>

        <!-- Insight Card 6: Referrers & Traffic Sources -->
        <div class="insight-card">
          <div class="insight-card-header">
            <h4>${astryxIcons.users} Traffic Sources</h4>
            <span class="astryx-micro-pill">REFERRERS</span>
          </div>
          <div class="insight-list" id="insight-referrers">
            <div class="insight-loading">Loading referrers...</div>
          </div>
        </div>
      </div>

      <!-- 5. Active Benchmark Stress-Test Console (Preserved from Enterprise Spec) -->
      <div class="traffic-benchmark-section" style="margin-top: 1rem;">
        <div class="timeline-header" style="margin-bottom: 0.65rem;">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.zap}</span>
            Multi-Target High-Frequency Benchmark Engine
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle); font-family: var(--forge-font-mono, monospace);">
            Live concurrent HTTP latency stress tester (<code class="astryx-code-badge">&lt;2ms SLO</code>)
          </span>
        </div>

        <div class="benchmark-toolbar">
          <div class="benchmark-controls-group">
            <div class="benchmark-select-label">
              <span>Target:</span>
              <select id="benchmark-target-select" class="form-input" style="height: 28px; padding: 0.15rem 1.8rem 0.15rem 0.55rem; font-size: 0.75rem;">
                <option value="dev-dashboard">Dev Dashboard (:3002 /health)</option>
                <option value="gateway">Caddy Gateway Ingress (:80/:443)</option>
                <option value="portal-api">Portal API Service (:3001)</option>
                <option value="portal">Portal SPA Frontend (:3000)</option>
                <option value="employees">Directory Studio (:3003)</option>
                <option value="db-query">Database Query Engine (/api/db/list)</option>
              </select>
            </div>

            <div class="benchmark-select-label">
              <span>Samples:</span>
              <select id="benchmark-samples-select" class="form-input" style="height: 28px; padding: 0.15rem 1.8rem 0.15rem 0.55rem; font-size: 0.75rem;">
                <option value="15">15 requests (Quick)</option>
                <option value="50" selected>50 requests (Standard)</option>
                <option value="100">100 requests (Deep Stress)</option>
              </select>
            </div>

            <div class="benchmark-select-label">
              <span>Concurrency:</span>
              <select id="benchmark-concurrency-select" class="form-input" style="height: 28px; padding: 0.15rem 1.8rem 0.15rem 0.55rem; font-size: 0.75rem;">
                <option value="1">1 worker (Sequential)</option>
                <option value="5" selected>5 workers (Parallel)</option>
                <option value="10">10 workers (High Load)</option>
              </select>
            </div>
          </div>

          <button class="astryx-btn btn-primary" id="btn-run-stress-test" style="padding: 0.3rem 0.85rem; font-size: 0.75rem;" onclick="runCustomTargetBenchmark()">
            ${astryxIcons.zap} Run Stress Test
          </button>
        </div>

        <div id="traffic-benchmark-scorecard"></div>
      </div>

      <!-- 6. Live Client IP & Machine Inspector Log -->
      <div class="traffic-table-card" id="traffic-events-table-container" style="margin-top: 1rem;">
        <div class="traffic-table-header">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.terminal}</span>
            Live Client Machine & IP Inspector Log
            <span class="astryx-micro-pill" id="inspector-status-badge">AUTO-REFRESHING</span>
          </h3>
          <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="telemetry-inspector-search" placeholder="Filter by IP, OS, path, or trace ID..." class="form-input" style="height: 24px; font-size: 0.72rem; max-width: 240px;" oninput="onInspectorSearchChange(this.value)">
            <button class="astryx-btn btn-outline" style="height: 24px; padding: 0 0.55rem; font-size: 0.7rem;" onclick="loadTelemetryData()">Refresh ↺</button>
          </div>
        </div>
        <div class="astryx-table-wrap" id="telemetry-inspector-container">
          <div style="padding: 1.2rem; text-align: center; color: var(--forge-text-muted);">Loading real client requests and machine specs...</div>
        </div>
      </div>

    </section>
  `;
}
