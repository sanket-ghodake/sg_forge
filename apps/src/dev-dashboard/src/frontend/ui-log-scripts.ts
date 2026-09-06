/**
 * @forge/dev-dashboard - Client Log Streamer & Zero-Hang Virtual Renderer (2026 LTS)
 * Modular client-side log engine, watchdog heartbeat, and 4-pillar inspector.
  * @requirements [HLR-SDK-303] [LLR-SUB-004]
 */

export function getLogDashboardScripts(): string {
  return `
    let activeLogApp = 'all';
    let activeLogSource = 'all';
    let activeLogLevel = 'ALL';
    let modalActivePillar = 'all';
    let logSearchFilter = '';
    let isAutoScrollPaused = false;
    let rawLogHistory = [];
    let lastSseEventTime = Date.now();
    let sseClient = null;
    let isReconnecting = false;
    let watchdogTimer = null;
    const MAX_DOM_LOG_LINES = 250;

    // ⚡ Watchdog Heartbeat Monitor & Resilient Self-Healing SSE Manager
    function updateWatchdogUI(status, text) {
      const dot = document.getElementById('watchdog-dot');
      const label = document.getElementById('watchdog-text');
      if (!dot || !label) return;
      dot.className = 'watchdog-dot ' + status;
      label.textContent = text;
    }

    function initWatchdogAndSSE() {
      if (sseClient) {
        try { sseClient.close(); } catch(e){}
        sseClient = null;
      }
      
      try {
        let sseUrl = apiBase + '/api/logs/stream';
        try {
          const sTok = sessionStorage.getItem('forge:devcenter:token');
          if (sTok) sseUrl += (sseUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(sTok);
        } catch(e) {}
        sseClient = new EventSource(sseUrl);
        sseClient.onopen = () => {
          lastSseEventTime = Date.now();
          isReconnecting = false;
          updateWatchdogUI('live', 'Live Stream');
        };
        sseClient.onerror = () => {
          updateWatchdogUI('reconnecting', 'Reconnecting...');
          // Auto-reconnect after brief backoff
          if (!isReconnecting) {
            setTimeout(() => reconnectSSE(), 2000);
          }
        };
        sseClient.onmessage = () => {
          lastSseEventTime = Date.now();
          updateWatchdogUI('live', 'Live Stream');
        };
        sseClient.addEventListener('ping', () => {
          lastSseEventTime = Date.now();
          updateWatchdogUI('live', 'Live Stream');
        });
        sseClient.addEventListener('vitals', () => {
          lastSseEventTime = Date.now();
          updateWatchdogUI('live', 'Live Stream');
        });
        sseClient.addEventListener('init', e => {
          lastSseEventTime = Date.now();
          updateWatchdogUI('live', 'Live Stream');
          try {
            const data = JSON.parse(e.data);
            if (data && data.recentLogs && Array.isArray(data.recentLogs)) {
              for (const log of data.recentLogs) {
                if (!rawLogHistory.some(r => r.id === log.id)) {
                  rawLogHistory.push(log);
                }
              }
              if (rawLogHistory.length > 500) rawLogHistory.splice(0, rawLogHistory.length - 500);
            }
          } catch (err) {}
        });
        sseClient.addEventListener('log', e => {
          lastSseEventTime = Date.now();
          updateWatchdogUI('live', 'Live Stream');
          try {
            const log = JSON.parse(e.data);
            rawLogHistory.push(log);
            if (rawLogHistory.length > 500) rawLogHistory.shift();
            window.appLogBuffer = rawLogHistory;
            const eventsEl = document.getElementById('vital-events-val');
            if (eventsEl) eventsEl.textContent = String(rawLogHistory.length);
            appendLogToTerminal(log);
            appendAppLogModalLine(log);
            updatePlainEnglishBanner(log);
          } catch(err) {}
        });
      } catch (err) {
        updateWatchdogUI('frozen', 'Disconnected');
      }

      if (!watchdogTimer) {
        watchdogTimer = setInterval(() => {
          // If no message/ping received for > 20s, auto-heal connection
          if (Date.now() - lastSseEventTime > 20000) {
            updateWatchdogUI('reconnecting', 'Auto-Healing Stream...');
            reconnectSSE();
          }
        }, 3000);
      }
    }

    function reconnectSSE() {
      if (isReconnecting) return;
      isReconnecting = true;
      lastSseEventTime = Date.now();
      initWatchdogAndSSE();
      loadActiveTabLogs();
      setTimeout(() => { isReconnecting = false; }, 1000);
    }

    // 🚀 High-Performance Zero-Hang DOM Log Renderer
    function appendLogToTerminal(l) {
      if (activeLogApp !== 'all' && l.service !== activeLogApp) return;
      if (activeLogSource !== 'all' && (l.source || 'app') !== activeLogSource) return;
      if (activeLogLevel !== 'ALL' && l.level !== activeLogLevel) return;
      if (logSearchFilter && !matchesSearch(l, logSearchFilter)) return;

      const fTerm = document.getElementById('full-terminal');
      const oTerm = document.getElementById('overview-terminal');
      if (fTerm) renderSingleRowToDOM(fTerm, l);
      if (oTerm) renderSingleRowToDOM(oTerm, l);
    }

    function matchesSearch(l, term) {
      const q = term.toLowerCase();
      return (l.message || '').toLowerCase().includes(q) ||
        (l.service || '').toLowerCase().includes(q) ||
        (l.traceId || '').toLowerCase().includes(q);
    }

    function renderSingleRowToDOM(container, l) {
      if (!container) return;
      while (container.children.length >= MAX_DOM_LOG_LINES) {
        container.removeChild(container.firstChild);
      }

      const row = document.createElement('div');
      row.className = 'log-row';
      const timeStr = l.timestamp ? l.timestamp.slice(11, 19) : new Date().toTimeString().slice(0, 8);
      const lvlClass = 'log-lvl-' + (l.level || 'info').toLowerCase();
      const srcText = l.source ? l.source.toUpperCase() : 'APP';
      const traceBadge = l.traceId ? ' <span class="log-trace-tag" onclick="filterByTraceId(\\'' + l.traceId + '\\')" title="Filter all pillars by this trace ID">#' + l.traceId.slice(0, 8) + '</span>' : '';

      row.innerHTML = '<span class="log-ts">[' + timeStr + ']</span> ' +
        '<span class="' + lvlClass + '">[' + (l.level || 'INFO') + ']</span> ' +
        '<span class="log-svc">(' + l.service + ')</span> ' +
        '<span class="log-source">' + srcText + '</span>' +
        traceBadge + ' ' +
        '<span class="log-msg">' + escapeHtml(l.message || '') + '</span>';

      container.appendChild(row);
      if (!isAutoScrollPaused) {
        container.scrollTop = container.scrollHeight;
      }
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function onLogSearchChange(val) {
      logSearchFilter = (val || '').trim();
      loadActiveTabLogs();
    }

    function filterByTraceId(traceId) {
      if (!traceId) return;
      if (typeof window.navigateToTab === 'function') {
        window.navigateToTab('logs', { search: traceId, traceId: traceId });
      } else {
        const searchInput = document.getElementById('logs-search-input');
        if (searchInput) searchInput.value = traceId;
        logSearchFilter = traceId;
        switchTab('logs');
        loadActiveTabLogs();
      }
    }

    function toggleAutoScrollPause() {
      isAutoScrollPaused = !isAutoScrollPaused;
      const btn = document.getElementById('logs-pause-scroll-btn');
      if (btn) {
        btn.textContent = isAutoScrollPaused ? '▶️ Resume Scroll' : '⏸️ Pause Scroll';
        btn.className = isAutoScrollPaused ? 'astryx-btn btn-primary' : 'astryx-btn btn-outline';
      }
    }

    function downloadRawLogs() {
      const text = rawLogHistory.map(l => \`[\${l.timestamp}] [\${l.level}] (\${l.service}) [\${l.source}] \${l.message} \${l.traceId ? '#'+l.traceId : ''}\`).join('\\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`logs_\${activeLogApp}_\${Date.now()}.log\`;
      a.click();
    }

    function updatePlainEnglishBanner(l) {
      const banner = document.getElementById('plain-english-banner');
      const icon = document.getElementById('plain-status-icon');
      const title = document.getElementById('plain-status-title');
      const detail = document.getElementById('plain-status-detail');
      if (!banner || !icon || !title || !detail) return;

      if (l.level === 'ERROR' || l.level === 'FATAL') {
        icon.textContent = '🔴';
        title.textContent = 'Issue Reported in ' + l.service.toUpperCase();
        detail.textContent = l.plainEnglishSummary || l.message;
      } else if (l.level === 'WARN') {
        icon.textContent = '🟡';
        title.textContent = 'Warning in ' + l.service.toUpperCase();
        detail.textContent = l.plainEnglishSummary || l.message;
      } else if (l.message && (l.message.includes('SYSTEM_BOOT') || l.message.includes('started') || l.message.includes('online'))) {
        icon.textContent = '🟢';
        title.textContent = l.service.toUpperCase() + ' Online & Healthy';
        detail.textContent = l.plainEnglishSummary || 'Service initialized successfully.';
      }
    }

    async function loadActiveTabLogs() {
      const term = document.getElementById('full-terminal');
      if (!term) return;

      if (window._initialAppFilter) {
        activeLogApp = window._initialAppFilter;
        const sel = document.getElementById('logs-app-select');
        if (sel) sel.value = window._initialAppFilter;
        window._initialAppFilter = null;
      }
      if (window._initialLogSearch) {
        logSearchFilter = window._initialLogSearch;
        const searchInput = document.getElementById('logs-search-input');
        if (searchInput) searchInput.value = logSearchFilter;
        window._initialLogSearch = null;
      }
      if (window._initialLogLevel) {
        activeLogLevel = window._initialLogLevel;
        const lvlSel = document.getElementById('logs-level-select');
        if (lvlSel) lvlSel.value = activeLogLevel;
        window._initialLogLevel = null;
      }

      term.innerHTML = '<div style="color:var(--forge-text-muted);">Loading logs...</div>';
      try {
        let url = apiBase + '/api/logs/recent?limit=150';
        if (activeLogApp !== 'all') url += '&service=' + activeLogApp;
        if (activeLogSource !== 'all') url += '&source=' + activeLogSource;
        if (activeLogLevel !== 'ALL') url += '&level=' + activeLogLevel;

        const res = await fetch(url).then(r => r.json());
        term.innerHTML = '';
        if (res.logs && res.logs.length) {
          rawLogHistory = res.logs;
          const filtered = logSearchFilter ? res.logs.filter(l => matchesSearch(l, logSearchFilter)) : res.logs;
          if (filtered.length) {
            filtered.forEach(l => renderSingleRowToDOM(term, l));
          } else {
            term.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Zero logs matching search filter: "' + escapeHtml(logSearchFilter) + '"</div>';
          }
        } else {
          term.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Zero matching log entries found.</div>';
        }
      } catch (err) {
        term.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Failed to fetch logs.</div>';
      }
    }

    function changeActiveLogApp(app) {
      activeLogApp = app;
      loadActiveTabLogs();
    }

    function changeActiveLogSource(source) {
      activeLogSource = source;
      loadActiveTabLogs();
    }

    function changeActiveLogLevel(level) {
      activeLogLevel = level;
      loadActiveTabLogs();
    }

    async function clearActiveAppLogs() {
      await fetch(apiBase + '/api/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: activeLogApp !== 'all' ? activeLogApp : undefined })
      });
      const term = document.getElementById('full-terminal');
      if (term) term.innerHTML = '';
    }

    // App Log Modal
    async function openAppLogsModal(id, name, port, ingress) {
      currentAppLogService = id;
      modalActivePillar = 'all';
      document.getElementById('app-logs-title').textContent = '📜 ' + name + ' (' + id + ')';
      document.getElementById('app-logs-meta').textContent = 'Port: :' + port + ' | Route: ' + ingress;
      document.getElementById('app-logs-modal')?.classList.add('open');
      setModalPillar('all');
    }

    function closeAppLogsModal() {
      currentAppLogService = null;
      document.getElementById('app-logs-modal')?.classList.remove('open');
    }

    function setModalPillar(pillar) {
      modalActivePillar = pillar;
      ['all', 'app', 'browser', 'docker', 'db'].forEach(p => {
        const btn = document.getElementById('pillar-tab-' + p);
        if (btn) {
          btn.className = p === pillar ? 'astryx-btn btn-primary' : 'astryx-btn btn-outline';
          btn.style.padding = '0.2rem 0.5rem';
          btn.style.fontSize = '0.72rem';
        }
      });
      loadModalLogs();
    }

    async function loadModalLogs() {
      if (!currentAppLogService) return;
      const term = document.getElementById('app-logs-terminal');
      if (!term) return;
      term.innerHTML = '<div style="color:var(--forge-text-muted);">Loading ' + modalActivePillar + ' logs for ' + currentAppLogService + '...</div>';

      try {
        let url = apiBase + '/api/logs/recent?service=' + currentAppLogService + '&limit=150';
        if (modalActivePillar !== 'all') url += '&source=' + modalActivePillar;
        const res = await fetch(url).then(r => r.json());
        term.innerHTML = '';
        if (res.logs && res.logs.length) {
          appLogBuffer = res.logs;
          res.logs.forEach(l => renderSingleRowToDOM(term, l));
        } else {
          term.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Zero ' + modalActivePillar + ' logs recorded for ' + currentAppLogService + ' yet.</div>';
        }
      } catch (err) {}
    }

    function appendAppLogModalLine(l) {
      if (!currentAppLogService || l.service !== currentAppLogService) return;
      if (modalActivePillar !== 'all' && (l.source || 'app') !== modalActivePillar) return;
      const term = document.getElementById('app-logs-terminal');
      if (term) renderSingleRowToDOM(term, l);
    }

    function filterAppLogs(term) {
      const el = document.getElementById('app-logs-terminal');
      if (!el) return;
      el.innerHTML = '';
      const list = !term ? appLogBuffer : appLogBuffer.filter(l => (l.message || '').toLowerCase().includes(term.toLowerCase()));
      list.forEach(l => renderSingleRowToDOM(el, l));
    }

    function clearAppLogs() {
      appLogBuffer = [];
      const term = document.getElementById('app-logs-terminal');
      if (term) term.innerHTML = '';
    }

    function clearLogs() {
      const o = document.getElementById('overview-terminal');
      const f = document.getElementById('full-terminal');
      if (o) o.innerHTML = '';
      if (f) f.innerHTML = '';
    }

    function openHelpModal() { document.getElementById('help-modal')?.classList.add('open'); }
    function closeHelpModal() { document.getElementById('help-modal')?.classList.remove('open'); }
  `;
}

