/**
 * @forge/dev-dashboard - Employee Directory & Org Chart Tab Renderer (2026 LTS)
 * Astryx Glassmorphic Layout & Component Structure.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderEmployeesTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderEmployeesTab(): string {
  return `
    <!-- Tab: Employees & Org Studio -->
    <section id="tab-employees" class="tab-pane">
      <!-- Studio Header Card -->
      <div class="astryx-card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.2rem; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
              <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.users}</span> Organization Command & Directory Studio
            </h2>
            <p style="color: var(--forge-text-muted); font-size: 0.82rem;">Manage organization members, explore visual reporting hierarchy, configure IAM roles, and bulk import/export datasets.</p>
          </div>
          <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
            <button class="astryx-btn btn-primary" onclick="openAddEmployeeModal()">
              ${astryxIcons.plus} Add Member
            </button>
          </div>
        </div>

        <!-- Horizontal 3-Tab Segmented Slider Navigation -->
        <div class="emp-subtab-slider-wrap">
          <div class="emp-subtab-bar" role="tablist" aria-label="Organization Studio Sections">
            <button class="emp-subtab-btn active" id="btn-subtab-emp-overview" role="tab" aria-selected="true" onclick="switchEmployeeSubTab('overview')">
              <span class="emp-subtab-icon">${astryxIcons.topology}</span>
              <span>Overview & Data Hub</span>
            </button>
            <button class="emp-subtab-btn" id="btn-subtab-emp-table" role="tab" aria-selected="false" onclick="switchEmployeeSubTab('table')">
              <span class="emp-subtab-icon">${astryxIcons.table}</span>
              <span>Employee Directory</span>
              <span class="emp-tab-badge" id="emp-tab-badge-count">0</span>
            </button>
            <button class="emp-subtab-btn" id="btn-subtab-emp-tree" role="tab" aria-selected="false" onclick="switchEmployeeSubTab('tree')">
              <span class="emp-subtab-icon">${astryxIcons.gitTree}</span>
              <span>Org Structure & Chart</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: Overview, Import & Export Hub -->
      <!-- ========================================================================= -->
      <div id="emp-subtab-overview" class="emp-subtab-pane active">
        <!-- Vitals Statistics Grid -->
        <div class="emp-stats-grid" style="margin-top: 0; margin-bottom: 1rem;">
          <div class="emp-stat-card"><div class="emp-stat-icon" style="color: var(--forge-text-muted);">${astryxIcons.users}</div><div class="emp-stat-info"><span class="emp-stat-val" id="emp-stat-total">0</span><span class="emp-stat-lbl">Total Members</span></div></div>
          <div class="emp-stat-card"><div class="emp-stat-icon"><span class="status-pulse-dot active"></span></div><div class="emp-stat-info"><span class="emp-stat-val" style="color: var(--forge-success);" id="emp-stat-active">0</span><span class="emp-stat-lbl">Active Accounts</span></div></div>
          <div class="emp-stat-card"><div class="emp-stat-icon"><span class="status-pulse-dot suspended"></span></div><div class="emp-stat-info"><span class="emp-stat-val" style="color: var(--forge-accent);" id="emp-stat-suspended">0</span><span class="emp-stat-lbl">Suspended</span></div></div>
          <div class="emp-stat-card"><div class="emp-stat-icon" style="color: var(--forge-text-muted);">${astryxIcons.building}</div><div class="emp-stat-info"><span class="emp-stat-val" id="emp-stat-depts">0</span><span class="emp-stat-lbl">Departments</span></div></div>
        </div>

        <!-- 2-Column Responsive Data Hub Grid (Import Hub + Export & Insights) -->
        <div class="emp-overview-grid">
          <!-- Left Column: Bulk Import & Onboarding Hub -->
          <div class="astryx-card emp-hub-card">
            <div class="emp-hub-header">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.upload}</span>
                <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700;">Bulk Import & Data Onboarding</h3>
              </div>
              <span class="astryx-badge">CSV / JSON</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 1rem 0;">
              Ingest enterprise org rosters with automated department hierarchy generation, role mapping, and duplicate resolution.
            </p>

            <div class="import-dropzone" style="padding: 1.75rem 1rem;" ondragover="this.classList.add('dragover'); event.preventDefault();" ondragleave="this.classList.remove('dragover');" ondrop="this.classList.remove('dragover'); handleFileDrop(event);">
              <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">📁</div>
              <h4 style="margin: 0 0 0.2rem 0; font-size: 0.88rem;">Drag & Drop Roster File Here</h4>
              <p style="font-size: 0.74rem; color: var(--forge-text-muted); margin: 0 0 0.85rem 0;">Supports .csv and .json formats up to 5,000 records</p>
              <div style="display: inline-flex; gap: 0.5rem;">
                <button type="button" class="astryx-btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.78rem;" onclick="document.getElementById('import-file-input').click()">
                  ${astryxIcons.upload} Browse Files
                </button>
                <button type="button" class="astryx-btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.78rem;" onclick="openImportWizard()">
                  Full Wizard &rarr;
                </button>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--forge-border); flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.73rem; color: var(--forge-text-muted);">Required: <code>display_name</code>, <code>email</code></span>
              <button type="button" class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.22rem 0.55rem;" onclick="downloadSampleCsvTemplate()">
                ${astryxIcons.download} Download Sample CSV
              </button>
            </div>
          </div>

          <!-- Right Column: Export Studio & Organization Breakdown -->
          <div class="astryx-card emp-hub-card">
            <div class="emp-hub-header">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--forge-accent); display: flex; align-items: center;">${astryxIcons.download}</span>
                <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700;">Enterprise Export Studio</h3>
              </div>
              <span class="astryx-badge" style="color: var(--forge-accent);">Live Data</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 1rem 0;">
              Export full directory or filtered organization slices in standard RFC 4180 CSV or structured JSON format.
            </p>

            <div class="emp-export-box">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.85rem;">
                <div>
                  <label style="font-size: 0.72rem; color: var(--forge-text-muted); display: block; margin-bottom: 0.25rem;">Format</label>
                  <select class="form-input" id="emp-quick-export-format" style="width: 100%; font-size: 0.75rem; padding: 0.35rem 0.5rem;">
                    <option value="csv">CSV (Comma Delimited)</option>
                    <option value="json">JSON (Structured Hierarchy)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.72rem; color: var(--forge-text-muted); display: block; margin-bottom: 0.25rem;">Status Filter</label>
                  <select class="form-input" id="emp-quick-export-status" style="width: 100%; font-size: 0.75rem; padding: 0.35rem 0.5rem;">
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INVITED">Invited Only</option>
                    <option value="SUSPENDED">Suspended Only</option>
                  </select>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="astryx-btn btn-primary" style="flex: 1; justify-content: center; padding: 0.35rem 0.8rem; font-size: 0.78rem;" onclick="triggerQuickExport()">
                  ${astryxIcons.download} Export Organization Data
                </button>
              </div>
            </div>

            <!-- Department Distribution Breakdown -->
            <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--forge-border);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--forge-text-muted);">Department Distribution</span>
                <span style="font-size: 0.72rem; color: var(--forge-primary); cursor: pointer;" onclick="switchEmployeeSubTab('table')">View Table &rarr;</span>
              </div>
              <div class="emp-dept-pill-list" id="emp-overview-dept-list">
                <span style="font-size: 0.74rem; color: var(--forge-text-muted); font-style: italic;">Loading department metrics...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: Employee Directory Table -->
      <!-- ========================================================================= -->
      <div id="emp-subtab-table" class="emp-subtab-pane" style="display: none;">
        <div class="services-toolbar">
          <div class="services-search-box">
            <span style="display: flex; align-items: center; color: var(--forge-text-muted);">${astryxIcons.search}</span>
            <input type="search" id="emp-search-input" placeholder="Search by name, email, code, title... (⌘K)" oninput="filterEmployees()">
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <select class="form-input" id="emp-dept-filter" style="max-width: 220px;" onchange="filterEmployees()">
              <option value="">All Departments</option>
            </select>
            <div class="filter-chip-group" id="emp-filter-chips">
              <button class="filter-chip active" data-filter="all" onclick="setEmployeeStatusFilter('all')">All</button>
              <button class="filter-chip" data-filter="ACTIVE" onclick="setEmployeeStatusFilter('ACTIVE')"><span class="status-pulse-dot active" style="margin-right: 3px;"></span> Active</button>
              <button class="filter-chip" data-filter="INVITED" onclick="setEmployeeStatusFilter('INVITED')"><span class="status-pulse-dot invited" style="margin-right: 3px;"></span> Invited</button>
              <button class="filter-chip" data-filter="SUSPENDED" onclick="setEmployeeStatusFilter('SUSPENDED')"><span class="status-pulse-dot suspended" style="margin-right: 3px;"></span> Suspended</button>
            </div>
          </div>
        </div>

        <div class="astryx-card" style="padding: 0; overflow: hidden;">
          <div class="astryx-table-wrap">
            <table class="data-table" style="margin-top: 0;">
              <thead>
                <tr>
                  <th style="width: 32px;"><input type="checkbox" id="emp-select-all" onchange="toggleSelectAllEmployees(this.checked)"></th>
                  <th style="cursor: pointer;" onclick="sortEmployeesBy('name')">Employee Name & Email ↕</th>
                  <th style="cursor: pointer;" onclick="sortEmployeesBy('department')">Department / Path ↕</th>
                  <th>Job Title & Code</th>
                  <th>Line Manager</th>
                  <th>IAM Roles</th>
                  <th style="width: 105px;">Status</th>
                  <th style="width: 130px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="employees-tbody">
                <tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);">Loading employee directory...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Integrated Enterprise Table Footer -->
          <div class="emp-table-footer">
            <div class="emp-footer-metrics" id="emp-footer-metrics">Showing 0 of 0 members</div>
            <div class="emp-footer-center">
              <span style="font-size: 0.74rem; color: var(--forge-text-muted);">Rows per page:</span>
              <select id="emp-page-limit" class="form-input" style="width: auto;" onchange="changeEmployeePageLimit(this.value)">
                <option value="10">10</option>
                <option value="25" selected>25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div class="emp-footer-pagination" id="emp-pagination-controls">
              <button class="astryx-btn btn-outline" id="btn-emp-prev" style="height: 26px; padding: 0 0.6rem; font-size: 0.74rem;" onclick="changeEmployeePage(-1)" disabled>&larr; Prev</button>
              <span id="emp-page-indicator" style="font-size: 0.75rem; font-weight: 600; color: var(--forge-text-main); min-width: 65px; text-align: center;">Page 1 of 1</span>
              <button class="astryx-btn btn-outline" id="btn-emp-next" style="height: 26px; padding: 0 0.6rem; font-size: 0.74rem;" onclick="changeEmployeePage(1)" disabled>Next &rarr;</button>
            </div>
          </div>
        </div>

        <div class="emp-table-keyboard-hints">
          <span><kbd>⌘K</kbd> Command Palette</span>
          <span><kbd>/</kbd> Filter Directory</span>
          <span><kbd>Space</kbd> Check/Uncheck</span>
          <span><kbd>Esc</kbd> Dismiss Drawers</span>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 3: Visual Org Chart & Structure (Astryx Endless Canvas) -->
      <!-- ========================================================================= -->
      <div id="emp-subtab-tree" class="emp-subtab-pane" style="display: none;">
        <div id="org-chart-container">Loading interactive organizational chart...</div>
      </div>

      <!-- Floating Batch Actions Bar -->
      <div id="emp-batch-bar" class="emp-batch-bar" role="toolbar" aria-label="Batch Actions Toolbar">
        <span class="emp-batch-label"><span class="status-pulse-dot active"></span> <span id="batch-selected-count">0</span> Selected</span>
        <div class="emp-batch-actions-group">
          <button class="astryx-btn btn-outline emp-batch-btn" onclick="executeBatchAction('revoke')">${astryxIcons.shield} Revoke Sessions</button>
          <button class="astryx-btn btn-outline emp-batch-btn" onclick="executeBatchAction('suspend')">${astryxIcons.pause} Suspend</button>
          <button class="astryx-btn btn-primary emp-batch-btn" onclick="executeBatchAction('activate')">${astryxIcons.check} Activate</button>
          <button class="emp-batch-close-btn" title="Cancel selection (Esc)" onclick="clearBatchSelection()">&times;</button>
        </div>
      </div>
    </section>
  `;
}
