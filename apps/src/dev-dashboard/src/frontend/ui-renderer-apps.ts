/**
 * @forge/dev-dashboard - Forge Apps Command Center Renderer (2026 LTS)
 * HTML Layout for Fleet Vitals, Toolbar, Grid View, Matrix Table, Drawer, Sandbox, and Register Wizard.
 * Enterprise Micro-App Console Standard
 */

import { astryxIcons } from '@forge/ui';

/**
 * getAppsTabHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAppsTabHtml(): string {
  return `
    <!-- Tab 3: Forge Apps 2026 Developer Command Center -->
    <section id="tab-apps" class="tab-pane">
      <!-- 1. Fleet Overview Vitals Cards -->
      <div class="vitals-grid" id="apps-vitals-cards" style="margin-bottom: 1.25rem;">
        <div class="vitals-card">
          <div class="vitals-header"><span class="vitals-title">Micro-App Fleet SLO</span><span class="astryx-badge badge-running"><span class="badge-dot"></span> Active</span></div>
          <div class="vitals-value" id="vitals-apps-slo">-- / -- <span style="font-size:0.85rem; font-weight:500; color:var(--forge-primary);">Running</span></div>
          <div class="vitals-subtext"><span id="vitals-apps-avail">--% Fleet Availability</span><span style="color:var(--forge-primary); font-weight:600;">99.9% Target</span></div>
        </div>
        <div class="vitals-card">
          <div class="vitals-header"><span class="vitals-title">Dedicated Turso DBs</span><span class="astryx-badge badge-pill">libSQL Isolation</span></div>
          <div class="vitals-value" id="vitals-apps-storage">-- MB <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Allocated</span></div>
          <div class="vitals-subtext"><span id="vitals-apps-dbs-count">-- Dedicated Databases</span><span style="color:var(--forge-primary); font-weight:600;">WAL Enabled</span></div>
        </div>
        <div class="vitals-card">
          <div class="vitals-header"><span class="vitals-title">Multi-Tenant RBAC</span><span class="astryx-badge badge-pill">Zero-Trust</span></div>
          <div class="vitals-value" id="vitals-apps-roles">-- <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Security Roles</span></div>
          <div class="vitals-subtext"><span>Iframe Sandbox Isolation</span><span style="color:var(--forge-primary); font-weight:600;">Strict CSP</span></div>
        </div>
        <div class="vitals-card">
          <div class="vitals-header"><span class="vitals-title">Ingress Gateway</span><span class="astryx-badge badge-running">Caddy Proxy</span></div>
          <div class="vitals-value" id="vitals-apps-routing">-- <span style="font-size:0.8rem; font-weight:500; color:var(--forge-text-muted);">Active Routes</span></div>
          <div class="vitals-subtext"><span>Port Auto-Allocation</span><span style="color:var(--forge-primary); font-weight:600;">:80 / :443 Ingress</span></div>
        </div>
      </div>

      <!-- 2. High-Density Command Toolbar -->
      <div class="astryx-card" style="margin-bottom: 1rem; padding: 0.85rem 1rem;">
        <div class="apps-toolbar">
          <div style="display: flex; gap: 0.65rem; align-items: center; flex: 1; flex-wrap: wrap;">
            <div class="apps-search-box">
              <span style="color: var(--forge-text-muted); display: flex; align-items: center;">${astryxIcons.search}</span>
              <input type="search" id="apps-search-input" placeholder="Search micro-apps by name, ID, port, role, category..." oninput="filterApps()">
            </div>
            <div class="filter-chip-group" id="apps-filter-chips">
              <button class="filter-chip active" data-filter="all" onclick="setAppFilter('all')">All (<span id="app-count-all">0</span>)</button>
              <button class="filter-chip" data-filter="running" onclick="setAppFilter('running')">Running (<span id="app-count-running">0</span>)</button>
              <button class="filter-chip" data-filter="disabled" onclick="setAppFilter('disabled')">Disabled (<span id="app-count-disabled">0</span>)</button>
              <button class="filter-chip" data-filter="degraded" onclick="setAppFilter('degraded')">Degraded (<span id="app-count-degraded">0</span>)</button>
              <button class="filter-chip" data-filter="stopped" onclick="setAppFilter('stopped')">Stopped (<span id="app-count-stopped">0</span>)</button>
              <button class="filter-chip" data-filter="polyglot" onclick="setAppFilter('polyglot')">Polyglot Apps (<span id="app-count-polyglot">0</span>)</button>
              <button class="filter-chip" data-filter="core" onclick="setAppFilter('core')">Core Services (<span id="app-count-core">0</span>)</button>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <div class="apps-view-toggle">
              <button class="apps-view-btn active" id="btn-view-grid" onclick="setAppViewMode('grid')" title="Visual Cards Grid">${astryxIcons.layers} Grid</button>
              <button class="apps-view-btn" id="btn-view-table" onclick="setAppViewMode('table')" title="High-Density Matrix Table">${astryxIcons.database} Table</button>
            </div>
            <button class="astryx-btn btn-primary" onclick="openRegisterAppModal()" style="display: flex; align-items: center; gap: 0.35rem;">
              ${astryxIcons.plus} Register Forge App
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Views Container -->
      <div id="apps-grid-view" class="apps-grid-container"></div>
      
      <div id="apps-table-view" class="apps-table-container" style="display: none;">
        <table>
          <thead>
            <tr>
              <th style="width: 100px;">Status</th>
              <th>App Name & ID</th>
              <th>Category & Role</th>
              <th>Port & Ingress</th>
              <th>Dedicated Turso DB</th>
              <th>Health Probe</th>
              <th>Issues</th>
              <th style="text-align: right;">Operations</th>
            </tr>
          </thead>
          <tbody id="apps-table-tbody"></tbody>
        </table>
      </div>
    </section>

    <!-- 4. Slide-Out App Inspector Drawer -->
    <div id="app-drawer-backdrop" class="app-drawer-backdrop" onclick="closeAppDrawer()"></div>
    <div id="app-drawer" class="app-drawer">
      <div class="app-drawer-resizer"></div>
      <div class="app-drawer-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div id="drawer-app-icon" class="app-card-icon">⚡</div>
          <div>
            <div id="drawer-app-name" style="font-weight: 700; font-size: 0.95rem; color: var(--forge-text-main);">App Inspector</div>
            <div id="drawer-app-meta" style="font-size: 0.72rem; color: var(--forge-text-subtle); font-family: 'Geist Mono', monospace;">ID: --</div>
          </div>
        </div>
        <button class="astryx-btn btn-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="closeAppDrawer()">✕ Close</button>
      </div>
      <div id="app-drawer-body-content" class="app-drawer-body">
        <div style="color: var(--forge-text-muted); font-size: 0.82rem; text-align: center; padding: 2rem;">Select an app to inspect.</div>
      </div>
    </div>

    <!-- 5. Interactive Sandboxed Iframe Preview Modal -->
    <div id="app-sandbox-modal" class="astryx-modal-backdrop">
      <div class="astryx-modal" style="max-width: 1100px; width: 95vw; height: 85vh; display: flex; flex-direction: column; padding: 0; overflow: hidden;">
        <div class="sandbox-toolbar">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span id="sandbox-modal-icon" style="font-size: 1.1rem;">🖥️</span>
            <div>
              <span id="sandbox-modal-title" style="font-weight: 700; font-size: 0.9rem; color: var(--forge-text-main);">Sandbox Preview</span>
              <span id="sandbox-modal-url" style="font-size: 0.72rem; color: var(--forge-text-subtle); font-family: 'Geist Mono', monospace; margin-left: 0.4rem;"></span>
            </div>
          </div>
          
          <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
            <!-- Viewport Switcher -->
            <div class="sandbox-viewport-controls">
              <button class="sandbox-vp-btn active" id="vp-btn-desktop" onclick="setSandboxViewport('100%')">Desktop</button>
              <button class="sandbox-vp-btn" id="vp-btn-tablet" onclick="setSandboxViewport('768px')">Tablet (768px)</button>
              <button class="sandbox-vp-btn" id="vp-btn-mobile" onclick="setSandboxViewport('375px')">Mobile (375px)</button>
            </div>

            <!-- Role Simulator -->
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <label style="font-size: 0.72rem; color: var(--forge-text-muted);">Simulate Role:</label>
              <select id="sandbox-role-select" class="form-input" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; width: auto;" onchange="refreshSandboxFrame()">
                <option value="roles/super_admin">roles/super_admin</option>
                <option value="roles/manager">roles/manager</option>
                <option value="roles/finance">roles/finance</option>
                <option value="roles/employee" selected>roles/employee</option>
              </select>
            </div>

            <button class="astryx-btn btn-outline" style="padding: 0.2rem 0.55rem; font-size: 0.72rem;" onclick="refreshSandboxFrame()" title="Reload Frame">🔄</button>
            <a id="sandbox-direct-link" class="astryx-btn btn-outline" href="#" target="_blank" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; text-decoration: none;" title="Open in new window">↗</a>
            <button class="astryx-btn btn-outline" style="padding: 0.2rem 0.55rem; font-size: 0.72rem;" onclick="closeAppSandboxModal()">✕</button>
          </div>
        </div>

        <div class="sandbox-frame-wrapper" style="position: relative;">
          <iframe id="sandbox-preview-iframe" class="sandbox-iframe" sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads" src="about:blank"></iframe>
          <div id="sandbox-fallback-notice" style="display: none; position: absolute; inset: 0; background: var(--forge-bg-surface); padding: 2rem; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; z-index: 10;">
            <div style="font-size: 2.2rem;">🔒</div>
            <div style="font-weight: 700; font-size: 1rem; color: var(--forge-text-main);">Zero-Trust Security Frame Protection</div>
            <p style="font-size: 0.82rem; color: var(--forge-text-muted); max-width: 440px; margin: 0;">This service enforces strict <code>X-Frame-Options: DENY</code> or same-origin security policies. Click below to launch directly in a standalone window.</p>
            <a id="sandbox-fallback-btn" href="#" target="_blank" class="astryx-btn btn-primary" style="text-decoration: none; padding: 0.45rem 1.25rem;">Launch in New Window ↗</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. Register New Forge App Modal -->
    <div id="register-app-modal" class="astryx-modal-backdrop">
      <div class="astryx-modal" style="max-width: 720px;">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(62, 207, 142, 0.12); border: 1px solid rgba(62, 207, 142, 0.25); display: flex; align-items: center; justify-content: center; color: var(--forge-primary); font-size: 1.15rem;">
              ✨
            </div>
            <div>
              <h3 style="font-size: 1.08rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">Register New Forge Micro-App</h3>
              <div style="font-size: 0.76rem; color: var(--forge-text-muted); margin-top: 0.15rem;">Deploy an isolated polyglot micro-frontend with dedicated Turso DB & Caddy routing.</div>
            </div>
          </div>
          <button class="astryx-modal-close" onclick="closeRegisterAppModal()">&times;</button>
        </div>

        <form id="register-app-form" class="astryx-modal-body" onsubmit="submitRegisterApp(event)" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="app-wizard-grid">
            <!-- App Display Name -->
            <div class="form-group">
              <label class="form-label" for="reg-app-name">App Display Name <span class="required-star">*</span></label>
              <input type="text" id="reg-app-name" class="form-input" placeholder="e.g. Inventory Tracker" required oninput="autoDeriveAppId(this.value)">
            </div>

            <!-- App ID (Slug) -->
            <div class="form-group">
              <label class="form-label" for="reg-app-id">App ID (Slug) <span class="required-star">*</span></label>
              <input type="text" id="reg-app-id" class="form-input font-mono" placeholder="e.g. inventory-tracker" required pattern="[a-z0-9-]+" title="Only lowercase letters, numbers, and hyphens">
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label" for="reg-app-category">Category</label>
              <select id="reg-app-category" class="form-input">
                <option value="Isolated Polyglot Forge Micro-Apps" selected>Isolated Polyglot Forge Micro-Apps</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Operations & Logistics">Operations & Logistics</option>
                <option value="HR & People Ops">HR & People Ops</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Core Enterprise Services">Core Enterprise Services</option>
              </select>
            </div>

            <!-- Access Role -->
            <div class="form-group">
              <label class="form-label" for="reg-app-role">Required Access Role</label>
              <select id="reg-app-role" class="form-input">
                <option value="General" selected>General (All Employees)</option>
                <option value="Finance / Manager">Finance / Manager</option>
                <option value="Finance">Finance Only</option>
                <option value="HR / Admin">HR / Admin</option>
                <option value="Developer">Developer Only</option>
                <option value="Superadmin">Superadmin Only</option>
                <option value="Public">Public (Unauthenticated)</option>
              </select>
            </div>

            <!-- Internal Port with Auto-Suggest -->
            <div class="form-group">
              <div class="form-label-row">
                <label class="form-label" for="reg-app-port">Internal Port <span class="required-star">*</span></label>
                <button type="button" class="astryx-micro-btn" onclick="fetchNextAvailablePort()">⚡ Auto-Suggest</button>
              </div>
              <input type="number" id="reg-app-port" class="form-input font-mono" placeholder="8088" min="1024" max="65535" required>
            </div>

            <!-- Ingress Path -->
            <div class="form-group">
              <label class="form-label" for="reg-app-ingress">Ingress Route Path <span class="required-star">*</span></label>
              <input type="text" id="reg-app-ingress" class="form-input font-mono" placeholder="/apps/inventory-tracker" required>
            </div>

            <!-- Runtime Engine -->
            <div class="form-group">
              <label class="form-label" for="reg-app-runtime">Runtime Engine</label>
              <select id="reg-app-runtime" class="form-input">
                <option value="bun-watch" selected>Bun Standalone (Hot-Reload / bun --watch)</option>
                <option value="node-service">Node.js LTS Service</option>
                <option value="docker-container">Docker Isolated Container</option>
                <option value="external-url">External / Hybrid Upstream URL</option>
              </select>
            </div>

            <!-- Storage Quota -->
            <div class="form-group">
              <label class="form-label" for="reg-app-quota">Turso DB Quota (MB)</label>
              <input type="number" id="reg-app-quota" class="form-input font-mono" value="50" min="5" max="1000">
            </div>
          </div>

          <!-- Automation & Provisioning Options -->
          <div class="app-options-section">
            <div class="app-options-title">AUTOMATION & PROVISIONING PIPELINE</div>
            <div class="app-options-list">
              <label class="app-option-card">
                <input type="checkbox" id="reg-opt-db" checked class="app-option-checkbox">
                <div class="app-option-icon">🗄️</div>
                <div class="app-option-text">
                  <div class="app-option-title">Auto-Provision Dedicated Turso DB</div>
                  <div class="app-option-desc">Creates <code>data/&lt;app-id&gt;.db</code> with WAL mode, incremental auto-vacuum, and metadata schema.</div>
                </div>
              </label>

              <label class="app-option-card">
                <input type="checkbox" id="reg-opt-env" checked class="app-option-checkbox">
                <div class="app-option-icon">📝</div>
                <div class="app-option-text">
                  <div class="app-option-title">Persist Declarative Ingress to <code>.env</code></div>
                  <div class="app-option-desc">Appends <code>APP_&lt;ID&gt;="..."</code> into root <code>.env</code> for dynamic Caddy routing & landing discovery.</div>
                </div>
              </label>

              <label class="app-option-card">
                <input type="checkbox" id="reg-opt-scaffold" checked class="app-option-checkbox">
                <div class="app-option-icon">📦</div>
                <div class="app-option-text">
                  <div class="app-option-title">Scaffold Project Starter Files</div>
                  <div class="app-option-desc">Clones <code>forge-apps/app-template</code> into <code>forge-apps/&lt;app-id&gt;</code> with customized package.json & health probes.</div>
                </div>
              </label>
            </div>
          </div>

          <div class="astryx-modal-footer">
            <button type="button" class="astryx-btn btn-outline" onclick="closeRegisterAppModal()">Cancel</button>
            <button type="submit" id="btn-submit-register" class="astryx-btn btn-primary" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem;">
              <span>🚀</span> Register & Deploy Micro-App
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 7. Edit App Configuration Modal -->
    <div id="edit-app-modal" class="astryx-modal-backdrop">
      <div class="astryx-modal" style="max-width: 600px;">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 34px; height: 34px; border-radius: 8px; background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              ⚙️
            </div>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">Edit Micro-App Configuration</h3>
              <div style="font-size: 0.74rem; color: var(--forge-text-muted); margin-top: 0.15rem;">Update metadata, operational state, or quota limits.</div>
            </div>
          </div>
          <button class="astryx-modal-close" onclick="closeEditAppModal()">&times;</button>
        </div>

        <form id="edit-app-form" class="astryx-modal-body" onsubmit="submitEditApp(event)" style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="hidden" id="edit-app-id">
          <div class="app-wizard-grid">
            <div class="form-group app-wizard-full">
              <label class="form-label" for="edit-app-name">App Display Name <span class="required-star">*</span></label>
              <input type="text" id="edit-app-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-app-category">Category</label>
              <input type="text" id="edit-app-category" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-app-role">Access Role</label>
              <input type="text" id="edit-app-role" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-app-status">Operational Status</label>
              <select id="edit-app-status" class="form-input">
                <option value="active">Active (Serving Traffic & Visible in Portal)</option>
                <option value="disabled">Disabled (Hidden from Portal & Users, Monitored Here)</option>
                <option value="maintenance">Maintenance Mode</option>
                <option value="inactive">Inactive / Paused</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-app-quota">Turso DB Quota (MB)</label>
              <input type="number" id="edit-app-quota" class="form-input font-mono" min="5" max="2000">
            </div>
          </div>

          <div class="astryx-modal-footer" style="justify-content: space-between;">
            <button type="button" class="astryx-btn btn-outline" style="color: var(--forge-accent); border-color: var(--forge-accent);" onclick="confirmDeleteApp()">🗑️ Deregister App</button>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="astryx-btn btn-outline" onclick="closeEditAppModal()">Cancel</button>
              <button type="submit" class="astryx-btn btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}
