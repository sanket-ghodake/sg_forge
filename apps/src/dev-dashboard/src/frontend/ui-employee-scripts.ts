import { getEmployeeImportScripts } from './ui-employee-import-scripts';
import { getEmployeeDrawerAndTreeScripts } from './ui-employee-drawer-scripts';
import { getEmployeeModalScripts } from './ui-employee-modal-scripts';
import { getOrgSetupScripts } from './ui-org-setup-scripts';
import { getEmployeeTableScripts } from './ui-employee-table-scripts';

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
        if (!orgSetupData?.organization) loadOrgSetupData().catch(() => {});
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
              '<span style="display:inline-flex;align-items:center;gap:0.35rem;">' + astryxIcons.building + ' ' + (d.name || 'Unnamed') + '</span>' +
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
      const depts = (employeeData && employeeData.departments && employeeData.departments.length > 0)
        ? employeeData.departments
        : ((typeof orgSetupData !== 'undefined' && orgSetupData.nodes) ? orgSetupData.nodes : []);

      const currentVal = currentEmployeeFilter.departmentId || (select ? select.value : '');
      let opts = '<option value="">All Departments</option>';
      let modalOpts = '<option value="">(No Department Assigned)</option>';

      for (const d of depts) {
        const selected = d.id === currentVal ? 'selected' : '';
        const label = d.name + (d.code ? ' [' + d.code + ']' : '');
        opts += '<option value="' + d.id + '" ' + selected + '>' + label + '</option>';
        modalOpts += '<option value="' + d.id + '">' + label + '</option>';
      }
      if (select) select.innerHTML = opts;
      if (modalSelect) modalSelect.innerHTML = modalOpts;
    }

    function switchEmployeeSubTab(tabName, updateState = true) {
      currentEmployeeSubTab = tabName;
      ['overview', 'table', 'tree', 'setup'].forEach(t => {
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
      else if (tabName === 'setup') loadOrgSetupData();
    }

    function setEmployeeViewMode(mode) {
      switchEmployeeSubTab(mode === 'table' ? 'table' : 'tree');
    }

    ${getEmployeeTableScripts()}

    function handleEmployeeRowClick(event, userId) {
      if (!userId || (event && event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || (event.target.closest && (event.target.closest('button') || event.target.closest('input') || event.target.closest('a')))))) return;
      try { openEmployeeDrawer(userId); } catch (e) {}
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

    ${getOrgSetupScripts()}
  `;
}

