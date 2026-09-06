/**
 * @forge/portal - Company Map & Org Canvas View Renderer (2026 LTS)
 * Executive-grade organizational graph, progressive tree expansion,
 * multi-perspective views (Canvas, Divisions Matrix, Leadership), and real SQLite data.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderCanvasView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderCanvasView(): string {
  return `
    <div id="view-canvas" class="portal-page-view">
      
      <!-- 1. Sleek Compact Header & Quick Tools -->
      <div class="canvas-hero-banner">
        <div class="canvas-hero-left">
          <div class="canvas-status-icon-box">
            <span class="badge-dot" style="background: var(--forge-success); box-shadow: 0 0 8px var(--forge-success); width: 7px; height: 7px;"></span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h1 class="canvas-hero-title">Company Map & Org Canvas</h1>
              <span class="astryx-badge badge-running" style="font-size: 0.68rem; padding: 0.12rem 0.45rem;">LIVE DIRECTORY</span>
            </div>
            <div class="canvas-hero-subtitle">
              <span id="canvas-total-summary">Loading organization...</span>
              <span>•</span>
              <span id="canvas-div-summary">Live SQLite Hierarchy</span>
            </div>
          </div>
        </div>

        <div class="canvas-hero-actions">
          <button class="astryx-btn btn-outline btn-sm" id="canvas-btn-fit" data-astryx-tooltip="Fit Visible Map to Window">
            <span class="btn-icon">${astryxIcons.layers}</span>
            <span>Fit to Window</span>
          </button>
          <button class="astryx-btn btn-outline btn-sm" id="canvas-btn-lead" data-astryx-tooltip="Focus Executive Leadership">
            <span class="btn-icon">${astryxIcons.topology}</span>
            <span>Leadership</span>
          </button>
          <button class="astryx-btn btn-primary btn-sm" id="canvas-find-me-btn" data-astryx-tooltip="Focus My Team Hierarchy">
            <span class="btn-icon">${astryxIcons.user}</span>
            <span>My Team</span>
          </button>
        </div>
      </div>

      <!-- 2. Perspective Tabs & Canvas Control Strip -->
      <div class="canvas-view-modes-bar">
        <div class="canvas-tab-pills">
          <button class="canvas-tab-pill active" data-mode="canvas">
            <span class="tab-icon">${astryxIcons.gitTree}</span>
            <span>Hierarchy Canvas</span>
          </button>
          <button class="canvas-tab-pill" data-mode="divisions">
            <span class="tab-icon">${astryxIcons.building}</span>
            <span>Divisions & Teams</span>
          </button>
          <button class="canvas-tab-pill" data-mode="leadership">
            <span class="tab-icon">${astryxIcons.topology}</span>
            <span>Leadership Tiers</span>
          </button>
        </div>

        <!-- Depth Controller (Default L2 for fast, progressive loading) -->
        <div class="canvas-actions-right">
          <div class="canvas-depth-selector">
            <span class="depth-label">Scope:</span>
            <button class="depth-btn active" data-depth="2" data-astryx-tooltip="Executive & Division Heads (Fast L1-L2)">Heads</button>
            <button class="depth-btn" data-depth="3" data-astryx-tooltip="Department Managers (L1-L3)">Managers</button>
            <button class="depth-btn" data-depth="5" data-astryx-tooltip="Full Functional Teams (L1-L5)">Teams</button>
            <button class="depth-btn" data-depth="10" data-astryx-tooltip="All Extended Levels">All</button>
          </div>

          <!-- Zoom Controls -->
          <div class="canvas-zoom-controls">
            <button class="astryx-btn btn-sm btn-ghost" id="canvas-zoom-out" data-astryx-tooltip="Zoom Out" aria-label="Zoom Out">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <span class="canvas-zoom-level" id="canvas-zoom-level">100%</span>
            <button class="astryx-btn btn-sm btn-ghost" id="canvas-zoom-in" data-astryx-tooltip="Zoom In" aria-label="Zoom In">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button class="astryx-btn btn-sm btn-ghost" id="canvas-reset-btn" data-astryx-tooltip="Reset Viewport">
              <span style="display:flex; align-items:center;">${astryxIcons.refresh}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Mode 1: Interactive Hierarchy Canvas View -->
      <div id="canvas-mode-canvas" class="canvas-mode-container active">
        <!-- Canvas Search & Division Filters Strip -->
        <div class="canvas-search-bar">
          <div class="canvas-search-input-wrap">
            <span class="search-icon">${astryxIcons.search}</span>
            <input type="text" id="canvas-search-input" placeholder="Search colleague by name, title, division, or email..." />
          </div>

          <div class="canvas-filter-pills" id="canvas-dept-filters">
            <button class="filter-pill active" data-div="all">All Divisions</button>
          </div>
        </div>

        <!-- Canvas Container with Non-Scrolling Sticky Minimap & Inspector -->
        <div class="canvas-viewport-wrapper">
          <div class="canvas-viewport-frame" id="canvas-viewport">
            <div class="canvas-pan-surface" id="canvas-surface">
              <!-- Dynamic SVG Bezier Connection Lines -->
              <svg class="canvas-connections-svg" id="canvas-svg-layer"></svg>

              <!-- Dynamic Node Cards Layer -->
              <div id="canvas-nodes-container" class="canvas-nodes-layer"></div>
            </div>
          </div>

          <!-- Position-Fixed Minimap Radar Overlay -->
          <div class="canvas-minimap-box" id="canvas-minimap" data-astryx-tooltip="Organization Minimap (Drag or Click to Pan)">
            <div class="minimap-viewport-indicator" id="minimap-indicator"></div>
          </div>

          <!-- Floating Colleague Inspector Drawer -->
          <div id="canvas-node-inspector" class="canvas-inspector-card" style="display: none;">
            <div class="inspector-header">
              <span class="inspector-title" id="inspector-name">Colleague Profile</span>
              <button class="inspector-close" id="inspector-close-btn" aria-label="Close Inspector">&times;</button>
            </div>

            <div class="inspector-body">
              <div class="inspector-avatar-row">
                <div class="node-avatar-large" id="inspector-avatar">--</div>
                <div style="min-width: 0; flex: 1;">
                  <div class="inspector-emp-name" id="inspector-full-name">--</div>
                  <div class="inspector-emp-role" id="inspector-role">--</div>
                  <div style="display: flex; gap: 0.35rem; margin-top: 0.3rem;">
                    <span class="astryx-micro-pill" id="inspector-status-pill">ONLINE</span>
                    <span class="astryx-micro-pill" id="inspector-code-pill" style="font-family: var(--forge-font-mono, monospace);">EMP-00</span>
                  </div>
                </div>
              </div>

              <!-- Upward Reporting Path Breadcrumb -->
              <div class="inspector-reporting-section">
                <div class="inspector-section-label">Reporting Path to Leadership</div>
                <div class="inspector-breadcrumb" id="inspector-chain">
                  <span class="breadcrumb-item">Loading path...</span>
                </div>
              </div>

              <div class="inspector-meta-list">
                <div class="detail-row"><span class="detail-label">Division</span><span class="detail-val" id="inspector-division">--</span></div>
                <div class="detail-row"><span class="detail-label">Department</span><span class="detail-val" id="inspector-department">--</span></div>
                <div class="detail-row"><span class="detail-label">Work Email</span><span class="detail-val" id="inspector-email" style="font-family: var(--forge-font-mono, monospace);">--</span></div>
                <div class="detail-row"><span class="detail-label">Hierarchy Level</span><span class="detail-val" id="inspector-level">--</span></div>
                <div class="detail-row"><span class="detail-label">Direct Reports</span><span class="detail-val" id="inspector-reports">--</span></div>
              </div>

              <!-- Direct Manager Card -->
              <div id="inspector-manager-box" class="inspector-relation-card" style="display: none; margin-top: 0.6rem;">
                <div class="relation-label">Reports Directly To:</div>
                <div class="relation-person-row" id="inspector-manager-row">
                  <div class="node-avatar-sm" id="inspector-mgr-avatar">--</div>
                  <div style="min-width:0; flex:1;">
                    <div class="relation-name" id="inspector-mgr-name">--</div>
                    <div class="relation-role" id="inspector-mgr-role">--</div>
                  </div>
                  <button class="astryx-btn btn-ghost btn-xs" id="inspector-jump-mgr-btn">View</button>
                </div>
              </div>

              <!-- Direct Reports Roster -->
              <div id="inspector-reports-box" class="inspector-relation-card" style="display: none; margin-top: 0.5rem;">
                <div class="relation-label" id="inspector-reports-label">Direct Reports:</div>
                <div class="reports-chip-grid" id="inspector-reports-grid"></div>
              </div>

              <div class="inspector-actions">
                <button class="astryx-btn btn-sm btn-outline" id="inspector-focus-sub-btn" style="flex: 1;">
                  <span class="btn-icon">${astryxIcons.gitTree}</span>
                  <span>Focus Team</span>
                </button>
                <button class="astryx-btn btn-sm btn-primary" id="inspector-copy-email-btn" style="flex: 1;">
                  <span class="btn-icon">${astryxIcons.mail}</span>
                  <span>Copy Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Mode 2: Divisions & Teams Matrix -->
      <div id="canvas-mode-divisions" class="canvas-mode-container">
        <div class="divisions-matrix-header">
          <div>
            <h2 class="divisions-matrix-title">Organizational Divisions & Pods</h2>
            <p class="divisions-matrix-desc">Comprehensive breakdown of all business units, functional squads, and team leaders across the company.</p>
          </div>
        </div>

        <div class="divisions-fleet-grid" id="divisions-fleet-grid">
          <!-- Rendered dynamically by ui-canvas-views.ts -->
        </div>
      </div>

      <!-- 5. Mode 3: Leadership Tier Pipeline -->
      <div id="canvas-mode-leadership" class="canvas-mode-container">
        <div class="leadership-tier-header">
          <div>
            <h2 class="leadership-tier-title">Executive & Management Pipeline</h2>
            <p class="leadership-tier-desc">Structured tier-by-tier flow from Executive Council down to Department Leads and Functional Pods.</p>
          </div>
          <span class="astryx-micro-pill" style="color: var(--forge-primary);">TOPOLOGY FLOW</span>
        </div>

        <div class="leadership-pipeline-flow" id="leadership-pipeline-flow">
          <!-- Rendered dynamically by ui-canvas-views.ts -->
        </div>
      </div>

    </div>
  `;
}
