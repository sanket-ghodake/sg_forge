/**
 * @forge/dev-hub - Client-Side Interactive Scripts (2026 LTS)
 * Modern Developer Console Navigation, Global ⌘K Search, Live API Sandbox & Health Mesh.
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function getClientScripts(): string {
  return `
    const TAB_ALIASES = {
      'gateway': 'routes',
      'health': 'routes',
      'security': 'api-catalog',
      'testing': 'scaffolding'
    };

    const TAB_TITLES = {
      'overview': 'Overview',
      'routes': 'Route Matrix & Fleet',
      'api-catalog': 'Live API Explorer',
      'sandbox': 'API Sandbox',
      'tokens': 'Token Mint',
      'sdk': '@forge/sdk Reference',
      'ui': 'Astryx UI Tokens',
      'scaffolding': 'Scaffolding & Testing'
    };

    // Tab Navigation
    function switchTab(tabId) {
      if (!tabId) tabId = 'overview';
      if (TAB_ALIASES[tabId]) tabId = TAB_ALIASES[tabId];
      try { document.documentElement.setAttribute('data-active-hub-tab', tabId); } catch(e) {}

      document.querySelectorAll('.sb-nav-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.hub-section').forEach(s => s.classList.remove('active'));

      const targetNav = document.querySelector('.sb-nav-item[data-tab="' + tabId + '"]');
      const targetSection = document.getElementById('section-' + tabId);

      if (targetNav) targetNav.classList.add('active');
      if (targetSection) targetSection.classList.add('active');

      const breadcrumb = document.getElementById('breadcrumb-title');
      if (breadcrumb && TAB_TITLES[tabId]) {
        breadcrumb.innerText = TAB_TITLES[tabId];
      }

      if (window.location.hash !== '#' + tabId) {
        window.location.hash = tabId;
      }
      
      const canvas = document.getElementById('main-canvas');
      if (canvas) canvas.scrollTo({ top: 0, behavior: 'smooth' });
      toggleMobileSidebar(false);
    }

    // 1-Click Send to Sandbox from API Catalog & Route Matrix
    function sendToSandbox(method, path) {
      const input = document.getElementById('sandbox-url-input');
      const select = document.getElementById('sandbox-endpoint-select');
      if (input) input.value = path;
      if (select) {
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value === path) {
            select.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) select.value = 'custom';
      }
      updatePolyglotSnippets();
      switchTab('sandbox');
      showAstryxToast('Loaded ' + method + ' ' + path + ' into Sandbox');
    }

    // Mobile Sidebar Toggle
    function toggleMobileSidebar(forceState) {
      const sidebar = document.getElementById('main-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sidebar) return;
      const isOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('open');
      if (isOpen) {
        sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
      } else {
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
      }
    }

    // Astryx Theme Toggle
    function toggleDevTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('forge:v1:platform:theme', next);
      } catch(e) {}
    }

    // Global Header Search & Filter (⌘K / Ctrl+K)
    function filterHubContent(query) {
      const q = (query || '').toLowerCase().trim();
      const endpointCards = document.querySelectorAll('.api-endpoint-card');
      const sdkCards = document.querySelectorAll('.sdk-module-card');
      const tableRows = document.querySelectorAll('.astryx-table tbody tr');

      if (!q) {
        endpointCards.forEach(c => c.style.display = '');
        sdkCards.forEach(c => c.style.display = '');
        tableRows.forEach(r => r.style.display = '');
        return;
      }

      endpointCards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });

      sdkCards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });

      tableRows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // Global Keyboard Hotkey (⌘K / Ctrl+K)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const search = document.getElementById('global-search-input');
        if (search) {
          search.focus();
          search.select();
        }
      }
      if (e.key === 'Escape') {
        const search = document.getElementById('global-search-input');
        if (search && document.activeElement === search) {
          search.value = '';
          filterHubContent('');
          search.blur();
        }
      }
    });

    // Astryx Toast Notification
    function showAstryxToast(message) {
      let toast = document.getElementById('astryx-toast-container');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'astryx-toast-container';
        toast.className = 'astryx-toast-container';
        document.body.appendChild(toast);
      }
      const item = document.createElement('div');
      item.className = 'astryx-toast-item';
      item.innerHTML = '<span>' + message + '</span>';
      toast.appendChild(item);
      setTimeout(() => {
        item.classList.add('toast-fade-out');
        setTimeout(() => item.remove(), 300);
      }, 2500);
    }

    // 1-Click Copy Snippet
    function copySnippet(elementId) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const text = el.value || el.innerText || el.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showAstryxToast('Copied to clipboard!');
      }).catch(() => {
        showAstryxToast('Failed to copy');
      });
    }

    // Language Code Switcher
    function switchLang(lang) {
      document.querySelectorAll('.lang-switcher .lang-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.lang-snippet').forEach(s => s.classList.remove('active'));
      if (window.event && window.event.target) window.event.target.classList.add('active');
      const targetSnippet = document.getElementById('snippet-' + lang);
      if (targetSnippet) targetSnippet.classList.add('active');
    }

    // Sandbox Polyglot Switcher
    function switchSandboxLang(lang) {
      const tabs = document.querySelectorAll('#section-sandbox .lang-switcher .lang-tab');
      tabs.forEach(t => t.classList.remove('active'));
      if (window.event && window.event.target) window.event.target.classList.add('active');
      ['curl', 'ts', 'py', 'go'].forEach(l => {
        const el = document.getElementById('sandbox-code-' + l);
        if (el) el.style.display = (l === lang) ? 'block' : 'none';
      });
    }

    function updatePolyglotSnippets() {
      const input = document.getElementById('sandbox-url-input');
      const path = input ? (input.value.trim() || '/health') : '/health';
      const fullUrl = 'http://localhost' + (path.startsWith('/') ? path : '/' + path);

      const curl = document.getElementById('code-curl-snippet');
      if (curl) curl.innerText = 'curl -X GET "' + fullUrl + '" \\\\\\n  -H "Accept: application/json" \\\\\\n  -H "Cookie: sg_forge_session=your_token_here"';

      const ts = document.getElementById('code-ts-snippet');
      if (ts) ts.innerText = 'const res = await fetch(\"' + fullUrl + '\", {\\n  headers: { \"Accept\": \"application/json\" },\\n  credentials: \"include\"\\n});\\nconst data = await res.json();\\nconsole.log(data);';

      const py = document.getElementById('code-py-snippet');
      if (py) py.innerText = 'import requests\\n\\nurl = \"' + fullUrl + '\"\\ncookies = {\"sg_forge_session\": \"your_token_here\"}\\nresp = requests.get(url, cookies=cookies)\\nprint(resp.json())';

      const go = document.getElementById('code-go-snippet');
      if (go) go.innerText = 'req, _ := http.NewRequest(\"GET\", \"' + fullUrl + '\", nil)\\nreq.AddCookie(&http.Cookie{Name: \"sg_forge_session\", Value: \"your_token_here\"})\\nresp, err := http.DefaultClient.Do(req)';
    }

    // Live Health Pinger
    async function pingSingleService(serviceId, endpoint) {
      const row = document.querySelector('tr[data-service=\"' + serviceId + '\"]');
      const statusCell = row ? row.querySelector('.service-status-cell') : null;
      const latencyCell = row ? row.querySelector('.service-latency-cell') : null;

      if (statusCell) {
        statusCell.innerHTML = '<span class=\"astryx-badge\" style=\"background:rgba(227,179,65,0.2);color:var(--forge-warning);\">Checking...</span>';
      }

      const start = performance.now();
      try {
        const res = await fetch(endpoint);
        const duration = Math.round(performance.now() - start);
        if (latencyCell) latencyCell.innerText = duration + ' ms';
        if (statusCell) {
          statusCell.innerHTML = res.ok 
            ? '<span class=\"astryx-badge badge-online\">' + res.status + ' OK</span>' 
            : '<span class=\"astryx-badge\" style=\"background:rgba(248,81,73,0.2);color:var(--forge-danger);\">' + res.status + ' ERR</span>';
        }
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        if (latencyCell) latencyCell.innerText = duration + ' ms';
        if (statusCell) {
          statusCell.innerHTML = '<span class=\"astryx-badge\" style=\"background:rgba(248,81,73,0.2);color:var(--forge-danger);\">OFFLINE</span>';
        }
      }
    }

    async function pingAllServices() {
      const rows = document.querySelectorAll('tr[data-service]');
      for (const r of rows) {
        const sId = r.getAttribute('data-service');
        const endpoint = r.getAttribute('data-health');
        if (sId && endpoint) {
          pingSingleService(sId, endpoint);
        }
      }
    }

    // Token Minting Presets
    const PERSONA_CLAIMS = {
      admin: { sub: 'usr-admin-sre', name: 'Alex Vance (SRE Admin)', email: 'alex.sre@forge.internal', role: 'roles/admin', orgPath: '/root/admin/ops', tenantId: 'tenant-primary', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 },
      lead: { sub: 'usr-bob-lead', name: 'Bob Roberts (Tech Lead)', email: 'bob.lead@forge.internal', role: 'roles/employee', orgPath: '/root/tech/eng-lead', tenantId: 'tenant-primary', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 },
      employee: { sub: 'usr-alice-eng', name: 'Alice Smith (Core Engineer)', email: 'alice.eng@forge.internal', role: 'roles/employee', orgPath: '/root/tech/eng-core', tenantId: 'tenant-primary', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 },
      contractor: { sub: 'usr-dave-contractor', name: 'Dave Miller (External Vendor)', email: 'dave.vendor@partner.org', role: 'roles/contractor', orgPath: '/root/vendors/temp', tenantId: 'tenant-partner', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 14400 }
    };

    function mintTestToken(persona) {
      const claims = PERSONA_CLAIMS[persona] || PERSONA_CLAIMS.admin;
      const header = { alg: 'EdDSA', crv: 'Ed25519', typ: 'JWT' };
      const b64Url = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
      const sig = btoa('mock_ed25519_sig_' + persona + '_' + Date.now()).replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
      const token = b64Url(header) + '.' + b64Url(claims) + '.' + sig;

      const input = document.getElementById('active-jwt-token');
      const hEl = document.getElementById('jwt-decoded-header');
      const pEl = document.getElementById('jwt-decoded-payload');

      if (input) input.value = token;
      if (hEl) hEl.innerText = JSON.stringify(header, null, 2);
      if (pEl) pEl.innerText = JSON.stringify(claims, null, 2);
    }

    function onTokenInputChange(val) {
      const hEl = document.getElementById('jwt-decoded-header');
      const pEl = document.getElementById('jwt-decoded-payload');
      if (!val || !val.includes('.')) return;
      try {
        const parts = val.split('.');
        const h = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (hEl) hEl.innerText = JSON.stringify(h, null, 2);
        if (pEl) pEl.innerText = JSON.stringify(p, null, 2);
      } catch (e) {}
    }

    // Live Sandbox Execution
    function onEndpointSelectChange() {
      const select = document.getElementById('sandbox-endpoint-select');
      const input = document.getElementById('sandbox-url-input');
      if (select && input && select.value !== 'custom') {
        input.value = select.value;
        updatePolyglotSnippets();
      }
    }

    async function runSandboxRequest() {
      const input = document.getElementById('sandbox-url-input');
      const btn = document.getElementById('sandbox-submit-btn');
      const statusBadge = document.getElementById('sandbox-status-badge');
      const latencyLabel = document.getElementById('sandbox-latency-label');
      const responseBody = document.getElementById('sandbox-response-body');

      const path = input ? (input.value.trim() || '/health') : '/health';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>Sending...</span>'; }
      if (statusBadge) { statusBadge.className = 'status-pill status-loading'; statusBadge.innerText = 'FETCHING'; }

      const startTime = performance.now();
      try {
        const res = await fetch(path);
        const duration = Math.round(performance.now() - startTime);
        if (latencyLabel) latencyLabel.innerText = duration + ' ms';

        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (responseBody) responseBody.innerText = JSON.stringify(data, null, 2);
        } catch {
          if (responseBody) responseBody.innerText = text;
        }

        if (statusBadge) {
          statusBadge.className = res.ok ? 'status-pill status-success' : 'status-pill status-error';
          statusBadge.innerText = res.status + (res.ok ? ' OK' : ' ERR');
        }
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        if (latencyLabel) latencyLabel.innerText = duration + ' ms';
        if (statusBadge) { statusBadge.className = 'status-pill status-error'; statusBadge.innerText = 'NETWORK ERROR'; }
        if (responseBody) responseBody.innerText = JSON.stringify({ error: err.message, path }, null, 2);
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<span>Send Request</span>'; }
      }
    }

    function updateHeaderSimulation() {
      const user = document.getElementById('sim-user').value;
      const userId = document.getElementById('sim-user-id').value;
      const role = document.getElementById('sim-role').value;
      const org = document.getElementById('sim-org').value;
      const preview = document.getElementById('simulated-headers-preview');
      if (preview) {
        preview.innerText = 'X-Forwarded-User: ' + user + '\\n' +
          'X-Forwarded-User-Id: ' + userId + '\\n' +
          'X-Forwarded-Role: ' + role + '\\n' +
          'X-Forwarded-Org-Path: ' + org + '\\n' +
          'X-Trace-Id: tr-live-sim-' + Math.floor(Math.random() * 900 + 100);
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      let hash = window.location.hash.replace('#', '');
      if (TAB_ALIASES[hash]) hash = TAB_ALIASES[hash];
      if (hash && document.getElementById('section-' + hash)) {
        switchTab(hash);
      } else {
        switchTab('overview');
      }
      mintTestToken('admin');
      updatePolyglotSnippets();
    });
  `;
}
