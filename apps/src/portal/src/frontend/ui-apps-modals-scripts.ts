/**
 * @forge/portal - App Governance & Request Details Modals Scripts (2026 LTS)
 * Handles "Who Will Approve It" inspection and Application Details modal.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001] [LLR-UI-003]
 */

export function getAppsModalsScript(): string {
  return `
    function renderAdminCards(admins) {
      if (!admins || !admins.length) {
        return '<div style="font-size: 0.76rem; color: var(--forge-text-muted); font-style: italic; padding: 0.35rem 0;">No specific admins registered; routed to Workspace System Administrators.</div>';
      }
      return admins.map(function(adm) {
        var safeName = escapeHtml(adm.name);
        var safeTitle = escapeHtml(adm.title || 'App Administrator');
        var safeEmail = escapeHtml(adm.email || '');
        var safeRole = escapeHtml(adm.roleTag || 'App Admin');
        var initial = escapeHtml(adm.avatarInitial || safeName.slice(0, 2).toUpperCase());
        return '<div class="app-admin-card">' +
          '<div class="app-admin-avatar">' + initial + '</div>' +
          '<div class="app-admin-meta">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">' +
              '<span class="app-admin-name">' + safeName + '</span>' +
              '<span class="app-admin-badge">' + safeRole + '</span>' +
            '</div>' +
            '<span class="app-admin-title">' + safeTitle + (safeEmail ? ' · <span class="app-admin-email-link">' + safeEmail + '</span>' : '') + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    // ── Request Details & "Who Will Approve It" Modal ──
    function initRequestDetailsModal() {
      var modal = document.getElementById('modal-request-details');
      if (!modal) return;

      var appNameElem = document.getElementById('req-detail-app-name');
      var statusBadge = document.getElementById('req-detail-status-badge');
      var deptElem = document.getElementById('req-detail-approver-dept');
      var approversList = document.getElementById('req-detail-approvers-list');
      var reasonTypeElem = document.getElementById('req-detail-reason-type');
      var userElem = document.getElementById('req-detail-user');
      var dateElem = document.getElementById('req-detail-date');
      var notesBox = document.getElementById('req-detail-notes-box');
      var cancelActionBtn = document.getElementById('req-detail-cancel-action');

      document.addEventListener('click', function(e) {
        var btn = e.target.closest('.view-req-details-btn');
        if (!btn) return;
        e.preventDefault();

        var reqId = btn.getAttribute('data-req-id');
        var req = activeRequests.find(function(r) { return r.id === reqId; });
        if (!req) return;

        var targetApp = findAppById(req.appId);
        var deptName = targetApp ? (targetApp.departmentOwner || targetApp.category + ' Team') : 'Department Leads & Security Ops';
        var admins = targetApp && targetApp.admins ? targetApp.admins : [];

        if (appNameElem) appNameElem.textContent = req.appName || 'Application';
        if (deptElem) deptElem.textContent = deptName;
        if (approversList) approversList.innerHTML = renderAdminCards(admins);

        if (req.appId) {
          fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(req.appId) + '/governance')
            .then(function(res) { return res.ok ? res.json() : null; })
            .then(function(json) {
              if (json && json.data && json.data.admins && json.data.admins.length > 0) {
                var mapped = json.data.admins.map(function(a) {
                  return {
                    name: a.userName,
                    title: a.userTitle,
                    email: a.userEmail,
                    roleTag: a.roleType === 'PRIMARY_OWNER' ? 'Primary Owner' : 'App Admin',
                    avatarInitial: a.avatarInitial
                  };
                });
                if (approversList) approversList.innerHTML = renderAdminCards(mapped);
              }
            }).catch(function() {});
        }
        if (reasonTypeElem) reasonTypeElem.textContent = req.reasonType;
        if (userElem) userElem.textContent = req.userEmail || 'You (Authenticated Member)';
        if (dateElem) {
          var d = new Date(req.createdAt || Date.now());
          dateElem.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        if (notesBox) {
          notesBox.textContent = req.notes && req.notes.trim().length > 0 ? req.notes : 'No additional project notes provided with this request.';
        }

        if (statusBadge) {
          if (req.status === 'PENDING') {
            statusBadge.className = 'astryx-badge badge-warning';
            statusBadge.textContent = 'Pending Review';
          } else if (req.status === 'APPROVED') {
            statusBadge.className = 'astryx-badge badge-online';
            statusBadge.textContent = 'Approved';
          } else {
            statusBadge.className = 'astryx-badge';
            statusBadge.style.background = 'var(--forge-error-bg)';
            statusBadge.style.color = 'var(--forge-error)';
            statusBadge.textContent = 'Declined';
          }
        }

        if (cancelActionBtn) {
          if (req.status === 'PENDING') {
            cancelActionBtn.style.display = 'inline-flex';
            cancelActionBtn.setAttribute('data-req-id', req.id);
            cancelActionBtn.className = 'astryx-btn btn-outline cancel-user-req-btn';
          } else {
            cancelActionBtn.style.display = 'none';
          }
        }

        modal.classList.add('active', 'open');
        modal.setAttribute('aria-hidden', 'false');
      });
    }

    // ── App Details Inspection Modal with Real Admins ──
    function initAppDetailsModal() {
      document.addEventListener('click', function(e) {
        var infoBtn = e.target.closest('.open-app-info-btn');
        if (!infoBtn) return;
        e.preventDefault();

        var modal = document.getElementById('modal-app-details');
        if (!modal) return;

        var card = infoBtn.closest('.app-card-item, .marketplace-card-item');
        var appId = infoBtn.getAttribute('data-info-id') || (card ? card.getAttribute('data-app-id') : null);
        var app = findAppById(appId);

        var title = card ? card.querySelector('.app-card-title, .market-card-title') : null;
        var desc = card ? card.querySelector('.app-card-desc, .market-card-desc') : null;
        var dept = app ? app.departmentOwner : (card ? card.getAttribute('data-category') : 'Platform Workspace');
        var tags = app && app.tags ? app.tags.join(' ') : (card ? card.getAttribute('data-tags') || '' : '');
        var launchLink = card ? card.querySelector('.app-launch-action') : null;

        var dTitle = document.getElementById('app-details-title');
        var dDept = document.getElementById('app-details-dept');
        var dDesc = document.getElementById('app-details-desc');
        var dTags = document.getElementById('app-details-tags');
        var dApprovalType = document.getElementById('app-details-approval-type');
        var dAdminsList = document.getElementById('app-details-admins-list');
        var dActionBtn = document.getElementById('app-details-action-btn');

        if (dTitle) dTitle.textContent = (app ? app.name : (title ? title.textContent.trim() : 'Application Details'));
        if (dDept) dDept.textContent = dept || 'Internal Workspace';
        if (dDesc) dDesc.textContent = (app ? app.description : (desc ? desc.textContent.trim() : ''));
        if (dTags) {
          var tagArr = tags.split(' ').filter(Boolean);
          dTags.innerHTML = tagArr.map(function(t) {
            return '<span class="app-tag-pill">' + escapeHtml(t) + '</span>';
          }).join('');
        }

        if (dApprovalType) {
          var apprv = app ? (app.approvalType || (app.isRestricted ? 'Admin Approval Required' : 'Open Access')) : 'Standard Policy';
          dApprovalType.textContent = apprv;
        }

        if (dAdminsList) {
          var admins = app && app.admins ? app.admins : [];
          dAdminsList.innerHTML = renderAdminCards(admins);

          if (appId) {
            fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(appId) + '/governance')
              .then(function(res) { return res.ok ? res.json() : null; })
              .then(function(json) {
                if (json && json.data && json.data.admins && json.data.admins.length > 0) {
                  var mapped = json.data.admins.map(function(a) {
                    return {
                      name: a.userName,
                      title: a.userTitle,
                      email: a.userEmail,
                      roleTag: a.roleType === 'PRIMARY_OWNER' ? 'Primary Owner' : 'App Admin',
                      avatarInitial: a.avatarInitial
                    };
                  });
                  if (dAdminsList) dAdminsList.innerHTML = renderAdminCards(mapped);
                }
              }).catch(function() {});
          }
        }

        if (dActionBtn) {
          var href = app ? app.ingressPath : (launchLink ? launchLink.getAttribute('href') : null);
          if (href && (!app || !app.isRestricted)) {
            dActionBtn.textContent = 'Open Application';
            dActionBtn.setAttribute('href', href);
            dActionBtn.setAttribute('target', '_blank');
            dActionBtn.setAttribute('rel', 'noopener noreferrer');
            dActionBtn.style.display = 'inline-flex';
          } else {
            dActionBtn.style.display = 'none';
          }
        }

        modal.classList.add('active', 'open');
        modal.setAttribute('aria-hidden', 'false');
      });
    }
  `;
}
