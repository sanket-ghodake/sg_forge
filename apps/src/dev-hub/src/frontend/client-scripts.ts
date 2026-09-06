/**
 * @forge/dev-hub - Client-Side Interactive Scripts (2026 LTS)
 * Astryx Design Standards & Workbench Interactive Logic.
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function getClientScripts(): string {
  return `
    // Tab Navigation
    function switchTab(tabId) {
      if (!tabId) tabId = 'overview';
      try { document.documentElement.setAttribute('data-active-hub-tab', tabId); } catch(e) {}

      document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.hub-section').forEach(s => s.classList.remove('active'));

      const targetTab = document.querySelector('[data-tab="' + tabId + '"]');
      const targetSection = document.getElementById('section-' + tabId);

      if (targetTab) targetTab.classList.add('active');
      if (targetSection) targetSection.classList.add('active');

      if (window.location.hash !== '#' + tabId) {
        window.location.hash = tabId;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
      item.innerHTML = '<span>✨ ' + message + '</span>';
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
      if (event && event.target) event.target.classList.add('active');
      const targetSnippet = document.getElementById('snippet-' + lang);
      if (targetSnippet) targetSnippet.classList.add('active');
    }

    // Sandbox Polyglot Switcher
    function switchSandboxLang(lang) {
      const tabs = document.querySelectorAll('#section-sandbox .lang-switcher .lang-tab');
      tabs.forEach(t => t.classList.remove('active'));
      if (event && event.target) event.target.classList.add('active');
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
      if (!row) return;
      const statusPill = row.querySelector('.status-pill');
      const latencyCell = row.querySelector('.latency-cell');

      statusPill.className = 'status-pill status-loading';
      statusPill.innerText = 'PROBING';

      const start = performance.now();
      try {
        const res = await fetch(endpoint);
        const duration = Math.round(performance.now() - start);
        latencyCell.innerText = duration + ' ms';
        if (res.ok) {
          statusPill.className = 'status-pill status-success';
          statusPill.innerText = res.status + ' OK';
        } else {
          statusPill.className = 'status-pill status-error';
          statusPill.innerText = res.status + ' ERR';
        }
      } catch {
        const duration = Math.round(performance.now() - start);
        latencyCell.innerText = duration + ' ms';
        statusPill.className = 'status-pill status-error';
        statusPill.innerText = 'OFFLINE';
      }
    }

    async function pingAllServices() {
      const btn = document.getElementById('ping-all-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Probing All...</span>';
      }
      const rows = document.querySelectorAll('#health-mesh-tbody tr');
      const promises = [];
      rows.forEach(r => {
        const sId = r.getAttribute('data-service');
        const ep = r.getAttribute('data-endpoint');
        if (sId && ep) promises.push(pingSingleService(sId, ep));
      });
      await Promise.allSettled(promises);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Ping All Services</span>';
      }
      showAstryxToast('Cluster health probe completed!');
    }

    // Token Minter & Inspector
    const mockTokens = {
      admin: {
        header: { alg: "EdDSA", typ: "JWT", kid: "key-2026-prod-01" },
        payload: { sub: "usr-carol-dir", email: "carol.dir@forge.internal", display_name: "Carol White", roles: ["roles/admin", "roles/employee"], org_id: "org-forge-core", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }
      },
      lead: {
        header: { alg: "EdDSA", typ: "JWT", kid: "key-2026-prod-01" },
        payload: { sub: "usr-bob-lead", email: "bob.lead@forge.internal", display_name: "Bob Jones", roles: ["roles/employee", "roles/lead"], org_id: "org-forge-core", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }
      },
      employee: {
        header: { alg: "EdDSA", typ: "JWT", kid: "key-2026-prod-01" },
        payload: { sub: "usr-alice-eng", email: "alice.eng@forge.internal", display_name: "Alice Smith", roles: ["roles/employee"], org_id: "org-forge-core", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }
      },
      contractor: {
        header: { alg: "EdDSA", typ: "JWT", kid: "key-2026-prod-01" },
        payload: { sub: "usr-david-ext", email: "david.contractor@partner.internal", display_name: "David Miller", roles: ["roles/contractor"], org_id: "org-forge-guest", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 28800 }
      }
    };

    function mintTestToken(roleKey) {
      const preset = mockTokens[roleKey] || mockTokens.employee;
      const b64H = btoa(JSON.stringify(preset.header)).replace(/=/g,'').replace(/\\+/g,'-').replace(/\\//g,'_');
      const b64P = btoa(JSON.stringify(preset.payload)).replace(/=/g,'').replace(/\\+/g,'-').replace(/\\//g,'_');
      const dummySig = 'MEQCID_Ed25519_SampleSig_' + Math.random().toString(36).substring(2);
      const jwt = b64H + '.' + b64P + '.' + dummySig;

      const txt = document.getElementById('active-jwt-token');
      if (txt) {
        txt.value = jwt;
        inspectActiveToken();
      }
      showAstryxToast('Minted ' + roleKey.toUpperCase() + ' test token!');
    }

    function copyCookieHeader() {
      const txt = document.getElementById('active-jwt-token');
      const val = txt ? txt.value.trim() : '';
      if (!val) {
        showAstryxToast('Mint or paste a token first');
        return;
      }
      navigator.clipboard.writeText('Cookie: sg_forge_session=' + val).then(() => {
        showAstryxToast('Copied Cookie header to clipboard!');
      });
    }

    function inspectActiveToken() {
      const txt = document.getElementById('active-jwt-token');
      const val = txt ? txt.value.trim() : '';
      const hEl = document.getElementById('jwt-decoded-header');
      const pEl = document.getElementById('jwt-decoded-payload');

      if (!val || !val.includes('.')) return;
      try {
        const parts = val.split('.');
        const h = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (hEl) hEl.innerText = JSON.stringify(h, null, 2);
        if (pEl) pEl.innerText = JSON.stringify(p, null, 2);
      } catch {
        // invalid base64 parse, ignore
      }
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
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>⏳ Sending...</span>'; }
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

    function filterContent(query) {
      const q = query.toLowerCase().trim();
      const cards = document.querySelectorAll('.sdk-module-card, .astryx-card');
      cards.forEach(card => {
        if (!q) { card.style.display = ''; return; }
        card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById('section-' + hash)) switchTab(hash);
      mintTestToken('admin');
      updatePolyglotSnippets();
    });
  `;
}
