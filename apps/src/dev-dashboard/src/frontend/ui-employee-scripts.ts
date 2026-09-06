import { getEmployeeImportScripts } from './ui-employee-import-scripts';
import { getEmployeeDrawerAndTreeScripts } from './ui-employee-drawer-scripts';
import { getEmployeeModalScripts } from './ui-employee-modal-scripts';

/**
 * getEmployeeDashboardScripts
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getEmployeeDashboardScripts(): string {
  return `
    const EMP_STATE_KEY = 'forge:v1:devcenter:emp_state';
    let employeeData = { items: [], total: 0, departments: [] };
    let currentEmployeeFilter = { search: '', departmentId: '', status: '' };
    let currentEmployeeSubTab = 'overview';
    let selectedEmployeeIds = new Set();
    let sortDirection = { name: 1, department: 1 };
    let activeDrawerEmployee = null;
    let employeeCurrentPage = 1;
    let employeePageLimit = 25;
    let isEmpStateInitialized = false;

    function getSavedEmployeeState() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const subtab = urlParams.get('emp_subtab') || urlParams.get('subtab');
        const search = urlParams.get('emp_search') || urlParams.get('search');
        const departmentId = urlParams.get('emp_dept') || urlParams.get('dept');
        const status = urlParams.get('emp_status') || urlParams.get('status');
        const focus = urlParams.get('emp_focus') || urlParams.get('focus');
        const pageStr = urlParams.get('emp_page') || urlParams.get('page');
        const limitStr = urlParams.get('emp_limit') || urlParams.get('limit');

        if (!subtab && search === null && !departmentId && !status && !focus && !pageStr) {
          const raw = localStorage.getItem(EMP_STATE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            const d = (parsed && typeof parsed === 'object' && parsed.data) ? parsed.data : parsed;
            if (d && typeof d === 'object') {
              return {
                subtab: d.subtab || 'overview',
                search: d.search || '',
                departmentId: d.departmentId || '',
                status: d.status || '',
                focus: d.focus || null,
                page: parseInt(d.page || 1, 10),
                limit: parseInt(d.limit || 25, 10),
              };
            }
          }
        }

        return {
          subtab: subtab || 'overview',
          search: search || '',
          departmentId: departmentId || '',
          status: status || '',
          focus: focus || null,
          page: parseInt(pageStr || '1', 10),
          limit: parseInt(limitStr || '25', 10),
        };
      } catch {
        return { subtab: 'overview', search: '', departmentId: '', status: '', focus: null, page: 1, limit: 25 };
      }
    }

    function persistEmployeeState() {
      try {
        const state = {
          subtab: currentEmployeeSubTab,
          search: currentEmployeeFilter.search,
          departmentId: currentEmployeeFilter.departmentId,
          status: currentEmployeeFilter.status,
          focus: focusedEmployeeId,
          page: employeeCurrentPage,
          limit: employeePageLimit,
        };

        const env = { version: 1, updatedAt: new Date().toISOString(), data: state };
        localStorage.setItem(EMP_STATE_KEY, JSON.stringify(env));

        const url = new URL(window.location.href);
        if (state.subtab && state.subtab !== 'overview') url.searchParams.set('emp_subtab', state.subtab);
        else url.searchParams.delete('emp_subtab');

        if (state.search) url.searchParams.set('emp_search', state.search);
        else url.searchParams.delete('emp_search');

        if (state.departmentId) url.searchParams.set('emp_dept', state.departmentId);
        else url.searchParams.delete('emp_dept');

        if (state.status) url.searchParams.set('emp_status', state.status);
        else url.searchParams.delete('emp_status');

        if (state.focus) url.searchParams.set('emp_focus', state.focus);
        else url.searchParams.delete('emp_focus');

        if (state.page > 1) url.searchParams.set('emp_page', state.page.toString());
        else url.searchParams.delete('emp_page');

        if (state.limit !== 25) url.searchParams.set('emp_limit', state.limit.toString());
        else url.searchParams.delete('emp_limit');

        window.history.replaceState(null, '', url.toString());
      } catch {}
    }

    function initEmployeeState() {
      const saved = getSavedEmployeeState();
      currentEmployeeSubTab = saved.subtab;
      currentEmployeeFilter.search = saved.search;
      currentEmployeeFilter.departmentId = saved.departmentId;
      currentEmployeeFilter.status = saved.status;
      focusedEmployeeId = saved.focus;
      employeeCurrentPage = saved.page;
      employeePageLimit = saved.limit;

      const searchInput = document.getElementById('emp-search-input');
      if (searchInput && saved.search) searchInput.value = saved.search;

      const deptFilter = document.getElementById('emp-dept-filter');
      if (deptFilter && saved.departmentId) deptFilter.value = saved.departmentId;

      const pageLimitSelect = document.getElementById('emp-page-limit');
      if (pageLimitSelect && saved.limit) pageLimitSelect.value = saved.limit.toString();

      setEmployeeStatusFilter(saved.status || 'all', false);
      switchEmployeeSubTab(currentEmployeeSubTab, false);
      isEmpStateInitialized = true;
    }

    async function loadEmployees() {
      const tbody = document.getElementById('employees-tbody');
      if (!tbody) return;

      if (!isEmpStateInitialized) {
        initEmployeeState();
      }

      const params = new URLSearchParams();
      if (currentEmployeeFilter.search) params.set('search', currentEmployeeFilter.search);
      if (currentEmployeeFilter.departmentId) params.set('departmentId', currentEmployeeFilter.departmentId);
      if (currentEmployeeFilter.status) params.set('status', currentEmployeeFilter.status);

      try {
        const res = await fetch(\`\${apiBase}/api/employees?\${params.toString()}\`);
        const json = await res.json();
        if (json.status !== 'ok') throw new Error(json.error || 'Failed to fetch employees');

        employeeData = json;
        renderEmployeeVitals();
        renderDepartmentDropdown();
        if (currentEmployeeSubTab === 'table') renderEmployeeTable();
        else if (currentEmployeeSubTab === 'tree') loadOrgChartTree();
      } catch (err) {
        if (typeof showAstryxToast === 'function') {
          showAstryxToast('error', 'Error loading employees: ' + err.message);
        }
      }
    }

    function renderEmployeeVitals() {
      const totalEl = document.getElementById('emp-stat-total');
      const activeEl = document.getElementById('emp-stat-active');
      const suspendedEl = document.getElementById('emp-stat-suspended');
      const deptsEl = document.getElementById('emp-stat-depts');
      const badgeCountEl = document.getElementById('emp-tab-badge-count');

      const items = employeeData.items || [];
      const activeCount = items.filter(i => i.status === 'ACTIVE').length;
      const suspendedCount = items.filter(i => i.status === 'SUSPENDED').length;
      const totalCount = employeeData.total || items.length;

      if (totalEl) totalEl.textContent = totalCount;
      if (activeEl) activeEl.textContent = activeCount;
      if (suspendedEl) suspendedEl.textContent = suspendedCount;
      if (deptsEl) deptsEl.textContent = employeeData.departments ? employeeData.departments.length : 0;
      if (badgeCountEl) badgeCountEl.textContent = totalCount;

      // Render Department Breakdown Pills in Overview Hub
      const deptListEl = document.getElementById('emp-overview-dept-list');
      if (deptListEl && employeeData.departments) {
        if (employeeData.departments.length === 0) {
          deptListEl.innerHTML = '<span style="font-size: 0.74rem; color: var(--forge-text-muted);">No departments configured.</span>';
        } else {
          deptListEl.innerHTML = employeeData.departments.map(d => {
            const count = items.filter(i => i.org_node_id === d.id || i.department_name === d.name).length;
            return '<div class="emp-dept-chip" onclick="filterByDepartment(\\'' + d.id + '\\')" title="Filter table by ' + (d.name || '') + '">' +
              '<span>🏢 ' + (d.name || 'Unnamed') + '</span>' +
              '<span class="emp-dept-chip-count">' + count + '</span>' +
            '</div>';
          }).join('');
        }
      }
    }

    function filterByDepartment(deptId) {
      const select = document.getElementById('emp-dept-filter');
      if (select) select.value = deptId;
      currentEmployeeFilter.departmentId = deptId;
      employeeCurrentPage = 1;
      persistEmployeeState();
      switchEmployeeSubTab('table');
      loadEmployees();
    }

    function triggerQuickExport() {
      const formatSelect = document.getElementById('emp-quick-export-format');
      const statusSelect = document.getElementById('emp-quick-export-status');
      const format = formatSelect ? formatSelect.value : 'csv';
      const status = statusSelect ? statusSelect.value : '';
      exportEmployees(format, status);
    }

    function renderDepartmentDropdown() {
      const select = document.getElementById('emp-dept-filter');
      const modalSelect = document.getElementById('emp-form-dept');
      if (!select || !employeeData.departments) return;

      const currentVal = currentEmployeeFilter.departmentId || select.value;
      let opts = '<option value="">All Departments</option>';
      let modalOpts = '<option value="">(No Department Assigned)</option>';

      for (const d of employeeData.departments) {
        const selected = d.id === currentVal ? 'selected' : '';
        opts += '<option value="' + d.id + '" ' + selected + '>' + d.name + '</option>';
        modalOpts += '<option value="' + d.id + '">' + d.name + '</option>';
      }
      select.innerHTML = opts;
      if (modalSelect) modalSelect.innerHTML = modalOpts;
    }

    function switchEmployeeSubTab(tabName, updateState = true) {
      currentEmployeeSubTab = tabName;
      ['overview', 'table', 'tree'].forEach(t => {
        const btn = document.getElementById('btn-subtab-emp-' + t);
        const pane = document.getElementById('emp-subtab-' + t);
        if (btn) {
          btn.classList.toggle('active', t === tabName);
          btn.setAttribute('aria-selected', t === tabName ? 'true' : 'false');
        }
        if (pane) {
          pane.style.display = t === tabName ? 'block' : 'none';
          pane.classList.toggle('active', t === tabName);
        }
      });

      if (updateState) persistEmployeeState();

      if (tabName === 'overview') renderEmployeeVitals();
      else if (tabName === 'table') renderEmployeeTable();
      else if (tabName === 'tree') loadOrgChartTree();
    }

    function setEmployeeViewMode(mode) {
      switchEmployeeSubTab(mode === 'table' ? 'table' : 'tree');
    }

    function renderEmployeeTable() {
      const tbody = document.getElementById('employees-tbody');
      if (!tbody) return;

      const items = employeeData.items || [];
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / employeePageLimit));
      if (employeeCurrentPage > totalPages) employeeCurrentPage = totalPages;
      if (employeeCurrentPage < 1) employeeCurrentPage = 1;

      const startIndex = (employeeCurrentPage - 1) * employeePageLimit;
      const paginatedItems = items.slice(startIndex, startIndex + employeePageLimit);

      const metricsEl = document.getElementById('emp-footer-metrics');
      const pageIndicator = document.getElementById('emp-page-indicator');
      const prevBtn = document.getElementById('btn-emp-prev');
      const nextBtn = document.getElementById('btn-emp-next');

      if (metricsEl) {
        if (total === 0) metricsEl.textContent = 'Showing 0 of 0 members';
        else metricsEl.textContent = 'Showing ' + (startIndex + 1) + '–' + Math.min(startIndex + paginatedItems.length, total) + ' of ' + total + ' members';
      }
      if (pageIndicator) pageIndicator.textContent = 'Page ' + employeeCurrentPage + ' of ' + totalPages;
      if (prevBtn) prevBtn.disabled = (employeeCurrentPage <= 1);
      if (nextBtn) nextBtn.disabled = (employeeCurrentPage >= totalPages);

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);"><div style="display: flex; justify-content: center; margin-bottom: 0.5rem; color: var(--forge-text-subtle);"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div><div>No employees match the specified filters.</div><button class="astryx-btn btn-outline" style="margin-top: 0.75rem;" onclick="resetEmployeeFilters()">Reset Filters</button></td></tr>';
        return;
      }

      tbody.innerHTML = paginatedItems.map(emp => {
        const isSuspended = emp.status === 'SUSPENDED';
        const isInvited = emp.status === 'INVITED';
        const isChecked = selectedEmployeeIds.has(emp.id) ? 'checked' : '';
        const statusBadge = isSuspended
          ? '<span class="status-badge" style="background: var(--forge-bg-elevated); color: var(--forge-text-muted); border: 1px solid var(--forge-border);"><span class="status-pulse-dot suspended" style="margin-right:4px;"></span>SUSPENDED</span>'
          : isInvited
          ? '<span class="status-badge" style="background: var(--forge-bg-elevated); color: var(--forge-accent); border: 1px solid var(--forge-border);"><span class="status-pulse-dot invited" style="margin-right:4px;"></span>INVITED</span>'
          : '<span class="status-badge" style="background: var(--forge-success-bg); color: var(--forge-success); border: 1px solid var(--forge-border);"><span class="status-pulse-dot active" style="margin-right:4px;"></span>ACTIVE</span>';

        const rolesList = (emp.roles || ['roles/employee']).map(r => {
          const short = r.replace('roles/', '');
          const isSuper = short.includes('super_admin') || short.includes('admin');
          return '<span class="astryx-badge" style="' + (isSuper ? 'background: var(--forge-bg-card-hover); color: var(--forge-accent); border-color: var(--forge-border-medium);' : '') + '">' + short + '</span>';
        }).join(' ');

        const initials = (emp.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        return '<tr class="emp-row" data-id="' + emp.id + '" style="cursor: pointer;" onclick="handleEmployeeRowClick(event, this.dataset.id)">' +
          '<td onclick="event.stopPropagation()"><input type="checkbox" ' + isChecked + ' data-emp-id="' + emp.id + '" onchange="toggleEmployeeSelection(this.getAttribute(\\'data-emp-id\\'), this.checked)"></td>' +
          '<td style="width: 260px;">' +
            '<div style="display: flex; align-items: center; gap: 0.65rem;">' +
              '<div class="emp-avatar">' + initials + '</div>' +
              '<div>' +
                '<div style="font-weight: 600; color: var(--forge-text-main); font-size: 0.85rem;">' + (emp.display_name || 'Unnamed') + '</div>' +
                '<div style="color: var(--forge-text-muted); font-size: 0.73rem; font-family: monospace;">' + emp.email + '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div style="font-size: 0.82rem; font-weight: 500;">' + (emp.department_name || '<span style="color: var(--forge-text-muted); font-style: italic;">Unassigned</span>') + '</div>' +
            '<div style="font-size: 0.7rem; color: var(--forge-text-muted); font-family: monospace;">' + (emp.department_path || '') + '</div>' +
          '</td>' +
          '<td>' +
            '<div style="font-size: 0.82rem;">' + (emp.job_title || 'Employee') + '</div>' +
            '<div style="font-size: 0.7rem; color: var(--forge-text-muted); font-family: monospace;">' + (emp.employee_code ? 'Code: ' + emp.employee_code : '') + '</div>' +
          '</td>' +
          '<td onclick="event.stopPropagation()">' +
            (emp.manager_name
              ? '<button class="emp-mgr-pill" data-emp-id="' + emp.id + '" onclick="openHierarchyModal(this.getAttribute(\\'data-emp-id\\'))" title="View Management Chain">👔 ' + emp.manager_name + '</button>'
              : '<span style="font-size: 0.75rem; color: var(--forge-text-muted); font-style: italic;">No Manager</span>') +
          '</td>' +
          '<td>' + rolesList + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td style="text-align: right;" onclick="event.stopPropagation()">' +
            '<div style="display: inline-flex; gap: 0.35rem;">' +
              '<button class="astryx-btn btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" data-emp-id="' + emp.id + '" onclick="openEditEmployeeModal(this.getAttribute(\\'data-emp-id\\'))">Edit</button>' +
              '<button class="astryx-btn btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.72rem; border-color: var(--forge-border); color: var(--forge-text-muted);" data-emp-id="' + emp.id + '" onclick="revokeEmployeeSessions(this.getAttribute(\\'data-emp-id\\'))">Revoke</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function changeEmployeePage(delta) {
      const items = employeeData.items || [];
      const totalPages = Math.max(1, Math.ceil(items.length / employeePageLimit));
      const next = employeeCurrentPage + delta;
      if (next >= 1 && next <= totalPages) {
        employeeCurrentPage = next;
        persistEmployeeState();
        renderEmployeeTable();
      }
    }

    function changeEmployeePageLimit(limit) {
      employeePageLimit = parseInt(limit, 10) || 25;
      employeeCurrentPage = 1;
      persistEmployeeState();
      renderEmployeeTable();
    }

    function handleEmployeeRowClick(event, userId) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') return;
      openEmployeeDrawer(userId);
    }

    function toggleEmployeeSelection(userId, checked) {
      if (checked) selectedEmployeeIds.add(userId);
      else selectedEmployeeIds.delete(userId);
      updateBatchToolbar();
    }

    function toggleSelectAllEmployees(checked) {
      const items = employeeData.items || [];
      if (checked) items.forEach(i => selectedEmployeeIds.add(i.id));
      else selectedEmployeeIds.clear();
      renderEmployeeTable();
      updateBatchToolbar();
    }

    function clearBatchSelection() {
      selectedEmployeeIds.clear();
      const selectAll = document.getElementById('emp-select-all');
      if (selectAll) selectAll.checked = false;
      renderEmployeeTable();
      updateBatchToolbar();
    }

    function updateBatchToolbar() {
      const bar = document.getElementById('emp-batch-bar');
      const countEl = document.getElementById('batch-selected-count');
      if (!bar || !countEl) return;

      countEl.textContent = selectedEmployeeIds.size;
      if (selectedEmployeeIds.size > 0) bar.classList.add('show');
      else bar.classList.remove('show');
    }

    async function executeBatchAction(action) {
      if (selectedEmployeeIds.size === 0) return;
      const userIds = Array.from(selectedEmployeeIds);

      try {
        const res = await fetch(\`\${apiBase}/api/employees/bulk-action\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, userIds }),
        });
        const json = await res.json();
        if (json.status !== 'ok') throw new Error(json.error || 'Action failed');
        showAstryxToast('success', 'Processed ' + json.processed + ' employees (' + action + ')');
        clearBatchSelection();
        loadEmployees();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    function sortEmployeesBy(field) {
      sortDirection[field] = -1 * (sortDirection[field] || 1);
      const dir = sortDirection[field];
      employeeData.items.sort((a, b) => {
        const valA = field === 'name' ? (a.display_name || '') : (a.department_name || '');
        const valB = field === 'name' ? (b.display_name || '') : (b.department_name || '');
        return valA.localeCompare(valB) * dir;
      });
      renderEmployeeTable();
    }

    function downloadSampleCsvTemplate() {
      const sample = 'display_name,email,job_title,employee_code,department,manager_email,role\\n' +
        'Rajesh Sharma,rajesh.sharma@forge.internal,Chief Executive Officer,CEO-001,Executive Leadership,,roles/super_admin\\n' +
        'Priya Patel,priya.patel@forge.internal,VP of Engineering,ENG-001,Engineering Org,rajesh.sharma@forge.internal,roles/super_admin\\n' +
        'Rohan Kulkarni,rohan.kulkarni@forge.internal,Principal Distributed Systems Architect,ENG-010,Platform Infrastructure,priya.patel@forge.internal,roles/employee';
      const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'org_roster_template.csv';
      link.click();
    }

    ${getEmployeeDrawerAndTreeScripts()}

    function filterEmployees() {
      const searchInput = document.getElementById('emp-search-input');
      const deptSelect = document.getElementById('emp-dept-filter');
      currentEmployeeFilter.search = searchInput ? searchInput.value.trim() : '';
      currentEmployeeFilter.departmentId = deptSelect ? deptSelect.value : '';
      employeeCurrentPage = 1;
      persistEmployeeState();
      loadEmployees();
    }

    function setEmployeeStatusFilter(status, updateState = true) {
      currentEmployeeFilter.status = status === 'all' ? '' : status;
      const chips = document.querySelectorAll('#emp-filter-chips .filter-chip');
      chips.forEach(c => {
        if (c.getAttribute('data-filter') === (status || 'all')) c.classList.add('active');
        else c.classList.remove('active');
      });
      if (updateState) {
        employeeCurrentPage = 1;
        persistEmployeeState();
        loadEmployees();
      }
    }

    function resetEmployeeFilters() {
      currentEmployeeFilter = { search: '', departmentId: '', status: '' };
      const searchInput = document.getElementById('emp-search-input');
      const deptSelect = document.getElementById('emp-dept-filter');
      if (searchInput) searchInput.value = '';
      if (deptSelect) deptSelect.value = '';
      employeeCurrentPage = 1;
      setEmployeeStatusFilter('all', false);
      persistEmployeeState();
      loadEmployees();
    }

    ${getEmployeeModalScripts()}

    ${getEmployeeImportScripts()}
  `;
}

