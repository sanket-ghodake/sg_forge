/**
 * @forge/dev-dashboard - Overview & System Topology Tab Component (2026 LTS)
 * High-Density Mission Control & Cluster Health UI.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderOverviewTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderOverviewTab(): string {
  return `
    <!-- Tab 1: Overview & Cluster Command Center -->
    <section id="tab-overview" class="tab-pane">
      
      <!-- 1. Hero Health Banner & Quick Action Tools -->
      <div class="overview-hero-card">
        <div class="overview-hero-left">
          <div class="overview-status-icon-box" id="overview-cluster-icon">
            <span class="badge-dot" style="background: var(--forge-success); box-shadow: 0 0 10px var(--forge-success); width: 10px; height: 10px;"></span>
          </div>
          <div>
            <h2 class="overview-hero-title">
              <span id="overview-cluster-status">All Systems Operational</span>
              <span class="astryx-badge badge-running" id="overview-cluster-badge" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;">LIVE CLUSTER</span>
            </h2>
            <div class="overview-hero-subtitle">
              <span id="overview-healthy-count">Checking microservice nodes...</span>
              <span>•</span>
              <span id="overview-uptime-badge">Uptime: Active</span>
              <span>•</span>
              <span id="overview-gateway-status">Gateway: Caddy (:80/:443)</span>
            </div>
          </div>
        </div>

        <div class="overview-hero-actions">
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem; gap: 0.35rem;" onclick="runFleetBenchmark()" title="Run 15-sample fleet latency benchmark">
            <span style="display:flex; align-items:center;">${astryxIcons.zap}</span>
            <span>Fleet Benchmark</span>
          </button>
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem; gap: 0.35rem;" onclick="runOverviewHealthProbe()" title="Ping and probe all service endpoints">
            <span style="display:flex; align-items:center;">${astryxIcons.refresh}</span>
            <span>Probe Fleet</span>
          </button>
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem; gap: 0.35rem;" onclick="flushTelemetryBuffer()" title="Flush ring buffer logs">
            <span style="display:flex; align-items:center;">${astryxIcons.slash}</span>
            <span>Flush Logs</span>
          </button>
        </div>
      </div>

      <!-- 2. 4 Golden Vitals Summary Cards -->
      <div class="overview-vitals-grid">
        <!-- Card 1: Fleet Latency -->
        <div class="overview-vital-card">
          <div class="vital-top">
            <span class="vital-label">Fleet Latency (p50)</span>
            <span class="vital-badge" id="vital-latency-p99">p99: -- ms</span>
          </div>
          <div class="vital-main-val">
            <span id="vital-latency-val">0.0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">ms</span>
          </div>
          <div class="vital-subtext">
            <span id="vital-latency-subtext">Fast HTTP loopback</span>
            <div id="vital-latency-sparkline" style="height: 18px; width: 68px;"></div>
          </div>
        </div>

        <!-- Card 2: Memory & Compute Pressure -->
        <div class="overview-vital-card">
          <div class="vital-top">
            <span class="vital-label">Host RAM Usage</span>
            <span class="vital-badge" id="vital-ram-pct">0%</span>
          </div>
          <div class="vital-main-val">
            <span id="vital-ram-val">0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);" id="vital-ram-total">/ 0 GB</span>
          </div>
          <div class="vitals-bar-container" style="margin-top: 0.35rem;">
            <div class="vitals-bar-fill" id="vital-ram-bar" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Card 3: Event Stream & Ingestion Throughput -->
        <div class="overview-vital-card">
          <div class="vital-top">
            <span class="vital-label">Event Stream</span>
            <span class="vital-badge" style="color: var(--forge-primary);" id="vital-events-status">ACTIVE</span>
          </div>
          <div class="vital-main-val">
            <span id="vital-events-val">0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">msgs</span>
          </div>
          <div class="vital-subtext">
            <span id="vital-events-subtext">Zero-disk ring buffer</span>
            <div id="vital-events-sparkline" style="height: 18px; width: 68px;"></div>
          </div>
        </div>

        <!-- Card 4: Database Fleet & Storage -->
        <div class="overview-vital-card">
          <div class="vital-top">
            <span class="vital-label">Database Fleet</span>
            <span class="vital-badge" id="vital-db-integrity">100% OK</span>
          </div>
          <div class="vital-main-val">
            <span id="vital-db-val">0</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted);">Databases</span>
          </div>
          <div class="vital-subtext">
            <span id="vital-db-subtext">Turso LibSQL & SQLite</span>
            <span style="color: var(--forge-success);" id="vital-db-tables">0 tables</span>
          </div>
        </div>
      </div>

      <!-- 3. Interactive Topology Architecture Pipeline -->
      <div class="overview-topology-section">
        <div class="topology-header">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.topology}</span>
            Cluster Architecture & Ingress Pipeline
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle); font-family: var(--forge-font-mono, monospace);">
            Live Request Flow: Ingress ➔ SPA ➔ Microservices ➔ Dedicated DBs
          </span>
        </div>
        
        <div class="topology-pipeline-container" id="overview-topology-pipeline">
          <!-- Tier 1: Ingress Gateway -->
          <div class="topology-tier">
            <div class="topology-tier-header">
              <span>1. Ingress</span>
              <span class="badge-dot" style="background: var(--forge-success);"></span>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('settings') : switchTab('settings')" title="Caddy Reverse Proxy Gateway">
              <div class="node-title-row">
                <span class="node-name">Caddy Gateway</span>
                <span class="astryx-micro-pill">:80/:443</span>
              </div>
              <div class="node-meta-row">
                <span>SSL / HTTP2</span>
                <span style="color: var(--forge-success);">ACTIVE</span>
              </div>
            </div>
          </div>

          <!-- Tier 2: Portal SPA -->
          <div class="topology-tier">
            <div class="topology-tier-header">
              <span>2. Frontend SPA</span>
              <span class="badge-dot" style="background: var(--forge-success);"></span>
            </div>
            <div class="topology-node-card" onclick="window.open('/', '_blank')" title="Main Single Page App">
              <div class="node-title-row">
                <span class="node-name">Portal SPA</span>
                <span class="astryx-micro-pill">:3000</span>
              </div>
              <div class="node-meta-row">
                <span>Next.js 16 / Astryx</span>
                <span style="color: var(--forge-success);">200 OK</span>
              </div>
            </div>
          </div>

          <!-- Tier 3: Core API Services -->
          <div class="topology-tier">
            <div class="topology-tier-header">
              <span>3. Platform APIs</span>
              <span class="badge-dot" style="background: var(--forge-success);"></span>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('services', { service: 'portal' }) : switchTab('services')" title="Portal API Service">
              <div class="node-title-row">
                <span class="node-name">Portal API</span>
                <span class="astryx-micro-pill">:3001</span>
              </div>
              <div class="node-meta-row">
                <span>/api/portal</span>
                <span style="color: var(--forge-success);" id="topo-node-3001-latency">-- ms</span>
              </div>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('services', { service: 'dev-dashboard' }) : switchTab('services')" title="Developer Center & Diagnostics">
              <div class="node-title-row">
                <span class="node-name">Dev Dashboard</span>
                <span class="astryx-micro-pill">:3002</span>
              </div>
              <div class="node-meta-row">
                <span>/devcenter</span>
                <span style="color: var(--forge-success);" id="topo-node-3002-latency">-- ms</span>
              </div>
            </div>
          </div>

          <!-- Tier 4: Micro-Apps -->
          <div class="topology-tier">
            <div class="topology-tier-header">
              <span>4. Micro-Apps</span>
              <span class="badge-dot" style="background: var(--forge-success);"></span>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('employees') : switchTab('employees')" title="Employee Directory & Org Studio">
              <div class="node-title-row">
                <span class="node-name">Directory Studio</span>
                <span class="astryx-micro-pill">:3003</span>
              </div>
              <div class="node-meta-row">
                <span>/employees</span>
                <span style="color: var(--forge-success);" id="topo-node-3003-latency">-- ms</span>
              </div>
            </div>
          </div>

          <!-- Tier 5: Storage & Ring Buffer -->
          <div class="topology-tier">
            <div class="topology-tier-header">
              <span>5. Data & Logs</span>
              <span class="badge-dot" style="background: var(--forge-success);"></span>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('database') : switchTab('database')" title="Dedicated Turso / libSQL Storage">
              <div class="node-title-row">
                <span class="node-name">Turso libSQL</span>
                <span class="astryx-micro-pill">SQLite</span>
              </div>
              <div class="node-meta-row">
                <span>Isolated DBs</span>
                <span style="color: var(--forge-success);" id="topo-db-status">ONLINE</span>
              </div>
            </div>
            <div class="topology-node-card" onclick="window.navigateToTab ? window.navigateToTab('logs') : switchTab('logs')" title="Zero-Disk Telemetry Buffer">
              <div class="node-title-row">
                <span class="node-name">SSE Ring Buffer</span>
                <span class="astryx-micro-pill">Stream</span>
              </div>
              <div class="node-meta-row">
                <span>2000 msgs cap</span>
                <span style="color: var(--forge-success);">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. High-Density Active Services Matrix -->
      <div style="margin-bottom: 0.65rem; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.services}</span>
          Live Services & Micro-Apps Fleet
        </h3>
        <button class="astryx-btn btn-outline" style="height: 24px; padding: 0 0.5rem; font-size: 0.7rem;" onclick="loadOverviewData()">
          Refresh Matrix
        </button>
      </div>
      <div class="overview-fleet-grid" id="overview-services-fleet-grid">
        <!-- Rendered dynamically by ui-overview-scripts.ts -->
      </div>

      <!-- 5. Split-Screen Operations Console -->
      <div class="overview-console-grid">
        <!-- Left Panel: Live Telemetry Terminal (60%) -->
        <div class="console-terminal-card">
          <div class="console-header">
            <h3 style="font-size: 0.88rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.4rem; color: var(--forge-text-main);">
              <span style="color: var(--forge-text-muted); display: flex; align-items: center;">${astryxIcons.terminal}</span>
              Live Cluster Telemetry Stream
            </h3>
            <div class="console-controls">
              <span class="console-filter-pill active" id="filter-ov-all" onclick="filterOverviewLogs('ALL')">All</span>
              <span class="console-filter-pill" id="filter-ov-info" onclick="filterOverviewLogs('INFO')">Info</span>
              <span class="console-filter-pill" id="filter-ov-warn" onclick="filterOverviewLogs('WARN')">Warn</span>
              <span class="console-filter-pill" id="filter-ov-error" onclick="filterOverviewLogs('ERROR')">Error</span>
              <button class="astryx-btn btn-outline" style="height: 22px; padding: 0 0.45rem; font-size: 0.68rem;" onclick="clearLogs()">Clear</button>
              <button class="astryx-btn btn-outline" style="height: 22px; padding: 0 0.45rem; font-size: 0.68rem;" id="btn-stream-pause" onclick="toggleOverviewStreamPause()">Pause</button>
            </div>
          </div>
          <div class="console-terminal-window" id="overview-terminal">Connecting to SSE telemetry stream...</div>
        </div>

        <!-- Right Panel: Health Radar & Database Telemetry (40%) -->
        <div class="console-radar-card">
          <div class="console-header" style="margin-bottom: 0.2rem;">
            <h3 style="font-size: 0.88rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.4rem; color: var(--forge-text-main);">
              <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.database}</span>
              Diagnostics & Database Radar
            </h3>
            <span class="astryx-micro-pill" style="color: var(--forge-success);">PROBED</span>
          </div>

          <!-- Subcard 1: Primary Database Telemetry -->
          <div class="radar-subcard">
            <div class="radar-subcard-title">
              <span id="radar-db-name">platform_core.db</span>
              <span class="astryx-micro-pill" style="color: var(--forge-success);" id="radar-db-integrity-pill">VALID</span>
            </div>
            <div class="radar-stats-row">
              <span>Storage Footprint:</span>
              <strong style="color: var(--forge-text-main);" id="radar-db-size">-- KB</strong>
            </div>
            <div class="radar-stats-row">
              <span>Schema Tables:</span>
              <strong style="color: var(--forge-text-main);" id="radar-db-tables-count">-- tables</strong>
            </div>
            <div style="display: flex; gap: 0.35rem; margin-top: 0.4rem;">
              <button class="fleet-btn-xs" style="flex: 1; justify-content: center;" onclick="switchTab('database')">Open Studio</button>
              <button class="fleet-btn-xs" style="flex: 1; justify-content: center;" onclick="runOverviewQuickSql()">Run Test Query</button>
            </div>
          </div>

          <!-- Subcard 2: Anomaly & Issue Radar -->
          <div class="radar-subcard">
            <div class="radar-subcard-title">
              <span>Cluster Anomaly Radar</span>
              <span class="astryx-micro-pill" style="color: var(--forge-success);" id="radar-anomaly-pill">CLEAN</span>
            </div>
            <div class="radar-stats-row">
              <span>Uncaught Rejections:</span>
              <strong style="color: var(--forge-success);" id="radar-err-count">0 in last 10m</strong>
            </div>
            <div class="radar-stats-row">
              <span>Security Invariants:</span>
              <strong style="color: var(--forge-success);">100% Passing</strong>
            </div>
            <div style="margin-top: 0.35rem;">
              <button class="fleet-btn-xs" style="width: 100%; justify-content: center;" onclick="switchTab('issues')">View Issue Center</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Runtime & Environment Cheatsheet Strip -->
      <div class="overview-env-strip">
        <div class="env-strip-item">
          <span class="badge-dot" style="background: var(--forge-primary); width: 6px; height: 6px;"></span>
          <span>Runtime: <strong>Bun v1.3.14 (LTS)</strong></span>
        </div>
        <div class="env-strip-item">
          <span>Host: <strong id="env-host-platform">Linux x86_64</strong></span>
        </div>
        <div class="env-strip-item">
          <span>Ingress: <strong>Caddy (Port 80/443)</strong></span>
        </div>
        <div class="env-strip-item">
          <span>Architecture: <strong>Astryx Modular Monorepo</strong></span>
        </div>
      </div>

    </section>
  `;
}
