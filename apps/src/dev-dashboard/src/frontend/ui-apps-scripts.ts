/**
 * @forge/dev-dashboard - Forge Apps Command Center Fleet Scripts (2026 LTS)
 * Client-side fleet data management, filtering, grid and matrix table views.
 * Enterprise Micro-App Console Standard
 */

import { getAppsModalScripts } from './ui-apps-modal-scripts';

/**
 * getAppsDashboardScripts
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAppsDashboardScripts(): string {
  return `
    let _cachedAppsList = [];
    let _activeAppFilter = 'all';
    let _activeAppViewMode = 'grid';
    let _inspectedAppId = null;
    let _sandboxActiveUrl = '';

    const _appIcons = {
      landing: '🏠',
      auth: '🔒',
      portal: '📂',
      devcenter: '📊',
      'dev-dashboard': '📊',
      gateway: '🔀',
      'dev-hub': '🔀',
      expenses: '💳',
      billing: '🧾',
      telemetry: '📡',
      inventory: '📦',
      analytics: '📈',
    };

    function getAppIcon(id) {
      if (_appIcons[id]) return _appIcons[id];
      const match = Object.keys(_appIcons).find(k => id.includes(k));
      return match ? _appIcons[match] : '⚡';
    }

    function getAppTargetUrl(a) {
      if (!a) return '/';
      if (a.remote_url) return a.remote_url;
      const isProxied = window.location.port === '80' || window.location.port === '443' || window.location.port === '' || window.location.pathname.startsWith('/devcenter');
      if (isProxied) {
        return a.ingress_path || ('/apps/' + a.id);
      }
      return window.location.protocol + '//' + window.location.hostname + ':' + a.port;
    }

    async function loadApps() {
      try {
        const res = await fetch(apiBase + '/api/apps').then(r => r.json());
        if (!res || !res.apps) return;
        _cachedAppsList = res.apps;

        // 1. Update Fleet Vitals Cards
        const overview = res.overview;
        if (overview) {
          const sloEl = document.getElementById('vitals-apps-slo');
          const availEl = document.getElementById('vitals-apps-avail');
          const storageEl = document.getElementById('vitals-apps-storage');
          const dbsEl = document.getElementById('vitals-apps-dbs-count');
          const rolesEl = document.getElementById('vitals-apps-roles');
          const routingEl = document.getElementById('vitals-apps-routing');

          if (sloEl) sloEl.innerHTML = overview.runningApps + ' / ' + overview.totalApps + ' <span style="font-size:0.85rem; font-weight:500; color:var(--forge-primary);">Running</span>';
          if (availEl) {
            const availPct = overview.totalApps > 0 ? ((overview.runningApps / overview.totalApps) * 100).toFixed(1) : 100;
            availEl.textContent = availPct + '% Fleet Availability';
          }
          if (storageEl) {
            const mb = (overview.totalDbStorageBytes / (1024 * 1024)).toFixed(2);
            storageEl.innerHTML = mb + ' MB <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Allocated</span>';
          }
          if (dbsEl) dbsEl.textContent = overview.totalApps + ' Dedicated Databases';
          if (rolesEl) {
            const roleCount = Object.keys(overview.roleBreakdown || {}).length;
            rolesEl.innerHTML = roleCount + ' <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Security Roles</span>';
          }
          if (routingEl) routingEl.innerHTML = overview.totalApps + ' <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Active Routes</span>';
        }

        // 2. Update Filter Counts
        const cAll = document.getElementById('app-count-all');
        const cRun = document.getElementById('app-count-running');
        const cDis = document.getElementById('app-count-disabled');
        const cDeg = document.getElementById('app-count-degraded');
        const cStop = document.getElementById('app-count-stopped');
        const cPoly = document.getElementById('app-count-polyglot');
        const cCore = document.getElementById('app-count-core');

        if (cAll) cAll.textContent = _cachedAppsList.length;
        if (cRun) cRun.textContent = _cachedAppsList.filter(a => a.healthStatus === 'RUNNING' && a.status !== 'disabled').length;
        if (cDis) cDis.textContent = _cachedAppsList.filter(a => a.status === 'disabled').length;
        if (cDeg) cDeg.textContent = _cachedAppsList.filter(a => a.healthStatus === 'DEGRADED').length;
        if (cStop) cStop.textContent = _cachedAppsList.filter(a => a.healthStatus === 'STOPPED' && a.status !== 'disabled').length;
        if (cPoly) cPoly.textContent = _cachedAppsList.filter(a => a.category && a.category.toLowerCase().includes('polyglot')).length;
        if (cCore) cCore.textContent = _cachedAppsList.filter(a => a.category && a.category.toLowerCase().includes('core')).length;

        renderAppsView();
      } catch (err) {
        console.error('Apps fetch error:', err);
      }
    }

    function setAppFilter(filter) {
      _activeAppFilter = filter;
      document.querySelectorAll('#apps-filter-chips .filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
      renderAppsView();
    }

    function setAppViewMode(mode) {
      _activeAppViewMode = mode;
      const gridBtn = document.getElementById('btn-view-grid');
      const tableBtn = document.getElementById('btn-view-table');
      const gridView = document.getElementById('apps-grid-view');
      const tableView = document.getElementById('apps-table-view');

      if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
      if (tableBtn) tableBtn.classList.toggle('active', mode === 'table');
      if (gridView) gridView.style.display = mode === 'grid' ? 'grid' : 'none';
      if (tableView) tableView.style.display = mode === 'table' ? 'block' : 'none';

      renderAppsView();
    }

    function filterApps() {
      renderAppsView();
    }

    function getFilteredApps() {
      const search = (document.getElementById('apps-search-input')?.value || '').toLowerCase().trim();
      return _cachedAppsList.filter(a => {
        if (_activeAppFilter === 'disabled' && a.status !== 'disabled') return false;
        if (_activeAppFilter === 'running' && (a.healthStatus !== 'RUNNING' || a.status === 'disabled')) return false;
        if (_activeAppFilter === 'degraded' && a.healthStatus !== 'DEGRADED') return false;
        if (_activeAppFilter === 'stopped' && (a.healthStatus !== 'STOPPED' || a.status === 'disabled')) return false;
        if (_activeAppFilter === 'polyglot' && !(a.category && a.category.toLowerCase().includes('polyglot'))) return false;
        if (_activeAppFilter === 'core' && !(a.category && a.category.toLowerCase().includes('core'))) return false;

        if (search) {
          const matchStr = (a.name + ' ' + a.id + ' ' + a.port + ' ' + a.ingress_path + ' ' + a.category + ' ' + a.access_role + ' ' + (a.status || '')).toLowerCase();
          if (!matchStr.includes(search)) return false;
        }
        return true;
      });
    }

    async function toggleAppStatus(id) {
      try {
        const res = await fetch(apiBase + '/api/apps/toggle-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        }).then(r => r.json());

        if (res.error) {
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('error', 'Error: ' + res.error);
          }
        } else {
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('success', res.message || 'Status updated');
          }
          await loadApps();
          if (_inspectedAppId === id) {
            openAppInspectorDrawer(id);
          }
        }
      } catch (err) {
        if (typeof window.showAstryxToast === 'function') {
          window.showAstryxToast('error', 'Failed to update status: ' + err);
        }
      }
    }

    function renderAppsView() {
      const filtered = getFilteredApps();
      const gridEl = document.getElementById('apps-grid-view');
      const tbodyEl = document.getElementById('apps-table-tbody');

      if (_activeAppViewMode === 'grid' && gridEl) {
        if (!filtered.length) {
          gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--forge-text-muted); background: var(--forge-bg-card); border: 1px dashed var(--forge-border); border-radius: var(--forge-radius-md);">No micro-apps matched the current filter.</div>';
          return;
        }

        gridEl.innerHTML = filtered.map(a => {
          const isDisabled = a.status === 'disabled';
          const isRunning = a.healthStatus === 'RUNNING';
          const isDegraded = a.healthStatus === 'DEGRADED';
          const icon = getAppIcon(a.id);
          const statusBadge = isDisabled
            ? '<span class="astryx-badge badge-disabled"><span class="badge-dot"></span> DISABLED</span>'
            : isRunning
            ? '<span class="astryx-badge badge-running"><span class="badge-dot"></span> RUNNING</span>'
            : isDegraded
            ? '<span class="astryx-badge badge-degraded"><span class="badge-dot"></span> DEGRADED</span>'
            : '<span class="astryx-badge badge-stopped">STOPPED</span>';

          const dbName = a.db_file_path ? a.db_file_path.split('/').pop() : a.id + '.db';
          const dbKb = a.dbSizeBytes ? (a.dbSizeBytes / 1024).toFixed(1) + ' KB' : '0 KB';
          const targetUrl = getAppTargetUrl(a);

          return \`
            <div class="app-card \${isDisabled ? 'card-disabled' : isRunning ? '' : 'card-stopped'}">
              <div>
                <div class="app-card-top">
                  <div class="app-card-title-group">
                    <div class="app-card-icon">\${icon}</div>
                    <div>
                      <h4 class="app-card-name">\${a.name}</h4>
                      <div class="app-card-id"><code>\${a.id}</code></div>
                    </div>
                  </div>
                  \${statusBadge}
                </div>

                <div class="app-card-pills">
                  <span class="astryx-micro-pill">\${a.category}</span>
                  <span class="astryx-micro-pill" style="border-color: rgba(62, 207, 142, 0.3);">ROLE: \${a.access_role}</span>
                  \${isDisabled ? '<span class="astryx-micro-pill" style="border-color: var(--forge-border-medium); color: var(--forge-accent);">HIDDEN FROM PORTAL</span>' : ''}
                </div>

                <div class="app-card-meta">
                  <div class="app-card-meta-item">
                    <span class="app-card-meta-label">Port & Ingress</span>
                    <span class="app-card-meta-val">:\${a.port} \${a.ingress_path}</span>
                  </div>
                  <div class="app-card-meta-item">
                    <span class="app-card-meta-label">Turso DB</span>
                    <span class="app-card-meta-val" title="\${dbName}">\${dbName} (\${dbKb})</span>
                  </div>
                  <div class="app-card-meta-item">
                    <span class="app-card-meta-label">Health Latency</span>
                    <span class="app-card-meta-val" style="color:\${a.latencyMs < 10 ? 'var(--forge-primary)' : 'var(--forge-text-main)'};">\${a.latencyMs || 0}ms</span>
                  </div>
                  <div class="app-card-meta-item">
                    <span class="app-card-meta-label">Open Issues</span>
                    <span class="app-card-meta-val" style="color:\${a.openIssuesCount > 0 ? 'var(--forge-accent)' : 'var(--forge-text-muted)'};">\${a.openIssuesCount} reports</span>
                  </div>
                </div>
              </div>

              <div class="app-card-actions">
                <div class="app-card-btn-group">
                  <button class="astryx-btn btn-outline" style="padding:0.22rem 0.48rem; font-size:0.72rem;" onclick="openAppInspectorDrawer('\${a.id}')" title="Inspect Micro-App">🔍 Details</button>
                  <button class="astryx-btn btn-outline \${isDisabled ? 'btn-toggle-enable' : 'btn-toggle-disable'}" style="padding:0.22rem 0.48rem; font-size:0.72rem;" onclick="event.stopPropagation(); toggleAppStatus('\${a.id}')" title="\${isDisabled ? 'Enable App for Employees' : 'Disable App (Hide from Employees)'}">\${isDisabled ? '✅ Enable' : '🚫 Disable'}</button>
                  <button class="astryx-btn btn-outline" style="padding:0.22rem 0.48rem; font-size:0.72rem;" onclick="jumpToDbStudio('\${dbName}')" title="Open in Database Studio">🗄️ DB</button>
                  <button class="astryx-btn btn-outline" style="padding:0.22rem 0.48rem; font-size:0.72rem;" onclick="jumpToLogs('\${a.id}')" title="Open App Logs">📜 Logs</button>
                  <button class="astryx-btn btn-outline" style="padding:0.22rem 0.48rem; font-size:0.72rem;" onclick="openEditAppModal('\${a.id}')" title="Edit App Settings">⚙️</button>
                </div>
                <a href="\${targetUrl}" target="_blank" class="astryx-btn btn-primary" style="padding:0.25rem 0.65rem; font-size:0.72rem; text-decoration:none;">Launch ↗</a>
              </div>
            </div>\`;
        }).join('');
      }

      if (_activeAppViewMode === 'table' && tbodyEl) {
        if (!filtered.length) {
          tbodyEl.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2.5rem; color:var(--forge-text-muted);">No micro-apps matched the current filter.</td></tr>';
          return;
        }

        tbodyEl.innerHTML = filtered.map(a => {
          const isDisabled = a.status === 'disabled';
          const isRunning = a.healthStatus === 'RUNNING';
          const icon = getAppIcon(a.id);
          const sBadge = isDisabled
            ? '<span class="astryx-badge badge-disabled"><span class="badge-dot"></span> DISABLED</span>'
            : isRunning
            ? '<span class="astryx-badge badge-running"><span class="badge-dot"></span> RUNNING</span>'
            : '<span class="astryx-badge badge-stopped">STOPPED</span>';
          const dbName = a.db_file_path ? a.db_file_path.split('/').pop() : a.id + '.db';
          const targetUrl = getAppTargetUrl(a);

          return \`
            <tr style="cursor: pointer;" class="\${isDisabled ? 'card-disabled' : ''}" onclick="openAppInspectorDrawer('\${a.id}')">
              <td>\${sBadge}</td>
              <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="font-size:1.1rem;">\${icon}</span>
                  <div>
                    <strong>\${a.name}</strong>
                    <div style="font-size:0.7rem; color:var(--forge-text-subtle); font-family:'Geist Mono', monospace;">\${a.id}</div>
                  </div>
                </div>
              </td>
              <td>
                <div><span class="astryx-micro-pill">\${a.category}</span></div>
                <div style="margin-top:0.25rem; font-size:0.72rem; color:var(--forge-text-muted);">\${a.access_role}</div>
              </td>
              <td>
                <div><code>:\${a.port}</code></div>
                <div style="font-size:0.72rem; color:var(--forge-primary);">\${a.ingress_path}</div>
              </td>
              <td>
                <button class="astryx-btn btn-outline" style="padding:0.15rem 0.45rem; font-size:0.7rem;" onclick="event.stopPropagation(); jumpToDbStudio('\${dbName}')">🗄️ \${dbName}</button>
              </td>
              <td>
                <span class="latency-pill \${a.latencyMs < 10 ? 'latency-fast' : 'latency-medium'}">\${a.latencyMs || 0}ms</span>
              </td>
              <td>
                <span style="font-size:0.75rem; color:\${a.openIssuesCount > 0 ? 'var(--forge-accent)' : 'var(--forge-text-muted)'};">\${a.openIssuesCount} open</span>
              </td>
              <td style="text-align:right;">
                <div style="display:inline-flex; gap:0.3rem;" onclick="event.stopPropagation()">
                  <button class="astryx-btn btn-outline \${isDisabled ? 'btn-toggle-enable' : 'btn-toggle-disable'}" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="toggleAppStatus('\${a.id}')" title="\${isDisabled ? 'Enable' : 'Disable'}">\${isDisabled ? '✅' : '🚫'}</button>
                  <button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="openAppSandboxModal('\${a.id}', '\${a.name}', '\${targetUrl}')" title="Preview">🖥️</button>
                  <button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="jumpToLogs('\${a.id}')" title="Logs">📜</button>
                  <button class="astryx-btn btn-outline" style="padding:0.2rem 0.45rem; font-size:0.72rem;" onclick="openEditAppModal('\${a.id}')" title="Edit">⚙️</button>
                  <a href="\${targetUrl}" target="_blank" class="astryx-btn btn-primary" style="padding:0.2rem 0.55rem; font-size:0.72rem; text-decoration:none;">↗</a>
                </div>
              </td>
            </tr>\`;
        }).join('');
      }
    }

    ${getAppsModalScripts()}
  `;
}
