/**
 * @forge/dev-dashboard - Employee Flyout & Hierarchy Modal Handlers (2026 LTS)
 * Astryx Form Processing, Validation, and Scoped Hierarchy Rendering.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getEmployeeModalScripts(): string {
  return `
    function openAddEmployeeModal() {
      const modal = document.getElementById('modal-employee-flyout');
      if (!modal) return;

      document.getElementById('modal-employee-title').textContent = '➕ Add New Employee Profile';
      document.getElementById('emp-form-id').value = '';
      document.getElementById('emp-form-name').value = '';
      const emailInput = document.getElementById('emp-form-email');
      if (emailInput) {
        emailInput.value = '';
        emailInput.removeAttribute('disabled');
      }
      document.getElementById('emp-form-title').value = '';
      document.getElementById('emp-form-code').value = '';
      document.getElementById('emp-form-dept').value = '';
      document.getElementById('emp-form-role').value = 'roles/employee';
      document.getElementById('emp-form-status').value = 'ACTIVE';

      const mgrSelect = document.getElementById('emp-form-manager');
      if (mgrSelect) {
        let opts = '<option value="">(None / Top Level)</option>';
        for (const e of (employeeData.items || [])) {
          opts += '<option value="' + e.id + '">' + (e.display_name || 'Unnamed') + ' (' + (e.job_title || 'Employee') + ')</option>';
        }
        mgrSelect.innerHTML = opts;
      }

      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function openEditEmployeeModal(userId) {
      const modal = document.getElementById('modal-employee-flyout');
      if (!modal) return;

      const emp = (employeeData.items || []).find(i => i.id === userId);
      if (!emp) return;

      document.getElementById('modal-employee-title').textContent = '✏️ Edit Profile: ' + (emp.display_name || '');
      document.getElementById('emp-form-id').value = emp.id;
      document.getElementById('emp-form-name').value = emp.display_name || '';
      const emailInput = document.getElementById('emp-form-email');
      if (emailInput) {
        emailInput.value = emp.email || '';
        emailInput.setAttribute('disabled', 'true');
      }
      document.getElementById('emp-form-title').value = emp.job_title || '';
      document.getElementById('emp-form-code').value = emp.employee_code || '';
      document.getElementById('emp-form-dept').value = emp.org_node_id || '';
      document.getElementById('emp-form-role').value = (emp.roles && emp.roles[0]) || 'roles/employee';
      document.getElementById('emp-form-status').value = emp.status || 'ACTIVE';

      const mgrSelect = document.getElementById('emp-form-manager');
      if (mgrSelect) {
        let opts = '<option value="">(None / Top Level)</option>';
        for (const e of (employeeData.items || [])) {
          if (e.id !== userId) {
            const sel = e.id === emp.manager_id ? ' selected' : '';
            opts += '<option value="' + e.id + '"' + sel + '>' + (e.display_name || 'Unnamed') + ' (' + (e.job_title || 'Employee') + ')</option>';
          }
        }
        mgrSelect.innerHTML = opts;
      }

      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function closeEmployeeModal() {
      const modal = document.getElementById('modal-employee-flyout');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      const emailInput = document.getElementById('emp-form-email');
      if (emailInput) emailInput.removeAttribute('disabled');
    }

    async function saveEmployeeForm(event) {
      if (event) event.preventDefault();
      const id = document.getElementById('emp-form-id').value;
      const name = document.getElementById('emp-form-name').value.trim();
      const email = document.getElementById('emp-form-email').value.trim();
      const title = document.getElementById('emp-form-title').value.trim();
      const code = document.getElementById('emp-form-code').value.trim();
      const deptId = document.getElementById('emp-form-dept').value || null;
      const managerId = document.getElementById('emp-form-manager').value || null;
      const role = document.getElementById('emp-form-role').value;
      const status = document.getElementById('emp-form-status').value;

      try {
        if (!id) {
          const res = await fetch(\`\${apiBase}/api/employees\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              display_name: name,
              email,
              job_title: title,
              employee_code: code,
              department_id: deptId,
              manager_id: managerId,
              role,
              status,
            }),
          });
          const json = await res.json();
          if (json.status !== 'ok') throw new Error(json.error || 'Failed to create employee');
          showAstryxToast('success', 'Created employee "' + name + '" successfully');
        } else {
          const res = await fetch(\`\${apiBase}/api/employees/update\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              display_name: name,
              job_title: title,
              employee_code: code,
              department_id: deptId,
              manager_id: managerId,
              role,
              status,
            }),
          });
          const json = await res.json();
          if (json.status !== 'ok') throw new Error(json.error || 'Failed to update employee');
          showAstryxToast('success', 'Updated employee "' + name + '" successfully');
        }
        closeEmployeeModal();
        loadEmployees();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    async function revokeEmployeeSessions(userId) {
      const emp = (employeeData.items || []).find(i => i.id === userId);
      const name = emp ? emp.display_name : 'Employee';
      try {
        const res = await fetch(\`\${apiBase}/api/employees/revoke\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });
        const json = await res.json();
        if (json.status !== 'ok') throw new Error(json.error || 'Revocation failed');
        showAstryxToast('success', 'Active sessions revoked for "' + name + '"');
        loadEmployees();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    async function openHierarchyModal(userId) {
      const modal = document.getElementById('modal-hierarchy-view');
      if (!modal || !container) return;

      modal.classList.add('open');
      modal.style.display = 'flex';
      container.innerHTML = '<div style="padding: 2.5rem; text-align: center; color: var(--forge-text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"><div style="font-size: 1.5rem;">⏳</div><div>Loading interactive reporting hierarchy...</div></div>';

      try {
        const res = await fetch(\`\${apiBase}/api/employees/hierarchy?userId=\${encodeURIComponent(userId)}\`);
        const json = await res.json();
        if (json.status !== 'ok') throw new Error(json.error || 'Failed to fetch hierarchy');

        const u = json.user;
        const uInitials = (u.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const uRoles = (u.roles || ['roles/employee']).map(r => '<span class="astryx-badge">' + r.replace('roles/', '') + '</span>').join(' ');

        let html = '<div class="org-tree-modal-chain">';

        // Top Navigation Bar
        html += '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 1rem; padding-bottom: 0.65rem; border-bottom: 1px solid var(--forge-border); flex-wrap: wrap; gap: 0.5rem;">' +
          '<div style="font-size: 0.76rem; color: var(--forge-text-muted); display: flex; align-items: center; gap: 0.35rem;">' +
            '<span>🏢 Organization</span> &rsaquo; <span>Reporting Hierarchy</span>' +
          '</div>' +
          '<button class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="closeHierarchyModal(); setOrgFocus(\\\'' + u.id + '\\\');">' +
            '🌳 Full Org Studio &rarr;' +
          '</button>' +
        '</div>';

        // Upward Management Chain
        if (json.managementChain && json.managementChain.length > 0) {
          json.managementChain.forEach((m, idx) => {
            const mInitials = (m.display_name || 'MG').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            const levelLabel = idx === json.managementChain.length - 1 ? '👔 Direct Manager' : '🏢 Level ' + (idx + 1) + ' Executive';
            html += '<div class="org-tree-modal-step">' +
              '<div class="org-tree-modal-person-card" onclick="openHierarchyModal(\\\'' + m.id + '\\\')" title="Click to view ' + m.display_name + '\\\'s hierarchy">' +
                '<div class="emp-avatar" style="width: 38px; height: 38px; font-size: 0.82rem;">' + mInitials + '</div>' +
                '<div style="flex: 1; min-width: 0;">' +
                  '<div class="org-tree-modal-level-badge">' + levelLabel + '</div>' +
                  '<div style="font-weight: 700; color: var(--forge-text-main); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + m.display_name + '</div>' +
                  '<div style="font-size: 0.74rem; color: var(--forge-text-muted);">' + (m.job_title || 'Manager') + ' &bull; <span style="font-family: monospace; font-size: 0.7rem;">' + m.email + '</span></div>' +
                '</div>' +
                '<span style="font-size: 0.72rem; color: var(--forge-primary); font-weight: 600; flex-shrink: 0;">↑ Focus</span>' +
              '</div>' +
              '<div class="org-tree-modal-connector"><div class="org-tree-modal-connector-line"></div></div>' +
            '</div>';
          });
        }

        // Focused Hero Person Card
        html += '<div class="org-tree-modal-hero">' +
          '<div style="display: flex; align-items: flex-start; gap: 0.9rem;">' +
            '<div class="emp-avatar" style="width: 48px; height: 48px; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(62,207,142,0.25);">' + uInitials + '</div>' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">' +
                '<span class="status-badge" style="background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid rgba(62, 207, 142, 0.3); font-size: 0.65rem; padding: 0.05rem 0.4rem;"><span class="status-pulse-dot active" style="margin-right: 3px;"></span>★ FOCUSED MEMBER</span>' +
              '</div>' +
              '<div style="font-weight: 800; color: var(--forge-text-main); font-size: 1.08rem; letter-spacing: -0.01em;">' + (u.display_name || 'Unnamed') + '</div>' +
              '<div style="font-size: 0.78rem; color: var(--forge-text-muted); margin-top: 0.1rem;">' + (u.job_title || 'Employee') + '</div>' +
              '<div style="font-size: 0.72rem; color: var(--forge-text-muted); font-family: monospace; margin-top: 0.15rem;">' + u.email + '</div>' +
              '<div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.5rem;">' +
                uRoles +
                (u.department_name ? '<span class="astryx-badge" style="background: var(--forge-bg-card);">🏢 ' + u.department_name + '</span>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; gap: 0.4rem; justify-content: flex-end; margin-top: 0.85rem; padding-top: 0.65rem; border-top: 1px solid var(--forge-border);">' +
            '<button class="astryx-btn btn-outline" style="padding: 0.22rem 0.55rem; font-size: 0.72rem;" onclick="closeHierarchyModal(); openEmployeeDrawer(\\\'' + u.id + '\\\');">👤 Profile Drawer</button>' +
            '<button class="astryx-btn btn-primary" style="padding: 0.22rem 0.55rem; font-size: 0.72rem;" onclick="closeHierarchyModal(); setOrgFocus(\\\'' + u.id + '\\\');">🌳 View in Org Chart</button>' +
          '</div>' +
        '</div>';

        // Direct Reports Section
        if (json.directReports && json.directReports.length > 0) {
          html += '<div class="org-tree-modal-connector"><div class="org-tree-modal-connector-line"></div></div>' +
            '<div class="org-tree-modal-reports-container">' +
              '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--forge-text-muted);">Direct Reports (' + json.directReports.length + ')</span>' +
                '<span style="font-size: 0.7rem; color: var(--forge-text-muted);">Click to drill down</span>' +
              '</div>' +
              '<div class="org-tree-modal-reports-grid">';

          json.directReports.forEach(r => {
            const rInitials = (r.display_name || 'DR').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            html += '<div class="org-tree-modal-report-item" onclick="openHierarchyModal(\\\'' + r.id + '\\\')" title="Focus ' + r.display_name + ' in hierarchy">' +
              '<div class="emp-avatar" style="width: 30px; height: 30px; font-size: 0.7rem;">' + rInitials + '</div>' +
              '<div style="flex: 1; min-width: 0;">' +
                '<div style="font-weight: 700; font-size: 0.8rem; color: var(--forge-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + r.display_name + '</div>' +
                '<div style="font-size: 0.7rem; color: var(--forge-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (r.job_title || 'Employee') + '</div>' +
              '</div>' +
              '<span style="font-size: 0.68rem; color: var(--forge-primary);">↓</span>' +
            '</div>';
          });

          html += '</div></div>';
        } else {
          html += '<div style="margin-top: 0.85rem; text-align: center; font-size: 0.74rem; color: var(--forge-text-muted); font-style: italic;">Individual Contributor &bull; 0 Direct Reports</div>';
        }

        html += '</div>';
        container.innerHTML = html;
      } catch (err) {
        container.innerHTML = '<div style="padding: 1.5rem; color: var(--forge-accent); text-align: center;">' + err.message + '</div>';
      }
    }

    function closeHierarchyModal() {
      const modal = document.getElementById('modal-hierarchy-view');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }
  `;
}
