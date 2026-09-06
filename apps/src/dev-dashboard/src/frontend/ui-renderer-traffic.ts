/**
 * @forge/dev-dashboard - Traffic Analytics & Latency Benchmark Tab Renderer (2026 LTS)
 * Enterprise Standard: Enterprise SRE Golden Signals, Active Stress Tester, Top Route Matrix.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderTrafficTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderTrafficTab(): string {
  return `
    <!-- Tab 7: Real-time Traffic Analytics & Latency Benchmarks -->
    <section id="tab-traffic" class="tab-pane">
      
      <!-- 1. Header Command Card -->
      <div class="traffic-header-card">
        <div>
          <h2 style="font-size: 1.15rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 700; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.traffic}</span>
            Real-time Traffic & Latency Benchmarks
          </h2>
          <p style="color: var(--forge-text-muted); font-size: 0.8rem; margin: 0;">
            Live HTTP request volume, statistical percentiles (<code class="astryx-code-badge">&lt;2ms SLO</code>), and active multi-target stress testing.
          </p>
        </div>
        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="exportTrafficCsv()">
            ${astryxIcons.download} Export CSV
          </button>
          <button class="astryx-btn btn-primary" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="runCustomTargetBenchmark()">
            ${astryxIcons.zap} Run Target Benchmark
          </button>
        </div>
      </div>

      <!-- 2. 4 Golden Traffic Signals (Real-time Telemetry) -->
      <div class="traffic-signals-grid">
        <!-- Signal 1: Throughput -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Request Throughput</span>
            <span class="astryx-micro-pill" id="traffic-signal-velocity">ACTIVE</span>
          </div>
          <div class="signal-main-val">
            <span id="traffic-signal-rps">0.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">req/sec</span>
          </div>
          <div class="signal-subtext">
            <span>24h Request Volume:</span>
            <strong style="color: var(--forge-text-main);" id="traffic-signal-24h">0 total</strong>
          </div>
        </div>

        <!-- Signal 2: Latency Spectrum (p50 / p99) -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Latency Spectrum</span>
            <span class="astryx-micro-pill" style="color: var(--forge-success);" id="traffic-signal-slo">SLO &lt;2ms</span>
          </div>
          <div class="signal-main-val">
            <span id="traffic-signal-p50">0.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">ms (p50)</span>
          </div>
          <div class="signal-subtext">
            <span>Peak Tail (p99):</span>
            <strong style="color: var(--forge-text-main);" id="traffic-signal-p99">-- ms</strong>
          </div>
        </div>

        <!-- Signal 3: Reliability & Success Rate -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Reliability Rate</span>
            <span class="astryx-micro-pill" style="color: var(--forge-success);" id="traffic-signal-status-pill">100% OK</span>
          </div>
          <div class="signal-main-val">
            <span id="traffic-signal-success-rate">100.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">% (2xx/3xx)</span>
          </div>
          <div class="signal-subtext">
            <span>Fault Count:</span>
            <strong style="color: var(--forge-text-muted);" id="traffic-signal-err-count">4xx: 0 • 5xx: 0</strong>
          </div>
        </div>

        <!-- Signal 4: Payload & Data Transfer -->
        <div class="traffic-signal-card">
          <div class="signal-top">
            <span class="signal-label">Data Transferred</span>
            <span class="astryx-micro-pill">ESTIMATED</span>
          </div>
          <div class="signal-main-val">
            <span id="traffic-signal-payload">0.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">KB</span>
          </div>
          <div class="signal-subtext">
            <span>Average Payload:</span>
            <strong style="color: var(--forge-text-main);" id="traffic-signal-payload-avg">-- KB / req</strong>
          </div>
        </div>
      </div>

      <!-- 3. Live Time-Series Traffic & Latency SVG Timeline -->
      <div class="traffic-timeline-section">
        <div class="timeline-header">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.topology}</span>
            Traffic Rate & Latency Timeline (Rolling 15-Minute Window)
          </h3>
          <div class="timeline-legend">
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-success);"></span> 2xx Success</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-primary);"></span> 3xx Redirect</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-accent);"></span> 4xx Client Err</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-accent);"></span> 5xx Fault</div>
            <div class="legend-item"><span class="legend-dot" style="background: var(--forge-primary); border-radius: 0; width: 12px; height: 2px;"></span> p50 Latency Curve</div>
          </div>
        </div>
        <div class="timeline-chart-container" id="traffic-timeline-chart">
          <!-- Dynamically generated SVG by ui-traffic-scripts.ts -->
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--forge-text-muted); font-size: 0.78rem;">
            Loading real-time time-series telemetry...
          </div>
        </div>
      </div>

      <!-- 4. Multi-Target Active Benchmark & Stress-Test Console -->
      <div class="traffic-benchmark-section">
        <div class="timeline-header" style="margin-bottom: 0.65rem;">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.zap}</span>
            Multi-Target High-Frequency Benchmark Engine
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle); font-family: var(--forge-font-mono, monospace);">
            Live concurrent HTTP latency stress tester
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

        <div id="traffic-benchmark-scorecard">
          <!-- Scorecard results injected dynamically -->
        </div>
      </div>

      <!-- 5. Top Routes Performance & Endpoint Matrix -->
      <div class="traffic-table-card" style="margin-bottom: 1rem;">
        <div class="traffic-table-header">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.services}</span>
            Endpoint Performance Matrix (Top Ingress Routes)
          </h3>
          <button class="astryx-btn btn-outline" style="height: 24px; padding: 0 0.55rem; font-size: 0.7rem;" onclick="loadTrafficRoutes()">
            Refresh Routes ↺
          </button>
        </div>
        <div class="astryx-table-wrap" id="traffic-routes-table-container">
          <div style="padding: 1rem; text-align: center; color: var(--forge-text-muted);">Loading endpoint route performance...</div>
        </div>
      </div>

      <!-- 6. High-Density Live Traffic Event Log -->
      <div class="traffic-table-card">
        <div class="traffic-table-header">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.terminal}</span>
            Live HTTP Traffic Events Stream
          </h3>
          <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="traffic-filter-search" placeholder="Filter path or trace ID..." class="form-input" style="height: 24px; font-size: 0.72rem; max-width: 180px;" oninput="onTrafficSearchChange(this.value)">
            <button class="astryx-btn btn-outline" style="height: 24px; padding: 0 0.55rem; font-size: 0.7rem;" onclick="loadTrafficEvents()">Refresh ↺</button>
          </div>
        </div>
        <div class="astryx-table-wrap" id="traffic-events-table-container">
          <div style="padding: 1rem; text-align: center; color: var(--forge-text-muted);">Loading live HTTP events stream...</div>
        </div>
      </div>

    </section>
  `;
}
