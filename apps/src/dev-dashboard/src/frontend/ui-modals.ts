/**
 * @forge/dev-dashboard - Modal Dialogs & Flyout Drawers Renderer (2026 LTS)
 * Modular Astryx modal dialogs for Command Palette, Remote DB Connect, Safe Env, API Registry, and Logs.
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * getModalsHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getModalsHtml(): string {
  return `
  <!-- Command Palette Modal (Cmd+K) -->
  <div class="palette-modal-backdrop" id="cmd-palette-modal" onclick="if(event.target===this)closeCommandPalette()">
    <div class="palette-box">
      <div class="palette-input-wrap">
        <span>🔍</span>
        <input type="search" class="palette-input" id="palette-search-input" name="palette-search-query" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type a command or jump to tab... (↑↓ to select, Enter)" oninput="filterPaletteItems(this.value)">
        <kbd style="font-size: 0.7rem; color: var(--forge-text-muted);">ESC</kbd>
      </div>
      <ul class="palette-list" id="palette-items-list"></ul>
    </div>
  </div>

  <!-- Connect Remote Database Modal (GCP / Turso / Postgres) -->
  <div class="astryx-modal-backdrop" id="connect-db-modal">
    <div class="astryx-modal" style="max-width: 520px;">
      <div class="astryx-modal-header">
        <h3>🔌 Connect Remote Microservice Database</h3>
        <button class="astryx-modal-close" onclick="closeConnectModal()">&times;</button>
      </div>
      <form class="astryx-modal-body" autocomplete="off" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem;">
        <div>
          <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Connection Name</label>
          <input type="text" class="form-input" id="remote-conn-name" name="db_connection_label" autocomplete="off" placeholder="e.g. Auth Microservice DB">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Database Type</label>
            <select class="form-input" id="remote-conn-type">
              <option value="turso">Turso LibSQL (HTTP/TLS)</option>
              <option value="postgres">PostgreSQL / Cloud SQL</option>
              <option value="sqlite">SQLite Remote / File</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Access Mode</label>
            <select class="form-input" id="remote-conn-mode">
              <option value="readonly">Read-Only Sandbox (Safe)</option>
              <option value="readwrite">Read-Write Access</option>
            </select>
          </div>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Connection URL / Endpoint</label>
          <input type="text" class="form-input" id="remote-conn-url" name="db_connection_endpoint" autocomplete="off" placeholder="libsql://your-db.turso.io or https://...">
        </div>
        <div>
          <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Auth Token / API Secret (Optional)</label>
          <input type="text" class="form-input" id="remote-conn-token" name="db_api_secret_token" autocomplete="new-password" style="-webkit-text-security: disc;" placeholder="Bearer eyJhbGciOi...">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
          <button class="astryx-btn btn-outline" style="padding: 0.35rem 0.75rem;" onclick="testRemoteConnection()">🩺 Test Ping</button>
          <div style="display: flex; gap: 0.4rem;">
            <button class="astryx-btn btn-outline" onclick="closeConnectModal()">Cancel</button>
            <button class="astryx-btn btn-primary" onclick="saveRemoteConnection()">💾 Save Connection</button>
          </div>
        </div>
        <div id="remote-conn-status" style="font-size: 0.78rem; margin-top: 0.25rem;"></div>
      </form>
    </div>
  </div>

  <!-- Safe Environment Modal -->
  <div class="astryx-modal-backdrop" id="safe-env-modal">
    <div class="astryx-modal">
      <div class="astryx-modal-header">
        <h3>🔐 Masked Environment Inspector</h3>
        <button class="astryx-modal-close" onclick="closeSafeEnvModal()">&times;</button>
      </div>
      <div class="astryx-modal-body">
        <div class="astryx-table-wrap" id="safe-env-table-container">Loading environment...</div>
      </div>
    </div>
  </div>

  <!-- API Registry Modal -->
  <div class="astryx-modal-backdrop" id="api-registry-modal">
    <div class="astryx-modal" style="max-width: 760px;">
      <div class="astryx-modal-header">
        <h3>⚡ API Route Explorer & cURL Generator</h3>
        <button class="astryx-modal-close" onclick="closeApiRegistryModal()">&times;</button>
      </div>
      <div class="astryx-modal-body">
        <div id="api-registry-container">Loading endpoints...</div>
      </div>
    </div>
  </div>

  <!-- Help & Architecture Explainer Modal -->
  <div class="astryx-modal-backdrop" id="help-modal">
    <div class="astryx-modal">
      <div class="astryx-modal-header">
        <h3>❓ Services & Processes Architecture Guide</h3>
        <button class="astryx-modal-close" onclick="closeHelpModal()">&times;</button>
      </div>
      <div class="astryx-modal-body">
        <h4 style="color: var(--forge-primary); margin-bottom: 0.4rem;">Operational States</h4>
        <ul style="padding-left: 1.2rem; margin-bottom: 1rem;">
          <li><strong style="color: var(--forge-success);">RUNNING:</strong> Process is active, healthy, and accepting Turso DB connections.</li>
          <li><strong style="color: var(--forge-accent);">DEGRADED:</strong> Service is experiencing elevated response latency (&gt;50ms).</li>
          <li><strong style="color: var(--forge-text-muted);">STOPPED:</strong> Service is halted or offline.</li>
          <li><strong style="color: var(--forge-primary);">STARTING:</strong> Service runtime is booting or executing migrations.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- App-Specific 4-Pillar Live Log Inspector Modal -->
  <div class="astryx-modal-backdrop" id="app-logs-modal">
    <div class="astryx-modal log-modal-content">
      <div class="astryx-modal-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.1rem;">📜</span>
          <div>
            <h3 id="app-logs-title" style="margin: 0; font-size: 1rem;">App Live Logs</h3>
            <span id="app-logs-meta" style="font-size: 0.75rem; color: var(--forge-text-muted);">Port: :3000 | Route: /</span>
          </div>
        </div>
        <button class="astryx-modal-close" onclick="closeAppLogsModal()">&times;</button>
      </div>
      <div class="astryx-modal-body" style="display: flex; flex-direction: column; flex: 1; padding: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">
          <div style="display: flex; gap: 0.3rem;">
            <button class="astryx-btn btn-primary" id="pillar-tab-all" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="setModalPillar('all')">All</button>
            <button class="astryx-btn btn-outline" id="pillar-tab-app" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="setModalPillar('app')">🖥️ Server</button>
            <button class="astryx-btn btn-outline" id="pillar-tab-browser" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="setModalPillar('browser')">🌐 Browser</button>
            <button class="astryx-btn btn-outline" id="pillar-tab-docker" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="setModalPillar('docker')">🐳 Docker</button>
            <button class="astryx-btn btn-outline" id="pillar-tab-db" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="setModalPillar('db')">🗄️ DB</button>
          </div>
          <div style="display: flex; gap: 0.3rem; align-items: center;">
            <input type="search" class="form-input" id="app-logs-filter" name="app-logs-filter-query" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Filter logs..." style="width: 180px; padding: 0.2rem 0.5rem; font-size: 0.75rem;" oninput="filterAppLogs(this.value)">
            <button class="astryx-btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="clearAppLogs()">Clear</button>
          </div>
        </div>
        <div class="terminal-window" id="app-logs-terminal" style="height: 100%; min-height: 380px;">Waiting for isolated app logs...</div>
      </div>
    </div>
  </div>

  <!-- Slide-Out Service Inspector Drawer -->
  <div class="service-drawer-backdrop" id="service-drawer-backdrop" onclick="closeServiceDrawer()"></div>
  <aside class="service-drawer" id="service-drawer" aria-label="Service Details Inspector">
    <div class="drawer-resizer" id="service-drawer-resizer" title="Drag edge to resize (Double-click to reset)"></div>
    <div class="drawer-header">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.3rem;" id="drawer-svc-icon">⚡</span>
        <div>
          <h3 id="drawer-svc-name" style="margin: 0; font-size: 1rem; color: var(--forge-text-main);">Service Name</h3>
          <span id="drawer-svc-meta" style="font-size: 0.75rem; color: var(--forge-text-muted);">Port: :3000 | Ingress: /</span>
        </div>
      </div>
      <button class="astryx-modal-close" onclick="closeServiceDrawer()">&times;</button>
    </div>
    <div class="drawer-body" id="drawer-body-content"></div>
  </aside>

  <!-- Add / Edit Employee Flyout Modal -->
  <div class="astryx-modal-backdrop" id="modal-employee-flyout">
    <div class="astryx-modal" style="max-width: 580px; width: 92vw;">
      <div class="astryx-modal-header">
        <h3 id="modal-employee-title">➕ Add New Employee Profile</h3>
        <button class="astryx-modal-close" onclick="closeEmployeeModal()">&times;</button>
      </div>
      <form class="astryx-modal-body" onsubmit="saveEmployeeForm(event)" style="display: flex; flex-direction: column; gap: 0.85rem; padding: 1.25rem;">
        <input type="hidden" id="emp-form-id">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Full Name *</label>
            <input type="text" class="form-input" id="emp-form-name" required placeholder="e.g. Elena Rostova">
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Work Email *</label>
            <input type="email" class="form-input" id="emp-form-email" required placeholder="elena.r@forge.internal">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Job Title</label>
            <input type="text" class="form-input" id="emp-form-title" placeholder="e.g. Senior Platform Architect">
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Employee Code</label>
            <input type="text" class="form-input" id="emp-form-code" placeholder="e.g. ENG-0204">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Department / Node</label>
            <select class="form-input" id="emp-form-dept"></select>
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Line Manager</label>
            <select class="form-input" id="emp-form-manager"></select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Primary IAM Role</label>
            <select class="form-input" id="emp-form-role">
              <option value="roles/employee">Employee Standard (roles/employee)</option>
              <option value="roles/super_admin">Super Administrator (roles/super_admin)</option>
              <option value="roles/security.admin">Security & System Admin (roles/security.admin)</option>
              <option value="roles/hr.admin">HR & People Administrator (roles/hr.admin)</option>
              <option value="roles/it.admin">IT & Systems Administrator (roles/it.admin)</option>
              <option value="roles/billing.admin">Billing Administrator (roles/billing.admin)</option>
              <option value="roles/dev.operator">Platform Developer (roles/dev.operator)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Account Status</label>
            <select class="form-input" id="emp-form-status">
              <option value="ACTIVE">🟢 Active</option>
              <option value="INVITED">🟡 Invited (Pending Password)</option>
              <option value="SUSPENDED">🔴 Suspended (Blocked)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem;">
          <button type="button" class="astryx-btn btn-outline" onclick="closeEmployeeModal()">Cancel</button>
          <button type="submit" class="astryx-btn btn-primary">💾 Save Employee</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Hierarchy Visualizer Modal (Astryx Glassmorphic Style) -->
  <div class="astryx-modal-backdrop" id="modal-hierarchy-view">
    <div class="astryx-modal" style="max-width: 660px; width: 94vw;">
      <div class="astryx-modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">👔</span>
          <h3 style="margin: 0; font-size: 1.05rem;">Organization Lineage & Reporting Line</h3>
        </div>
        <button class="astryx-modal-close" onclick="closeHierarchyModal()">&times;</button>
      </div>
      <div class="astryx-modal-body" id="hierarchy-content-box" style="padding: 1.25rem; max-height: 540px; overflow-y: auto; scrollbar-width: thin;"></div>
    </div>
  </div>

  <!-- Multi-Step Bulk Import Wizard Modal -->
  <div class="astryx-modal-backdrop" id="modal-import-wizard">
    <div class="astryx-modal" style="max-width: 720px; width: 94vw;">
      <div class="astryx-modal-header">
        <h3>📥 Bulk Import Organization Employees (CSV / JSON)</h3>
        <button class="astryx-modal-close" onclick="closeImportWizard()">&times;</button>
      </div>
      <div class="astryx-modal-body" style="padding: 1.25rem;">
        <!-- Step 1: Upload Dropzone -->
        <div id="import-step-1">
          <div class="import-dropzone" ondragover="this.classList.add('dragover'); event.preventDefault();" ondragleave="this.classList.remove('dragover');" ondrop="this.classList.remove('dragover'); handleFileDrop(event);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📁</div>
            <h4 style="margin: 0 0 0.25rem 0;">Drag & Drop CSV or JSON File</h4>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 1rem 0;">Supports up to 5,000 employee records with auto-column matching</p>
            <input type="file" id="import-file-input" accept=".csv,.json" style="display: none;" onchange="handleImportFileSelect(event)">
            <button type="button" class="astryx-btn btn-primary" onclick="document.getElementById('import-file-input').click()">Browse Files</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.75rem; color: var(--forge-text-muted); flex-wrap: wrap; gap: 0.5rem;">
            <div>💡 Required columns: <code>display_name</code>, <code>email</code>. Optional: <code>job_title</code>, <code>department</code>, <code>manager_email</code>, <code>employee_code</code>, <code>role</code></div>
            <button type="button" class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;" onclick="downloadSampleCsvTemplate()">📥 Download Sample CSV</button>
          </div>
        </div>

        <!-- Step 2: Auto-Mapping & Settings -->
        <div id="import-step-2" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="margin: 0;">Step 2: Review File Data & Options</h4>
            <span class="astryx-badge" id="import-record-count-badge">0 records</span>
          </div>

          <div class="astryx-table-wrap" style="max-height: 220px; overflow-y: auto; margin-bottom: 1rem;">
            <table class="data-table" style="font-size: 0.75rem;">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody id="import-preview-tbody"></tbody>
            </table>
          </div>

          <div style="background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; cursor: pointer;">
              <input type="checkbox" id="import-opt-autodept" checked>
              <span>Auto-create missing departments/squads in hierarchy tree</span>
            </label>
            <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.78rem;">
              <span>Duplicate Handling:</span>
              <select class="form-input" id="import-opt-duplicate" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                <option value="update">Overwrite & Update Existing (Recommended)</option>
                <option value="skip">Skip Existing</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
            <button type="button" class="astryx-btn btn-outline" onclick="openImportWizard()">← Back</button>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="astryx-btn btn-outline" onclick="executeImportValidation(true)">🩺 Run Dry-Run Check</button>
              <button type="button" class="astryx-btn btn-primary" onclick="executeImportValidation(false)">🚀 Commit Import</button>
            </div>
          </div>
        </div>

        <!-- Step 3: Dry-Run Summary -->
        <div id="import-step-3" style="display: none;">
          <h4 style="margin: 0 0 0.75rem 0;">Step 3: Dry-Run Validation Summary</h4>
          <div class="db-telemetry-grid" style="margin-bottom: 1rem;">
            <div class="db-metric-chip"><span class="db-metric-val" style="color: var(--forge-success);" id="dryrun-valid-count">0</span><span class="db-metric-lbl">Valid Rows</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" style="color: var(--forge-accent);" id="dryrun-invalid-count">0</span><span class="db-metric-lbl">Invalid Rows</span></div>
            <div class="db-metric-chip"><span class="db-metric-val" id="dryrun-dept-count">0</span><span class="db-metric-lbl">New Depts</span></div>
          </div>

          <div id="dryrun-errors-box" style="display: none; background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.75rem; color: var(--forge-accent); font-size: 0.75rem; max-height: 160px; overflow-y: auto; margin-bottom: 1rem;"></div>

          <div style="display: flex; justify-content: space-between;">
            <button type="button" class="astryx-btn btn-outline" onclick="showImportStep2()">← Back</button>
            <button type="button" class="astryx-btn btn-primary" onclick="executeImportValidation(false)">🚀 Confirm & Commit</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Slide-Over Employee Profile Inspector Drawer -->
  <div class="emp-drawer-backdrop" id="emp-drawer-backdrop" onclick="closeEmployeeDrawer()"></div>
  <aside class="emp-drawer" id="emp-profile-drawer">
    <div class="drawer-resizer" id="emp-drawer-resizer" title="Drag edge to resize (Double-click to reset)"></div>
    <div class="emp-drawer-header">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div class="emp-avatar" id="drawer-emp-avatar" style="width: 40px; height: 40px; font-size: 0.9rem;">EM</div>
        <div>
          <h3 id="drawer-emp-name" style="margin: 0; font-size: 1rem;">Employee Profile</h3>
          <div id="drawer-emp-email" style="font-size: 0.75rem; color: var(--forge-text-muted); font-family: monospace;">email@forge.internal</div>
        </div>
      </div>
      <button class="astryx-modal-close" onclick="closeEmployeeDrawer()">&times;</button>
    </div>
    <div class="emp-drawer-tabs">
      <button class="emp-tab-btn active" id="tab-btn-emp-overview" onclick="switchDrawerTab('overview')">Overview</button>
      <button class="emp-tab-btn" id="tab-btn-emp-roles" onclick="switchDrawerTab('roles')">IAM & Access</button>
      <button class="emp-tab-btn" id="tab-btn-emp-chain" onclick="switchDrawerTab('chain')">Management Chain</button>
    </div>
    <div class="emp-drawer-body" id="emp-drawer-body">
      Loading profile details...
    </div>
  </aside>

  <!-- Modern Astryx Toast Overlay Viewport Container -->
  <div id="astryx-toast-container" class="astryx-toast-container" aria-live="polite" aria-atomic="true"></div>

  <!-- 24/7 High-Availability & Host Setup Guide Modal -->
  <div class="astryx-modal-backdrop" id="modal-247-guide" style="display: none;" onclick="if(event.target===this)close247GuideModal()">
    <div class="astryx-modal" style="max-width: 720px; max-height: 85vh; display: flex; flex-direction: column;">
      <div class="astryx-modal-header" style="flex-shrink: 0;">
        <h3 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.05rem;">
          <span>🛡️</span> 24/7 High-Availability & Host Auto-Start Setup Guide
        </h3>
        <button class="astryx-modal-close" onclick="close247GuideModal()">&times;</button>
      </div>
      
      <!-- OS Selector Tabs -->
      <div class="guide-tabs-nav">
        <button class="guide-tab-btn active" data-guide-tab="ubuntu" onclick="switch247GuideTab('ubuntu')">🐧 Ubuntu / Linux</button>
        <button class="guide-tab-btn" data-guide-tab="wsl" onclick="switch247GuideTab('wsl')">🪟 WSL2 (Windows)</button>
        <button class="guide-tab-btn" data-guide-tab="macos" onclick="switch247GuideTab('macos')">🍏 macOS</button>
        <button class="guide-tab-btn" data-guide-tab="windows" onclick="switch247GuideTab('windows')">💻 Windows Native</button>
      </div>

      <div class="astryx-modal-body" style="overflow-y: auto; padding: 0;">
        <!-- Pane 1: Ubuntu -->
        <div class="guide-tab-pane" id="guide-pane-ubuntu" style="display: block;">
          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">1. Enable Docker & Containerd on Host Boot</span>
            </div>
            <div class="guide-step-desc">Ensures the Docker engine automatically restarts when the server boots.</div>
            <div class="guide-code-box">
              <code>sudo systemctl enable docker.service containerd.service</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'sudo systemctl enable docker.service containerd.service')">Copy</button>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">2. Enable Zero-Downtime Live-Restore</span>
            </div>
            <div class="guide-step-desc">Keeps containers running even during Docker daemon restarts or upgrades.</div>
            <div class="guide-code-box">
              <code>echo '{"live-restore":true,"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json && sudo systemctl restart docker</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'echo \'{\"live-restore\":true,\"log-driver\":\"json-file\",\"log-opts\":{\"max-size\":\"10m\",\"max-file\":\"3\"}}\' | sudo tee /etc/docker/daemon.json && sudo systemctl restart docker')">Copy</button>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">3. Install ${loadBrandConfig().name} 24/7 Systemd Boot Service</span>
            </div>
            <div class="guide-step-desc">Registers the production compose stack as a managed system service.</div>
            <div class="guide-code-box">
              <code>sudo bash scripts/systemd/install-service.sh</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'sudo bash scripts/systemd/install-service.sh')">Copy</button>
            </div>
          </div>
        </div>

        <!-- Pane 2: WSL2 -->
        <div class="guide-tab-pane" id="guide-pane-wsl">
          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">1. Enable Systemd in WSL2</span>
            </div>
            <div class="guide-step-desc">Add systemd boot flag to <code>/etc/wsl.conf</code> so services initialize automatically:</div>
            <div class="guide-code-box">
              <code>echo -e "[boot]\nsystemd=true\n[automount]\noptions = \"metadata\"" | sudo tee /etc/wsl.conf</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'echo -e \"[boot]\\nsystemd=true\\n[automount]\\noptions = \\\"metadata\\\"\" | sudo tee /etc/wsl.conf')">Copy</button>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">2. Windows Background Startup (Headless 24/7)</span>
            </div>
            <div class="guide-step-desc">In Windows Task Scheduler, create a task on system startup that runs:</div>
            <div class="guide-code-box">
              <code>wsl.exe -d Ubuntu -u root -- systemctl start docker</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'wsl.exe -d Ubuntu -u root -- systemctl start docker')">Copy</button>
            </div>
          </div>
        </div>

        <!-- Pane 3: macOS -->
        <div class="guide-tab-pane" id="guide-pane-macos">
          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">1. Prevent Mac Sleep on Idle</span>
            </div>
            <div class="guide-step-desc">In macOS System Settings > Energy Saver, enable <strong>"Prevent automatic sleeping when display is off"</strong> and <strong>"Wake for network access"</strong>.</div>
          </div>

          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">2. Headless Colima / Launchd Setup (Recommended)</span>
            </div>
            <div class="guide-step-desc">Start Colima as a background service managed by macOS launchd:</div>
            <div class="guide-code-box">
              <code>brew install colima docker && brew services start colima</code>
              <button class="guide-copy-btn" onclick="copyGuideCode(this, 'brew install colima docker && brew services start colima')">Copy</button>
            </div>
          </div>
        </div>

        <!-- Pane 4: Windows Native -->
        <div class="guide-tab-pane" id="guide-pane-windows">
          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">1. Windows Power & Sleep Settings</span>
            </div>
            <div class="guide-step-desc">Open Windows Settings > Power & battery > Sleep: set <strong>"When plugged in, put my PC to sleep"</strong> to <strong>Never</strong>.</div>
          </div>

          <div class="guide-step-card">
            <div class="guide-step-header">
              <span class="guide-step-title">2. Docker Desktop Auto-Start Settings</span>
            </div>
            <div class="guide-step-desc">In Docker Desktop > Settings > General: Enable <strong>"Start Docker Desktop when you log in"</strong> and <strong>"Use WSL 2 based engine"</strong>.</div>
          </div>
        </div>
      </div>
      
      <div class="astryx-modal-footer" style="flex-shrink: 0; display: flex; justify-content: flex-end; padding: 0.75rem 1rem; border-top: 1px solid var(--forge-border);">
        <button class="astryx-btn btn-outline" onclick="close247GuideModal()">Close Guide</button>
      </div>
    </div>
  </div>
  `;
}

