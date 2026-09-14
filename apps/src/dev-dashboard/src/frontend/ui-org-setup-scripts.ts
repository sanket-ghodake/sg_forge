/**
 * @forge/dev-dashboard - Organization Setup Client Controller & DOM Scripts (2026 LTS)
 * Handles client-side state, modal triggers, and AJAX calls for Org Setup & EID Generator.
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-009]
 */

export function getOrgSetupScripts(): string {
  return `
    let orgSetupData = { organization: null, nodeTypes: [], nodes: [] };

    async function loadOrgSetupData() {
      try {
        const res = await fetch(apiBase + '/api/org-setup');
        const json = await res.json();
        if (json.status !== 'ok' && !json.ok) throw new Error(json.error || 'Failed to fetch org setup');

        orgSetupData = json;
        renderOrgSetupPanels();

        // Dynamically update global employee departments list
        if (orgSetupData.nodes) {
          employeeData.departments = orgSetupData.nodes.map(n => ({
            id: n.id,
            name: n.name,
            code: n.code,
            path: n.path
          }));
          renderDepartmentDropdown();
        }
      } catch (err) {
        if (typeof showAstryxToast === 'function') {
          showAstryxToast('error', 'Error loading organization setup: ' + err.message);
        }
      }
    }

    function renderOrgSetupPanels() {
      renderOrgProfileCard();
      renderOrgLevelsList();
      renderOrgDepartmentsTree();
      renderOrgEidCard();
    }

    function renderOrgProfileCard() {
      const org = orgSetupData.organization || {};
      const nameEl = document.getElementById('org-card-name');
      const domainEl = document.getElementById('org-card-domain');
      const brandEl = document.getElementById('org-card-brand');
      const timezoneEl = document.getElementById('org-card-timezone');
      const emailEl = document.getElementById('org-card-email');

      if (nameEl) nameEl.textContent = org.name || 'Organization Name Unset';
      if (domainEl) domainEl.textContent = org.domain || 'domain.internal';
      if (brandEl) brandEl.textContent = org.brand_name ? (org.brand_name + (org.brand_tagline ? ' — ' + org.brand_tagline : '')) : 'Default Brand';
      if (timezoneEl) timezoneEl.textContent = org.timezone || 'UTC';
      if (emailEl) emailEl.textContent = org.contact_email || 'Not configured';
    }

    function renderOrgLevelsList() {
      const tbody = document.getElementById('org-levels-tbody');
      if (!tbody) return;

      const levels = orgSetupData.nodeTypes || [];
      if (levels.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--forge-text-muted);">No hierarchy level tiers defined. Add your first tier (e.g. Division, Department, Squad).</td></tr>';
        return;
      }

      tbody.innerHTML = levels.map(l =>
        '<tr><td><span class="astryx-badge" style="font-weight: 700; color: var(--forge-primary);">Rank #' + l.level_order + '</span></td>' +
        '<td style="font-weight: 600; color: var(--forge-text-main);">' + l.name + '</td>' +
        '<td style="color: var(--forge-text-muted); font-size: 0.78rem;">' + (l.description || '—') + '</td>' +
        '<td style="text-align: right;"><div style="display: inline-flex; gap: 0.35rem;">' +
        '<button class="astryx-btn btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" onclick="openEditLevelModal(\\'' + l.id + '\\')">Edit</button>' +
        '<button class="astryx-btn btn-outline" style="padding: 0.2rem 0.45rem; font-size: 0.72rem; color: var(--forge-accent); border-color: var(--forge-border);" onclick="deleteLevel(\\'' + l.id + '\\')">Delete</button>' +
        '</div></td></tr>'
      ).join('');
    }

    function renderOrgDepartmentsTree() {
      const container = document.getElementById('org-departments-list');
      if (!container) return;

      const nodes = orgSetupData.nodes || [];
      if (nodes.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);">No departments or structural units created yet. Click "Add Department" to build your organization structure.</div>';
        return;
      }

      container.innerHTML = nodes.map(n => {
        const parentNode = nodes.find(p => p.id === n.parent_id);
        const parentLabel = parentNode ? parentNode.name : '<span style="color: var(--forge-text-muted); font-style: italic;">Top-Level Unit</span>';
        const empCount = n.employee_count || 0;
        const childCount = n.child_count || 0;

        return '<div class="astryx-card" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; border-left: 3px solid var(--forge-primary); margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.75rem;">' +
          '<div style="display: flex; align-items: center; gap: 0.85rem;">' +
            '<div style="background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); width: 36px; height: 36px; border-radius: var(--forge-radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; color: var(--forge-primary);">' + (n.code ? n.code.slice(0, 3) : 'ORG') + '</div>' +
            '<div>' +
              '<div style="font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 0.45rem;">' + n.name + (n.code ? '<span class="astryx-badge" style="font-size: 0.68rem; font-family: monospace;">' + n.code + '</span>' : '') + '<span class="astryx-badge" style="font-size: 0.68rem; background: var(--forge-bg-card); color: var(--forge-text-muted);">' + (n.type_name || 'Unit') + '</span></div>' +
              '<div style="font-size: 0.72rem; color: var(--forge-text-muted); margin-top: 0.15rem;">Parent: ' + parentLabel + ' &bull; Path: <code style="font-size: 0.7rem;">' + n.path + '</code></div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 0.85rem;">' +
            '<div style="display: flex; gap: 0.5rem; font-size: 0.74rem;">' +
              '<span class="astryx-badge" style="border-color: var(--forge-border);">' + empCount + ' Members</span>' +
              (childCount > 0 ? '<span class="astryx-badge" style="border-color: var(--forge-border);">' + childCount + ' Sub-Units</span>' : '') +
            '</div>' +
            '<div style="display: inline-flex; gap: 0.35rem;">' +
              '<button class="astryx-btn btn-outline" style="padding: 0.22rem 0.5rem; font-size: 0.72rem;" onclick="openEditDepartmentModal(\\'' + n.id + '\\')">Edit</button>' +
              '<button class="astryx-btn btn-outline" style="padding: 0.22rem 0.5rem; font-size: 0.72rem; color: var(--forge-accent); border-color: var(--forge-border);" onclick="deleteDepartment(\\'' + n.id + '\\')">Delete</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderOrgEidCard() {
      const org = orgSetupData.organization || {};
      const prefix = org.eid_prefix || 'EMP';
      const padding = org.eid_padding || 4;
      const counter = org.eid_counter || 0;
      const nextSample = prefix + '-' + String(counter + 1).padStart(padding, '0');

      const pEl = document.getElementById('org-eid-prefix-val'), dEl = document.getElementById('org-eid-padding-val');
      const cEl = document.getElementById('org-eid-counter-val'), sEl = document.getElementById('org-eid-sample-val');
      if (pEl) pEl.textContent = prefix; if (dEl) dEl.textContent = padding + ' Digits';
      if (cEl) cEl.textContent = counter; if (sEl) sEl.textContent = nextSample;
    }

    // ── Department Modals & Actions ──
    async function openAddDepartmentModal() {
      if (!orgSetupData.organization || !orgSetupData.nodeTypes || orgSetupData.nodeTypes.length === 0) {
        await loadOrgSetupData();
      }

      const modal = document.getElementById('modal-org-department');
      if (!modal) return;

      document.getElementById('modal-dept-title').textContent = 'Add Department / Unit';
      ['id', 'name', 'code'].forEach(f => { const el = document.getElementById('dept-form-' + f); if (el) el.value = ''; });

      // Populate Level Types
      const typeSelect = document.getElementById('dept-form-type');
      if (typeSelect) {
        const types = orgSetupData.nodeTypes || [];
        if (types.length === 0) {
          showAstryxToast('warning', 'Please create at least one Hierarchy Level Tier first.');
          openAddLevelModal();
          return;
        }
        typeSelect.innerHTML = types.map(t => '<option value="' + t.id + '">' + t.name + ' (Rank #' + t.level_order + ')</option>').join('');
      }

      // Populate Parent Nodes
      const parentSelect = document.getElementById('dept-form-parent');
      if (parentSelect) {
        const nodes = orgSetupData.nodes || [];
        parentSelect.innerHTML = '<option value="">(None / Top Level Division)</option>' +
          nodes.map(n => '<option value="' + n.id + '">' + n.name + ' (' + (n.path || '/' + n.name) + ')</option>').join('');
      }

      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function openEditDepartmentModal(nodeId) {
      const node = (orgSetupData.nodes || []).find(n => n.id === nodeId);
      if (!node) return;

      const modal = document.getElementById('modal-org-department');
      if (!modal) return;

      document.getElementById('modal-dept-title').textContent = 'Edit Department: ' + node.name;
      const elId = document.getElementById('dept-form-id'), elNm = document.getElementById('dept-form-name'), elCd = document.getElementById('dept-form-code');
      if (elId) elId.value = node.id; if (elNm) elNm.value = node.name; if (elCd) elCd.value = node.code || '';

      const typeSelect = document.getElementById('dept-form-type');
      if (typeSelect) {
        typeSelect.innerHTML = (orgSetupData.nodeTypes || []).map(t => {
          const sel = t.id === node.type_id ? ' selected' : '';
          return '<option value="' + t.id + '"' + sel + '>' + t.name + ' (Rank #' + t.level_order + ')</option>';
        }).join('');
      }

      const parentSelect = document.getElementById('dept-form-parent');
      if (parentSelect) {
        parentSelect.innerHTML = '<option value="">(None / Top Level Division)</option>' +
          (orgSetupData.nodes || []).filter(n => n.id !== nodeId).map(n => {
            const sel = n.id === node.parent_id ? ' selected' : '';
            return '<option value="' + n.id + '"' + sel + '>' + n.name + ' (' + (n.path || '/' + n.name) + ')</option>';
          }).join('');
      }

      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function closeDepartmentModal() {
      const modal = document.getElementById('modal-org-department');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
        modal.style.zIndex = '';
      }
      window._addingDeptFromMemberModal = false;
    }

    async function saveDepartmentForm(event) {
      if (event) event.preventDefault();
      const id = document.getElementById('dept-form-id').value;
      const name = document.getElementById('dept-form-name').value.trim();
      const code = document.getElementById('dept-form-code').value.trim();
      const type_id = document.getElementById('dept-form-type').value;
      const parent_id = document.getElementById('dept-form-parent').value || null;

      try {
        const res = await fetch(apiBase + '/api/org-setup/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id || undefined, name, code, type_id, parent_id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save department');

        showAstryxToast('success', 'Department saved successfully');
        closeDepartmentModal();
        await loadOrgSetupData();
        loadEmployees();

        if (window._addingDeptFromMemberModal) {
          window._addingDeptFromMemberModal = false;
          if (typeof renderDepartmentDropdown === 'function') renderDepartmentDropdown();
          const deptSelect = document.getElementById('emp-form-dept');
          if (deptSelect && json && json.node) deptSelect.value = json.node.id;
          else if (deptSelect && id) deptSelect.value = id;
          if (typeof updateEmployeeLivePreview === 'function') updateEmployeeLivePreview();
          if (typeof window.syncAstryxSelects === 'function') window.syncAstryxSelects();
        }
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    async function deleteDepartment(nodeId) {
      try {
        const res = await fetch(apiBase + '/api/org-setup/nodes/' + encodeURIComponent(nodeId), {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to delete department');

        showAstryxToast('success', 'Department deleted successfully');
        await loadOrgSetupData();
        loadEmployees();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    // ── Hierarchy Level Modals & Actions ──
    function openAddLevelModal() {
      const modal = document.getElementById('modal-org-level');
      if (!modal) return;
      document.getElementById('modal-level-title').textContent = 'Add Hierarchy Level Tier';
      document.getElementById('level-form-id').value = '';
      document.getElementById('level-form-name').value = '';
      const existing = orgSetupData.nodeTypes || [];
      const nextOrder = existing.length > 0 ? Math.max(...existing.map(e => e.level_order)) + 1 : 1;
      document.getElementById('level-form-order').value = nextOrder;
      document.getElementById('level-form-desc').value = '';
      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function openEditLevelModal(typeId) {
      const level = (orgSetupData.nodeTypes || []).find(l => l.id === typeId);
      if (!level) return;

      const modal = document.getElementById('modal-org-level');
      if (!modal) return;
      document.getElementById('modal-level-title').textContent = 'Edit Level Tier: ' + level.name;
      document.getElementById('level-form-id').value = level.id;
      document.getElementById('level-form-name').value = level.name;
      document.getElementById('level-form-order').value = level.level_order;
      document.getElementById('level-form-desc').value = level.description || '';
      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function closeLevelModal() {
      const modal = document.getElementById('modal-org-level');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    async function saveLevelForm(event) {
      if (event) event.preventDefault();
      const id = document.getElementById('level-form-id').value;
      const name = document.getElementById('level-form-name').value.trim();
      const level_order = parseInt(document.getElementById('level-form-order').value, 10);
      const description = document.getElementById('level-form-desc').value.trim();

      try {
        const res = await fetch(apiBase + '/api/org-setup/node-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id || undefined, name, level_order, description }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save level tier');

        showAstryxToast('success', 'Hierarchy level tier saved successfully');
        closeLevelModal();
        await loadOrgSetupData();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    async function deleteLevel(typeId) {
      try {
        const res = await fetch(apiBase + '/api/org-setup/node-types/' + encodeURIComponent(typeId), {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to delete level tier');

        showAstryxToast('success', 'Hierarchy level tier deleted');
        await loadOrgSetupData();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    // ── Organization Profile & EID Settings ──
    async function openOrgSettingsModal(defaultTab = 'identity') {
      if (!orgSetupData.organization) {
        await loadOrgSetupData();
      }

      const modal = document.getElementById('modal-org-settings');
      if (!modal) return;

      const org = orgSetupData.organization || {};
      const nameEl = document.getElementById('org-settings-name');
      const domainEl = document.getElementById('org-settings-domain');
      const brandEl = document.getElementById('org-settings-brand');
      const taglineEl = document.getElementById('org-settings-tagline');
      const timezoneEl = document.getElementById('org-settings-timezone');
      const emailEl = document.getElementById('org-settings-email');

      if (nameEl) nameEl.value = org.name || '';
      if (domainEl) domainEl.value = org.domain || '';
      if (brandEl) brandEl.value = org.brand_name || '';
      if (taglineEl) taglineEl.value = org.brand_tagline || '';
      if (timezoneEl) timezoneEl.value = org.timezone || 'UTC';
      if (emailEl) emailEl.value = org.contact_email || '';

      const prefixEl = document.getElementById('eid-settings-prefix');
      const paddingEl = document.getElementById('eid-settings-padding');
      const counterEl = document.getElementById('eid-settings-counter');

      if (prefixEl) prefixEl.value = org.eid_prefix || 'EMP';
      if (paddingEl) paddingEl.value = String(org.eid_padding || 4);
      if (counterEl) counterEl.value = org.eid_counter !== undefined ? org.eid_counter : 0;
      updateEidPreview();

      switchOrgSettingsTab(defaultTab);
      modal.classList.add('open');
      modal.style.display = 'flex';
    }

    function closeOrgSettingsModal() {
      const modal = document.getElementById('modal-org-settings');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    function switchOrgSettingsTab(tab) {
      const isId = tab === 'identity';
      const formId = document.getElementById('form-org-identity');
      const formEid = document.getElementById('form-org-eid');
      const btnId = document.getElementById('btn-tab-org-identity');
      const btnEid = document.getElementById('btn-tab-org-eid');

      if (formId) formId.style.display = isId ? 'flex' : 'none';
      if (formEid) formEid.style.display = isId ? 'none' : 'flex';
      if (btnId) btnId.classList.toggle('active', isId);
      if (btnEid) btnEid.classList.toggle('active', !isId);
    }

    function updateEidPreview() {
      const prefixInput = document.getElementById('eid-settings-prefix');
      const paddingSelect = document.getElementById('eid-settings-padding');
      const counterInput = document.getElementById('eid-settings-counter');
      const previewEl = document.getElementById('eid-preview-badge');

      if (!prefixInput || !paddingSelect || !previewEl) return;
      const prefix = (prefixInput.value || 'EMP').trim().toUpperCase();
      const padding = parseInt(paddingSelect.value, 10) || 4;
      const counter = parseInt(counterInput ? counterInput.value : 0, 10) || 0;
      const nextFormatted = prefix + '-' + String(counter + 1).padStart(padding, '0');
      previewEl.textContent = nextFormatted;
    }

    async function saveOrgProfileForm(event) {
      if (event) event.preventDefault();
      const payload = {
        name: document.getElementById('org-settings-name').value.trim(),
        domain: document.getElementById('org-settings-domain').value.trim(),
        brand_name: document.getElementById('org-settings-brand').value.trim(),
        brand_tagline: document.getElementById('org-settings-tagline').value.trim(),
        timezone: document.getElementById('org-settings-timezone').value,
        contact_email: document.getElementById('org-settings-email').value.trim(),
      };

      try {
        const res = await fetch(apiBase + '/api/org-setup/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save org profile');

        showAstryxToast('success', 'Organization profile updated');
        closeOrgSettingsModal();
        await loadOrgSetupData();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    async function saveEidConfigForm(event) {
      if (event) event.preventDefault();
      const prefix = document.getElementById('eid-settings-prefix').value.trim().toUpperCase();
      const padding = parseInt(document.getElementById('eid-settings-padding').value, 10) || 4;
      const counterStr = document.getElementById('eid-settings-counter').value;
      const counter = counterStr !== '' ? parseInt(counterStr, 10) : undefined;

      try {
        const res = await fetch(apiBase + '/api/org-setup/eid-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, padding, counter }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to save EID config');

        showAstryxToast('success', 'EID sequence configuration saved');
        closeOrgSettingsModal();
        await loadOrgSetupData();
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    // ── 1-Click Auto-Generate EID for Member Creation Modal ──
    async function autoGenerateEmployeeId() {
      const codeInput = document.getElementById('emp-form-code');
      if (!codeInput) return;

      try {
        const res = await fetch(apiBase + '/api/org-setup/eid/next', { method: 'POST' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || 'Failed to allocate EID');

        codeInput.value = json.eid;
        showAstryxToast('success', 'Generated sequential EID: ' + json.eid);
      } catch (err) {
        showAstryxToast('error', 'Auto-EID failed: ' + err.message);
      }
    }

    window.openAddDepartmentModal = openAddDepartmentModal;
    window.openEditDepartmentModal = openEditDepartmentModal;
    window.closeDepartmentModal = closeDepartmentModal;
    window.openAddLevelModal = openAddLevelModal;
    window.openEditLevelModal = openEditLevelModal;
    window.closeLevelModal = closeLevelModal;
    window.openOrgSettingsModal = openOrgSettingsModal;
    window.closeOrgSettingsModal = closeOrgSettingsModal;
    window.autoGenerateEmployeeId = autoGenerateEmployeeId;
    window.loadOrgSetupData = loadOrgSetupData;
  `;
}
