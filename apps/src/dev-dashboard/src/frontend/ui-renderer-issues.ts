/**
 * @forge/dev-dashboard - Sentry-Style Issues Studio HTML Renderer (2026 LTS)
 * High-density incident tracking, triage matrix, and RFC 7807 inspection modal.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderIssuesTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderIssuesTab(): string {
  return `
    <!-- Tab 8: Sentry-Style Issue Incident Center (RFC 7807) -->
    <section id="tab-issues" class="tab-pane">
      
      <!-- 1. Header Command Card -->
      <div class="issues-header-card">
        <div>
          <h2 style="font-size: 1.15rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 700; color: var(--forge-text-main);">
            <span style="color: var(--forge-accent); display: flex; align-items: center;">${astryxIcons.issues}</span>
            Issue Incident Center & Error Triage
          </h2>
          <p style="color: var(--forge-text-muted); font-size: 0.8rem; margin: 0;">
            RFC 7807 problem details, deduplicated fingerprinting, stack trace inspection, and status triage.
          </p>
        </div>
        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="exportIssuesCsv()">
            ${astryxIcons.download} Export Issues CSV
          </button>
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="simulateDiagnosticIssue()">
            ⚡ Simulate Error
          </button>
          <button class="astryx-btn btn-primary" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="resolveAllOpenIssues()">
            ✓ Resolve All
          </button>
        </div>
      </div>

      <!-- 2. Real-time Incident Vitals (4 Cards) -->
      <div class="issues-vitals-grid">
        <div class="issues-vital-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">Active Unresolved</span>
            <span class="astryx-micro-pill" style="color: var(--forge-accent);" id="issues-unresolved-pill">TRIAGE</span>
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: var(--forge-accent);" id="issues-vital-unresolved">0</div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);">Open + Investigating items</div>
        </div>

        <div class="issues-vital-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">24h Error Density</span>
            <span class="astryx-micro-pill">ROLLING</span>
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main);" id="issues-vital-24h">0</div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);">Occurrences in last 24h</div>
        </div>

        <div class="issues-vital-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">Top Impacted Service</span>
            <span class="astryx-micro-pill">HOTSPOT</span>
          </div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--forge-primary);" id="issues-vital-top-service">None</div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);">Highest error density</div>
        </div>

        <div class="issues-vital-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">Resolved / Closed</span>
            <span class="astryx-micro-pill" style="color: var(--forge-success);">HEALTHY</span>
          </div>
          <div style="font-size: 1.35rem; font-weight: 700; color: var(--forge-success);" id="issues-vital-resolved">0</div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="issues-vital-ignored-sub">Ignored: 0</div>
        </div>
      </div>

      <!-- 3. Filter Toolbar & Search -->
      <div class="issues-filter-bar">
        <div class="issues-chips-group">
          <button class="issue-chip active" id="chip-status-all" onclick="setIssueStatusFilter('all')">All</button>
          <button class="issue-chip chip-open" id="chip-status-open" onclick="setIssueStatusFilter('open')">Open</button>
          <button class="issue-chip chip-investigating" id="chip-status-investigating" onclick="setIssueStatusFilter('investigating')">Investigating</button>
          <button class="issue-chip chip-resolved" id="chip-status-resolved" onclick="setIssueStatusFilter('resolved')">Resolved</button>
          <button class="issue-chip" id="chip-status-ignored" onclick="setIssueStatusFilter('ignored')">Ignored</button>
        </div>

        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <select id="issues-service-filter" class="form-input" style="height: 28px; font-size: 0.74rem; padding: 0.15rem 1.8rem 0.15rem 0.55rem;" onchange="onIssueServiceFilterChange(this.value)">
            <option value="all">All Services</option>
            <option value="portal">portal (:3000)</option>
            <option value="portal-api">portal-api (:3001)</option>
            <option value="auth">auth (:3001)</option>
            <option value="dev-dashboard">dev-dashboard (:3002)</option>
            <option value="employees">employees (:3003)</option>
            <option value="billing">billing (:3004)</option>
            <option value="landing">landing (:3005)</option>
          </select>
          <input type="text" id="issues-search-input" placeholder="Search error type, message, trace..." class="form-input" style="height: 28px; font-size: 0.74rem; width: 220px;" oninput="onIssueSearchInput(this.value)">
          <button class="astryx-btn btn-outline" style="height: 28px; padding: 0 0.55rem; font-size: 0.72rem;" onclick="loadIssues()">Refresh ↺</button>
        </div>
      </div>

      <!-- 4. Issues Incident List -->
      <div id="issues-container" class="issues-list-container">
        <div style="padding: 1.5rem; text-align: center; color: var(--forge-text-muted);">Loading incident logs...</div>
      </div>

      <!-- 5. Issue Detail Stack Trace Modal -->
      <div class="astryx-modal-backdrop" id="issue-detail-modal">
        <div class="astryx-modal-window" style="max-width: 720px;">
          <div class="astryx-modal-header">
            <h3 style="margin: 0; font-size: 1.05rem; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
              <span style="color: var(--forge-accent);">${astryxIcons.issues}</span>
              <span id="modal-issue-title">Incident Details</span>
            </h3>
            <button class="astryx-modal-close" onclick="closeIssueDetailModal()">✕</button>
          </div>
          <div class="astryx-modal-body" id="modal-issue-body" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <!-- Injected by ui-issues-scripts.ts -->
          </div>
          <div class="astryx-modal-footer" id="modal-issue-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <!-- Action buttons injected dynamically -->
          </div>
        </div>
      </div>

    </section>
  `;
}
