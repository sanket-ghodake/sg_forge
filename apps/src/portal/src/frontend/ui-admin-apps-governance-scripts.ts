/**
 * @forge/portal - Application Governance Client Scripts (2026 LTS)
 * Client-side event controller for managing App Admins, Policies, and Ingress Routing.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { getAppUsersGovernanceScript } from './ui-admin-apps-users-scripts';

/**
 * getAppGovernanceClientScript
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getAppGovernanceClientScript(): string {
  return `
    (function() {
      var currentAppId = null;
      var cachedGovData = null;
      var cachedMembers = [];

      function getApiPrefix() {
        return window.location.pathname.startsWith('/portal') ? '/portal' : '';
      }

      function escapeHtml(str) {
        return (str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      // ── Tab Navigation ──
      var tabBtns = document.querySelectorAll('.gov-tab-btn');
      tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var target = btn.getAttribute('data-target');
          tabBtns.forEach(function(b) {
            b.classList.remove('active');
            b.style.color = 'var(--forge-text-muted)';
            b.style.borderBottomColor = 'transparent';
          });
          btn.classList.add('active');
          btn.style.color = 'var(--forge-primary)';
          btn.style.borderBottomColor = 'var(--forge-primary)';

          var panels = document.querySelectorAll('.gov-tab-panel');
          panels.forEach(function(p) {
            p.style.display = 'none';
            p.classList.remove('active');
          });

          var activePanel = document.getElementById(target);
          if (activePanel) {
            activePanel.style.display = 'block';
            activePanel.classList.add('active');
          }
          if (target === 'gov-tab-metrics' && currentAppId) {
            loadAppActiveUsers(currentAppId);
          }
        });
      });

      function closeGovernanceModal() {
        var modal = document.getElementById('modal-app-governance');
        if (!modal) return;
        modal.classList.remove('active', 'open');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }

      var closeBtn = document.getElementById('close-app-gov-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          closeGovernanceModal();
        });
      }

      document.addEventListener('click', function(e) {
        var modal = document.getElementById('modal-app-governance');
        if (modal && e.target === modal) {
          closeGovernanceModal();
        }
        var dataClose = e.target.closest('[data-close-modal="modal-app-governance"]');
        if (dataClose) {
          e.preventDefault();
          closeGovernanceModal();
        }
      });

      // ── Pre-fetch Directory Members for Autocomplete ──
      async function loadDirectoryMembers() {
        if (cachedMembers.length > 0) return;
        try {
          var res = await fetch(getApiPrefix() + '/api/v1/portal/members');
          if (res.ok) {
            var json = await res.json();
            cachedMembers = json.data || [];
          }
        } catch(e) {}
      }

      // ── Render Admins Roster ──
      function renderAdminsRoster(admins) {
        var container = document.getElementById('app-gov-admins-list');
        var pill = document.getElementById('gov-admins-count-pill');
        if (pill) pill.textContent = (admins || []).length;
        if (!container) return;

        if (!admins || admins.length === 0) {
          container.innerHTML = '<div style="text-align:center; padding:1.5rem; color:var(--forge-text-muted);">No designated administrators. Workspace Super Admins act as default approvers.</div>';
          return;
        }

        var isOnlyOne = admins.length <= 1;

        container.innerHTML = admins.map(function(adm) {
          var safeName = escapeHtml(adm.userName || adm.name);
          var safeTitle = escapeHtml(adm.userTitle || adm.title || 'App Administrator');
          var safeDept = escapeHtml(adm.userDept || adm.department || 'Enterprise');
          var safeEmail = escapeHtml(adm.userEmail || adm.email);
          var safeInit = escapeHtml(adm.avatarInitial || 'AD');
          var roleTag = adm.roleType === 'PRIMARY_OWNER' ? 'Primary Owner' : (adm.roleType === 'APPROVER' ? 'Approver' : 'App Admin');
          var badgeStyle = adm.roleType === 'PRIMARY_OWNER' ? 'background:var(--forge-primary-bg); color:var(--forge-primary); border:1px solid var(--forge-border);' : 'background:var(--forge-success-bg); color:var(--forge-success); border:1px solid var(--forge-border);';

          var revokeBtnHtml = isOnlyOne
            ? '<button type="button" class="astryx-btn btn-sm btn-ghost" disabled style="opacity:0.4; cursor:not-allowed; font-size:0.75rem;" data-astryx-tooltip="At least one administrator required">Protected</button>'
            : '<button type="button" class="astryx-btn btn-sm btn-ghost btn-revoke-admin" data-user-id="' + escapeHtml(adm.userId || adm.email) + '" data-user-name="' + safeName + '" style="color:var(--forge-error); font-size:0.75rem;">Revoke</button>';

          return '<div class="app-admin-card" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">' +
            '<div style="display:flex; align-items:center; gap:0.85rem;">' +
              '<div class="app-admin-avatar" style="width:36px; height:36px; border-radius:50%; background:var(--forge-primary); color:var(--forge-primary-btn-text); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:0.82rem;">' + safeInit + '</div>' +
              '<div>' +
                '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                  '<strong style="font-size:0.86rem; color:var(--forge-text-main);">' + safeName + '</strong>' +
                  '<span class="astryx-badge" style="font-size:0.68rem; padding:0.1rem 0.4rem; ' + badgeStyle + '">' + roleTag + '</span>' +
                '</div>' +
                '<div style="font-size:0.76rem; color:var(--forge-text-muted); margin-top:0.15rem;">' + safeTitle + ' • ' + safeDept + '</div>' +
                '<div style="font-size:0.73rem; color:var(--forge-text-subtle);">' + safeEmail + '</div>' +
              '</div>' +
            '</div>' +
            '<div>' + revokeBtnHtml + '</div>' +
          '</div>';
        }).join('');
      }

      // ── Open & Hydrate Governance Modal ──
      window.openAppGovernanceModal = async function(rawAppId) {
        var cleanAppId = (rawAppId || '').replace(/^\\/apps\\//, '').replace(/^apps\\//, '').trim();
        currentAppId = cleanAppId;

        var modal = document.getElementById('modal-app-governance');
        if (!modal) return;

        modal.classList.add('active', 'open');
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        loadAppActiveUsers(cleanAppId);

        // Pre-populate immediately from local catalog for instantaneous UX
        var apps = window.__PORTAL_APPS__ || [];
        var matched = apps.find(function(a) {
          return a.id === cleanAppId || a.id === ('apps/' + cleanAppId) || a.ingressPath === ('/apps/' + cleanAppId);
        });

        var titleEl = document.getElementById('gov-modal-title');
        var idBadge = document.getElementById('gov-modal-app-id-badge');
        var iconBox = document.getElementById('gov-modal-icon');

        if (titleEl) titleEl.textContent = matched ? matched.name : ('Application • ' + cleanAppId.toUpperCase());
        if (idBadge) idBadge.textContent = cleanAppId;
        if (iconBox && matched && matched.iconSvg) iconBox.innerHTML = matched.iconSvg;

        if (matched && matched.admins && matched.admins.length > 0) {
          renderAdminsRoster(matched.admins.map(function(a) {
            return {
              userId: a.email,
              userName: a.name,
              userTitle: a.title,
              userDept: matched.departmentOwner || 'Enterprise',
              userEmail: a.email,
              roleType: a.roleTag && a.roleTag.includes('Owner') ? 'PRIMARY_OWNER' : 'ADMIN',
              avatarInitial: a.avatarInitial
            };
          }));
        }

        loadDirectoryMembers();

        var user = window.__PORTAL_USER__ || {};
        var userRoles = user.roles || [];
        var isSuperAdmin = userRoles.some(function(r) { return r.includes('super_admin'); });

        var privBadge = document.getElementById('gov-role-privilege-badge');
        if (privBadge) {
          privBadge.textContent = isSuperAdmin ? 'Super Admin Privilege' : 'Department Admin Privilege';
          privBadge.className = isSuperAdmin ? 'astryx-badge badge-warning' : 'astryx-badge badge-online';
        }

        var infraAlert = document.getElementById('gov-infra-superadmin-alert');
        var infraSave = document.getElementById('gov-infra-save-container');
        var ingressInput = document.getElementById('gov-infra-ingress-path');
        var portInput = document.getElementById('gov-infra-internal-port');
        var statusSelect = document.getElementById('gov-infra-app-status');

        if (!isSuperAdmin) {
          if (infraAlert) infraAlert.innerHTML = '<div style="font-size:0.78rem; color:var(--forge-text-muted);">Routing & Port settings are read-only. Modifying infrastructure requires Super Admin authorization.</div>';
          if (ingressInput) ingressInput.disabled = true;
          if (portInput) portInput.disabled = true;
          if (statusSelect) statusSelect.disabled = true;
          if (infraSave) infraSave.style.display = 'none';
        } else {
          if (ingressInput) ingressInput.disabled = false;
          if (portInput) portInput.disabled = false;
          if (statusSelect) statusSelect.disabled = false;
          if (infraSave) infraSave.style.display = 'flex';
        }

        // Live backend hydration
        try {
          var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(cleanAppId) + '/governance');
          if (res.ok) {
            var json = await res.json();
            cachedGovData = json.data;
            var gov = cachedGovData;

            if (titleEl) titleEl.textContent = (matched ? matched.name : (gov.policy.departmentOwner || 'App')) + ' • ' + cleanAppId.toUpperCase();
            if (idBadge) idBadge.textContent = cleanAppId;

            renderAdminsRoster(gov.admins);

            // Policy tab
            var modeRadios = document.querySelectorAll('input[name="gov-access-mode"]');
            modeRadios.forEach(function(r) {
              r.checked = (r.value === gov.policy.accessMode);
            });
            var deptInput = document.getElementById('gov-policy-dept-owner');
            if (deptInput) deptInput.value = gov.policy.departmentOwner || (matched ? matched.departmentOwner : '');
            var roleInput = document.getElementById('gov-policy-req-role');
            if (roleInput) roleInput.value = gov.policy.requiredRole || (matched ? matched.requiredRole : '');
            var slaSelect = document.getElementById('gov-policy-sla-hours');
            if (slaSelect) slaSelect.value = String(gov.policy.slaHours || 24);
            var reqNotes = document.getElementById('gov-policy-require-notes');
            if (reqNotes) reqNotes.checked = Boolean(gov.policy.requireJustification);

            // Infra tab
            if (ingressInput) ingressInput.value = gov.policy.ingressPath || (matched ? matched.ingressPath : ('/apps/' + cleanAppId));
            if (portInput) portInput.value = gov.policy.internalPort || (matched ? matched.port : 3000);
            if (statusSelect) statusSelect.value = gov.policy.status || 'ONLINE';

            // Metrics tab
            var metricUsers = document.getElementById('gov-metric-users');
            if (metricUsers) metricUsers.textContent = gov.metrics.activeUsersCount;
            var metricPending = document.getElementById('gov-metric-pending');
            if (metricPending) metricPending.textContent = gov.metrics.pendingRequestsCount;
            var metricSla = document.getElementById('gov-metric-sla');
            if (metricSla && gov.metrics.slaCompliancePct !== undefined) {
              metricSla.textContent = gov.metrics.slaCompliancePct + '%';
            }
          }
        } catch(err) {
          console.warn('Backend governance hydration note:', err);
        }
      };

      // ── Global Event Delegation for Gear Icon (App Store) ──
      document.addEventListener('click', function(e) {
        var editBtn = e.target.closest('.edit-app-policy-btn');
        if (editBtn) {
          e.preventDefault();
          e.stopPropagation();
          var appId = editBtn.getAttribute('data-id');
          if (appId && window.openAppGovernanceModal) {
            window.openAppGovernanceModal(appId);
          }
        }
      });

      // ── Member Autocomplete Search ──
      var searchInput = document.getElementById('gov-add-member-search');
      var resultsDropdown = document.getElementById('gov-member-search-results');

      if (searchInput && resultsDropdown) {
        searchInput.addEventListener('input', function() {
          var query = (searchInput.value || '').trim().toLowerCase();
          if (query.length < 1) {
            resultsDropdown.style.display = 'none';
            return;
          }
          var matches = cachedMembers.filter(function(m) {
            return (m.name || '').toLowerCase().includes(query) || (m.email || '').toLowerCase().includes(query);
          }).slice(0, 6);

          if (matches.length === 0) {
            resultsDropdown.innerHTML = '<div style="padding:0.6rem 0.8rem; font-size:0.75rem; color:var(--forge-text-muted);">No matching employees</div>';
            resultsDropdown.style.display = 'block';
            return;
          }

          resultsDropdown.innerHTML = matches.map(function(m) {
            return '<div class="gov-search-item" data-id="' + escapeHtml(m.id) + '" data-name="' + escapeHtml(m.name) + '" data-email="' + escapeHtml(m.email) + '" data-title="' + escapeHtml(m.jobTitle) + '" data-dept="' + escapeHtml(m.department) + '" style="padding:0.6rem 0.85rem; cursor:pointer; border-bottom:1px solid var(--forge-border);">' +
              '<div style="font-weight:600; font-size:0.8rem; color:var(--forge-text-main);">' + escapeHtml(m.name) + '</div>' +
              '<div style="font-size:0.72rem; color:var(--forge-text-muted);">' + escapeHtml(m.jobTitle) + ' • ' + escapeHtml(m.email) + '</div>' +
            '</div>';
          }).join('');
          resultsDropdown.style.display = 'block';
        });

        resultsDropdown.addEventListener('click', function(e) {
          var item = e.target.closest('.gov-search-item');
          if (item) {
            var userId = item.getAttribute('data-id');
            var userName = item.getAttribute('data-name');
            var userEmail = item.getAttribute('data-email');
            var userTitle = item.getAttribute('data-title');
            var userDept = item.getAttribute('data-dept');

            searchInput.value = userName + ' (' + userEmail + ')';
            document.getElementById('gov-selected-user-id').value = userId;
            document.getElementById('gov-selected-user-name').value = userName;
            document.getElementById('gov-selected-user-email').value = userEmail;
            document.getElementById('gov-selected-user-title').value = userTitle;
            document.getElementById('gov-selected-user-dept').value = userDept;
            resultsDropdown.style.display = 'none';
          }
        });
      }

      // ── Assign Administrator ──
      var assignBtn = document.getElementById('btn-assign-gov-admin');
      if (assignBtn) {
        assignBtn.addEventListener('click', async function() {
          var userId = document.getElementById('gov-selected-user-id').value;
          var userName = document.getElementById('gov-selected-user-name').value;
          var userEmail = document.getElementById('gov-selected-user-email').value;
          var userTitle = document.getElementById('gov-selected-user-title').value;
          var userDept = document.getElementById('gov-selected-user-dept').value;
          var roleType = document.getElementById('gov-add-role-type').value;

          if (!userId || !userName || !userEmail) {
            if (window.astryxToast) window.astryxToast('Please search and select an employee first', 'warning');
            return;
          }

          assignBtn.disabled = true;
          assignBtn.textContent = 'Appointing...';

          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(currentAppId) + '/admins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userId, userName: userName, userEmail: userEmail, userTitle: userTitle, userDept: userDept, roleType: roleType })
            });
            var json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to appoint admin');

            if (window.astryxToast) window.astryxToast('Successfully appointed ' + userName + ' as App Admin', 'success');
            searchInput.value = '';
            document.getElementById('gov-selected-user-id').value = '';

            window.openAppGovernanceModal(currentAppId);
          } catch(err) {
            if (window.astryxToast) window.astryxToast(err.message, 'error');
          } finally {
            assignBtn.disabled = false;
            assignBtn.textContent = '+ Appoint Admin';
          }
        });
      }

      // ── Revoke Administrator ──
      document.addEventListener('click', async function(e) {
        var revokeBtn = e.target.closest('.btn-revoke-admin');
        if (revokeBtn) {
          var targetUserId = revokeBtn.getAttribute('data-user-id');
          var targetUserName = revokeBtn.getAttribute('data-user-name') || 'this administrator';

          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(currentAppId) + '/admins/' + encodeURIComponent(targetUserId), {
              method: 'DELETE'
            });
            var json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to revoke admin');

            if (window.astryxToast) window.astryxToast('Revoked admin rights for ' + targetUserName, 'info');
            window.openAppGovernanceModal(currentAppId);
          } catch(err) {
            if (window.astryxToast) window.astryxToast(err.message, 'error');
          }
        }
      });

      // ── Save Policy ──
      var savePolicyBtn = document.getElementById('btn-save-gov-policy');
      if (savePolicyBtn) {
        savePolicyBtn.addEventListener('click', async function() {
          var modeRadio = document.querySelector('input[name="gov-access-mode"]:checked');
          var accessMode = modeRadio ? modeRadio.value : 'REQUEST_REQUIRED';
          var deptOwner = (document.getElementById('gov-policy-dept-owner').value || '').trim();
          var reqRole = (document.getElementById('gov-policy-req-role').value || '').trim();
          var slaHours = Number(document.getElementById('gov-policy-sla-hours').value || 24);
          var requireNotes = document.getElementById('gov-policy-require-notes').checked;

          savePolicyBtn.disabled = true;
          savePolicyBtn.textContent = 'Saving Policy...';

          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(currentAppId) + '/policy', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessMode: accessMode, departmentOwner: deptOwner, requiredRole: reqRole, slaHours: slaHours, requireJustification: requireNotes })
            });
            var json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save policy');

            if (window.astryxToast) window.astryxToast('Access policy saved successfully', 'success');
          } catch(err) {
            if (window.astryxToast) window.astryxToast(err.message, 'error');
          } finally {
            savePolicyBtn.disabled = false;
            savePolicyBtn.textContent = 'Save Access Policy';
          }
        });
      }

      // ── Save Infrastructure (Super Admin) ──
      var saveInfraBtn = document.getElementById('btn-save-gov-infra');
      if (saveInfraBtn) {
        saveInfraBtn.addEventListener('click', async function() {
          var ingressPath = (document.getElementById('gov-infra-ingress-path').value || '').trim();
          var internalPort = Number(document.getElementById('gov-infra-internal-port').value || 3000);
          var status = document.getElementById('gov-infra-app-status').value;

          saveInfraBtn.disabled = true;
          saveInfraBtn.textContent = 'Updating...';

          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(currentAppId) + '/policy', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ingressPath: ingressPath, internalPort: internalPort, status: status })
            });
            var json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to update infrastructure');

            if (window.astryxToast) window.astryxToast('Gateway routing updated successfully', 'success');
          } catch(err) {
            if (window.astryxToast) window.astryxToast(err.message, 'error');
          } finally {
            saveInfraBtn.disabled = false;
            saveInfraBtn.textContent = 'Update Infrastructure Routing';
          }
        });
      }

      // ── Shortcut Jump to Requests ──
      var jumpBtn = document.getElementById('gov-jump-to-requests-btn');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', function() {
          closeGovernanceModal();
          var navLink = document.querySelector('[data-view="admin-requests"]');
          if (navLink) navLink.click();
        });
      }

      ${getAppUsersGovernanceScript()}
    })();
  `;
}
