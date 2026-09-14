/**
 * @forge/dev-dashboard - Employee Directory Table Client Logic (2026 LTS)
 * Multipage Pagination, Column Sorting, Fullscreen Canvas, and Zero-Emoji Rendering.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */

import { astryxIcons } from '@forge/ui';

/**
 * getEmployeeTableScripts
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getEmployeeTableScripts(): string {
  return `
    let isEmpTableFullscreen = false;
    let currentSortField = 'name';
    let sortDirection = { name: 1, department: 1, title: 1, status: 1 };

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

      // 1. Update Metrics in Toolbar and Footer
      const metricsEl = document.getElementById('emp-footer-metrics');
      const pillTotal = document.getElementById('emp-metric-pill-total');
      const selectionEl = document.getElementById('emp-footer-selection');
      const selectedCountEl = document.getElementById('emp-footer-selected-count');

      if (metricsEl) {
        if (total === 0) metricsEl.textContent = 'Showing 0 of 0 members';
        else metricsEl.textContent = 'Showing ' + (startIndex + 1) + '–' + Math.min(startIndex + paginatedItems.length, total) + ' of ' + total + ' members';
      }
      if (pillTotal) pillTotal.textContent = total + ' Members';

      if (selectionEl && selectedCountEl) {
        if (selectedEmployeeIds.size > 0) {
          selectionEl.style.display = 'inline-flex';
          selectedCountEl.textContent = selectedEmployeeIds.size;
        } else {
          selectionEl.style.display = 'none';
        }
      }

      // 2. Render Multipage Pagination Bar
      renderEmployeePagination(totalPages);

      // 3. Render Empty State
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="emp-table-empty-cell">' +
          '<div class="emp-empty-icon">${astryxIcons.users}</div>' +
          '<div class="emp-empty-title">No employees found</div>' +
          '<div class="emp-empty-desc">No members match the specified search or filter criteria.</div>' +
          '<button type="button" class="astryx-btn btn-outline" style="margin-top: 0.75rem;" onclick="resetEmployeeFilters()">' +
            '${astryxIcons.refresh} Reset Filters' +
          '</button>' +
        '</td></tr>';
        return;
      }

      // 4. Render Table Rows (Zero OS Emojis, 100% Vector SVG Icons)
      tbody.innerHTML = paginatedItems.map(emp => {
        const isSuspended = emp.status === 'SUSPENDED';
        const isInvited = emp.status === 'INVITED';
        const isChecked = selectedEmployeeIds.has(emp.id) ? 'checked' : '';

        const statusBadge = isSuspended
          ? '<span class="status-badge emp-status-badge suspended"><span class="status-pulse-dot suspended"></span>SUSPENDED</span>'
          : isInvited
          ? '<span class="status-badge emp-status-badge invited"><span class="status-pulse-dot invited"></span>INVITED</span>'
          : '<span class="status-badge emp-status-badge active"><span class="status-pulse-dot active"></span>ACTIVE</span>';

        const rolesList = (emp.roles || ['roles/employee']).map(r => {
          const short = r.replace('roles/', '');
          const isSuper = short.includes('super_admin') || short.includes('admin');
          return '<span class="astryx-badge emp-role-badge ' + (isSuper ? 'role-super' : '') + '">' + short + '</span>';
        }).join(' ');

        const initials = (emp.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        const managerPill = emp.manager_name
          ? '<button type="button" class="emp-mgr-pill" data-emp-id="' + emp.id + '" onclick="openHierarchyModal(this.getAttribute(\\'data-emp-id\\'))" title="View Management Chain">' +
              '<span class="emp-mgr-icon">${astryxIcons.gitTree}</span>' +
              '<span>' + emp.manager_name + '</span>' +
            '</button>'
          : '<span class="emp-no-mgr">Direct / Head</span>';

        return '<tr class="emp-row" data-id="' + emp.id + '" onclick="handleEmployeeRowClick(event, this.dataset.id)">' +
          '<td class="emp-cell-checkbox" onclick="event.stopPropagation()">' +
            '<input type="checkbox" ' + isChecked + ' class="emp-checkbox" data-emp-id="' + emp.id + '" onchange="toggleEmployeeSelection(this.getAttribute(\\'data-emp-id\\'), this.checked)">' +
          '</td>' +
          '<td class="emp-cell-identity">' +
            '<div class="emp-identity-wrap">' +
              '<div class="emp-avatar-wrap">' +
                '<div class="emp-avatar">' + initials + '</div>' +
                '<span class="emp-avatar-beacon ' + (isSuspended ? 'suspended' : isInvited ? 'invited' : 'active') + '"></span>' +
              '</div>' +
              '<div class="emp-identity-info">' +
                '<div class="emp-name-row">' +
                  '<span class="emp-name-text">' + (emp.display_name || 'Unnamed') + '</span>' +
                '</div>' +
                '<div class="emp-email-row">' +
                  '<span class="emp-email-text">' + emp.email + '</span>' +
                  '<button type="button" class="emp-copy-email-btn" onclick="copyEmployeeEmail(\\'' + emp.email + '\\', event)" title="Copy email">' +
                    '${astryxIcons.copy}' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div class="emp-dept-cell">' +
              '<span class="emp-dept-name">' + (emp.department_name || '<span class="emp-unassigned">Unassigned</span>') + '</span>' +
              (emp.department_path ? '<span class="emp-dept-path">' + emp.department_path + '</span>' : '') +
            '</div>' +
          '</td>' +
          '<td>' +
            '<div class="emp-job-cell">' +
              '<span class="emp-job-title">' + (emp.job_title || 'Employee') + '</span>' +
              (emp.employee_code ? '<span class="emp-code-pill">' + emp.employee_code + '</span>' : '') +
            '</div>' +
          '</td>' +
          '<td onclick="event.stopPropagation()">' + managerPill + '</td>' +
          '<td><div class="emp-roles-cell">' + rolesList + '</div></td>' +
          '<td>' + statusBadge + '</td>' +
          '<td class="emp-cell-actions" onclick="event.stopPropagation()">' +
            '<div class="emp-actions-group">' +
              '<button type="button" class="emp-action-btn" title="Inspect Profile" data-emp-id="' + emp.id + '" onclick="openEmployeeDrawer(this.getAttribute(\\'data-emp-id\\'))">' +
                '${astryxIcons.eye}' +
              '</button>' +
              '<button type="button" class="emp-action-btn" title="Edit Member" data-emp-id="' + emp.id + '" onclick="openEditEmployeeModal(this.getAttribute(\\'data-emp-id\\'))">' +
                '${astryxIcons.edit}' +
              '</button>' +
              '<button type="button" class="emp-action-btn emp-action-revoke" title="Revoke Active Sessions" data-emp-id="' + emp.id + '" onclick="revokeEmployeeSessions(this.getAttribute(\\'data-emp-id\\'))">' +
                '${astryxIcons.userX}' +
              '</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderEmployeePagination(totalPages) {
      const pillsContainer = document.getElementById('emp-page-pills');
      const firstBtn = document.getElementById('btn-emp-first');
      const prevBtn = document.getElementById('btn-emp-prev');
      const nextBtn = document.getElementById('btn-emp-next');
      const lastBtn = document.getElementById('btn-emp-last');

      if (firstBtn) firstBtn.disabled = (employeeCurrentPage <= 1);
      if (prevBtn) prevBtn.disabled = (employeeCurrentPage <= 1);
      if (nextBtn) nextBtn.disabled = (employeeCurrentPage >= totalPages);
      if (lastBtn) lastBtn.disabled = (employeeCurrentPage >= totalPages);

      if (!pillsContainer) return;

      // Build compact page pills with ellipsis: e.g. [1] ... [4] [5] [6] ... [12]
      let html = '';
      const current = employeeCurrentPage;
      const range = [];

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        let start = Math.max(2, current - 1);
        let end = Math.min(totalPages - 1, current + 1);

        if (current <= 3) {
          start = 2;
          end = 4;
        } else if (current >= totalPages - 2) {
          start = totalPages - 3;
          end = totalPages - 1;
        }

        if (start > 2) range.push('...');
        for (let i = start; i <= end; i++) range.push(i);
        if (end < totalPages - 1) range.push('...');
        range.push(totalPages);
      }

      pillsContainer.innerHTML = range.map(p => {
        if (p === '...') {
          return '<span class="emp-page-ellipsis">&hellip;</span>';
        }
        const isActive = p === current ? 'active' : '';
        return '<button type="button" class="emp-page-pill ' + isActive + '" onclick="jumpToEmployeePage(' + p + ')">' + p + '</button>';
      }).join('');
    }

    function jumpToEmployeePage(page) {
      const totalPages = Math.max(1, Math.ceil((employeeData.items || []).length / employeePageLimit));
      if (page >= 1 && page <= totalPages && page !== employeeCurrentPage) {
        employeeCurrentPage = page;
        persistEmployeeState();
        renderEmployeeTable();
        const wrap = document.querySelector('.emp-table-scroll-wrap');
        if (wrap) wrap.scrollTop = 0;
      }
    }

    function jumpToEmployeeLastPage() {
      const totalPages = Math.max(1, Math.ceil((employeeData.items || []).length / employeePageLimit));
      jumpToEmployeePage(totalPages);
    }

    function changeEmployeePage(delta) {
      jumpToEmployeePage(employeeCurrentPage + delta);
    }

    function changeEmployeePageLimit(limit) {
      employeePageLimit = parseInt(limit, 10) || 25;
      employeeCurrentPage = 1;
      persistEmployeeState();
      renderEmployeeTable();
    }

    function sortEmployeesBy(field) {
      currentSortField = field;
      sortDirection[field] = -1 * (sortDirection[field] || 1);
      const dir = sortDirection[field];

      // Update sort arrow indicator visuals
      ['name', 'department', 'title', 'status'].forEach(f => {
        const ind = document.getElementById('emp-sort-' + f + '-indicator');
        if (!ind) return;
        if (f === field) {
          ind.innerHTML = dir === 1 ? '${astryxIcons.arrowUp}' : '${astryxIcons.arrowDown}';
          ind.classList.add('active');
        } else {
          ind.innerHTML = '${astryxIcons.arrowUpDown}';
          ind.classList.remove('active');
        }
      });

      employeeData.items.sort((a, b) => {
        let valA = '';
        let valB = '';
        if (field === 'name') {
          valA = (a.display_name || '').toLowerCase();
          valB = (b.display_name || '').toLowerCase();
        } else if (field === 'department') {
          valA = (a.department_name || '').toLowerCase();
          valB = (b.department_name || '').toLowerCase();
        } else if (field === 'title') {
          valA = (a.job_title || '').toLowerCase();
          valB = (b.job_title || '').toLowerCase();
        } else if (field === 'status') {
          valA = (a.status || '').toLowerCase();
          valB = (b.status || '').toLowerCase();
        }
        return valA.localeCompare(valB) * dir;
      });

      renderEmployeeTable();
    }

    function toggleEmployeeTableFullscreen(force) {
      const container = document.getElementById('emp-table-container');
      const hud = document.getElementById('emp-fullscreen-hud');
      const labelEl = document.getElementById('emp-fullscreen-btn-label');
      const iconEl = document.getElementById('emp-fullscreen-btn-icon');
      if (!container) return;

      if (typeof force === 'boolean') {
        isEmpTableFullscreen = force;
      } else {
        isEmpTableFullscreen = !isEmpTableFullscreen;
      }

      container.classList.toggle('emp-table-fullscreen', isEmpTableFullscreen);
      document.body.classList.toggle('emp-fullscreen-active', isEmpTableFullscreen);

      if (hud) hud.style.display = isEmpTableFullscreen ? 'flex' : 'none';
      if (labelEl) labelEl.textContent = isEmpTableFullscreen ? 'Exit Full Screen' : 'Full Screen';
      if (iconEl) iconEl.innerHTML = isEmpTableFullscreen ? '${astryxIcons.minimize}' : '${astryxIcons.maximize}';

      if (isEmpTableFullscreen && typeof showAstryxToast === 'function') {
        showAstryxToast('info', 'Full Canvas Mode active. Press Esc to exit.');
      }
    }

    function refreshEmployeeDirectory() {
      const btn = document.getElementById('btn-emp-table-refresh');
      if (btn) btn.classList.add('spinning');
      loadEmployees().finally(() => {
        if (btn) setTimeout(() => btn.classList.remove('spinning'), 350);
      });
    }

    function clearEmployeeSearch() {
      const input = document.getElementById('emp-search-input');
      const clearBtn = document.getElementById('emp-search-clear');
      if (input) {
        input.value = '';
        input.focus();
      }
      if (clearBtn) clearBtn.style.display = 'none';
      filterEmployees();
    }

    function copyEmployeeEmail(email, event) {
      if (event) event.stopPropagation();
      if (!email) return;
      navigator.clipboard.writeText(email).then(() => {
        if (typeof showAstryxToast === 'function') showAstryxToast('success', 'Email copied: ' + email);
      }).catch(() => {});
    }

    // Keyboard listener for Escape key (to exit fullscreen) and hotkeys
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isEmpTableFullscreen) {
        toggleEmployeeTableFullscreen(false);
      }
    });
  `;
}
