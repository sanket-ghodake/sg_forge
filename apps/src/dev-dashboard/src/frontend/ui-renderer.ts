/**
 * @forge/dev-dashboard - Astryx UI Renderer (2026 LTS)
 * Full-width top header, below-header vertical sidebar, theme toggler, and responsive SPA layout.
 * Astryx Enterprise Baseline (v2.0.0 LTS)
 */

import { astryxIcons, getHeadStateScript } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';
import { getModalsHtml } from './ui-modals';
import { getDashboardScripts } from './ui-scripts';
import { getDashboardStyles } from './ui-styles';
import { renderEmployeesTab } from './ui-renderer-employees';
import { renderOverviewTab } from './ui-renderer-overview';
import { renderTrafficTab } from './ui-renderer-traffic';
import { renderIssuesTab } from './ui-renderer-issues';
import { renderHostTab } from './ui-renderer-host';
import { getAppsTabHtml } from './ui-renderer-apps';

/**
 * renderDashboardHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderDashboardHtml(): string {
  const brand = loadBrandConfig();
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - Developer Dashboard & Diagnostics</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <script>
    (function() {
      try {
        var p = new URLSearchParams(window.location.search);
        var t = p.get('tab') || (window.location.hash ? window.location.hash.slice(1) : '');
        if (!t) {
          try { t = sessionStorage.getItem('forge:v1:devcenter:active-tab'); } catch(e) {}
        }
        var validTabs = ['overview', 'services', 'apps', 'traffic', 'database', 'logs', 'issues', 'employees', 'host', 'settings'];
        if (!t || validTabs.indexOf(t) === -1) t = 'overview';
        document.documentElement.setAttribute('data-active-tab', t);
      } catch(e) {}
    })();
  </script>
  <style>${getDashboardStyles()}</style>
</head>
<body>
  <!-- Chrome/Edge Credential Autofill De-Coupler Trap -->
  <div style="position:absolute; top:-9999px; left:-9999px; width:1px; height:1px; opacity:0; pointer-events:none;" aria-hidden="true">
    <input type="text" name="chrome_autofill_user_trap" tabindex="-1" autocomplete="username">
    <input type="password" name="chrome_autofill_pwd_trap" tabindex="-1" autocomplete="current-password">
  </div>

  <!-- 1. 100% Full-Width Global Top Header -->
  <header class="sb-global-header">
    <div class="sb-header-left">
      <button class="sb-mobile-menu-btn" id="mobile-menu-toggle" aria-label="Toggle Mobile Navigation">☰</button>
      <a href="/" class="sb-brand" style="display: flex; align-items: center; gap: 0.55rem;">
        ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${brand.name}" class="astryx-brand-logo-img" style="height: 32px; max-height: 80%; width: auto; max-width: 180px; object-fit: contain; flex-shrink: 0;" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-flex';" />` : ''}
        <span class="astryx-logo-badge" style="${brand.logoUrl ? 'display: none;' : ''}">${brand.short}</span>
        <span class="sb-app-tag">DEVELOPER CENTER</span>
      </a>
      <div class="sb-header-divider"></div>
      <div class="sb-header-breadcrumb" id="header-active-view">
        <span class="breadcrumb-dot"></span>
        <span id="breadcrumb-title">Overview</span>
      </div>
    </div>

    <div class="sb-header-center">
      <div class="sb-quick-find-bar" id="cmd-palette-btn" title="Open Command Palette (Cmd+K)" onclick="openCommandPalette()">
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Quick Find & Navigate...</span>
        </div>
        <kbd class="sb-hotkey-badge" style="opacity: 1; transform: none;">⌘K</kbd>
      </div>
    </div>

    <div class="sb-header-right">
      <!-- Heartbeat & Connection Watchdog -->
      <div class="watchdog-pill" id="dashboard-watchdog" title="Live SSE telemetry stream status (click to reconnect)" onclick="reconnectSSE()">
        <span class="watchdog-dot live" id="watchdog-dot"></span>
        <span id="watchdog-text">Live Stream</span>
      </div>

      <!-- Theme Switcher -->
      <button class="astryx-theme-toggle" id="theme-toggle-btn" title="Toggle Light / Dark Theme" aria-label="Toggle Theme" style="width: 32px; height: 32px;">
        <svg id="sun-icon" viewBox="0 0 24 24" style="width: 15px; height: 15px;">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
        </svg>
        <svg id="moon-icon" viewBox="0 0 24 24" style="width: 15px; height: 15px; display: none;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- Operator Session Lock / Sign Out -->
      <button class="astryx-theme-toggle" id="logout-btn" title="Sign Out & Lock Dev Dashboard" aria-label="Sign Out" style="width: 32px; height: 32px;" onclick="handleDevLogout()">
        <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2;">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  </header>

  <!-- 2. Below-Header Body Container (Left Sidebar + Main SPA Canvas) -->
  <div class="sb-body-container">
    <div class="sb-sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>

    <aside class="sb-sidebar" id="main-sidebar" aria-label="Main Navigation">
      <div class="sb-nav-section-label">Runtime & Fleet</div>
      <div class="sb-nav-item" data-tab="overview" onclick="switchTab('overview')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('overview')" title="Overview" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.topology}</span><span class="sb-nav-label">Overview</span></div>
      <div class="sb-nav-item" data-tab="services" onclick="switchTab('services')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('services')" title="Services & Processes" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.services}</span><span class="sb-nav-label">Services & Processes</span></div>
      <div class="sb-nav-item" data-tab="apps" onclick="switchTab('apps')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('apps')" title="Forge Apps" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.apps}</span><span class="sb-nav-label">Forge Apps</span></div>
      <div class="sb-nav-item" data-tab="traffic" onclick="switchTab('traffic')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('traffic')" title="Traffic Analytics" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.traffic}</span><span class="sb-nav-label">Traffic Analytics</span></div>

      <div class="sb-nav-section-label">Data & Storage</div>
      <div class="sb-nav-item" data-tab="database" onclick="switchTab('database')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('database')" title="Database Studio" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.database}</span><span class="sb-nav-label">Database Studio</span></div>

      <div class="sb-nav-section-label">Observability</div>
      <div class="sb-nav-item" data-tab="logs" onclick="switchTab('logs')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('logs')" title="Isolated App Logs" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.logs}</span><span class="sb-nav-label">Isolated App Logs</span></div>
      <div class="sb-nav-item" data-tab="issues" onclick="switchTab('issues')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('issues')" title="Issue Center" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.issues}</span><span class="sb-nav-label">Issue Center</span></div>

      <div class="sb-nav-section-label">Platform & Host</div>
      <div class="sb-nav-item" data-tab="employees" onclick="switchTab('employees')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('employees')" title="Employees & Org" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.users}</span><span class="sb-nav-label">Employees & Org</span></div>
      <div class="sb-nav-item" data-tab="host" onclick="switchTab('host')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('host')" title="Host & Cloud" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.host}</span><span class="sb-nav-label">Host & Cloud</span></div>
      <div class="sb-nav-item" data-tab="settings" onclick="switchTab('settings')" onkeydown="if(event.key==='Enter'||event.key===' ')switchTab('settings')" title="Settings & Tools" tabindex="0" role="button"><span class="sb-nav-icon">${astryxIcons.settings}</span><span class="sb-nav-label">Settings & Tools</span></div>

      <div class="sb-sidebar-footer">
        <div class="sb-footer-pill">
          <span class="badge-dot" style="background: var(--forge-primary); width: 5px; height: 5px;"></span>
          <span>Bun v1.3.14 • LTS</span>
        </div>
      </div>
    </aside>

    <main class="sb-content">
      ${renderOverviewTab()}

      <!-- Tab 2: Services & Processes Command Center (2026 GCP Standard) -->
      <section id="tab-services" class="tab-pane">
        <div class="astryx-card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.2rem; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 600;">
                <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.services}</span> Services & Processes Command Center
                <button class="help-btn" onclick="openHelpModal()" title="Help & Architecture Explainer">?</button>
              </h2>
              <p style="color: var(--forge-text-muted); font-size: 0.82rem;">Real-time operational status, dual-probe latency, rolling sparklines, and flyout process inspector.</p>
            </div>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <button class="astryx-btn btn-outline" onclick="runLatencyBenchmark()">
                ${astryxIcons.zap} Latency Benchmark
              </button>
              <button class="astryx-btn btn-primary" onclick="rollingRestartFleet()">
                ${astryxIcons.refresh} Restart Fleet
              </button>
            </div>
          </div>
        </div>

        <div class="vitals-grid" id="services-vitals-cards">
          <div class="vitals-card"><div class="vitals-title">Loading Service Fleet Health...</div></div>
          <div class="vitals-card"><div class="vitals-title">Loading CPU Utilization...</div></div>
          <div class="vitals-card"><div class="vitals-title">Loading Memory Allocation...</div></div>
          <div class="vitals-card"><div class="vitals-title">Loading Storage & DB Quota...</div></div>
        </div>

        <div class="services-toolbar">
          <div class="services-search-box">
            <span style="display: flex; align-items: center; color: var(--forge-text-muted);">${astryxIcons.search}</span>
            <input type="search" id="services-search-input" name="services-search-query" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Search services by name, port, route..." oninput="filterServicesTable()">
          </div>
          <div class="filter-chip-group" id="services-filter-chips">
            <button class="filter-chip active" data-filter="all" onclick="setServiceFilter('all')">All (<span id="count-all">0</span>)</button>
            <button class="filter-chip" data-filter="running" onclick="setServiceFilter('running')"><span class="status-pulse-dot active" style="margin-right: 3px;"></span> Running (<span id="count-running">0</span>)</button>
            <button class="filter-chip" data-filter="stopped" onclick="setServiceFilter('stopped')"><span class="status-pulse-dot suspended" style="margin-right: 3px;"></span> Stopped (<span id="count-stopped">0</span>)</button>
            <button class="filter-chip" data-filter="fast" onclick="setServiceFilter('fast')">${astryxIcons.zap} Fast &lt;5ms (<span id="count-fast">0</span>)</button>
          </div>
        </div>

        <div class="astryx-card">
          <div class="astryx-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 110px;">Status</th>
                  <th>Service Name</th>
                  <th style="width: 130px;">CPU Load</th>
                  <th style="width: 140px;">RAM Usage</th>
                  <th style="width: 90px;">Dual-Probe</th>
                  <th style="width: 70px;">Port</th>
                  <th>Route Ingress</th>
                  <th style="width: 200px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="services-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      ${getAppsTabHtml()}

      <!-- Tab 4: Unified Database Studio (Enterprise Standard) -->
      <section id="tab-database" class="tab-pane">
        <div class="astryx-card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
              <label style="font-weight: 600; font-size: 0.82rem;">Active Database:</label>
              <select class="form-input" id="db-select" style="max-width: 260px;" onchange="inspectDatabase(this.value)"></select>
              <button class="astryx-btn btn-outline" onclick="checkDatabaseIntegrity()">Integrity Check</button>
              <button class="astryx-btn btn-outline" onclick="optimizeCurrentDb()">${astryxIcons.sparkles} 1-Click Optimize</button>
              <button class="astryx-btn btn-primary" onclick="backupCurrentDb()">${astryxIcons.database} Snapshot</button>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <button class="astryx-btn btn-outline" id="btn-db-fullscreen" onclick="toggleDbStudioFullscreen()">Fullscreen</button>
              <button class="astryx-btn btn-outline" style="border-color: var(--forge-primary); color: var(--forge-primary);" onclick="openConnectModal()">${astryxIcons.plus} Connect Remote DB</button>
            </div>
          </div>
          <!-- Live Real-Time DB Telemetry & Storage Bar -->
          <div class="db-telemetry-grid" id="db-telemetry-container">
            <div class="db-metric-chip"><span class="db-metric-val" id="telemetry-db-size">-- KB</span><span class="db-metric-lbl">Total Storage</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" id="telemetry-wal-size">-- KB</span><span class="db-metric-lbl">WAL Journal</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" id="telemetry-tables-count">0</span><span class="db-metric-lbl">Tables / Views</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" id="telemetry-total-records">0</span><span class="db-metric-lbl">Est. Total Records</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" id="telemetry-page-cache">WAL</span><span class="db-metric-lbl">Engine Mode</span></div>
          </div>
        </div>

        <div class="db-studio-layout" id="db-studio-main-layout">
          <!-- Left Explorer: Tables & Hierarchy -->
          <div class="db-studio-sidebar">
            <div class="astryx-card" style="height: 100%; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h3 style="font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
                  <span style="color: var(--forge-text-muted);">${astryxIcons.layers}</span> Schema Tables
                </h3>
                <span id="db-tables-count-badge" class="astryx-badge badge-pill">0 tables</span>
              </div>
              <input type="search" id="db-table-filter-input" placeholder="Filter tables..." class="form-input" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; width: 100%; margin-bottom: 0.5rem;" oninput="filterTableList(this.value)">
              <div id="db-tables-view" style="display: flex; flex-direction: column; gap: 0.2rem; overflow-y: auto; max-height: 480px; flex: 1;">Select database to inspect.</div>
            </div>
          </div>

          <!-- Right Workspace: Table Data / Visual ER / SQL Scratchpad / DDL -->
          <div class="db-studio-main">
            <div class="astryx-card" style="height: 100%; display: flex; flex-direction: column;">
              <div class="db-subtab-bar">
                <button class="db-subtab-btn active" id="btn-subtab-rows" onclick="switchDbSubTab('rows')">Table Data</button>
                <button class="db-subtab-btn" id="btn-subtab-graph" onclick="switchDbSubTab('graph')">Schema Graph</button>
                <button class="db-subtab-btn" id="btn-subtab-sql" onclick="switchDbSubTab('sql')">SQL Scratchpad</button>
                <button class="db-subtab-btn" id="btn-subtab-ddl" onclick="switchDbSubTab('ddl')">Schema DDL</button>
              </div>

              <!-- Sub-pane 1: Table Data Browser with Real-time Search -->
              <div id="db-subpane-rows">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
                  <h3 style="font-size: 0.95rem; margin: 0;" id="db-table-data-title">Table Rows</h3>
                  <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                    <input type="search" id="db-table-search-input" placeholder="Search in table..." class="form-input" style="padding: 0.2rem 0.55rem; font-size: 0.75rem; width: 180px;" oninput="onDbTableSearch(this.value)">
                    <select id="db-table-limit-select" class="form-input" onchange="changeTableLimit(this.value)">
                      <option value="15">15 rows</option>
                      <option value="25" selected>25 rows</option>
                      <option value="50">50 rows</option>
                      <option value="100">100 rows</option>
                    </select>
                    <button class="astryx-btn btn-outline" style="height: 26px; padding: 0 0.55rem; font-size: 0.75rem;" onclick="exportCurrentTableCsv()">${astryxIcons.download} Export CSV</button>
                  </div>
                </div>
                <div class="astryx-table-wrap" id="db-table-data-view" style="max-height: 440px; overflow: auto;">Select a table to browse records.</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;" id="db-pagination-bar"></div>
              </div>

              <!-- Sub-pane 2: Visual ER Schema Graph -->
              <div id="db-subpane-graph" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
                  <h3 style="font-size: 0.95rem; margin: 0;">Interactive Schema Relationship Map</h3>
                  <button class="astryx-btn btn-outline" style="height: 26px; padding: 0 0.5rem; font-size: 0.72rem;" onclick="loadDbSchemaGraph(currentSelectedDb)">${astryxIcons.refresh} Refresh Diagram</button>
                </div>
                <div id="db-er-diagram-view">Loading schema graph...</div>
              </div>

              <!-- Sub-pane 3: Interactive SQL Scratchpad with Profiler -->
              <div id="db-subpane-sql" style="display: none;">
                <div style="display: flex; gap: 0.75rem; margin-bottom: 0.55rem; align-items: center; flex-wrap: wrap;">
                  <label style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
                    <input type="checkbox" id="sql-readonly-check" checked> Read-Only Sandbox Mode
                  </label>
                  <button class="astryx-btn btn-primary" onclick="runSqlQuery()">Run Query (Ctrl+Enter)</button>
                  <button class="astryx-btn btn-outline" onclick="exportSqlResultCsv()">${astryxIcons.download} Export CSV</button>
                  <button class="astryx-btn btn-outline" style="height: 32px; padding: 0 0.55rem; font-size: 0.75rem;" onclick="clearSqlQuery()">Clear</button>
                  <span id="sql-perf-indicator"></span>
                </div>
                <!-- Dynamic Quick Queries Chips Per DB -->
                <div id="db-quick-queries-container" style="display: flex; gap: 0.35rem; margin-bottom: 0.55rem; flex-wrap: wrap;"></div>
                <textarea class="sql-input" id="sql-query-input" placeholder="SELECT * FROM apps_registry LIMIT 10;" style="height: 110px; font-family: monospace; font-size: 0.82rem;">SELECT * FROM apps_registry LIMIT 10;</textarea>
                <div id="sql-result-container"></div>
              </div>

              <!-- Sub-pane 4: Schema DDL -->
              <div id="db-subpane-ddl" style="display: none;">
                <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem;" id="db-ddl-title">Schema Definition</h3>
                <div class="schema-code-box" id="db-ddl-view">Select a table to view its DDL schema.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab 6: Isolated App Logs & Observability -->
      <section id="tab-logs" class="tab-pane">
        <div class="astryx-card" style="margin-bottom: 1rem; padding: 0.75rem 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span class="status-pulse-dot active" style="width: 9px; height: 9px;"></span>
              <div>
                <h2 style="font-size: 1.05rem; margin: 0; display: flex; align-items: center; gap: 0.45rem; font-weight: 700;">
                  <span>Isolated App Logs & Observability Stream</span>
                  <span class="astryx-badge badge-running" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;">LIVE TAIL</span>
                </h2>
                <p style="color: var(--forge-text-muted); font-size: 0.78rem; margin: 0.15rem 0 0 0;">
                  Real-time structured JSON telemetry, automated secret/PII redaction, and multi-service trace correlation.
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="astryx-micro-pill" id="log-buffer-count-pill" style="color: var(--forge-primary);">2000 msgs buffer</span>
              <button class="astryx-btn btn-outline" style="padding: 0.22rem 0.55rem; font-size: 0.72rem;" onclick="clearActiveAppLogs()">Clear Stream</button>
            </div>
          </div>
        </div>

        <div class="astryx-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <select class="form-input" id="logs-app-select" style="max-width: 160px;" onchange="changeActiveLogApp(this.value)">
                <option value="all">All Microservices</option>
                <option value="landing">Landing</option>
                <option value="auth">Auth</option>
                <option value="portal">Portal</option>
                <option value="dev-dashboard">Dev Dashboard</option>
                <option value="dev-hub">Dev Hub</option>
                <option value="expenses">Expenses</option>
                <option value="billing">Billing</option>
                <option value="telemetry">Telemetry</option>
              </select>

              <select class="form-input" id="logs-source-select" style="max-width: 140px;" onchange="changeActiveLogSource(this.value)">
                <option value="all">All Sources</option>
                <option value="app">Server</option>
                <option value="browser">Browser</option>
                <option value="docker">Docker</option>
                <option value="db">Database</option>
              </select>

              <select class="form-input" id="logs-level-select" style="max-width: 90px;" onchange="changeActiveLogLevel(this.value)">
                <option value="ALL">ALL</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>

              <input type="search" class="form-input" id="logs-search-input" name="logs-search-query" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Search text or traceId..." style="width: 170px;" oninput="onLogSearchChange(this.value)">
            </div>

            <div style="display: flex; gap: 0.3rem;">
              <button class="astryx-btn btn-outline" id="logs-pause-scroll-btn" style="height: 32px; padding: 0 0.55rem; font-size: 0.75rem;" onclick="toggleAutoScrollPause()">${astryxIcons.pause} Pause Scroll</button>
              <button class="astryx-btn btn-outline" style="height: 32px; padding: 0 0.55rem; font-size: 0.75rem;" onclick="downloadRawLogs()">${astryxIcons.download} Download</button>
              <button class="astryx-btn btn-outline" style="height: 32px; padding: 0 0.55rem; font-size: 0.75rem;" onclick="clearActiveAppLogs()">Clear</button>
            </div>
          </div>
          <div class="terminal-window" id="full-terminal" style="height: 440px;"></div>
        </div>
      </section>

      <!-- Tab 7: Real-time Traffic Analytics & Latency Benchmarks -->
      ${renderTrafficTab()}

      <!-- Tab 8: Sentry-Style Issue Incident Center -->
      ${renderIssuesTab()}

      <!-- Tab: Employees & Org Studio -->
      ${renderEmployeesTab()}

      <!-- Tab 9: Host System & Infrastructure Diagnostics -->
      ${renderHostTab()}

      <!-- Tab 10: Settings & Tools -->
      <section id="tab-settings" class="tab-pane">
        <div class="astryx-card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.15rem; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 700;">
                <span style="color: var(--forge-text-muted); display: flex; align-items: center;">${astryxIcons.settings}</span> Platform Configuration & Tools
              </h2>
              <p style="color: var(--forge-text-muted); font-size: 0.8rem; margin: 0;">Inspect masked environment variables, explore registered API routes, and review administrative audit trails.</p>
            </div>
            <div style="display: flex; gap: 0.45rem; flex-wrap: wrap;">
              <button class="astryx-btn btn-primary" onclick="openApiRegistryModal()">${astryxIcons.zap} API Route Explorer & cURL</button>
              <button class="astryx-btn btn-outline" onclick="openSafeEnvModal()">${astryxIcons.key} Masked Environment Inspector</button>
              <button class="astryx-btn btn-outline" onclick="open247GuideModal()">🛡️ 24/7 Host Setup Guide</button>
              <button class="astryx-btn btn-outline" onclick="exportAuditCsv()">${astryxIcons.download} Export Audit CSV</button>
            </div>
          </div>
        </div>

        <div class="astryx-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <h2 style="font-size: 1.05rem; margin: 0; display: flex; align-items: center; gap: 0.45rem; font-weight: 600;">
              <span style="color: var(--forge-text-muted); display: flex; align-items: center;">${astryxIcons.fileText}</span> Administrative & Security Audit Trail
            </h2>
            <span class="astryx-badge">RFC 7807 Traceable</span>
          </div>
          <div class="astryx-table-wrap" id="audit-table-container">Loading audit logs...</div>
        </div>
      </section>
    </main>
  </div>

  ${getModalsHtml()}

  <script>${getDashboardScripts()}</script>
</body>
</html>`;
}
