/**
 * @forge/dev-dashboard - Employee Directory Table View Renderer (2026 LTS)
 * Astryx Glassmorphic Table with Sticky Headers, Fullscreen Canvas, and Zero Emojis.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderEmployeeTableSubTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderEmployeeTableSubTab(): string {
  return `
    <!-- TAB 2: Employee Directory Table (Astryx Enterprise Standard) -->
    <div id="emp-subtab-table" class="emp-subtab-pane" style="display: none;">
      <!-- Table Shell & Fullscreen Wrapper -->
      <div id="emp-table-container" class="emp-table-container">
        <!-- Fullscreen HUD Banner (Only visible in Fullscreen Canvas mode) -->
        <div id="emp-fullscreen-hud" class="emp-fullscreen-hud" style="display: none;">
          <div class="emp-fullscreen-hud-info">
            <span class="emp-fullscreen-hud-dot"></span>
            <span class="emp-fullscreen-hud-title">Full Canvas Active</span>
            <span class="emp-fullscreen-hud-hint">Press <kbd>ESC</kbd> or click button to exit</span>
          </div>
          <button type="button" class="astryx-btn btn-outline emp-fullscreen-hud-btn" onclick="toggleEmployeeTableFullscreen(false)">
            <span class="emp-btn-icon">${astryxIcons.minimize}</span>
            <span>Exit Fullscreen</span>
          </button>
        </div>

        <!-- Directory Toolbar -->
        <div class="emp-table-toolbar">
          <div class="emp-toolbar-left">
            <div class="services-search-box emp-search-box">
              <span class="emp-search-icon">${astryxIcons.search}</span>
              <input type="search" id="emp-search-input" placeholder="Search by name, email, code, title... (⌘K)" oninput="filterEmployees()">
              <button type="button" id="emp-search-clear" class="emp-search-clear-btn" onclick="clearEmployeeSearch()" title="Clear Search" style="display: none;">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <select class="form-input emp-dept-select" id="emp-dept-filter" onchange="filterEmployees()">
              <option value="">All Departments</option>
            </select>
            <div class="filter-chip-group emp-status-chips" id="emp-filter-chips">
              <button class="filter-chip active" data-filter="all" onclick="setEmployeeStatusFilter('all')">All</button>
              <button class="filter-chip" data-filter="ACTIVE" onclick="setEmployeeStatusFilter('ACTIVE')">
                <span class="status-pulse-dot active"></span> Active
              </button>
              <button class="filter-chip" data-filter="INVITED" onclick="setEmployeeStatusFilter('INVITED')">
                <span class="status-pulse-dot invited"></span> Invited
              </button>
              <button class="filter-chip" data-filter="SUSPENDED" onclick="setEmployeeStatusFilter('SUSPENDED')">
                <span class="status-pulse-dot suspended"></span> Suspended
              </button>
            </div>
          </div>

          <div class="emp-toolbar-right">
            <div class="emp-toolbar-metrics" id="emp-table-quick-metrics">
              <span class="emp-metric-pill" id="emp-metric-pill-total">0 Members</span>
            </div>
            <button type="button" class="astryx-btn btn-outline" id="btn-emp-table-refresh" onclick="refreshEmployeeDirectory()" title="Refresh Roster">
              <span class="emp-btn-icon">${astryxIcons.refresh}</span>
            </button>
            <button type="button" class="astryx-btn btn-outline emp-btn-fullscreen-toggle" id="btn-emp-fullscreen" onclick="toggleEmployeeTableFullscreen()" title="Toggle Full Canvas (Esc to exit)">
              <span class="emp-btn-icon" id="emp-fullscreen-btn-icon">${astryxIcons.maximize}</span>
              <span id="emp-fullscreen-btn-label">Full Screen</span>
            </button>
            <button type="button" class="astryx-btn btn-primary" onclick="openAddEmployeeModal()">
              <span class="emp-btn-icon">${astryxIcons.plus}</span>
              <span>Add Member</span>
            </button>
          </div>
        </div>

        <!-- Glassmorphic Data Table Card -->
        <div class="emp-table-card">
          <div class="emp-table-scroll-wrap">
            <table class="emp-modern-table" id="emp-main-table">
              <colgroup>
                <col style="width: 38px;">
                <col style="width: 26%;">
                <col style="width: 18%;">
                <col style="width: 20%;">
                <col style="width: 16%;">
                <col style="width: 100px;">
                <col style="width: 80px;">
                <col style="width: 110px;">
              </colgroup>
              <thead>
                <tr>
                  <th style="text-align: center;">
                    <input type="checkbox" id="emp-select-all" class="emp-checkbox" onchange="toggleSelectAllEmployees(this.checked)" title="Select All On Page">
                  </th>
                  <th class="emp-sortable-th" onclick="sortEmployeesBy('name')" title="Sort by Name">
                    <div class="emp-th-inner">
                      <span>Employee Name & Email</span>
                      <span class="emp-sort-indicator" id="emp-sort-name-indicator">${astryxIcons.arrowUpDown}</span>
                    </div>
                  </th>
                  <th class="emp-sortable-th" onclick="sortEmployeesBy('department')" title="Sort by Department">
                    <div class="emp-th-inner">
                      <span>Department / Hierarchy</span>
                      <span class="emp-sort-indicator" id="emp-sort-dept-indicator">${astryxIcons.arrowUpDown}</span>
                    </div>
                  </th>
                  <th class="emp-sortable-th" onclick="sortEmployeesBy('title')" title="Sort by Job Title">
                    <div class="emp-th-inner">
                      <span>Job Title & Code</span>
                      <span class="emp-sort-indicator" id="emp-sort-title-indicator">${astryxIcons.arrowUpDown}</span>
                    </div>
                  </th>
                  <th>Line Manager</th>
                  <th>IAM Roles</th>
                  <th class="emp-sortable-th" onclick="sortEmployeesBy('status')" title="Sort by Status">
                    <div class="emp-th-inner">
                      <span>Status</span>
                      <span class="emp-sort-indicator" id="emp-sort-status-indicator">${astryxIcons.arrowUpDown}</span>
                    </div>
                  </th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="employees-tbody">
                <tr>
                  <td colspan="8" class="emp-table-loading-cell">
                    <div class="emp-table-loading-spinner"></div>
                    <div class="emp-table-loading-text">Loading employee directory...</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Multipage Pagination & Telemetry Footer -->
          <div class="emp-table-footer">
            <div class="emp-footer-left">
              <span class="emp-footer-metrics" id="emp-footer-metrics">Showing 0 of 0 members</span>
              <span class="emp-footer-selection" id="emp-footer-selection" style="display: none;">
                <span class="emp-selection-dot"></span>
                <span id="emp-footer-selected-count">0</span> selected
              </span>
            </div>

            <!-- Interactive Multipage Navigation -->
            <div class="emp-footer-center">
              <div class="emp-multipage-nav" id="emp-pagination-controls">
                <button type="button" class="emp-nav-page-btn" id="btn-emp-first" onclick="jumpToEmployeePage(1)" title="First Page" disabled>
                  ${astryxIcons.chevronsLeft}
                </button>
                <button type="button" class="emp-nav-page-btn" id="btn-emp-prev" onclick="changeEmployeePage(-1)" title="Previous Page" disabled>
                  ${astryxIcons.chevronLeft}
                </button>
                <div class="emp-page-pills" id="emp-page-pills">
                  <!-- Dynamic page pills populated by script -->
                </div>
                <button type="button" class="emp-nav-page-btn" id="btn-emp-next" onclick="changeEmployeePage(1)" title="Next Page" disabled>
                  ${astryxIcons.chevronRight}
                </button>
                <button type="button" class="emp-nav-page-btn" id="btn-emp-last" onclick="jumpToEmployeeLastPage()" title="Last Page" disabled>
                  ${astryxIcons.chevronsRight}
                </button>
              </div>
            </div>

            <div class="emp-footer-right">
              <label for="emp-page-limit" class="emp-page-limit-label">Rows per page:</label>
              <select id="emp-page-limit" class="form-input emp-page-limit-select" onchange="changeEmployeePageLimit(this.value)">
                <option value="10">10</option>
                <option value="25" selected>25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Keyboard Shortcuts Bar -->
        <div class="emp-table-keyboard-hints">
          <span><kbd>⌘K</kbd> Search</span>
          <span><kbd>/</kbd> Focus Filter</span>
          <span><kbd>Esc</kbd> Exit Fullscreen / Drawers</span>
          <span><kbd>F</kbd> Toggle Full Canvas</span>
        </div>
      </div>
    </div>
  `;
}
