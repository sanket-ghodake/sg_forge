/**
 * @forge/dev-dashboard - Forge Apps Modal & Drawer Scripts (2026 LTS)
 * Client-side logic for slide-out inspector drawer, sandbox iframe preview, registration wizard, edit modal, and deep links.
 * Enterprise Micro-App Console Standard
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getAppsModalScripts(): string {
  return `
    // ==============================================================================
    // Drawer & Inspector Operations
    // ==============================================================================
    async function openAppInspectorDrawer(id) {
      _inspectedAppId = id;
      const drawer = document.getElementById('app-drawer');
      const backdrop = document.getElementById('app-drawer-backdrop');
      const iconEl = document.getElementById('drawer-app-icon');
      const nameEl = document.getElementById('drawer-app-name');
      const metaEl = document.getElementById('drawer-app-meta');
      const bodyEl = document.getElementById('app-drawer-body-content');

      const app = _cachedAppsList.find(a => a.id === id);
      if (!app) return;

      if (iconEl) iconEl.textContent = getAppIcon(app.id);
      if (nameEl) nameEl.textContent = app.name;
      if (metaEl) metaEl.textContent = 'ID: ' + app.id + ' | Port: :' + app.port + ' | Route: ' + app.ingress_path;

      if (bodyEl) {
        bodyEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--forge-text-muted);">Fetching deep diagnostics...</div>';
      }

      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');

      try {
        const details = await fetch(apiBase + '/api/apps/inspect?id=' + encodeURIComponent(id)).then(r => r.json());
        if (!details || !details.app || !bodyEl) return;

        const dbName = details.database.path ? details.database.path.split('/').pop() : id + '.db';
        const dbKb = (details.database.sizeBytes / 1024).toFixed(1);
        const targetUrl = getAppTargetUrl(app);
        const isDisabled = app.status === 'disabled';

        bodyEl.innerHTML = \`
          \${isDisabled ? \`
            <div class="drawer-card drawer-banner-disabled">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color: var(--forge-accent); font-size: 0.85rem;">🚫 Application Disabled</strong>
                  <div style="font-size: 0.74rem; color: var(--forge-text-muted); margin-top: 0.2rem;">
                    This micro-app is hidden from the Employee Portal and public users. It remains fully active for developer inspection and monitoring.
                  </div>
                </div>
                <button class="astryx-btn btn-primary" style="padding:0.3rem 0.7rem; font-size:0.75rem; white-space:nowrap;" onclick="toggleAppStatus('\${app.id}')">✅ Enable App</button>
              </div>
            </div>
          \` : ''}

          <!-- 1. Health Probe Test -->
          <div class="drawer-card">
            <div class="drawer-card-title">
              <span>🩺 Dual-Probe Health Verification</span>
              <div style="display:flex; gap:0.4rem; align-items:center;">
                \${isDisabled ? '<span class="astryx-badge badge-disabled">DISABLED</span>' : ''}
                <span class="astryx-badge \${details.health.status === 'RUNNING' ? 'badge-running' : 'badge-stopped'}">\${details.health.status}</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; margin-bottom:0.65rem;">
              <span>Recorded Latency: <strong style="color:var(--forge-primary);">\${details.health.latencyMs}ms</strong></span>
              <button class="astryx-btn btn-primary" style="padding:0.25rem 0.6rem; font-size:0.74rem;" onclick="testDrawerHealthProbe('\${app.id}', '\${app.port}', '\${app.ingress_path}')">🚀 Ping /health</button>
            </div>
            <div id="drawer-app-probe-output" class="drawer-probe-result">Click 'Ping /health' to test live endpoint responsiveness.</div>
          </div>

          <!-- 2. Dedicated Turso Database Studio -->
          <div class="drawer-card">
            <div class="drawer-card-title">
              <span>🗄️ Dedicated Turso Database</span>
              <span class="astryx-badge badge-pill">WAL Mode</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.76rem; background:var(--forge-bg-elevated); padding:0.65rem; border-radius:4px; border:1px solid var(--forge-border); margin-bottom:0.65rem;">
              <div><strong>DB File:</strong> <code>\${dbName}</code></div>
              <div><strong>Size:</strong> \${dbKb} KB</div>
              <div><strong>Status:</strong> \${details.database.exists ? '✅ Ready' : '⚠️ Missing'}</div>
              <div><strong>Quota:</strong> \${app.storage_quota_mb || 50} MB</div>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button class="astryx-btn btn-outline" style="flex:1; font-size:0.76rem;" onclick="jumpToDbStudio('\${dbName}')">🗄️ Open in Database Studio</button>
            </div>
          </div>

          <!-- 3. Security & Sandboxing Policies -->
          <div class="drawer-card">
            <div class="drawer-card-title"><span>🛡️ RBAC & Sandbox Containment</span></div>
            <div style="font-size:0.78rem; display:flex; flex-direction:column; gap:0.35rem; color:var(--forge-text-main);">
              <div><strong>Operational State:</strong> <span class="astryx-micro-pill" style="\${isDisabled ? 'color:var(--forge-accent); border-color:var(--forge-border-medium);' : ''}">\${(app.status || 'active').toUpperCase()}</span></div>
              <div><strong>Allowed Roles:</strong> <span class="astryx-micro-pill">\${app.access_role}</span></div>
              <div><strong>Container Name:</strong> <code>\${app.container_name || 'app-' + app.id}</code></div>
              <div><strong>Runtime Engine:</strong> <code>\${app.runtime_type || 'bun-watch'}</code></div>
              <div><strong>CSP Sandbox:</strong> <code>allow-scripts allow-forms allow-popups</code></div>
            </div>
          </div>

          <!-- 4. Quick Developer Actions -->
          <div class="drawer-card">
            <div class="drawer-card-title"><span>⚡ Micro-App Controls</span></div>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button class="astryx-btn btn-outline \${isDisabled ? 'btn-toggle-enable' : 'btn-toggle-disable'}" style="padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="toggleAppStatus('\${app.id}')">\${isDisabled ? '✅ Enable App' : '🚫 Disable App'}</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="openAppSandboxModal('\${app.id}', '\${app.name}', '\${targetUrl}')">🖥️ Sandbox Preview</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="jumpToLogs('\${app.id}')">📜 Stream Logs</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="jumpToIssues('\${app.id}')">🚨 View Issues (\${details.openIssuesCount})</button>
              <button class="astryx-btn btn-outline" style="padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="openEditAppModal('\${app.id}')">⚙️ Edit Config</button>
            </div>
          </div>\`;
      } catch (err) {
        if (bodyEl) bodyEl.innerHTML = '<div style="color:var(--forge-accent); padding:1rem;">Failed to load diagnostics.</div>';
      }
    }

    function closeAppDrawer() {
      _inspectedAppId = null;
      const drawer = document.getElementById('app-drawer');
      const backdrop = document.getElementById('app-drawer-backdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }

    async function testDrawerHealthProbe(id, port, ingressPath) {
      const output = document.getElementById('drawer-app-probe-output');
      if (!output) return;
      output.textContent = '⏱️ Dispatching synthetic /health probe to :' + port + ' (' + ingressPath + ')...';
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
        output.textContent = 'HTTP Status: ' + res.status + ' ' + res.statusText + '\\nRound-trip Time: ' + duration + 'ms\\nTarget Route: ' + targetUrl + '\\nResponse Payload:\\n' + bodyText;
      } catch (err) {
        const duration = (performance.now() - t0).toFixed(2);
        output.textContent = '⚠️ Probe Error (' + duration + 'ms): ' + (err.message || err);
      }
    }

    // ==============================================================================
    // Sandbox Preview Modal
    // ==============================================================================
    function openAppSandboxModal(appId, name, targetUrl) {
      _sandboxActiveUrl = targetUrl;
      const modal = document.getElementById('app-sandbox-modal');
      const titleEl = document.getElementById('sandbox-modal-title');
      const iconEl = document.getElementById('sandbox-modal-icon');
      const urlEl = document.getElementById('sandbox-modal-url');
      const directLink = document.getElementById('sandbox-direct-link');
      const fallbackBtn = document.getElementById('sandbox-fallback-btn');
      const fallbackNotice = document.getElementById('sandbox-fallback-notice');
      const iframe = document.getElementById('sandbox-preview-iframe');

      if (titleEl) titleEl.textContent = name + ' (Sandbox Preview)';
      if (iconEl) iconEl.textContent = getAppIcon(appId);
      if (urlEl) urlEl.textContent = targetUrl;
      if (directLink) directLink.href = targetUrl;
      if (fallbackBtn) fallbackBtn.href = targetUrl;
      if (fallbackNotice) fallbackNotice.style.display = 'none';

      setSandboxViewport('100%');

      if (appId === 'auth') {
        if (fallbackNotice) fallbackNotice.style.display = 'flex';
        if (iframe) iframe.src = 'about:blank';
      } else {
        if (iframe) {
          iframe.src = targetUrl;
        }
      }

      if (modal) modal.classList.add('open');
    }

    function closeAppSandboxModal() {
      const modal = document.getElementById('app-sandbox-modal');
      const iframe = document.getElementById('sandbox-preview-iframe');
      const fallbackNotice = document.getElementById('sandbox-fallback-notice');
      if (iframe) iframe.src = 'about:blank';
      if (fallbackNotice) fallbackNotice.style.display = 'none';
      if (modal) modal.classList.remove('open');
    }

    function setSandboxViewport(width) {
      const iframe = document.getElementById('sandbox-preview-iframe');
      if (iframe) iframe.style.width = width;

      document.querySelectorAll('.sandbox-vp-btn').forEach(btn => btn.classList.remove('active'));
      if (width === '100%') document.getElementById('vp-btn-desktop')?.classList.add('active');
      else if (width === '768px') document.getElementById('vp-btn-tablet')?.classList.add('active');
      else if (width === '375px') document.getElementById('vp-btn-mobile')?.classList.add('active');
    }

    function refreshSandboxFrame() {
      const iframe = document.getElementById('sandbox-preview-iframe');
      if (iframe && _sandboxActiveUrl) {
        iframe.src = _sandboxActiveUrl + ( _sandboxActiveUrl.includes('?') ? '&' : '?' ) + '_t=' + Date.now();
      }
    }

    // ==============================================================================
    // App Registration Wizard
    // ==============================================================================
    async function openRegisterAppModal() {
      const modal = document.getElementById('register-app-modal');
      if (modal) modal.classList.add('open');
      await fetchNextAvailablePort();
    }

    function closeRegisterAppModal() {
      const modal = document.getElementById('register-app-modal');
      if (modal) modal.classList.remove('open');
    }

    function autoDeriveAppId(name) {
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const idInput = document.getElementById('reg-app-id');
      const ingressInput = document.getElementById('reg-app-ingress');
      if (idInput && (!idInput.dataset.touched || idInput.dataset.touched === 'false')) {
        idInput.value = slug;
      }
      if (ingressInput && (!ingressInput.dataset.touched || ingressInput.dataset.touched === 'false')) {
        ingressInput.value = slug ? '/apps/' + slug : '';
      }
    }

    async function fetchNextAvailablePort() {
      try {
        const res = await fetch(apiBase + '/api/apps/next-port').then(r => r.json());
        if (res && res.port) {
          const portInput = document.getElementById('reg-app-port');
          if (portInput) portInput.value = res.port;
        }
      } catch (err) {
        console.error('Port fetch error:', err);
      }
    }

    async function submitRegisterApp(e) {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-register');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Deploying Micro-App...'; }

      const payload = {
        name: document.getElementById('reg-app-name')?.value || '',
        id: document.getElementById('reg-app-id')?.value || '',
        category: document.getElementById('reg-app-category')?.value || 'Isolated Polyglot Forge Micro-Apps',
        access_role: document.getElementById('reg-app-role')?.value || 'General',
        port: Number(document.getElementById('reg-app-port')?.value || 8090),
        ingress_path: document.getElementById('reg-app-ingress')?.value || '',
        runtime_type: document.getElementById('reg-app-runtime')?.value || 'bun-watch',
        storage_quota_mb: Number(document.getElementById('reg-app-quota')?.value || 50),
        autoProvisionDb: document.getElementById('reg-opt-db')?.checked !== false,
        persistToEnv: document.getElementById('reg-opt-env')?.checked !== false,
        scaffoldTemplate: document.getElementById('reg-opt-scaffold')?.checked !== false,
      };

      try {
        const res = await fetch(apiBase + '/api/apps/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.error) {
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('error', 'Registration Error: ' + res.error);
          }
        } else {
          closeRegisterAppModal();
          document.getElementById('register-app-form')?.reset();
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('success', 'Micro-app registered successfully!');
          }
          loadApps();
          loadTopology();
        }
      } catch (err) {
        if (typeof window.showAstryxToast === 'function') {
          window.showAstryxToast('error', 'Failed to register app: ' + (err.message || err));
        }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🚀 Register & Deploy Micro-App'; }
      }
    }

    // ==============================================================================
    // Edit & Delete Operations
    // ==============================================================================
    function openEditAppModal(id) {
      const app = _cachedAppsList.find(a => a.id === id);
      if (!app) return;

      const modal = document.getElementById('edit-app-modal');
      const idInput = document.getElementById('edit-app-id');
      const nameInput = document.getElementById('edit-app-name');
      const catInput = document.getElementById('edit-app-category');
      const roleInput = document.getElementById('edit-app-role');
      const statusInput = document.getElementById('edit-app-status');
      const quotaInput = document.getElementById('edit-app-quota');

      if (idInput) idInput.value = app.id;
      if (nameInput) nameInput.value = app.name;
      if (catInput) catInput.value = app.category || '';
      if (roleInput) roleInput.value = app.access_role || '';
      if (statusInput) statusInput.value = app.status || 'active';
      if (quotaInput) quotaInput.value = app.storage_quota_mb || 50;

      if (modal) modal.classList.add('open');
    }

    function closeEditAppModal() {
      const modal = document.getElementById('edit-app-modal');
      if (modal) modal.classList.remove('open');
    }

    async function submitEditApp(e) {
      e.preventDefault();
      const id = document.getElementById('edit-app-id')?.value;
      if (!id) return;

      const updates = {
        name: document.getElementById('edit-app-name')?.value,
        category: document.getElementById('edit-app-category')?.value,
        access_role: document.getElementById('edit-app-role')?.value,
        status: document.getElementById('edit-app-status')?.value,
        storage_quota_mb: Number(document.getElementById('edit-app-quota')?.value || 50),
      };

      try {
        const res = await fetch(apiBase + '/api/apps/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, updates })
        }).then(r => r.json());

        if (res.error) {
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('error', 'Update error: ' + res.error);
          }
        } else {
          closeEditAppModal();
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('success', 'Micro-app updated successfully');
          }
          loadApps();
        }
      } catch (err) {
        if (typeof window.showAstryxToast === 'function') {
          window.showAstryxToast('error', 'Failed to update app: ' + err);
        }
      }
    }

    async function confirmDeleteApp() {
      const id = document.getElementById('edit-app-id')?.value;
      if (!id) return;

      try {
        const res = await fetch(apiBase + '/api/apps/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, deleteDb: false })
        }).then(r => r.json());

        if (res.error) {
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('error', 'Delete error: ' + res.error);
          }
        } else {
          closeEditAppModal();
          closeAppDrawer();
          if (typeof window.showAstryxToast === 'function') {
            window.showAstryxToast('success', 'Micro-app deregistered successfully');
          }
          loadApps();
          loadTopology();
        }
      } catch (err) {
        if (typeof window.showAstryxToast === 'function') {
          window.showAstryxToast('error', 'Failed to delete app: ' + err);
        }
      }
    }

    // ==============================================================================
    // SPA In-Page Navigation Jumps (Zero Full Reloads, Viewport Preserved)
    // ==============================================================================
    function jumpToDbStudio(dbName) {
      if (typeof closeManageModal === 'function') closeManageModal();
      if (typeof window.navigateToTab === 'function') {
        window.navigateToTab('database', { db: dbName });
      } else {
        window.location.hash = '#database';
      }
    }

    function jumpToLogs(appId) {
      if (typeof closeManageModal === 'function') closeManageModal();
      if (typeof window.navigateToTab === 'function') {
        window.navigateToTab('logs', { app: appId });
      } else {
        window.location.hash = '#logs';
      }
    }

    function jumpToIssues(appId) {
      if (typeof closeManageModal === 'function') closeManageModal();
      if (typeof window.navigateToTab === 'function') {
        window.navigateToTab('issues', { app: appId });
      } else {
        window.location.hash = '#issues';
      }
    }
  `;
}
