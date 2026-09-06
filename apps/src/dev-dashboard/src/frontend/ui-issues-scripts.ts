/**
 * @forge/dev-dashboard - Sentry-Style Issues Studio Client Scripts (2026 LTS)
 * Client logic for status filtering, triage transitions, modal inspection, and diagnostic simulation.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getIssuesDashboardScripts(): string {
  return `
    let currentIssueStatusFilter = 'all';
    let currentIssueServiceFilter = 'all';
    let currentIssueSearchText = '';
    let cachedIssuesList = [];

    async function loadIssues() {
      try {
        if (window._initialAppFilter && !currentIssueSearchText) {
          currentIssueSearchText = window._initialAppFilter;
          const searchInput = document.getElementById('issues-search-input');
          if (searchInput) searchInput.value = window._initialAppFilter;
        }

        const queryParams = new URLSearchParams();
        if (currentIssueStatusFilter !== 'all') queryParams.set('status', currentIssueStatusFilter);
        if (currentIssueServiceFilter !== 'all') queryParams.set('appId', currentIssueServiceFilter);
        if (currentIssueSearchText.trim()) queryParams.set('search', currentIssueSearchText.trim());

        const res = await fetch(apiBase + '/api/issues?' + queryParams.toString()).then(r => r.json());
        if (res && res.status === 'ok') {
          cachedIssuesList = res.issues || [];
          updateIssuesVitals(res.vitals || {});
          renderIssuesList(cachedIssuesList);
        }
      } catch (err) {
        console.error('Failed to load issues', err);
      }
    }

    function updateIssuesVitals(v) {
      const unresEl = document.getElementById('issues-vital-unresolved');
      const count24hEl = document.getElementById('issues-vital-24h');
      const topSvcEl = document.getElementById('issues-vital-top-service');
      const resEl = document.getElementById('issues-vital-resolved');
      const ignEl = document.getElementById('issues-vital-ignored-sub');

      if (unresEl) unresEl.textContent = (v.openCount || 0) + (v.investigatingCount || 0);
      if (count24hEl) count24hEl.textContent = v.last24hOccurrences || 0;
      if (topSvcEl) topSvcEl.textContent = v.topImpactedService || 'None';
      if (resEl) resEl.textContent = v.resolvedCount || 0;
      if (ignEl) ignEl.textContent = 'Ignored: ' + (v.ignoredCount || 0);
    }

    function setIssueStatusFilter(status) {
      currentIssueStatusFilter = status;
      ['all', 'open', 'investigating', 'resolved', 'ignored'].forEach(s => {
        const btn = document.getElementById('chip-status-' + s);
        if (btn) {
          if (s === status) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });
      loadIssues();
    }

    function onIssueServiceFilterChange(svc) {
      currentIssueServiceFilter = svc;
      loadIssues();
    }

    let issueSearchDebounce = null;
    function onIssueSearchInput(val) {
      currentIssueSearchText = val;
      clearTimeout(issueSearchDebounce);
      issueSearchDebounce = setTimeout(() => {
        loadIssues();
      }, 300);
    }

    function renderIssuesList(issues) {
      const container = document.getElementById('issues-container');
      if (!container) return;

      if (!issues || !issues.length) {
        container.innerHTML = \`
          <div style="background:var(--forge-bg-surface); border:1px solid var(--forge-border); border-radius:var(--forge-radius); padding:2rem; text-align:center;">
            <span style="font-size:1.8rem; display:block; margin-bottom:0.4rem;">🎉</span>
            <strong style="color:var(--forge-text-main); font-size:0.95rem;">Zero active issues in this view</strong>
            <p style="color:var(--forge-text-muted); font-size:0.8rem; margin:0.35rem 0 0 0;">All microservices are operating cleanly with zero unresolved RFC 7807 problem incidents.</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = issues.map(issue => {
        const statusBadge = issue.status === 'open'
          ? '<span class="astryx-badge badge-degraded">OPEN</span>'
          : (issue.status === 'investigating'
            ? '<span class="astryx-badge" style="background:rgba(245,158,11,0.15); color:var(--forge-accent); border:1px solid rgba(245,158,11,0.3);">INVESTIGATING</span>'
            : (issue.status === 'resolved'
              ? '<span class="astryx-badge badge-running">RESOLVED</span>'
              : '<span class="astryx-badge" style="background:var(--forge-bg-root); color:var(--forge-text-subtle);">IGNORED</span>'));

        const relativeTime = formatRelativeTime(issue.last_seen);
        const traceTag = issue.trace_id
          ? '<span class="log-trace-tag" onclick="event.stopPropagation(); filterByTraceId(\\'' + issue.trace_id + '\\')">#' + issue.trace_id.slice(0, 8) + '</span>'
          : '';

        return \`
          <div class="issue-item-card" onclick="openIssueDetailModal('\${issue.id}')">
            <div class="issue-item-main">
              <div class="issue-type-header">
                <span class="issue-freq-badge">\${issue.occurrence_count}x</span>
                <span class="astryx-micro-pill" style="font-weight:700; color:var(--forge-accent);">\${issue.error_type}</span>
                <span class="astryx-micro-pill">SVC: \${issue.app_id}</span>
                \${statusBadge}
                \${traceTag}
              </div>
              <div class="issue-message-text">\${escapeHtml(issue.message)}</div>
              <div class="issue-meta-row">
                <span>Last seen: <strong>\${relativeTime}</strong></span>
                <span>•</span>
                <span>First recorded: \${new Date(issue.first_seen * 1000).toLocaleTimeString()}</span>
                <span>•</span>
                <span style="font-family:monospace; font-size:0.7rem; color:var(--forge-text-subtle);">\${issue.id}</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.35rem; align-items:flex-end;" onclick="event.stopPropagation()">
              <select class="form-input" style="height:24px; font-size:0.7rem; padding:0 1.5rem 0 0.4rem;" onchange="triageIssueStatus('\${issue.id}', this.value)">
                <option value="open" \${issue.status === 'open' ? 'selected' : ''}>Open</option>
                <option value="investigating" \${issue.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                <option value="resolved" \${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                <option value="ignored" \${issue.status === 'ignored' ? 'selected' : ''}>Ignored</option>
              </select>
            </div>
          </div>
        \`;
      }).join('');
    }

    function openIssueDetailModal(issueId) {
      const issue = cachedIssuesList.find(i => i.id === issueId);
      if (!issue) return;

      const modal = document.getElementById('issue-detail-modal');
      const titleEl = document.getElementById('modal-issue-title');
      const bodyEl = document.getElementById('modal-issue-body');
      const footerEl = document.getElementById('modal-issue-footer');

      if (titleEl) titleEl.textContent = issue.error_type + ' (' + issue.app_id + ')';
      if (bodyEl) {
        bodyEl.innerHTML = \`
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
            <span class="issue-freq-badge" style="font-size:0.8rem;">Occurrences: \${issue.occurrence_count}x</span>
            <span class="astryx-micro-pill">App: \${issue.app_id}</span>
            <span class="astryx-micro-pill">Status: \${issue.status.toUpperCase()}</span>
            \${issue.trace_id ? '<span class="log-trace-tag" onclick="filterByTraceId(\\'' + issue.trace_id + '\\'); closeIssueDetailModal();">Trace: #' + issue.trace_id + '</span>' : ''}
          </div>

          <div>
            <label style="font-size:0.72rem; font-weight:600; text-transform:uppercase; color:var(--forge-text-muted); display:block; margin-bottom:0.3rem;">Exception Message</label>
            <div style="background:var(--forge-bg-card); border:1px solid var(--forge-border); padding:0.65rem; border-radius:var(--forge-radius-sm); font-size:0.82rem; color:var(--forge-text-main); font-weight:550;">
              \${escapeHtml(issue.message)}
            </div>
          </div>

          <div>
            <label style="font-size:0.72rem; font-weight:600; text-transform:uppercase; color:var(--forge-text-muted); display:block; margin-bottom:0.3rem;">Stack Trace</label>
            <div class="stack-trace-box">\${escapeHtml(issue.stack_trace || 'No stack trace captured for this event.')}</div>
          </div>

          \${issue.context_json ? \`
            <div>
              <label style="font-size:0.72rem; font-weight:600; text-transform:uppercase; color:var(--forge-text-muted); display:block; margin-bottom:0.3rem;">Request Context</label>
              <div class="stack-trace-box" style="max-height:120px;">\${escapeHtml(issue.context_json)}</div>
            </div>
          \` : ''}
        \`;
      }

      if (footerEl) {
        footerEl.innerHTML = \`
          <div style="font-size:0.75rem; color:var(--forge-text-subtle);">
            Fingerprint: <code style="font-size:0.72rem;">\${issue.fingerprint.slice(0, 32)}...</code>
          </div>
          <div style="display:flex; gap:0.4rem;">
            \${issue.status !== 'resolved' ? \`
              <button class="astryx-btn btn-primary" style="padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="triageIssueStatus('\${issue.id}', 'resolved'); closeIssueDetailModal();">
                ✓ Mark Resolved
              </button>
            \` : ''}
            <button class="astryx-btn btn-outline" style="padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="closeIssueDetailModal()">Close</button>
          </div>
        \`;
      }

      if (modal) modal.classList.add('open');
    }

    function closeIssueDetailModal() {
      document.getElementById('issue-detail-modal')?.classList.remove('open');
    }

    async function triageIssueStatus(issueId, status) {
      try {
        const res = await fetch(apiBase + '/api/issues/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issueId, status }),
        }).then(r => r.json());

        if (res.status === 'ok' || res.success) {
          if (window.showAstryxToast) window.showAstryxToast('success', 'Incident status updated to ' + status);
          loadIssues();
        }
      } catch (err) {
        console.error('Triage failed', err);
      }
    }

    async function resolveAllOpenIssues() {
      try {
        const res = await fetch(apiBase + '/api/issues/resolve-all', { method: 'POST' }).then(r => r.json());
        if (res.status === 'ok') {
          if (window.showAstryxToast) window.showAstryxToast('success', 'Bulk resolved ' + res.resolvedCount + ' issues');
          loadIssues();
        }
      } catch (err) {
        console.error('Bulk resolve failed', err);
      }
    }

    async function simulateDiagnosticIssue() {
      try {
        const res = await fetch(apiBase + '/api/issues/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId: 'portal', errorType: 'UnhandledRejection' }),
        }).then(r => r.json());

        if (res.status === 'ok') {
          if (window.showAstryxToast) window.showAstryxToast('info', '⚡ Ingested test diagnostic exception into issue tracker');
          loadIssues();
        }
      } catch (err) {
        console.error('Simulate failed', err);
      }
    }

    function exportIssuesCsv() {
      window.location.href = apiBase + '/api/export/csv?type=issues';
    }

    function formatRelativeTime(epochSec) {
      const nowSec = Math.floor(Date.now() / 1000);
      const diff = nowSec - epochSec;
      if (diff < 60) return diff + 's ago';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    }
  `;
}
