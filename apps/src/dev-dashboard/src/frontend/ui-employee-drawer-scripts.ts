/**
 * @forge/dev-dashboard - Interactive Org Chart & Drawer Scripts (2026 LTS)
 * Infinite Pan & Zoom Canvas, Upward/Downward Traversal, Peer Navigation, and Astryx Styling.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getEmployeeDrawerAndTreeScripts(): string {
  return `
    /* Interactive Org Chart State */
    let focusedEmployeeId = null;
    let orgChartZoom = 1.0;
    let orgChartPan = { x: 0, y: 0 };
    let isPanningOrg = false;
    let panStart = { x: 0, y: 0 };
    let panInitPos = { x: 0, y: 0 };

    async function loadOrgChartTree() {
      const container = document.getElementById('org-chart-container');
      if (!container) return;

      const items = employeeData.items || [];
      if (items.length === 0) {
        container.innerHTML = '<div class="astryx-card" style="padding: 2.5rem; text-align: center; color: var(--forge-text-muted);">No employee records found in organization.</div>';
        return;
      }

      if (!focusedEmployeeId || !items.find(i => i.id === focusedEmployeeId)) {
        const topLeader = items.find(i => !i.manager_id) || items[0];
        focusedEmployeeId = topLeader ? topLeader.id : null;
      }

      renderInteractiveOrgChart();
    }

    function setOrgFocus(userId) {
      focusedEmployeeId = userId;
      if (typeof switchEmployeeSubTab === 'function') switchEmployeeSubTab('tree');
      else renderInteractiveOrgChart();
      if (typeof persistEmployeeState === 'function') persistEmployeeState();
    }

    function zoomOrgChart(delta) {
      orgChartZoom = Math.min(1.35, Math.max(0.75, Math.round((orgChartZoom + delta) * 100) / 100));
      updateOrgChartTransform();
    }

    function resetOrgChartTransform() {
      orgChartZoom = 1.0;
      orgChartPan = { x: 0, y: 0 };
      updateOrgChartTransform();
    }

    function updateOrgChartTransform() {
      const canvas = document.getElementById('org-chart-canvas');
      const levelEl = document.getElementById('org-zoom-level');
      if (canvas) {
        canvas.style.transform = 'translate(' + orgChartPan.x + 'px, ' + orgChartPan.y + 'px) scale(' + orgChartZoom + ')';
      }
      if (levelEl) {
        levelEl.textContent = Math.round(orgChartZoom * 100) + '%';
      }
    }

    function initOrgChartCanvasListeners() {
      const viewport = document.getElementById('org-chart-viewport');
      if (!viewport) return;

      // Mouse drag-to-pan
      viewport.onmousedown = function(e) {
        if (e.target.closest('.org-tree-hero-card') || e.target.closest('.org-tree-report-card') || e.target.closest('.org-tree-manager-node') || e.target.closest('.org-floating-controls') || e.target.closest('button') || e.target.closest('select')) return;
        isPanningOrg = true;
        viewport.classList.add('panning');
        panStart = { x: e.clientX, y: e.clientY };
        panInitPos = { x: orgChartPan.x, y: orgChartPan.y };
      };

      window.onmousemove = function(e) {
        if (!isPanningOrg) return;
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        orgChartPan = { x: panInitPos.x + dx, y: panInitPos.y + dy };
        updateOrgChartTransform();
      };

      window.onmouseup = function() {
        if (isPanningOrg) {
          isPanningOrg = false;
          if (viewport) viewport.classList.remove('panning');
        }
      };

      // Touch drag-to-pan for mobile (pinch zoom disabled - button only)
      viewport.ontouchstart = function(e) {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          if (touch.target.closest('.org-tree-hero-card') || touch.target.closest('.org-tree-report-card') || touch.target.closest('.org-tree-manager-node') || touch.target.closest('.org-floating-controls') || touch.target.closest('button') || touch.target.closest('select')) return;
          isPanningOrg = true;
          panStart = { x: touch.clientX, y: touch.clientY };
          panInitPos = { x: orgChartPan.x, y: orgChartPan.y };
        }
      };

      window.ontouchmove = function(e) {
        if (!isPanningOrg || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const dx = touch.clientX - panStart.x;
        const dy = touch.clientY - panStart.y;
        orgChartPan = { x: panInitPos.x + dx, y: panInitPos.y + dy };
        updateOrgChartTransform();
      };

      window.ontouchend = function() {
        isPanningOrg = false;
      };

      // Note: Wheel and two-finger trackpad zoom are explicitly disabled. Zoom is button-only.
      viewport.onwheel = null;
    }

    function renderInteractiveOrgChart() {
      const container = document.getElementById('org-chart-container');
      if (!container) return;

      const items = employeeData.items || [];
      const focused = items.find(i => i.id === focusedEmployeeId) || items[0];
      if (!focused) {
        container.innerHTML = '<div class="astryx-card" style="padding: 2rem; text-align: center; color: var(--forge-text-muted);">Select an employee to explore org chart.</div>';
        return;
      }

      // Build Multi-Level Manager Lineage Chain
      const chain = [];
      let curr = focused;
      const visited = new Set([curr.id]);
      while (curr && curr.manager_id && !visited.has(curr.manager_id)) {
        const mgr = items.find(i => i.id === curr.manager_id);
        if (mgr) {
          chain.unshift(mgr);
          visited.add(mgr.id);
          curr = mgr;
        } else {
          break;
        }
      }

      // Direct Manager & Peers
      const directManager = focused.manager_id ? items.find(i => i.id === focused.manager_id) : null;
      const peers = directManager ? items.filter(i => i.manager_id === directManager.id && i.id !== focused.id) : [];

      // Direct Reports
      const directReports = items.filter(i => i.manager_id === focused.id);

      // Top Breadcrumb & Quick Toolbar
      let breadcrumbsHtml = '<div class="org-tree-breadcrumbs">' +
        '<span class="org-tree-breadcrumb-item" onclick="jumpToTopLeader()">🏢 Organization Root</span>';
      chain.forEach(mgr => {
        breadcrumbsHtml += ' <span>&rsaquo;</span> <span class="org-tree-breadcrumb-item" onclick="setOrgFocus(\\\'' + mgr.id + '\\\')">' + (mgr.display_name || 'Manager') + '</span>';
      });
      breadcrumbsHtml += ' <span>&rsaquo;</span> <span class="org-tree-breadcrumb-current">' + (focused.display_name || 'Employee') + '</span></div>';

      let toolbarHtml = '<div class="org-tree-toolbar">' +
        breadcrumbsHtml +
        '<div class="org-search-wrap">' +
          '<div class="org-search-input-box">' +
            '<span style="color: var(--forge-text-muted); font-size: 0.75rem;">🔍</span>' +
            '<input type="search" id="org-chart-search-input" class="org-search-input" placeholder="Search member to focus..." oninput="filterOrgChartSearch(this.value)" onfocus="filterOrgChartSearch(this.value)" autocomplete="off" />' +
          '</div>' +
          '<button class="astryx-btn btn-primary" style="font-size: 0.72rem; padding: 0.22rem 0.6rem; height: 26px;" onclick="focusOrgChartSearch()">🔍 Search</button>' +
          '<button class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.22rem 0.55rem; height: 26px;" onclick="resetOrgChartTransform()">⛶ Center</button>' +
          '<div id="org-chart-search-results" class="org-search-dropdown" style="display: none;"></div>' +
        '</div>' +
      '</div>';

      // =========================================================================
      // 1. UPWARD MANAGER SECTION (SMALL BUTTON & CARD)
      // =========================================================================
      let upwardHtml = '';
      if (directManager) {
        const mgrInitials = (directManager.display_name || 'MG').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const mgrStatusColor = directManager.status === 'ACTIVE' ? 'var(--forge-success)' : directManager.status === 'INVITED' ? 'var(--forge-accent)' : 'var(--forge-text-muted)';
        
        upwardHtml = '<div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 0.15rem;">' +
          '<button class="org-tree-up-nav-btn" onclick="setOrgFocus(\\\'' + directManager.id + '\\\')" title="Move up to direct manager">' +
            '<span>▲</span> Reports to: ' + (directManager.display_name || 'Manager') +
          '</button>' +
          '<div class="org-tree-manager-node" onclick="setOrgFocus(\\\'' + directManager.id + '\\\')" title="Click to focus manager in org chart">' +
            '<div class="org-tree-hero-avatar-wrap">' +
              '<div class="emp-avatar" style="width: 42px; height: 42px; font-size: 0.85rem;">' + mgrInitials + '</div>' +
              '<span class="org-tree-hero-status-dot" style="background: ' + mgrStatusColor + '; width: 9px; height: 9px;"></span>' +
            '</div>' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="font-size: 0.68rem; font-weight: 700; color: var(--forge-primary); text-transform: uppercase; letter-spacing: 0.04em;">Reporting Line Manager</div>' +
              '<div style="font-weight: 700; color: var(--forge-text-main); font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (directManager.display_name || 'Manager') + '</div>' +
              '<div style="font-size: 0.74rem; color: var(--forge-text-muted);">' + (directManager.job_title || 'Manager') + ' &bull; 🏢 ' + (directManager.department_name || 'Org') + '</div>' +
            '</div>' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; flex-shrink: 0; color: var(--forge-primary); border-color: var(--forge-primary);">↑ Focus</button>' +
          '</div>' +
          '<div class="org-tree-connector-vertical"></div>' +
        '</div>';
      } else {
        upwardHtml = '<div style="margin-bottom: 0.85rem;"><span class="astryx-badge" style="background: var(--forge-bg-elevated); color: var(--forge-primary); border-color: var(--forge-border-medium); font-size: 0.72rem; padding: 0.25rem 0.65rem;">👑 Top Executive / Organization Root</span></div>';
      }

      // =========================================================================
      // 2. FOCUSED HERO PERSON CARD (ASTRYX STYLE)
      // =========================================================================
      const heroInitials = (focused.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const heroStatusColor = focused.status === 'ACTIVE' ? 'var(--forge-success)' : focused.status === 'INVITED' ? 'var(--forge-accent)' : 'var(--forge-text-muted)';
      const heroRoles = (focused.roles || ['roles/employee']).map(r => '<span class="astryx-badge">' + r.replace('roles/', '') + '</span>').join(' ');

      // Peer navigation pills if siblings exist
      let peersNavHtml = '';
      if (peers.length > 0) {
        peersNavHtml = '<div style="display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem; font-size: 0.72rem; color: var(--forge-text-muted);">' +
          '<span>Peers (' + peers.length + '):</span>' +
          peers.slice(0, 3).map(p => '<button class="emp-dept-chip" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;" onclick="setOrgFocus(\\\'' + p.id + '\\\')">' + (p.display_name || '').split(' ')[0] + '</button>').join('') +
          (peers.length > 3 ? '<span style="font-size: 0.68rem;">+' + (peers.length - 3) + ' more</span>' : '') +
        '</div>';
      }

      const heroCardHtml = '<div class="org-tree-hero-card">' +
        '<div class="org-tree-hero-header">' +
          '<div class="org-tree-hero-avatar-wrap">' +
            '<div class="org-tree-hero-avatar">' + heroInitials + '</div>' +
            '<span class="org-tree-hero-status-dot" style="background: ' + heroStatusColor + ';"></span>' +
          '</div>' +
          '<div style="flex: 1; min-width: 0;">' +
            '<div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.15rem;">' +
              '<span class="status-badge" style="background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-border-medium); font-size: 0.64rem; padding: 0.05rem 0.35rem;"><span class="status-pulse-dot active" style="margin-right: 3px;"></span>FOCUSED</span>' +
              heroRoles +
            '</div>' +
            '<div class="org-tree-hero-name">' + (focused.display_name || 'Unnamed Employee') + '</div>' +
            '<div class="org-tree-hero-title">' + (focused.job_title || 'Employee') + '</div>' +
            '<div class="org-tree-hero-meta">' +
              '<span>🏢 ' + (focused.department_name || 'Unassigned Department') + '</span>' +
              '<span>✉️ <code>' + (focused.email || 'N/A') + '</code></span>' +
              (focused.employee_code ? '<span>🏷️ Code: <code>' + focused.employee_code + '</code></span>' : '') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="org-tree-hero-actions">' +
          peersNavHtml +
          '<div style="display: flex; gap: 0.35rem; margin-left: auto;">' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.22rem 0.55rem;" onclick="openEmployeeDrawer(\\\'' + focused.id + '\\\')">👤 Profile Drawer</button>' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.22rem 0.55rem;" onclick="openEditEmployeeModal(\\\'' + focused.id + '\\\')">✏️ Edit Profile</button>' +
            '<button class="astryx-btn btn-primary" style="font-size: 0.72rem; padding: 0.22rem 0.55rem;" onclick="openAddReportModal(\\\'' + focused.id + '\\\')">➕ Add Report</button>' +
          '</div>' +
        '</div>' +
      '</div>';

      // =========================================================================
      // 3. DOWNSIDE DIRECT REPORTS (BRANCH GRID WITH SMALL BUTTONS)
      // =========================================================================
      let reportsSectionHtml = '';
      if (directReports.length > 0) {
        const reportCardsHtml = directReports.map(rep => {
          const repInitials = (rep.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const subReportsCount = items.filter(i => i.manager_id === rep.id).length;
          const repStatusColor = rep.status === 'ACTIVE' ? 'var(--forge-success)' : rep.status === 'INVITED' ? 'var(--forge-accent)' : 'var(--forge-text-muted)';

          return '<div class="org-tree-report-card" onclick="setOrgFocus(\\\'' + rep.id + '\\\')" title="Focus ' + (rep.display_name || 'employee') + ' in org chart">' +
            '<div class="org-tree-report-header">' +
              '<div class="org-tree-hero-avatar-wrap">' +
                '<div class="emp-avatar">' + repInitials + '</div>' +
                '<span class="org-tree-hero-status-dot" style="background: ' + repStatusColor + '; width: 8px; height: 8px;"></span>' +
              '</div>' +
              '<div style="flex: 1; min-width: 0;">' +
                '<div class="org-tree-report-name">' + (rep.display_name || 'Unnamed') + '</div>' +
                '<div class="org-tree-report-title">' + (rep.job_title || 'Employee') + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="org-tree-report-footer">' +
              '<span style="color: var(--forge-text-muted); font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">🏢 ' + (rep.department_name || 'Dept') + '</span>' +
              '<div style="display: flex; gap: 0.25rem; align-items: center;">' +
                (subReportsCount > 0
                  ? '<button class="astryx-btn btn-outline" style="font-size: 0.68rem; padding: 0.12rem 0.45rem; color: var(--forge-primary); border-color: var(--forge-primary);" onclick="event.stopPropagation(); setOrgFocus(\\\'' + rep.id + '\\\')">👥 ' + subReportsCount + ' Reports ↓</button>'
                  : '<span style="color: var(--forge-text-muted); font-size: 0.68rem;">Individual</span>') +
                '<button class="astryx-btn btn-outline" style="font-size: 0.68rem; padding: 0.12rem 0.45rem;" onclick="event.stopPropagation(); setOrgFocus(\\\'' + rep.id + '\\\')">↓ Focus</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');

        reportsSectionHtml = '<div class="org-tree-connector-vertical"></div>' +
          '<div class="org-tree-reports-section">' +
            '<div class="org-tree-branch-header"><span>👥 Direct Reports</span> <span class="astryx-badge" style="background: var(--forge-primary-bg); color: var(--forge-primary);">' + directReports.length + '</span></div>' +
            '<div class="org-tree-reports-grid">' + reportCardsHtml + '</div>' +
          '</div>';
      } else {
        reportsSectionHtml = '<div style="margin-top: 1.25rem; text-align: center; color: var(--forge-text-muted); font-size: 0.8rem; background: var(--forge-bg-card); padding: 1rem 1.5rem; border-radius: var(--forge-radius-md); border: 1px dashed var(--forge-border);">' +
          '<div>Individual Contributor &bull; 0 Direct Reports under ' + (focused.display_name || 'this member') + '.</div>' +
          '<button class="astryx-btn btn-outline" style="font-size: 0.74rem; margin-top: 0.5rem;" onclick="openAddReportModal(\\\'' + focused.id + '\\\')">➕ Add Direct Report</button>' +
        '</div>';
      }

      // =========================================================================
      // 4. ASSEMBLE ENDLESS CANVAS VIEWPORT & FLOATING CONTROLS
      // =========================================================================
      container.innerHTML = toolbarHtml +
        '<div class="org-chart-wrapper" id="org-chart-viewport">' +
          '<div class="org-chart-canvas" id="org-chart-canvas">' +
            upwardHtml +
            heroCardHtml +
            reportsSectionHtml +
          '</div>' +
          '<div class="org-floating-controls">' +
            '<button class="org-zoom-btn" onclick="zoomOrgChart(0.10)" title="Zoom In (+)">+</button>' +
            '<span class="org-zoom-level" id="org-zoom-level">' + Math.round(orgChartZoom * 100) + '%</span>' +
            '<button class="org-zoom-btn" onclick="zoomOrgChart(-0.10)" title="Zoom Out (−)">−</button>' +
            '<button class="org-zoom-btn" onclick="resetOrgChartTransform()" title="Reset Zoom & Center">⛶</button>' +
          '</div>' +
        '</div>';

      initOrgChartCanvasListeners();
      updateOrgChartTransform();
    }

    function jumpToTopLeader() {
      const items = employeeData.items || [];
      const topLeader = items.find(i => !i.manager_id) || items[0];
      if (topLeader) setOrgFocus(topLeader.id);
    }

    function filterOrgChartSearch(query) {
      const resEl = document.getElementById('org-chart-search-results');
      if (!resEl) return;
      const q = (query || '').toLowerCase().trim();
      const items = employeeData.items || [];
      const matches = q
        ? items.filter(i => (i.display_name && i.display_name.toLowerCase().includes(q)) || (i.email && i.email.toLowerCase().includes(q)) || (i.job_title && i.job_title.toLowerCase().includes(q)) || (i.department_name && i.department_name.toLowerCase().includes(q)))
        : items.slice(0, 8);

      if (matches.length === 0) {
        resEl.innerHTML = '<div style="padding: 0.65rem; font-size: 0.74rem; color: var(--forge-text-muted); text-align: center;">No matching members found</div>';
        resEl.style.display = 'flex';
        return;
      }

      resEl.innerHTML = matches.map(m => {
        const initials = (m.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return '<div class="org-search-item" onclick="setOrgFocus(\\\'' + m.id + '\\\'); closeOrgChartSearch();">' +
          '<div class="emp-avatar" style="width: 26px; height: 26px; font-size: 0.65rem;">' + initials + '</div>' +
          '<div class="org-search-item-info">' +
            '<div class="org-search-item-name">' + (m.display_name || 'Unnamed') + '</div>' +
            '<div class="org-search-item-role">' + (m.job_title || 'Employee') + ' &bull; ' + (m.department_name || 'Dept') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      resEl.style.display = 'flex';
    }

    function closeOrgChartSearch() {
      const resEl = document.getElementById('org-chart-search-results');
      if (resEl) resEl.style.display = 'none';
      const input = document.getElementById('org-chart-search-input');
      if (input) input.value = '';
    }

    function focusOrgChartSearch() {
      const input = document.getElementById('org-chart-search-input');
      if (input) {
        input.focus();
        filterOrgChartSearch(input.value);
      }
    }

    document.addEventListener('click', (e) => {
      const wrap = document.querySelector('.org-search-wrap');
      if (wrap && !wrap.contains(e.target)) {
        const resEl = document.getElementById('org-chart-search-results');
        if (resEl) resEl.style.display = 'none';
      }
    });

    function openAddReportModal(managerId) {
      openAddEmployeeModal();
      const mgrSelect = document.getElementById('emp-form-manager');
      if (mgrSelect) mgrSelect.value = managerId;
    }

    /* Slide-Over Profile Inspector Drawer */
    function openEmployeeDrawer(userId) {
      const emp = (employeeData.items || []).find(i => i.id === userId);
      if (!emp) return;

      activeDrawerEmployee = emp;
      const drawer = document.getElementById('emp-profile-drawer');
      const backdrop = document.getElementById('emp-drawer-backdrop');
      const avatarEl = document.getElementById('drawer-emp-avatar');
      const nameEl = document.getElementById('drawer-emp-name');
      const emailEl = document.getElementById('drawer-emp-email');

      const initials = (emp.display_name || 'EM').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = emp.display_name || 'Unnamed';
      if (emailEl) emailEl.textContent = emp.email;

      switchDrawerTab('overview');
      if (backdrop) backdrop.classList.add('open');
      if (drawer) drawer.classList.add('open');
    }

    function closeEmployeeDrawer() {
      const drawer = document.getElementById('emp-profile-drawer');
      const backdrop = document.getElementById('emp-drawer-backdrop');
      if (backdrop) backdrop.classList.remove('open');
      if (drawer) drawer.classList.remove('open');
    }

    function switchDrawerTab(tab) {
      ['overview', 'roles', 'chain'].forEach(t => {
        const btn = document.getElementById('tab-btn-emp-' + t);
        if (btn) {
          if (t === tab) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });

      const body = document.getElementById('emp-drawer-body');
      if (!body || !activeDrawerEmployee) return;

      const emp = activeDrawerEmployee;

      if (tab === 'overview') {
        body.innerHTML = '<div class="drawer-card">' +
          '<div class="drawer-card-title">Employee Information</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8rem;">' +
            '<div><span style="color: var(--forge-text-muted); font-size: 0.7rem; display: block;">JOB TITLE</span><strong>' + (emp.job_title || 'N/A') + '</strong></div>' +
            '<div><span style="color: var(--forge-text-muted); font-size: 0.7rem; display: block;">EMPLOYEE CODE</span><code>' + (emp.employee_code || 'N/A') + '</code></div>' +
            '<div><span style="color: var(--forge-text-muted); font-size: 0.7rem; display: block;">DEPARTMENT</span><strong>' + (emp.department_name || 'Unassigned') + '</strong></div>' +
            '<div><span style="color: var(--forge-text-muted); font-size: 0.7rem; display: block;">STATUS</span><span class="astryx-badge">' + emp.status + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="drawer-card">' +
          '<div class="drawer-card-title">Quick Actions</div>' +
          '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.75rem;" onclick="openEditEmployeeModal(\\\'' + emp.id + '\\\')">✏️ Edit Details</button>' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.75rem;" onclick="setEmployeeViewMode(\\\'tree\\\'); setOrgFocus(\\\'' + emp.id + '\\\'); closeEmployeeDrawer();">🌳 Focus in Org Chart</button>' +
            '<button class="astryx-btn btn-outline" style="font-size: 0.75rem; color: var(--forge-accent); border-color: var(--forge-border);" onclick="revokeEmployeeSessions(\\\'' + emp.id + '\\\')">🔒 Revoke Sessions</button>' +
          '</div>' +
        '</div>';
      } else if (tab === 'roles') {
        const roles = (emp.roles || ['roles/employee']).map(r => '<div style="background: var(--forge-bg-card); border: 1px solid var(--forge-border); padding: 0.6rem; border-radius: var(--forge-radius-sm); font-size: 0.8rem; margin-bottom: 0.4rem;">🔑 <strong>' + r + '</strong><div style="font-size: 0.7rem; color: var(--forge-text-muted); margin-top: 0.2rem;">Scope: org/* | Resource Condition: (None)</div></div>').join('');
        body.innerHTML = '<div class="drawer-card"><div class="drawer-card-title">IAM Policy Bindings</div>' + roles + '</div>';
      } else if (tab === 'chain') {
        body.innerHTML = '<div class="drawer-card"><div class="drawer-card-title">Hierarchy</div>' +
          '<div style="font-size: 0.8rem; color: var(--forge-text-muted); margin-bottom: 0.5rem;">Direct Manager: <strong>' + (emp.manager_name || 'None') + '</strong></div>' +
          '<button class="astryx-btn btn-outline" style="font-size: 0.75rem;" onclick="openHierarchyModal(\\\'' + emp.id + '\\\')">Explore Management Chain</button>' +
        '</div>';
      }
    }
  `;
}
