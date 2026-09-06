/**
 * @forge/dev-dashboard - Services & Processes Command Center Scripts (2026 LTS)
 * Option C high-density fleet table, live multi-filtering, and slide-out inspector drawer.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getServicesDashboardScripts(): string {
  return `
    let _cachedServices = [];
    let _activeServiceFilter = 'all';
    let _activeInspectedServiceId = null;

    function setServiceFilter(filter) {
      _activeServiceFilter = filter;
      document.querySelectorAll('#services-filter-chips .filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
      renderFilteredServicesTable();
    }

    function filterServicesTable() {
      renderFilteredServicesTable();
    }

    function renderFilteredServicesTable() {
      const tbody = document.getElementById('services-tbody');
      if (!tbody || !_cachedServices) return;

      const searchInput = document.getElementById('services-search-input');
      const search = (searchInput ? searchInput.value : '').toLowerCase().trim();

      const filtered = _cachedServices.filter(s => {
        if (_activeServiceFilter === 'running' && s.status !== 'RUNNING') return false;
        if (_activeServiceFilter === 'stopped' && s.status !== 'STOPPED') return false;
        if (_activeServiceFilter === 'fast' && s.latencyMs >= 5) return false;
        if (search) {
          const matchStr = (s.name + ' ' + s.id + ' ' + s.port + ' ' + s.ingressPath).toLowerCase();
          if (!matchStr.includes(search)) return false;
        }
        return true;
      });

      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem; color:var(--forge-text-muted);">No services matched the active filter.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(s => {
        const latClass = s.latencyMs < 5 ? 'latency-fast' : s.latencyMs < 50 ? 'latency-medium' : 'latency-slow';
        const sBadge = s.status === 'RUNNING' ? '<span class="astryx-badge badge-running"><span class="badge-dot"></span> RUNNING</span>' :
          s.status === 'STOPPED' ? '<span class="astryx-badge badge-stopped">STOPPED</span>' :
          s.status === 'DEGRADED' ? '<span class="astryx-badge badge-degraded">DEGRADED</span>' : '<span class="astryx-badge badge-starting">STARTING</span>';
        const actions = s.status === 'RUNNING'
          ? '<button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="event.stopPropagation(); restartService(\\\'' + s.id + '\\\')">🔄</button>' +
            '<button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="event.stopPropagation(); toggleServiceState(\\\'' + s.id + '\\\',\\\'stop\\\')">🛑</button>'
          : '<button class="astryx-btn btn-primary" style="padding:0.2rem 0.55rem; font-size:0.72rem;" onclick="event.stopPropagation(); toggleServiceState(\\\'' + s.id + '\\\',\\\'start\\\')">▶️ Start</button>';

        const isSelected = s.id === _activeInspectedServiceId;
        return '<tr class="service-row-clickable ' + (isSelected ? 'selected-row' : '') + '" onclick="openServiceDrawer(\\\'' + s.id + '\\\')">' +
          '<td>' + sBadge + '</td>' +
          '<td><div style="display:flex; align-items:center; gap:0.4rem;"><strong>' + s.name + '</strong> <code style="font-size:0.72rem; color:var(--forge-text-subtle);">' + s.id + '</code></div></td>' +
          '<td><div class="sparkline-cell"><span style="min-width:32px; font-weight:600;">' + s.cpuPercent + '%</span>' + renderSparklineSvg(s.cpuSparkline, false) + '</div></td>' +
          '<td><div class="sparkline-cell"><span style="min-width:48px; font-weight:600;">' + s.memoryMb + ' MB</span>' + renderSparklineSvg(s.ramSparkline, true) + '</div></td>' +
          '<td><span class="latency-pill ' + latClass + '" title="Dual-probe latency">' + s.latencyMs + 'ms</span></td>' +
          '<td><code>' + s.port + '</code></td>' +
          '<td><a href="' + s.ingressPath + '" target="_blank" onclick="event.stopPropagation()" style="color:var(--forge-primary); text-decoration:none;"><code>' + s.ingressPath + ' ↗</code></a></td>' +
          '<td style="text-align:right;"><div style="display:inline-flex; gap:0.3rem;">' + actions + '<button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="event.stopPropagation(); openAppLogsModal(\\\'' + s.id + '\\\',\\\'' + s.name + '\\\',\\\'' + s.port + '\\\',\\\'' + s.ingressPath + '\\\')">📜</button><button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="event.stopPropagation(); openServiceDrawer(\\\'' + s.id + '\\\')">🔍</button></div></td>' +
        '</tr>';
      }).join('');
    }

    async function loadServices() {
      try {
        const res = await fetch(apiBase + '/api/services').then(r => r.json());
        if (!res) return;
        _cachedServices = res.services || [];
        const summary = res.summary, cards = document.getElementById('services-vitals-cards');
        if (cards && summary) {
          const storageMb = (summary.storageSizeBytes / (1024 * 1024)).toFixed(1);
          cards.innerHTML = \`
            <div class="vitals-card">
              <div class="vitals-header"><span class="vitals-title">Service Fleet Health</span><span class="astryx-badge badge-running"><span class="badge-dot"></span> Active</span></div>
              <div class="vitals-value">\${summary.onlineCount} / \${summary.totalServices} <span style="font-size:0.85rem; font-weight:500; color:var(--forge-primary);">Running</span></div>
              <div class="vitals-subtext"><span>\${summary.sloAvailabilityPercent}% Availability</span><span style="color:var(--forge-primary); font-weight:600;">100% SLO</span></div>
            </div>
            <div class="vitals-card">
              <div class="vitals-header"><span class="vitals-title">CPU Utilization</span><span class="astryx-badge badge-pill">\${summary.cpuCores} Cores</span></div>
              <div class="vitals-value">\${summary.avgCpuPercent}% <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Avg Load</span></div>
              <div class="vitals-bar-container"><div class="vitals-bar-fill" style="width:\${Math.min(summary.avgCpuPercent, 100)}%;"></div></div>
            </div>
            <div class="vitals-card">
              <div class="vitals-header"><span class="vitals-title">Memory Allocation</span><span class="astryx-badge badge-pill">RAM Pool</span></div>
              <div class="vitals-value">\${summary.totalAllocatedRamMb} MB <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">/ \${summary.maxAllocatedRamMb} MB</span></div>
              <div class="vitals-bar-container"><div class="vitals-bar-fill" style="width:\${Math.min((summary.totalAllocatedRamMb / summary.maxAllocatedRamMb) * 100, 100)}%;"></div></div>
            </div>
            <div class="vitals-card">
              <div class="vitals-header"><span class="vitals-title">Storage & DB Quota</span><span class="astryx-badge badge-running">\${summary.autoVacuum}</span></div>
              <div class="vitals-value">\${storageMb} MB <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">/ \${summary.storageQuotaMb} MB Cap</span></div>
              <div class="vitals-subtext"><span>\${summary.tursoDbsCount} Turso Databases</span><span style="color:var(--forge-primary); font-weight:600;">WAL Enabled</span></div>
            </div>\`;
        }

        const countAll = document.getElementById('count-all');
        const countRun = document.getElementById('count-running');
        const countStop = document.getElementById('count-stopped');
        const countFast = document.getElementById('count-fast');
        if (countAll) countAll.textContent = _cachedServices.length;
        if (countRun) countRun.textContent = _cachedServices.filter(s => s.status === 'RUNNING').length;
        if (countStop) countStop.textContent = _cachedServices.filter(s => s.status === 'STOPPED').length;
        if (countFast) countFast.textContent = _cachedServices.filter(s => s.latencyMs < 5).length;

        if (window._initialAppFilter) {
          const searchInput = document.getElementById('services-search-input');
          if (searchInput) searchInput.value = window._initialAppFilter;
          const match = _cachedServices.find(s => s.id === window._initialAppFilter || s.name.toLowerCase().includes(window._initialAppFilter.toLowerCase()));
          if (match) openServiceDrawer(match.id);
          window._initialAppFilter = null;
        }

        renderFilteredServicesTable();
      } catch (err) { console.error('Services load failed', err); }
    }

    function openServiceDrawer(serviceId) {
      _activeInspectedServiceId = serviceId;
      const s = _cachedServices.find(x => x.id === serviceId);
      if (!s) return;

      const drawer = document.getElementById('service-drawer');
      const backdrop = document.getElementById('service-drawer-backdrop');
      const iconEl = document.getElementById('drawer-svc-icon');
      const nameEl = document.getElementById('drawer-svc-name');
      const metaEl = document.getElementById('drawer-svc-meta');
      const bodyEl = document.getElementById('drawer-body-content');

      const icons = { landing: '🏠', auth: '🔒', portal: '📂', 'dev-dashboard': '📊', 'dev-hub': '🔀', expenses: '💳', billing: '🧾', telemetry: '📡' };
      if (iconEl) iconEl.textContent = icons[s.id] || '⚡';
      if (nameEl) nameEl.textContent = s.name + ' (' + s.id + ')';
      if (metaEl) metaEl.textContent = 'Port: :' + s.port + ' | Ingress: ' + s.ingressPath;

      if (bodyEl) {
        bodyEl.innerHTML = \`
          <div class="drawer-card">
            <div class="drawer-card-title"><span>🩺 Dual-Probe Health Verification</span><span class="astryx-badge \${s.status === 'RUNNING' ? 'badge-running' : 'badge-stopped'}">\${s.status}</span></div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; margin-bottom:0.65rem;">
              <span>Recorded Latency: <strong style="color:var(--forge-primary);">\${s.latencyMs}ms</strong></span>
              <button class="astryx-btn btn-primary" style="padding:0.25rem 0.6rem; font-size:0.74rem;" onclick="testServiceHealthProbe('\${s.id}', '\${s.port}', '\${s.ingressPath}')">🚀 Ping /health</button>
            </div>
            <div id="drawer-probe-output" class="drawer-probe-result">Click 'Ping /health' to test live endpoint responsiveness.</div>
          </div>

          <div class="drawer-card">
            <div class="drawer-card-title"><span>📊 Real-Time Vitals</span><span style="font-size:0.75rem; color:var(--forge-text-muted);">High-Frequency</span></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div style="background:var(--forge-bg-elevated); padding:0.6rem; border-radius:4px; border:1px solid var(--forge-border);">
                <div style="font-size:0.7rem; color:var(--forge-text-muted);">CPU Utilization</div>
                <div style="font-size:1.1rem; font-weight:700; color:var(--forge-text-main);">\${s.cpuPercent}%</div>
                <div style="margin-top:0.3rem;">\${renderSparklineSvg(s.cpuSparkline, false)}</div>
              </div>
              <div style="background:var(--forge-bg-elevated); padding:0.6rem; border-radius:4px; border:1px solid var(--forge-border);">
                <div style="font-size:0.7rem; color:var(--forge-text-muted);">RAM Memory Usage</div>
                <div style="font-size:1.1rem; font-weight:700; color:var(--forge-text-main);">\${s.memoryMb} MB</div>
                <div style="margin-top:0.3rem;">\${renderSparklineSvg(s.ramSparkline, true)}</div>
              </div>
            </div>
          </div>

          <div class="drawer-card">
            <div class="drawer-card-title"><span>⚡ Lifecycle Operations</span></div>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.75rem; font-size:0.76rem;" onclick="restartService('\${s.id}')">🔄 Restart Process</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.75rem; font-size:0.76rem;" onclick="toggleServiceState('\${s.id}', '\${s.status === 'RUNNING' ? 'stop' : 'start'}')">\${s.status === 'RUNNING' ? '🛑 Halt Process' : '▶️ Start Process'}</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.75rem; font-size:0.76rem;" onclick="openAppLogsModal('\${s.id}', '\${s.name}', '\${s.port}', '\${s.ingressPath}')">📜 4-Pillar Logs</button>
              <a class="astryx-btn btn-primary" href="\${s.ingressPath}" target="_blank" style="padding:0.35rem 0.75rem; font-size:0.76rem; text-decoration:none;">🔗 Open URL ↗</a>
            </div>
          </div>\`;
      }

      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      renderFilteredServicesTable();
    }

    function closeServiceDrawer() {
      _activeInspectedServiceId = null;
      const drawer = document.getElementById('service-drawer');
      const backdrop = document.getElementById('service-drawer-backdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      renderFilteredServicesTable();
    }

    async function testServiceHealthProbe(serviceId, port, ingressPath) {
      const output = document.getElementById('drawer-probe-output');
      if (!output) return;
      output.textContent = '⏱️ Dispatching synthetic /health probe...';
      const t0 = performance.now();
      try {
        const isProxied = window.location.port === '80' || window.location.port === '443' || window.location.port === '' || window.location.pathname.startsWith('/devcenter');
        const targetUrl = isProxied
          ? (ingressPath === '/' ? '/health' : ingressPath + '/health')
          : (window.location.protocol + '//' + window.location.hostname + ':' + port + '/health');
        const res = await fetch(targetUrl);
        const duration = (performance.now() - t0).toFixed(2);
        let bodyText = '';
        try {
          const json = await res.json();
          bodyText = JSON.stringify(json, null, 2);
        } catch {
          bodyText = await res.text();
        }
        output.textContent = 'HTTP Status: ' + res.status + ' ' + res.statusText + '\\nRound-trip Time: ' + duration + 'ms\\nTarget Route: ' + targetUrl + '\\nResponse Body:\\n' + bodyText;
      } catch (err) {
        const duration = (performance.now() - t0).toFixed(2);
        output.textContent = '⚠️ Probe Error (' + duration + 'ms): ' + (err.message || err);
      }
    }

    async function rollingRestartFleet() {
      const btn = event && event.target;
      if (btn) btn.textContent = '⏳ Restarting Fleet...';
      for (const s of _cachedServices) {
        if (s.status === 'RUNNING') {
          await fetch(apiBase + '/api/services/restart', { method: 'POST', body: JSON.stringify({ serviceId: s.id }) });
        }
      }
      if (btn) btn.textContent = '🔄 Restart Fleet';
      loadServices();
      loadTopology();
    }

    async function restartService(id) {
      await fetch(apiBase + '/api/services/restart', { method: 'POST', body: JSON.stringify({ serviceId: id }) });
      loadServices();
      loadTopology();
    }

    async function toggleServiceState(id, state) {
      await fetch(apiBase + '/api/services/toggle', { method: 'POST', body: JSON.stringify({ serviceId: id, state }) });
      loadServices();
      loadTopology();
    }
  `;
}
