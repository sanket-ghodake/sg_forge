import { getLogDashboardScripts } from './ui-log-scripts';
import { getToolsDashboardScripts } from './ui-tools-scripts';
import { getDbDashboardScripts } from './ui-db-scripts';
import { getServicesDashboardScripts } from './ui-services-scripts';
import { getEmployeeDashboardScripts } from './ui-employee-scripts';
import { getOverviewDashboardScripts } from './ui-overview-scripts';
import { getTrafficDashboardScripts } from './ui-traffic-scripts';
import { getIssuesDashboardScripts } from './ui-issues-scripts';
import { getHostDashboardScripts } from './ui-host-scripts';
import { getAppsDashboardScripts } from './ui-apps-scripts';
import { getDropdownScripts } from './ui-dropdown-scripts';
import { getAstryxToastScript, getAstryxTooltipScript } from '@forge/ui';

/**
 * getDashboardScripts
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getDashboardScripts(): string {
  return `
    ${getAstryxToastScript()}
    ${getAstryxTooltipScript()}
    ${getDropdownScripts()}

    window.showAstryxToast = function(type, message, duration = 4000) {
      if (typeof window.astryxToast === 'function') {
        window.astryxToast(message, type, duration);
      }
    };

    const apiBase = window.location.pathname.startsWith('/devcenter') ? '/devcenter' : '';
    let currentAppLogService = null;
    let appLogBuffer = [];

    // 🛡️ Resilient Operator Bearer Interceptor
    const _origFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        const urlStr = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
        if (urlStr.includes('/api/')) {
          let token = null;
          try { token = sessionStorage.getItem('forge:devcenter:token'); } catch(e) {}
          if (token) {
            init = Object.assign({}, init);
            const headers = new Headers(init.headers || {});
            if (!headers.has('Authorization')) {
              headers.set('Authorization', 'Bearer ' + token);
            }
            init.headers = headers;
          }
        }
      } catch (e) {}
      return _origFetch.call(this, input, init);
    };

    window.handleDevLogout = async function() {
      try {
        await fetch(apiBase + '/api/auth/logout', { method: 'POST' });
        try { sessionStorage.removeItem('forge:devcenter:token'); } catch(e) {}
        window.location.reload();
      } catch (err) {
        window.location.reload();
      }
    };

    (function initTheme() {
      const THEME_KEY = 'forge:v1:platform:theme';
      const LEGACY_KEY = 'sg-forge-theme';
      const CHANNEL_NAME = 'sg_forge_state_sync_bus';

      function getSavedTheme() {
        try {
          const raw = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_KEY);
          if (!raw) return 'dark';
          const env = JSON.parse(raw);
          return (env && typeof env === 'object' && env.data) ? env.data : (env || 'dark');
        } catch {
          return 'dark';
        }
      }

      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        updateThemeIcons(t);
      }

      function saveTheme(t) {
        try {
          const env = { version: 1, updatedAt: new Date().toISOString(), data: t };
          localStorage.setItem(THEME_KEY, JSON.stringify(env));
          localStorage.setItem(LEGACY_KEY, t);
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel(CHANNEL_NAME);
            bc.postMessage({ key: THEME_KEY, data: t, timestamp: Date.now() });
            bc.close();
          }
        } catch {}
      }

      const activeTheme = getSavedTheme();
      applyTheme(activeTheme);

      const btn = document.getElementById('theme-toggle-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const cur = document.documentElement.getAttribute('data-theme') || 'dark';
          const next = cur === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          saveTheme(next);
        });
      }

      function updateThemeIcons(theme) {
        const sun = document.getElementById('sun-icon');
        const moon = document.getElementById('moon-icon');
        if (sun && moon) {
          sun.style.display = theme === 'dark' ? 'block' : 'none';
          moon.style.display = theme === 'dark' ? 'none' : 'block';
        }
      }

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const receiver = new BroadcastChannel(CHANNEL_NAME);
          receiver.onmessage = (e) => {
            if (e.data && (e.data.key === THEME_KEY || e.data.key === LEGACY_KEY)) {
              applyTheme(e.data.data);
            }
          };
        } catch {}
      }
    })();

    function toggleMobileSidebar(force) {
      const sb = document.getElementById('main-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sb || !backdrop) return;
      const isOpen = force !== undefined ? force : !sb.classList.contains('open');
      sb.classList.toggle('open', isOpen);
      backdrop.classList.toggle('open', isOpen);
    }

    const menuBtn = document.getElementById('mobile-menu-toggle');
    if (menuBtn) menuBtn.addEventListener('click', () => toggleMobileSidebar());

    const mainSidebar = document.getElementById('main-sidebar');
    if (mainSidebar) {
      mainSidebar.addEventListener('mouseleave', () => {
        if (document.activeElement && mainSidebar.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      });
    }

    const TAB_KEY = 'forge:v1:devcenter:active-tab';
    const TAB_TITLES = {
      overview: 'Overview',
      services: 'Services & Processes',
      apps: 'Forge Apps',
      database: 'Database Studio',
      logs: 'Isolated App Logs',
      traffic: 'Traffic Analytics',
      issues: 'Issue Center',
      employees: 'Employees & Org',
      host: 'Host & Cloud',
      settings: 'Settings & Tools'
    };

    let currentActiveTab = 'overview';

    function switchTab(tabId, updateUrl = true) {
      if (!tabId || !TAB_TITLES[tabId]) tabId = 'overview';
      currentActiveTab = tabId;
      try { document.documentElement.setAttribute('data-active-tab', tabId); } catch(e) {}

      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.sb-nav-item').forEach(el => el.classList.remove('active'));
      
      const pane = document.getElementById('tab-' + tabId);
      if (pane) pane.classList.add('active');

      document.querySelectorAll('.sb-nav-item').forEach(n => {
        if (n.dataset.tab === tabId) n.classList.add('active');
      });

      if (document.activeElement && mainSidebar && mainSidebar.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      const breadcrumbEl = document.getElementById('breadcrumb-title');
      if (breadcrumbEl && TAB_TITLES[tabId]) {
        breadcrumbEl.textContent = TAB_TITLES[tabId];
      }

      // Tier 1 URL State: Synchronize URL search params and hash for refresh fidelity
      if (updateUrl) {
        try {
          const url = new URL(window.location.href);
          url.hash = '#' + tabId;
          url.searchParams.set('tab', tabId);
          window.history.replaceState({ tab: tabId }, '', url.toString());
        } catch {}
      }
      try {
        sessionStorage.setItem(TAB_KEY, tabId);
      } catch {}
      toggleMobileSidebar(false);

      if (tabId === 'overview') loadTopology();
      if (tabId === 'services') loadServices();
      if (tabId === 'apps') loadApps();
      if (tabId === 'database' || tabId === 'sql') loadDatabases();
      if (tabId === 'logs') loadActiveTabLogs();
      if (tabId === 'traffic') loadTraffic();
      if (tabId === 'issues') loadIssues();
      if (tabId === 'employees') loadEmployees();
      if (tabId === 'host') { loadHostVitals(); if (typeof loadReliabilityDiagnostics === 'function') loadReliabilityDiagnostics(); }
      if (tabId === 'settings') { loadAudit(); if (typeof loadReliabilityDiagnostics === 'function') loadReliabilityDiagnostics(); }
    }

    window.navigateToTab = function(tabId, params = {}) {
      if (!tabId || !TAB_TITLES[tabId]) tabId = 'overview';
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        url.hash = '#' + tabId;
        
        ['app', 'service', 'filter', 'db', 'table', 'traceId', 'search', 'level', 'target', 'section'].forEach(k => {
          if (params[k] === undefined) url.searchParams.delete(k);
        });

        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            url.searchParams.set(k, String(v));
          }
        });

        window.history.pushState({ tab: tabId, ...params }, '', url.toString());
      } catch {}

      if (params.app || params.service || params.filter) window._initialAppFilter = params.app || params.service || params.filter;
      if (params.db) window._initialSelectedDb = params.db;
      if (params.table) window._initialSelectedTable = params.table;
      if (params.traceId || params.search) window._initialLogSearch = params.traceId || params.search;
      if (params.level) window._initialLogLevel = params.level;
      if (params.target) window._initialTrafficTarget = params.target;

      switchTab(tabId, false);
    };

    function syncTabFromHash() {
      const params = new URLSearchParams(window.location.search);
      let tabFromUrl = params.get('tab') || window.location.hash.replace('#', '');
      const dbParam = params.get('db');
      const appParam = params.get('app') || params.get('service') || params.get('filter');
      const traceParam = params.get('traceId') || params.get('search');
      const levelParam = params.get('level');
      const targetParam = params.get('target');

      if (dbParam) window._initialSelectedDb = dbParam;
      if (appParam) window._initialAppFilter = appParam;
      if (traceParam) window._initialLogSearch = traceParam;
      if (levelParam) window._initialLogLevel = levelParam;
      if (targetParam) window._initialTrafficTarget = targetParam;

      let savedTab = null;
      try { savedTab = sessionStorage.getItem(TAB_KEY); } catch {}

      // Tier 1 Ground Truth: URL parameter/hash wins, then active session tab, else defaults to overview
      const activeTab = (tabFromUrl && TAB_TITLES[tabFromUrl])
        ? tabFromUrl
        : (savedTab && TAB_TITLES[savedTab] ? savedTab : 'overview');
      
      switchTab(activeTab, false);
    }

    window.addEventListener('hashchange', syncTabFromHash);
    window.addEventListener('popstate', syncTabFromHash);

    ${getLogDashboardScripts()}
    ${getToolsDashboardScripts()}
    ${getDbDashboardScripts()}
    ${getServicesDashboardScripts()}
    ${getAppsDashboardScripts()}
    ${getEmployeeDashboardScripts()}
    ${getOverviewDashboardScripts()}
    ${getTrafficDashboardScripts()}
    ${getIssuesDashboardScripts()}
    ${getHostDashboardScripts()}

    function loadTopology() {
      if (typeof loadOverviewData === 'function') {
        loadOverviewData();
      }
    }

    async function runSqlQuery() {
      const dbName = document.getElementById('db-select')?.value || currentSelectedDb;
      const sql = document.getElementById('sql-query-input')?.value;
      const readOnly = document.getElementById('sql-readonly-check')?.checked !== false;
      const c = document.getElementById('sql-result-container');
      const perfEl = document.getElementById('sql-perf-indicator');
      if (!sql || !sql.trim()) {
        if (c) c.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Please enter a SQL query.</div>';
        return;
      }
      if (c) c.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Executing query in safe sandbox...</div>';
      if (perfEl) perfEl.innerHTML = '<span style="font-size:0.75rem; color:var(--forge-text-muted);">Executing...</span>';

      const res = await fetch(apiBase + '/api/db/query', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dbName, sql, readOnly })
      }).then(r => r.json());

      if (perfEl && res.durationMs !== undefined) {
        const perfClass = res.durationMs < 2 ? 'db-perf-fast' : (res.durationMs < 15 ? 'db-perf-med' : 'db-perf-slow');
        perfEl.innerHTML = '<span class="db-perf-badge ' + perfClass + '">⚡ ' + res.durationMs + 'ms</span>';
      }

      if (res.error) {
        c.innerHTML = '<div style="color:var(--forge-accent); background:var(--forge-bg-elevated); border:1px solid var(--forge-border); padding:0.65rem; border-radius:var(--forge-radius-sm); margin-top:0.65rem;"><strong>Error:</strong> ' + res.error + '</div>';
        return;
      }
      let html = '<div style="margin:0.65rem 0; font-size:0.78rem; color:var(--forge-success);">⚡ Query executed in ' + res.durationMs + 'ms (' + (res.rows ? res.rows.length : res.affectedRows || 0) + ' rows)</div>';
      if (res.rows && res.rows.length) {
        html += '<div class="astryx-table-wrap"><table class="data-table"><thead><tr>' + res.columns.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
          res.rows.map(r => '<tr>' + res.columns.map(c => '<td>' + String(r[c] !== null ? r[c] : '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
      } else if (res.affectedRows !== undefined) {
        html += '<div style="color:var(--forge-text-muted); font-size:0.8rem;">Rows affected: ' + res.affectedRows + '</div>';
      }
      c.innerHTML = html;
    }

    function runLatencyBenchmark() {
      if (typeof runFleetBenchmark === 'function') {
        runFleetBenchmark();
      }
    }

    async function loadAudit() {
      try {
        const res = await fetch(apiBase + '/api/audit').then(r => r.json());
        const cont = document.getElementById('audit-table-container');
        if (!cont || !res.logs) return;
        cont.innerHTML = res.logs.length ? '<table class="data-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Status</th></tr></thead><tbody>' +
          res.logs.map(l => '<tr><td>' + new Date(l.timestamp*1000).toLocaleTimeString() + '</td><td>' + l.actor_id + '</td><td><code>' + l.action_type + '</code></td><td>' + l.target_service + '</td><td><span class="astryx-badge badge-running">' + l.result_status + '</span></td></tr>').join('') + '</tbody></table>' : '<p style="color:var(--forge-text-muted);">Zero audit logs recorded.</p>';
      } catch (err) { console.error('Audit load failed', err); }
    }

    // 🚀 Refresh Active Tab Data Helper
    function refreshActiveTab() {
      const tab = currentActiveTab || 'overview';
      if (tab === 'services') loadServices();
      else if (tab === 'overview') loadTopology();
      else if (tab === 'host') loadHostVitals();
      else if (tab === 'traffic') loadTraffic();
      else if (tab === 'apps') loadApps();
      else if (tab === 'issues') loadIssues();
      // Note: Employee Directory & Org Chart are event/mutation driven to preserve pan/zoom and editing states
    }

    // 🚀 Mount Initial Tab & Start Resilient SSE Watchdog
    initWatchdogAndSSE();
    syncTabFromHash();

    // 🌙 Sleep / Wake & Network Resumption Lifecycle Engine (Auto-Heal on Unlock)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        reconnectSSE();
        refreshActiveTab();
      }
    });

    window.addEventListener('online', () => {
      reconnectSSE();
      refreshActiveTab();
    });

    window.addEventListener('focus', () => {
      refreshActiveTab();
    });

    // ⏱️ Real-Time 1.5-Second Throttled Live Polling Engine
    setInterval(() => {
      if (document.hidden) return;
      refreshActiveTab();
    }, 1500);

    // 📐 Interactive Resizable Drawers (Services & Employee Profile)
    function initDrawerResize(drawerId, resizerId, storageKey, defaultWidth) {
      const drawerEl = document.getElementById(drawerId);
      const resizerEl = document.getElementById(resizerId);
      if (!drawerEl || !resizerEl) return;

      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (parsed >= 320 && parsed <= window.innerWidth - 60) {
          drawerEl.style.width = parsed + 'px';
        }
      }

      resizerEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resizerEl.classList.add('resizing');
        document.body.classList.add('is-resizing-drawer');

        const onMouseMove = (moveEv) => {
          const newW = window.innerWidth - moveEv.clientX;
          const minW = 320;
          const maxW = Math.min(window.innerWidth - 60, 1200);
          const clamped = Math.max(minW, Math.min(maxW, newW));
          drawerEl.style.width = clamped + 'px';
          drawerEl.style.maxWidth = 'calc(100vw - 60px)';
        };

        const onMouseUp = () => {
          resizerEl.classList.remove('resizing');
          document.body.classList.remove('is-resizing-drawer');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          if (drawerEl.offsetWidth) {
            localStorage.setItem(storageKey, String(drawerEl.offsetWidth));
          }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      resizerEl.addEventListener('dblclick', () => {
        drawerEl.style.width = defaultWidth + 'px';
        localStorage.removeItem(storageKey);
      });
    }

    initDrawerResize('service-drawer', 'service-drawer-resizer', 'forge:service_drawer_w', 540);
    initDrawerResize('emp-profile-drawer', 'emp-drawer-resizer', 'forge:emp_drawer_w', 560);

    // 🧹 Clean Any Errant Browser Autofill Credentials on Startup
    function sanitizeSearchInputs() {
      const s = document.getElementById('services-search-input');
      if (s && s.value && (s.value.includes('@') || s.value === 'alice.eng@forge.internal')) {
        s.value = '';
        if (typeof filterServicesTable === 'function') filterServicesTable();
      }
      const l = document.getElementById('logs-search-input');
      if (l && l.value && l.value.includes('@')) {
        l.value = '';
      }
    }
    setTimeout(sanitizeSearchInputs, 50);
    setTimeout(sanitizeSearchInputs, 300);
    setTimeout(sanitizeSearchInputs, 1000);
  `;
}


