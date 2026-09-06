/**
 * @forge/dev-dashboard - Developer Tools & Command Palette Client Scripts (2026 LTS)
 * Modular client-side scripts for Command Palette (Cmd+K), Safe Env, and API Registry.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getToolsDashboardScripts(): string {
  return `
    // 🔌 Connect Remote DB Modal Handlers
    function openConnectModal() {
      document.getElementById('connect-db-modal')?.classList.add('open');
      const st = document.getElementById('remote-conn-status');
      if (st) st.innerHTML = '';
    }
    function closeConnectModal() {
      document.getElementById('connect-db-modal')?.classList.remove('open');
    }

    async function testRemoteConnection() {
      const url = document.getElementById('remote-conn-url')?.value;
      const token = document.getElementById('remote-conn-token')?.value;
      const type = document.getElementById('remote-conn-type')?.value;
      const st = document.getElementById('remote-conn-status');
      if (!url) {
        if (st) st.innerHTML = '<span style="color:var(--forge-accent);">Please enter a connection URL.</span>';
        return;
      }
      if (st) st.innerHTML = '<span style="color:var(--forge-primary);">Pinging remote database endpoint...</span>';
      try {
        const res = await fetch(apiBase + '/api/db/test-connect', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, authToken: token, type })
        }).then(r => r.json());
        if (res.success) {
          if (st) st.innerHTML = '<span style="color:var(--forge-success);">🟢 Connection successful (' + res.latencyMs + 'ms latency)</span>';
        } else {
          if (st) st.innerHTML = '<span style="color:var(--forge-accent);">🔴 Connection failed: ' + (res.error || 'Check endpoint and credentials') + '</span>';
        }
      } catch (err) {
        if (st) st.innerHTML = '<span style="color:var(--forge-accent);">Ping error: ' + err.message + '</span>';
      }
    }

    async function saveRemoteConnection() {
      const name = document.getElementById('remote-conn-name')?.value;
      const url = document.getElementById('remote-conn-url')?.value;
      const token = document.getElementById('remote-conn-token')?.value;
      const type = document.getElementById('remote-conn-type')?.value;
      const mode = document.getElementById('remote-conn-mode')?.value;
      const st = document.getElementById('remote-conn-status');
      if (!name || !url) {
        if (st) st.innerHTML = '<span style="color:var(--forge-accent);">Name and URL are required.</span>';
        return;
      }
      try {
        const res = await fetch(apiBase + '/api/db/connect', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, authToken: token, type, readOnly: mode === 'readonly' })
        }).then(r => r.json());
        if (res.success) {
          if (window.astryxToast) window.astryxToast('Connected to ' + name + ' successfully!', 'success');
          closeConnectModal();
          await loadDatabases();
          if (res.connectionId) {
            document.getElementById('db-select').value = res.connectionId;
            inspectDatabase(res.connectionId);
          }
        } else {
          if (st) st.innerHTML = '<span style="color:var(--forge-accent);">' + (res.message || 'Failed to save connection') + '</span>';
        }
      } catch (err) {
        if (st) st.innerHTML = '<span style="color:var(--forge-accent);">Save failed: ' + err.message + '</span>';
      }
    }

    // ⚡ Command Palette & Modal Handlers
    const paletteCommands = [
      { label: 'Overview (Topology & Vitals)', action: () => switchTab('overview') },
      { label: 'Services & Processes Command Center', action: () => switchTab('services') },
      { label: 'Registered Forge Apps', action: () => switchTab('apps') },
      { label: 'Unified Database Studio', action: () => switchTab('database') },
      { label: 'Isolated App Logs & Observability', action: () => switchTab('logs') },
      { label: 'Organization Command & Employee Studio', action: () => switchTab('employees') },
      { label: 'Real-time Traffic Analytics', action: () => switchTab('traffic') },
      { label: 'Issue Incident Center (RFC 7807)', action: () => switchTab('issues') },
      { label: 'Host Infrastructure Metrics', action: () => switchTab('host') },
      { label: 'Settings & Tools', action: () => switchTab('settings') },
      { label: 'Connect Remote Database', action: () => openConnectModal() },
      { label: 'Open API Route Explorer & cURL', action: () => openApiRegistryModal() },
      { label: 'Open Masked Environment Inspector', action: () => openSafeEnvModal() },
      { label: 'Run Latency Benchmark', action: () => { switchTab('services'); runLatencyBenchmark(); } },
      { label: '1-Click Database Optimize', action: () => optimizeCurrentDb() }
    ];

    function openCommandPalette() {
      const modal = document.getElementById('cmd-palette-modal');
      const input = document.getElementById('palette-search-input');
      if (modal) modal.classList.add('open');
      if (input) { input.value = ''; input.focus(); }
      filterPaletteItems('');
    }

    function closeCommandPalette() {
      document.getElementById('cmd-palette-modal')?.classList.remove('open');
    }

    function filterPaletteItems(q) {
      const list = document.getElementById('palette-items-list');
      if (!list) return;
      const filtered = !q ? paletteCommands : paletteCommands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
      list.innerHTML = filtered.map((c, i) =>
        '<li class="palette-item" onclick="executePaletteItem(' + i + ')">' +
        '<span>' + c.label + '</span>' +
        '<span style="font-size:0.75rem; color:var(--forge-text-muted);">&rarr; Jump</span>' +
        '</li>'
      ).join('');
      window._activePaletteList = filtered;
    }

    function executePaletteItem(index) {
      const item = (window._activePaletteList || paletteCommands)[index];
      if (item && item.action) {
        item.action();
        closeCommandPalette();
      }
    }

    async function openSafeEnvModal() {
      const modal = document.getElementById('safe-env-modal');
      const cont = document.getElementById('safe-env-table-container');
      if (modal) modal.classList.add('open');
      if (cont) cont.innerHTML = '<div style="color:var(--forge-text-muted);">Loading environment configs...</div>';
      try {
        const res = await fetch(apiBase + '/api/env/safe').then(r => r.json());
        if (cont && res.env) {
          const keys = Object.keys(res.env).sort();
          cont.innerHTML = '<table class="data-table"><thead><tr><th>Variable</th><th>Active Value</th></tr></thead><tbody>' +
            keys.map(k => '<tr><td><code>' + k + '</code></td><td>' + res.env[k] + '</td></tr>').join('') + '</tbody></table>';
        }
      } catch (err) { if (cont) cont.innerHTML = '<div style="color:var(--forge-accent);">Failed to load env.</div>'; }
    }
    function closeSafeEnvModal() { document.getElementById('safe-env-modal')?.classList.remove('open'); }

    function copyCurlSnippet(path, port) {
      const target = path.startsWith('http') ? path : 'http://localhost:' + port + path;
      navigator.clipboard.writeText('curl -i ' + target);
      if (window.astryxToast) {
        window.astryxToast('cURL command copied to clipboard: curl -i ' + target, 'info');
      }
    }

    async function openApiRegistryModal() {
      const modal = document.getElementById('api-registry-modal');
      const cont = document.getElementById('api-registry-container');
      if (modal) modal.classList.add('open');
      if (cont) cont.innerHTML = '<div style="color:var(--forge-text-muted);">Loading API endpoints...</div>';
      try {
        const res = await fetch(apiBase + '/api/routes/registry').then(r => r.json());
        if (cont && res.endpoints) {
          cont.innerHTML = res.endpoints.map(e =>
            '<div class="astryx-card" style="margin-bottom:0.75rem; background:var(--forge-bg-elevated);">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<strong>' + e.name + ' (' + e.serviceId + ')</strong>' +
                '<span class="astryx-badge badge-running">:' + e.port + '</span>' +
              '</div>' +
              '<div style="margin-top:0.4rem; font-size:0.78rem;">' +
                e.sampleRoutes.map(r =>
                  '<div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0; border-bottom:1px solid var(--forge-border);">' +
                    '<code>' + r.method + ' ' + r.path + '</code>' +
                    '<button class="astryx-btn btn-outline" style="padding:0.1rem 0.35rem; font-size:0.68rem;" onclick="copyCurlSnippet(\\'' + r.path + '\\', ' + e.port + ')">📋 Copy cURL</button>' +
                  '</div>'
                ).join('') +
              '</div>' +
            '</div>'
          ).join('');
        }
      } catch (err) { if (cont) cont.innerHTML = '<div style="color:var(--forge-accent);">Failed to load registry.</div>'; }
    }
    function closeApiRegistryModal() { document.getElementById('api-registry-modal')?.classList.remove('open'); }

    // ⌨️ Global Developer Keyboard Conductor
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === 'Escape') {
        closeCommandPalette();
        closeConnectModal();
        closeSafeEnvModal();
        closeApiRegistryModal();
        closeHelpModal();
        closeAppLogsModal();
        if (typeof close247GuideModal === 'function') close247GuideModal();
        if (typeof closeServiceDrawer === 'function') closeServiceDrawer();
        if (typeof closeEmployeeModal === 'function') closeEmployeeModal();
        if (typeof closeEmployeeDrawer === 'function') closeEmployeeDrawer();
        if (typeof closeHierarchyModal === 'function') closeHierarchyModal();
        if (typeof closeImportWizard === 'function') closeImportWizard();
      } else if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        const tabMap = { '1': 'overview', '2': 'services', '3': 'apps', '4': 'database', '5': 'logs', '6': 'traffic', '7': 'issues', '8': 'employees', '9': 'host', '0': 'settings' };
        if (tabMap[e.key]) switchTab(tabMap[e.key]);
      }
    });
  `;
}
