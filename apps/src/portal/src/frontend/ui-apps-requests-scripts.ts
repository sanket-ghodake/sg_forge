/**
 * @forge/portal - Access Requests & App Details Inspection Controller (2026 LTS)
 * Handles user access request history, "Who Will Approve It" governance modals,
 * app administrators inspection, and real-time cancellation.
 */

/**
 * getAppsRequestsScript
 * @requirements [HLR-PORTAL-201] [LLR-UI-001] [LLR-UI-003]
 */
export function getAppsRequestsScript(): string {
  return `
    // ── Persistent Access Requests & Approver Governance Engine ──
    var activeRequests = [];

    function findAppById(appId) {
      if (!window.__PORTAL_APPS__ || !Array.isArray(window.__PORTAL_APPS__)) return null;
      for (var i = 0; i < window.__PORTAL_APPS__.length; i++) {
        if (window.__PORTAL_APPS__[i].id === appId) return window.__PORTAL_APPS__[i];
      }
      return null;
    }

    function renderAdminCards(admins) {
      if (!admins || !admins.length) {
        return '<div style="font-size: 0.76rem; color: var(--forge-text-muted); font-style: italic; padding: 0.35rem 0;">No specific admins registered; routed to Workspace System Administrators.</div>';
      }
      return admins.map(function(adm) {
        var safeName = escapeHtml(adm.name);
        var safeTitle = escapeHtml(adm.title);
        var safeEmail = escapeHtml(adm.email);
        var safeRole = escapeHtml(adm.roleTag || 'App Admin');
        var initial = escapeHtml(adm.avatarInitial || safeName.slice(0, 2).toUpperCase());
        return '<div class="app-admin-card">' +
          '<div class="app-admin-avatar">' + initial + '</div>' +
          '<div class="app-admin-meta">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">' +
              '<span class="app-admin-name">' + safeName + '</span>' +
              '<span class="app-admin-badge">' + safeRole + '</span>' +
            '</div>' +
            '<span class="app-admin-title">' + safeTitle + ' · <span class="app-admin-email-link">' + safeEmail + '</span></span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var currentReqFilter = 'ALL';

    function reconcileMarketplaceCards() {
      var slots = document.querySelectorAll('.market-actions-slot');
      slots.forEach(function(slot) {
        var appId = slot.getAttribute('data-app-id');
        if (!appId) return;
        var card = slot.closest('.marketplace-card-item');
        var isRestricted = card && card.getAttribute('data-is-restricted') === 'true';
        var targetApp = findAppById(appId);
        var launchHref = targetApp ? targetApp.ingressPath : '/apps/' + appId;

        var req = activeRequests.find(function(r) { return r.appId === appId; });
        var detailsBtn = '<button class="astryx-btn btn-sm btn-ghost open-app-info-btn" data-info-id="' + escapeHtml(appId) + '">Details</button>';

        if (req && req.status === 'PENDING') {
          slot.innerHTML = detailsBtn +
            '<span class="astryx-badge badge-warning" style="margin-left: 0.25rem;">Requested</span>' +
            '<button class="astryx-btn btn-sm btn-outline view-req-details-btn" data-req-id="' + escapeHtml(req.id) + '">View Request</button>';
        } else if (req && req.status === 'APPROVED') {
          slot.innerHTML = detailsBtn +
            '<span class="astryx-badge badge-online" style="margin-left: 0.25rem;">Approved</span>' +
            '<a href="' + escapeHtml(launchHref) + '" class="astryx-btn btn-sm btn-primary app-launch-action" target="_blank" rel="noopener noreferrer">Launch</a>';
        } else if (req && (req.status === 'REJECTED' || req.status === 'DECLINED')) {
          slot.innerHTML = detailsBtn +
            '<span class="astryx-badge" style="background: var(--forge-error-bg); color: var(--forge-error); margin-left: 0.25rem;">Declined</span>' +
            '<button class="astryx-btn btn-sm btn-primary request-access-btn" data-app-name="' + escapeHtml(targetApp ? targetApp.name : appId) + '" data-app-id="' + escapeHtml(appId) + '" data-approval="' + escapeHtml(targetApp ? (targetApp.approvalType || 'Manager Approval') : 'Manager Approval') + '">Request Access</button>';
        } else if (isRestricted) {
          slot.innerHTML = detailsBtn +
            '<button class="astryx-btn btn-sm btn-primary request-access-btn" data-app-name="' + escapeHtml(targetApp ? targetApp.name : appId) + '" data-app-id="' + escapeHtml(appId) + '" data-approval="' + escapeHtml(targetApp ? (targetApp.approvalType || 'Manager Approval') : 'Manager Approval') + '">Request Access</button>';
        } else {
          slot.innerHTML = detailsBtn +
            '<a href="' + escapeHtml(launchHref) + '" class="astryx-btn btn-sm btn-primary app-launch-action" target="_blank" rel="noopener noreferrer">Launch</a>';
        }
      });
    }

    function reconcileActiveAppsCatalog() {
      var approvedIds = [];
      activeRequests.forEach(function(r) {
        if (r.status === 'APPROVED') {
          var clean = (r.appId || '').replace(/^apps\\//, '');
          if (clean && !approvedIds.includes(clean)) approvedIds.push(clean);
        }
      });
      if (window.__PORTAL_USER__ && Array.isArray(window.__PORTAL_USER__.approvedApps)) {
        window.__PORTAL_USER__.approvedApps.forEach(function(id) {
          var clean = (id || '').replace(/^apps\\//, '');
          if (clean && !approvedIds.includes(clean)) approvedIds.push(clean);
        });
      }

      var catalogGrid = document.getElementById('apps-catalog-grid');
      var allApps = window.__PORTAL_APPS__ || [];
      
      allApps.forEach(function(app) {
        var clean = (app.id || '').replace(/^apps\\//, '');
        if (approvedIds.includes(clean) || approvedIds.includes(app.id)) {
          app.isRestricted = false;
        }
      });

      if (!catalogGrid) return;

      var activeList = allApps.filter(function(app) {
        var clean = (app.id || '').replace(/^apps\\//, '');
        return !app.isRestricted || approvedIds.includes(clean) || approvedIds.includes(app.id);
      });

      var counter = document.getElementById('my-apps-tab-counter');
      if (counter) counter.textContent = String(activeList.length);

      activeList.forEach(function(app) {
        var clean = (app.id || '').replace(/^apps\\//, '');
        var existing = catalogGrid.querySelector('.app-card-item[data-app-id="' + clean + '"], .app-card-item[data-app-id="' + app.id + '"]');
        if (!existing) {
          var div = document.createElement('div');
          div.className = 'app-card-item' + (app.isPinned ? ' is-pinned' : '');
          div.setAttribute('data-app-id', clean);
          div.setAttribute('data-category', app.category || 'Operations');
          div.setAttribute('data-tags', (app.tags || []).join(' '));
          
          var tagsHtml = (app.tags || []).map(function(t) {
            return '<span class="app-tag-pill">' + escapeHtml(t) + '</span>';
          }).join('');

          div.innerHTML = 
            '<div class="app-card-top">' +
              '<div class="app-card-brand">' +
                '<div class="app-card-icon-box">' + (app.iconSvg || '') + '</div>' +
                '<div>' +
                  '<h3 class="app-card-title">' + escapeHtml(app.name) + '</h3>' +
                  '<span class="app-card-cat">' + escapeHtml(app.category) + '</span>' +
                '</div>' +
              '</div>' +
              '<button class="app-pin-btn' + (app.isPinned ? ' active' : '') + '" data-pin-id="' + escapeHtml(clean) + '" data-astryx-tooltip="' + (app.isPinned ? 'Unpin from favorites' : 'Pin to favorites') + '">' +
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="' + (app.isPinned ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
              '</button>' +
            '</div>' +
            '<p class="app-card-desc">' + escapeHtml(app.description) + '</p>' +
            '<div class="app-card-tags-row">' + tagsHtml + '</div>' +
            '<div class="app-card-footer">' +
              '<div class="app-status-badge" data-astryx-tooltip="Single Sign-On Active">' +
                '<span class="status-indicator status-online"></span>' +
                '<span style="font-size: 0.74rem; font-weight: 500; color: var(--forge-text-muted);">Active</span>' +
              '</div>' +
              '<div class="app-card-actions">' +
                '<button class="astryx-btn btn-sm btn-ghost open-app-info-btn" data-info-id="' + escapeHtml(clean) + '" data-astryx-tooltip="App Details">Details</button>' +
                '<a href="' + escapeHtml(app.ingressPath || ('/apps/' + clean)) + '" class="astryx-btn btn-sm btn-primary app-launch-action" target="_blank" rel="noopener noreferrer">' +
                  '<span>Open</span>' +
                  '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
                '</a>' +
              '</div>' +
            '</div>';
          catalogGrid.appendChild(div);
        }
      });
      if (typeof updatePinnedDockUI === 'function') updatePinnedDockUI();
    }

    function updateRequestsUI() {
      var reqList = document.getElementById('active-user-requests-list');
      var indicator = document.getElementById('pending-requests-indicator');
      var countText = document.getElementById('pending-req-count-text');
      var tabCounter = document.getElementById('requests-tab-counter');

      var pendingCount = activeRequests.filter(function(r) { return r.status === 'PENDING'; }).length;

      if (tabCounter) {
        tabCounter.style.display = activeRequests.length > 0 ? 'inline-flex' : 'none';
        tabCounter.textContent = String(activeRequests.length);
      }

      if (indicator && countText) {
        if (pendingCount > 0) {
          indicator.style.display = 'inline-flex';
          countText.textContent = pendingCount + (pendingCount === 1 ? ' Request Pending Review' : ' Requests Pending Review');
        } else {
          indicator.style.display = 'none';
        }
      }

      reconcileMarketplaceCards();
      reconcileActiveAppsCatalog();

      if (reqList) {
        var filtered = activeRequests;
        if (currentReqFilter !== 'ALL') {
          filtered = activeRequests.filter(function(r) {
            if (currentReqFilter === 'DECLINED') return r.status === 'REJECTED' || r.status === 'DECLINED';
            return r.status === currentReqFilter;
          });
        }

        if (filtered.length === 0) {
          reqList.innerHTML = '<div class="requests-panel-box" style="text-align: center; padding: 2rem 1rem; color: var(--forge-text-muted);">' +
            '<p style="margin: 0; font-size: 0.85rem;">No ' + (currentReqFilter === 'ALL' ? '' : currentReqFilter.toLowerCase() + ' ') + 'access requests found.</p>' +
          '</div>';
          reqList.style.display = 'block';
          return;
        }

        reqList.style.display = 'block';
        reqList.innerHTML = '<div class="requests-panel-box">' +
          '<div class="requests-panel-title">' +
            '<span class="badge-dot" style="background: var(--forge-primary);"></span>' +
            '<span>Your Application Access Requests (' + filtered.length + ')</span>' +
          '</div>' +
          '<div class="requests-cards-stack">' +
            filtered.map(function(r) {
              var safeAppName = escapeHtml(r.appName);
              var safeReason = escapeHtml(r.reasonType + (r.notes ? ' · ' + r.notes : ''));
              var safeId = escapeHtml(r.id);
              var statusBadge = '';
              var actionBtns = '';

              if (r.status === 'PENDING') {
                statusBadge = '<span class="astryx-badge badge-warning">Pending Review</span>';
                actionBtns = '<button class="astryx-btn btn-sm btn-ghost view-req-details-btn" data-req-id="' + safeId + '">Details</button>' +
                  '<button class="astryx-btn btn-sm btn-ghost cancel-user-req-btn" data-req-id="' + safeId + '" data-req-app="' + safeAppName + '" style="color: var(--forge-error);">Cancel</button>';
              } else if (r.status === 'APPROVED') {
                statusBadge = '<span class="astryx-badge badge-online">Approved</span>';
                var targetApp = findAppById(r.appId);
                var launchHref = targetApp ? targetApp.ingressPath : '/apps/' + r.appId;
                actionBtns = '<button class="astryx-btn btn-sm btn-ghost view-req-details-btn" data-req-id="' + safeId + '">Details</button>' +
                  '<a href="' + escapeHtml(launchHref) + '" class="astryx-btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer" style="height: 28px; padding: 0 0.65rem; font-size: 0.74rem;">Launch</a>';
              } else {
                statusBadge = '<span class="astryx-badge" style="background: var(--forge-error-bg); color: var(--forge-error); border: 1px solid var(--forge-border);">Declined</span>';
                actionBtns = '<button class="astryx-btn btn-sm btn-ghost view-req-details-btn" data-req-id="' + safeId + '">Details</button>';
              }

              return '<div class="user-request-chip">' +
                '<div class="user-request-info">' +
                  '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
                    '<strong>' + safeAppName + '</strong>' +
                    statusBadge +
                  '</div>' +
                  '<span class="user-request-reason">' + safeReason + '</span>' +
                '</div>' +
                '<div class="user-request-status" style="gap: 0.4rem;">' +
                  actionBtns +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }
    }

    async function loadUserAccessRequests() {
      try {
        var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/requests');
        if (!res.ok) return;
        var body = await res.json();
        activeRequests = body.data || [];
        updateRequestsUI();
      } catch(e) {}
    }

    // ── Request Creation Flow ──
    function initRequestAccess() {
      var reqModal = document.getElementById('modal-request-access');
      var appNameSpan = document.getElementById('req-access-app-name');
      var submitBtn = document.getElementById('submit-access-req-btn');
      var reasonSelect = document.getElementById('req-access-justification-type');
      var reasonText = document.getElementById('req-access-reason');
      var charCounter = document.getElementById('req-access-char-count');
      var activeRequestTargetAppId = '';
      var activeRequestTargetAppName = '';

      function updateCharCounter() {
        if (!charCounter || !reasonText) return;
        charCounter.textContent = reasonText.value.length + ' / 300';
      }

      if (reasonText) {
        reasonText.addEventListener('input', updateCharCounter);
      }

      // Filter pills in Tab 3
      document.addEventListener('click', function(e) {
        var pill = e.target.closest('.req-filter-pill');
        if (pill) {
          e.preventDefault();
          document.querySelectorAll('.req-filter-pill').forEach(function(p) { p.classList.remove('active'); });
          pill.classList.add('active');
          currentReqFilter = pill.getAttribute('data-req-status') || 'ALL';
          updateRequestsUI();
        }
      });

      document.addEventListener('click', function(e) {
        var chipBtn = e.target.closest('.quick-chip-btn');
        if (chipBtn && reasonText) {
          e.preventDefault();
          var chipReason = chipBtn.getAttribute('data-reason');
          if (chipReason) {
            if (reasonText.value.trim().length === 0) {
              reasonText.value = chipReason;
            } else if (!reasonText.value.includes(chipReason)) {
              reasonText.value = (reasonText.value.trim() + ' · ' + chipReason).slice(0, 300);
            }
            updateCharCounter();
            reasonText.focus();
          }
        }
      });

      document.addEventListener('click', function(e) {
        var reqBtn = e.target.closest('.request-access-btn');
        if (reqBtn && reqModal) {
          e.preventDefault();
          activeRequestTargetAppId = reqBtn.getAttribute('data-app-id') || 'app_custom';
          activeRequestTargetAppName = reqBtn.getAttribute('data-app-name') || 'Application';

          // Duplicate request check
          var pendingReq = activeRequests.find(function(r) {
            return r.appId === activeRequestTargetAppId && r.status === 'PENDING';
          });
          if (pendingReq) {
            if (window.astryxToast) {
              window.astryxToast('You already have a pending request for ' + activeRequestTargetAppName + '.', 'info');
            }
            var dBtn = document.querySelector('.view-req-details-btn[data-req-id="' + pendingReq.id + '"]');
            if (dBtn) dBtn.click();
            return;
          }

          var approvedReq = activeRequests.find(function(r) {
            return r.appId === activeRequestTargetAppId && r.status === 'APPROVED';
          });
          if (approvedReq) {
            if (window.astryxToast) {
              window.astryxToast('You already have approved access for ' + activeRequestTargetAppName + '.', 'success');
            }
            return;
          }

          if (appNameSpan) appNameSpan.textContent = activeRequestTargetAppName;
          if (reasonText) {
            reasonText.value = '';
            updateCharCounter();
          }
          reqModal.classList.add('active', 'open');
          reqModal.setAttribute('aria-hidden', 'false');
        }
      });

      if (submitBtn && reqModal) {
        submitBtn.addEventListener('click', async function() {
          var reasonType = reasonSelect ? reasonSelect.value : 'Core Job Requirement';
          var notes = reasonText ? reasonText.value.trim() : '';

          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appId: activeRequestTargetAppId,
                appName: activeRequestTargetAppName,
                reasonType: reasonType,
                notes: notes
              })
            });
            var json = await res.json();
            if (res.ok && json.ok) {
              if (window.astryxToast) {
                window.astryxToast('Access request submitted for ' + activeRequestTargetAppName, 'success');
              }
              loadUserAccessRequests();
            } else {
              if (window.astryxToast) {
                window.astryxToast(json.error || 'Failed to submit request', 'error');
              }
            }
          } catch(e) {}

          reqModal.classList.remove('active', 'open');
          reqModal.setAttribute('aria-hidden', 'true');
        });
      }

      // Cancel Request Handler with Database Sync
      document.addEventListener('click', async function(e) {
        var cancelBtn = e.target.closest('.cancel-user-req-btn');
        if (cancelBtn) {
          e.preventDefault();
          var reqId = cancelBtn.getAttribute('data-req-id');
          try {
            var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/requests/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: reqId })
            });
            if (res.ok) {
              activeRequests = activeRequests.filter(function(r) { return r.id !== reqId; });
              updateRequestsUI();
              var reqDetailModal = document.getElementById('modal-request-details');
              if (reqDetailModal) {
                reqDetailModal.classList.remove('active', 'open');
                reqDetailModal.setAttribute('aria-hidden', 'true');
              }
              if (window.astryxToast) {
                window.astryxToast('Access request cancelled', 'info');
              }
            }
          } catch(e) {}
        }
      });
    }
  `;
}
