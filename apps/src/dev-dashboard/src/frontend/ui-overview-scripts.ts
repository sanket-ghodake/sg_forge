/**
 * @forge/dev-dashboard - Overview Client Controller & Scripts (2026 LTS)
 * High-density mission control telemetry, topology flow, sparklines, and quick tools.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getOverviewDashboardScripts(): string {
  return `
    let isOverviewStreamPaused = false;
    let overviewActiveLogLevel = 'ALL';
    let latencyHistory = [];
    let eventHistory = [];

    function renderSparklineSvg(data, isArea) {
      if (!data || !data.length) return '';
      const min = Math.min(...data, 0), max = Math.max(...data, 5), range = (max - min) || 1;
      const w = 68, h = 18, step = w / Math.max(1, data.length - 1);
      const points = data.map((d, i) => (i * step).toFixed(1) + ',' + (h - ((d - min) / range) * (h - 4) - 2).toFixed(1)).join(' ');
      const fill = isArea ? '<polygon points="0,' + h + ' ' + points + ' ' + w + ',' + h + '" fill="rgba(62, 207, 142, 0.18)" />' : '';
      return '<svg style="width:' + w + 'px; height:' + h + 'px; overflow:visible;" viewBox="0 0 ' + w + ' ' + h + '">' + fill +
        '<polyline points="' + points + '" fill="none" stroke="var(--forge-primary)" stroke-width="1.5" stroke-linecap="round" />' +
      '</svg>';
    }

    async function loadOverviewData() {
      try {
        const [servRes, metricsRes, dbRes] = await Promise.all([
          fetch(apiBase + '/api/services').then(r => r.json()).catch(() => ({ services: [] })),
          fetch(apiBase + '/api/system/metrics').then(r => r.json()).catch(() => ({})),
          fetch(apiBase + '/api/db/list').then(r => r.json()).catch(() => ({ databases: [] })),
        ]);

        const services = servRes.services || [];
        const vitals = metricsRes.vitals || {};
        const databases = dbRes.databases || [];

        updateOverviewHero(services, vitals);
        updateOverviewGoldenVitals(services, vitals, databases);
        renderOverviewFleetGrid(services);
        updateOverviewTopologyNodes(services);
        updateOverviewRadar(databases, vitals);
      } catch (err) {
        console.error('Failed to load overview data', err);
      }
    }

    function updateOverviewHero(services, vitals) {
      const running = services.filter(s => s.status === 'RUNNING');
      const total = services.length;
      const allHealthy = running.length === total && total > 0;

      const statusEl = document.getElementById('overview-cluster-status');
      const iconEl = document.getElementById('overview-cluster-icon');
      const countEl = document.getElementById('overview-healthy-count');
      const uptimeEl = document.getElementById('overview-uptime-badge');

      if (statusEl) {
        statusEl.textContent = allHealthy ? 'All Systems Operational' : (running.length + '/' + total + ' Services Healthy');
      }
      if (iconEl) {
        iconEl.innerHTML = allHealthy
          ? '<span class="badge-dot" style="background:var(--forge-success); box-shadow:0 0 10px var(--forge-success); width:10px; height:10px;"></span>'
          : '<span class="badge-dot" style="background:var(--forge-accent); box-shadow:0 0 10px var(--forge-accent); width:10px; height:10px;"></span>';
      }
      if (countEl) {
        countEl.textContent = running.length + ' of ' + total + ' nodes online';
      }
      if (uptimeEl && vitals.hostUptimeSeconds) {
        const h = Math.floor(vitals.hostUptimeSeconds / 3600);
        const m = Math.floor((vitals.hostUptimeSeconds % 3600) / 60);
        uptimeEl.textContent = 'Host Uptime: ' + h + 'h ' + m + 'm';
      }
    }

    function updateOverviewGoldenVitals(services, vitals, databases) {
      // 1. Latency Vital
      const latencies = services.map(s => s.latencyMs || 0).filter(l => l > 0);
      const avgLat = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : '0.0';
      const maxLat = latencies.length ? Math.max(...latencies).toFixed(1) : '0.0';

      const latEl = document.getElementById('vital-latency-val');
      const p99El = document.getElementById('vital-latency-p99');
      const latSparkEl = document.getElementById('vital-latency-sparkline');

      if (latEl) latEl.textContent = avgLat;
      if (p99El) p99El.textContent = 'peak: ' + maxLat + ' ms';
      if (latSparkEl) {
        latencyHistory.push(Number(avgLat));
        if (latencyHistory.length > 10) latencyHistory.shift();
        latSparkEl.innerHTML = renderSparklineSvg(latencyHistory, true);
      }

      // 2. Memory Vital
      const memPct = vitals.memPercent || 0;
      const usedMb = vitals.usedMemBytes ? Math.round(vitals.usedMemBytes / (1024 * 1024)) : 0;
      const totalGb = vitals.totalMemBytes ? (vitals.totalMemBytes / (1024 * 1024 * 1024)).toFixed(1) : '0.0';
      const physGb = vitals.physicalHostTotalBytes ? (vitals.physicalHostTotalBytes / (1024 * 1024 * 1024)).toFixed(1) : totalGb;

      const ramPctEl = document.getElementById('vital-ram-pct');
      const ramValEl = document.getElementById('vital-ram-val');
      const ramTotalEl = document.getElementById('vital-ram-total');
      const ramBarEl = document.getElementById('vital-ram-bar');

      if (ramPctEl) {
        ramPctEl.textContent = memPct + '%';
        if (vitals.virtualizationType && vitals.virtualizationType !== 'native') {
          ramPctEl.title = vitals.virtualizationNote || '';
        }
      }
      if (ramValEl) ramValEl.textContent = usedMb >= 1024 ? (usedMb / 1024).toFixed(2) + ' GB' : usedMb + ' MB';
      if (ramTotalEl) {
        if (Number(physGb) > Number(totalGb)) {
          ramTotalEl.textContent = '/ ' + totalGb + ' GB (' + physGb + ' GB Host)';
          ramTotalEl.title = vitals.virtualizationNote || 'Allocated inside virtual machine';
        } else {
          ramTotalEl.textContent = '/ ' + totalGb + ' GB';
        }
      }
      if (ramBarEl) ramBarEl.style.width = Math.min(100, memPct) + '%';

      // 3. Database Fleet Vital
      const dbValEl = document.getElementById('vital-db-val');
      const dbTablesEl = document.getElementById('vital-db-tables');
      if (dbValEl) dbValEl.textContent = databases.length;
      if (dbTablesEl && databases.length) {
        const totalTables = databases.reduce((sum, d) => sum + (d.tableCount || 0), 0);
        dbTablesEl.textContent = totalTables + ' tables across ' + databases.length + ' DBs';
      }
    }

    function renderOverviewFleetGrid(services) {
      const grid = document.getElementById('overview-services-fleet-grid');
      if (!grid) return;

      if (!services || !services.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; padding:1.5rem; text-align:center; color:var(--forge-text-muted);">No services registered in cluster registry.</div>';
        return;
      }

      grid.innerHTML = services.map(s => {
        const isRunning = s.status === 'RUNNING';
        const lat = s.latencyMs || 0;
        const latClass = lat <= 5 ? 'latency-fast' : (lat <= 25 ? 'latency-medium' : 'latency-slow');
        const probeHtml = s.dualProbe && s.dualProbe.live
          ? '<span class="astryx-micro-pill" style="color:var(--forge-success);">PROBE OK</span>'
          : '<span class="astryx-micro-pill" style="color:var(--forge-text-muted);">HEALTHY</span>';

        return \`
          <div class="fleet-card">
            <div>
              <div class="fleet-card-top">
                <h4 class="fleet-card-title">
                  <span class="badge-dot" style="background:\${isRunning ? 'var(--forge-success)' : 'var(--forge-accent)'}; width:7px; height:7px;"></span>
                  <span>\${s.name}</span>
                </h4>
                <span class="astryx-badge \${isRunning ? 'badge-running' : 'badge-stopped'}">\${s.status}</span>
              </div>
              <div class="fleet-card-ingress">Port :\${s.port} • \${s.ingressPath || '/'}</div>
              <div class="fleet-card-badges">
                <span class="latency-pill \${latClass}">\${lat}ms</span>
                \${probeHtml}
                <span class="astryx-micro-pill">\${s.category ? s.category.toUpperCase() : 'CORE'}</span>
              </div>
            </div>
            <div class="fleet-card-bottom">
              <div style="font-size:0.7rem; color:var(--forge-text-subtle);">
                PID: \${s.pid || '--'}
              </div>
              <div class="fleet-actions">
                <button class="fleet-btn-xs" onclick="openServiceInspector('\${s.id}')" title="Inspect Service Vitals">Inspect ↗</button>
                <button class="fleet-btn-xs" onclick="jumpToServiceLogs('\${s.id}')" title="Filter Telemetry Stream">Logs</button>
                <button class="fleet-btn-xs" onclick="restartService('\${s.id}')" title="Restart Process">↺</button>
                \${s.ingressPath ? \`<a href="\${s.ingressPath}" class="fleet-btn-xs" target="_blank" title="Launch Ingress Route">Launch ↗</a>\` : ''}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function updateOverviewTopologyNodes(services) {
      services.forEach(s => {
        const nodeLat = document.getElementById('topo-node-' + s.port + '-latency');
        if (nodeLat && s.latencyMs !== undefined) {
          nodeLat.textContent = s.latencyMs + 'ms';
        }
      });
    }

    function updateOverviewRadar(databases, vitals) {
      if (databases && databases.length) {
        const mainDb = databases[0];
        const dbNameEl = document.getElementById('radar-db-name');
        const dbSizeEl = document.getElementById('radar-db-size');
        const dbTablesEl = document.getElementById('radar-db-tables-count');
        if (dbNameEl) dbNameEl.textContent = mainDb.name || 'platform_core.db';
        if (dbSizeEl) {
          const kb = mainDb.sizeBytes ? (mainDb.sizeBytes / 1024).toFixed(1) : '0.0';
          dbSizeEl.textContent = kb + ' KB';
        }
        if (dbTablesEl) {
          dbTablesEl.textContent = (mainDb.tableCount !== undefined ? mainDb.tableCount : 0) + ' active tables';
        }
      }
    }

    async function runOverviewHealthProbe() {
      if (window.showAstryxToast) window.showAstryxToast('info', 'Probing all cluster service endpoints...');
      try {
        const res = await fetch(apiBase + '/api/services').then(r => r.json());
        if (res && res.services) {
          renderOverviewFleetGrid(res.services);
          updateOverviewTopologyNodes(res.services);
          if (window.showAstryxToast) window.showAstryxToast('success', 'Health probe completed: ' + res.services.length + ' nodes responding');
        }
      } catch (err) {
        if (window.showAstryxToast) window.showAstryxToast('error', 'Health probe encountered network timeout');
      }
    }

    async function runOverviewQuickSql() {
      if (window.showAstryxToast) window.showAstryxToast('info', 'Executing diagnostic query against primary database...');
      try {
        const start = performance.now();
        const res = await fetch(apiBase + '/api/db/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dbName: 'platform_core.db', sql: 'SELECT COUNT(*) as total_apps FROM apps_registry;', readOnly: true }),
        }).then(r => r.json());
        const dur = (performance.now() - start).toFixed(2);

        if (res && res.rows) {
          const count = res.rows[0]?.total_apps ?? (res.rows[0] ? Object.values(res.rows[0])[0] : 0);
          if (window.showAstryxToast) window.showAstryxToast('success', 'SQL query completed in ' + dur + 'ms (Registered apps: ' + count + ')');
        } else {
          if (window.showAstryxToast) window.showAstryxToast('success', 'SQL query executed in ' + dur + 'ms');
        }
      } catch (err) {
        if (window.showAstryxToast) window.showAstryxToast('error', 'SQL query execution failed');
      }
    }

    function filterOverviewLogs(level) {
      overviewActiveLogLevel = level;
      document.querySelectorAll('.console-filter-pill').forEach(p => p.classList.remove('active'));
      const activePill = document.getElementById('filter-ov-' + level.toLowerCase());
      if (activePill) activePill.classList.add('active');

      if (window.appLogBuffer) {
        renderOverviewTerminalLogs(window.appLogBuffer);
      }
    }

    function toggleOverviewStreamPause() {
      isOverviewStreamPaused = !isOverviewStreamPaused;
      const btn = document.getElementById('btn-stream-pause');
      if (btn) {
        btn.textContent = isOverviewStreamPaused ? 'Resume' : 'Pause';
        btn.style.color = isOverviewStreamPaused ? 'var(--forge-accent)' : 'var(--forge-text-muted)';
      }
      if (window.showAstryxToast) {
        window.showAstryxToast('info', isOverviewStreamPaused ? 'Live telemetry stream paused' : 'Live telemetry stream resumed');
      }
    }

    function renderOverviewTerminalLogs(logs) {
      const term = document.getElementById('overview-terminal');
      if (!term) return;

      const filtered = logs.filter(l => {
        if (overviewActiveLogLevel === 'ALL') return true;
        return (l.level || '').toUpperCase() === overviewActiveLogLevel;
      });

      if (!filtered.length) {
        term.innerHTML = '<span style="color:var(--forge-text-subtle);">No logs matching current filter (' + overviewActiveLogLevel + ')</span>';
        return;
      }

      term.innerHTML = filtered.slice(-50).map(l => {
        const lvl = (l.level || 'INFO').toUpperCase();
        const lvlColor = lvl === 'ERROR' ? 'var(--forge-accent)' : (lvl === 'WARN' ? 'var(--forge-accent)' : 'var(--forge-primary)');
        const time = (l.timestamp || '').split('T')[1]?.slice(0, 8) || '';
        return '<div style="margin-bottom:2px;">' +
          '<span style="color:var(--forge-text-subtle); margin-right:6px;">' + time + '</span>' +
          '<span style="color:' + lvlColor + '; font-weight:600; margin-right:6px;">[' + lvl + ']</span>' +
          '<span style="color:var(--forge-text-main); font-weight:600; margin-right:6px;">' + (l.service || 'sys') + ':</span>' +
          '<span style="color:var(--forge-text-muted);">' + (l.message || '') + '</span>' +
        '</div>';
      }).join('');

      if (!isOverviewStreamPaused) {
        term.scrollTop = term.scrollHeight;
      }
    }

    async function flushTelemetryBuffer() {
      try {
        await fetch(apiBase + '/api/logs/clear', { method: 'POST' });
        const term = document.getElementById('overview-terminal');
        if (term) term.innerHTML = '<span style="color:var(--forge-text-subtle);">Telemetry ring buffer flushed successfully.</span>';
        if (window.showAstryxToast) window.showAstryxToast('success', 'Telemetry ring buffer cleared');
      } catch (err) {
        if (window.showAstryxToast) window.showAstryxToast('error', 'Failed to flush telemetry buffer');
      }
    }

    async function runFleetBenchmark() {
      if (window.showAstryxToast) window.showAstryxToast('info', 'Running 15-sample fleet latency benchmark...');
      try {
        const res = await fetch(apiBase + '/api/benchmark', { method: 'POST' }).then(r => r.json());
        if (res && res.status === 'ok') {
          const latEl = document.getElementById('vital-latency-val');
          const p99El = document.getElementById('vital-latency-p99');
          const latSparkEl = document.getElementById('vital-latency-sparkline');
          if (latEl) latEl.textContent = res.p50Ms;
          if (p99El) p99El.textContent = 'peak: ' + res.p99Ms + ' ms';
          if (latSparkEl) {
            latencyHistory.push(Number(res.p50Ms));
            if (latencyHistory.length > 10) latencyHistory.shift();
            latSparkEl.innerHTML = renderSparklineSvg(latencyHistory, true);
          }

          const scorecard = document.getElementById('benchmark-scorecard');
          if (scorecard) {
            scorecard.innerHTML = \`
              <div class="astryx-card" style="background:var(--forge-bg-elevated); border:1px solid var(--forge-border-medium);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <strong style="color:var(--forge-primary);">Latency Benchmark Scorecard</strong>
                  <span class="astryx-badge \${res.targetMet ? 'badge-running' : 'badge-degraded'}">\${res.targetMet ? 'SLO TARGET MET (<2ms)' : 'LATENCY WARNING'}</span>
                </div>
                <div style="display:flex; gap:1.5rem; flex-wrap:wrap; font-size:0.85rem;">
                  <div>P50 Median: <strong style="color:var(--forge-success);">\${res.p50Ms}ms</strong></div>
                  <div>P99 Tail: <strong>\${res.p99Ms}ms</strong></div>
                  <div>Avg Latency: <strong>\${res.avgMs}ms</strong></div>
                  <div>Throughput: <strong style="color:var(--forge-primary);">\${res.reqPerSec} req/sec</strong></div>
                </div>
              </div>\`;
          }

          if (window.showAstryxToast) {
            window.showAstryxToast('success', 'Benchmark Complete: p50 ' + res.p50Ms + 'ms | p99 ' + res.p99Ms + 'ms (' + res.reqPerSec + ' req/sec)');
          }
        }
      } catch (err) {
        if (window.showAstryxToast) window.showAstryxToast('error', 'Latency benchmark request failed');
      }
    }
    window.runFleetBenchmark = runFleetBenchmark;
    window.runLatencyBenchmark = runFleetBenchmark;

    function jumpToServiceLogs(serviceId) {
      if (typeof window.navigateToTab === 'function') {
        window.navigateToTab('logs', { app: serviceId });
      } else if (typeof switchTab === 'function') {
        switchTab('logs');
        const sel = document.getElementById('logs-app-select');
        if (sel) {
          sel.value = serviceId;
          if (typeof changeActiveLogApp === 'function') changeActiveLogApp(serviceId);
        }
      }
    }
  `;
}
