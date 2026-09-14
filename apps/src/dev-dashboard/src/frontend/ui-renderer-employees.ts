/**
 * @forge/dev-dashboard - Employee Directory & Org Chart Tab Renderer (2026 LTS)
 * Astryx Glassmorphic Layout & Component Structure.
 */

import { astryxIcons } from '@forge/ui';
import { renderEmployeeTableSubTab } from './ui-employee-table';

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
            <button class="astryx-btn btn-outline" onclick="openAddDepartmentModal()">
              ${astryxIcons.building} Add Department
            </button>
            <button class="astryx-btn btn-outline" onclick="openOrgSettingsModal('identity')">
              ${astryxIcons.settings} Org Settings
            </button>
            <button class="astryx-btn btn-primary" onclick="openAddEmployeeModal()">
              ${astryxIcons.plus} Add Member
            </button>
          </div>
        </div>

        <!-- Horizontal 4-Tab Segmented Slider Navigation -->
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
            <button class="emp-subtab-btn" id="btn-subtab-emp-setup" role="tab" aria-selected="false" onclick="switchEmployeeSubTab('setup')">
              <span class="emp-subtab-icon">${astryxIcons.settings}</span>
              <span>Organization Setup & Hierarchy</span>
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
              <div style="font-size: 1.8rem; margin-bottom: 0.35rem; color: var(--forge-primary); display: flex; justify-content: center;">${astryxIcons.upload}</div>
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

      ${renderEmployeeTableSubTab()}

      <!-- ========================================================================= -->
      <!-- TAB 3: Visual Org Chart & Structure (Astryx Endless Canvas) -->
      <!-- ========================================================================= -->
      <div id="emp-subtab-tree" class="emp-subtab-pane" style="display: none;">
        <div id="org-chart-container">Loading interactive organizational chart...</div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 4: Organization Setup & Hierarchy (Profile, Levels, Units, EID) -->
      <!-- ========================================================================= -->
      <div id="emp-subtab-setup" class="emp-subtab-pane" style="display: none;">
        <!-- Top Row: 2-Column Identity & EID Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <!-- Card 1: Org Profile & Corporate Brand Identity -->
          <div class="astryx-card emp-hub-card">
            <div class="emp-hub-header">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.building}</span>
                <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700;">Corporate Identity & Domain</h3>
              </div>
              <button type="button" class="astryx-btn btn-outline" style="padding: 0.22rem 0.55rem; font-size: 0.72rem;" onclick="openOrgSettingsModal('identity')">
                ${astryxIcons.edit} Edit Identity
              </button>
            </div>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 1rem 0;">
              Legal enterprise details, root domain routing, and brand tags across platform applications.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Legal Entity:</span>
                <span style="font-weight: 600;" id="org-card-name">Loading...</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Primary Domain:</span>
                <code style="font-size: 0.75rem; color: var(--forge-primary);" id="org-card-domain">loading...</code>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Brand Identity:</span>
                <span id="org-card-brand">Loading...</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Default Timezone:</span>
                <span id="org-card-timezone">UTC</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--forge-text-muted);">Corporate Contact:</span>
                <span id="org-card-email" style="font-family: monospace; font-size: 0.75rem;">—</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Sequential EID Generator Studio -->
          <div class="astryx-card emp-hub-card">
            <div class="emp-hub-header">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: var(--forge-accent); display: flex; align-items: center;">${astryxIcons.hash}</span>
                <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700;">Employee ID (EID) Generator Studio</h3>
              </div>
              <button type="button" class="astryx-btn btn-outline" style="padding: 0.22rem 0.55rem; font-size: 0.72rem;" onclick="openOrgSettingsModal('eid')">
                ${astryxIcons.settings} Configure Rules
              </button>
            </div>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 1rem 0;">
              Deterministic sequence formatting for automated employee and contractor identifier assignment.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Configured Prefix:</span>
                <span class="astryx-badge" style="font-weight: 700; font-family: monospace;" id="org-eid-prefix-val">EMP</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Zero-Padding Length:</span>
                <span id="org-eid-padding-val">4 Digits</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.4rem;">
                <span style="color: var(--forge-text-muted);">Current Sequence Counter:</span>
                <span style="font-weight: 600;" id="org-eid-counter-val">0</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--forge-bg-card); padding: 0.5rem 0.75rem; border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); margin-top: 0.25rem;">
                <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Next Generated EID:</span>
                <span class="astryx-badge" style="font-size: 0.95rem; font-family: monospace; font-weight: 700; color: var(--forge-primary); border-color: var(--forge-primary);" id="org-eid-sample-val">EMP-0001</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hierarchy Level Tiers Studio -->
        <div class="astryx-card" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700; display: flex; align-items: center; gap: 0.45rem;">
                <span style="color: var(--forge-primary);">${astryxIcons.layers}</span> Hierarchy Level Tiers Studio
              </h3>
              <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0.2rem 0 0 0;">
                Define custom structural ranks (e.g. Division &rarr; Department &rarr; Squad). Units adhere to these rank constraints.
              </p>
            </div>
            <button type="button" class="astryx-btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.78rem;" onclick="openAddLevelModal()">
              ${astryxIcons.plus} Add Level Tier
            </button>
          </div>

          <div class="astryx-table-wrap">
            <table class="data-table" style="margin-top: 0; font-size: 0.78rem;">
              <thead>
                <tr>
                  <th style="width: 110px;">Rank Order</th>
                  <th>Level Tier Name</th>
                  <th>Description</th>
                  <th style="width: 140px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="org-levels-tbody">
                <tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--forge-text-muted);">Loading hierarchy tiers...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Department & Structural Units Tree Manager -->
        <div class="astryx-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="margin: 0; font-size: 0.98rem; font-weight: 700; display: flex; align-items: center; gap: 0.45rem;">
                <span style="color: var(--forge-primary);">${astryxIcons.building}</span> Department & Structural Units Manager
              </h3>
              <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0.2rem 0 0 0;">
                Manage organizational nodes, parent-child lineages, department codes, and unit member allocations.
              </p>
            </div>
            <button type="button" class="astryx-btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.78rem;" onclick="openAddDepartmentModal()">
              ${astryxIcons.plus} Add Department / Unit
            </button>
          </div>

          <div id="org-departments-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="text-align: center; padding: 2rem; color: var(--forge-text-muted);">Loading structural units...</div>
          </div>
        </div>
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
