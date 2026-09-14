/**
 * @forge/portal - Application Access Requests & Audit History Client Script (2026 LTS)
 * Handles modal lifecycle, live request streaming, multi-parameter filtering,
 * real-time search, and 1-click inline request decisioning with Astryx toasts.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

/**
 * getAppRequestHistoryClientScript
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getAppRequestHistoryClientScript(): string {
  return `
    (function initAppRequestHistoryController() {
      var currentAppId = 'all';
      var currentStatusFilter = 'ALL';
      var currentSearchQuery = '';
      var searchDebounceTimer = null;

      function getApiPrefix() {
        return window.location.pathname.startsWith('/portal') ? '/portal' : '';
      }

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function formatRelativeTime(timestamp) {
        if (!timestamp) return 'Unknown';
        var now = Date.now();
        var diff = now - Number(timestamp);
        if (diff < 60000) return 'Just now';
        var minutes = Math.floor(diff / 60000);
        if (minutes < 60) return minutes + 'm ago';
        var hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + 'h ago';
        var days = Math.floor(hours / 24);
        if (days < 30) return days + 'd ago';
        return new Date(Number(timestamp)).toLocaleDateString();
      }

      function formatFullDate(timestamp) {
        if (!timestamp) return '';
        try {
          return new Date(Number(timestamp)).toLocaleString();
        } catch (e) {
          return '';
        }
      }

      function populateAppSwitcher(selectedAppId, authorizedAppIds) {
        var select = document.getElementById('app-history-app-select');
        if (!select) return;
        var apps = window.__PORTAL_APPS__ || [];
        var isRestrictedAdmin = authorizedAppIds && Array.isArray(authorizedAppIds) && !authorizedAppIds.includes('all');
        if (isRestrictedAdmin) {
          apps = apps.filter(function(a) {
            var cId = (a.id || '').replace(/^apps\\//, '');
            return authorizedAppIds.includes(cId) || authorizedAppIds.includes(a.id);
          });
        }
        var html = !isRestrictedAdmin ? '<option value="all">All Applications</option>' : '';
        for (var i = 0; i < apps.length; i++) {
          var a = apps[i];
          var cleanId = (a.id || '').replace(/^apps\\//, '');
          var isSel = (cleanId === selectedAppId || a.id === selectedAppId) ? 'selected' : '';
          html += '<option value="' + escapeHtml(cleanId) + '" ' + isSel + '>' + escapeHtml(a.name || cleanId) + '</option>';
        }
        select.innerHTML = html;
        if (isRestrictedAdmin && (selectedAppId === 'all' || !selectedAppId) && apps.length > 0) {
          var defaultAppId = (apps[0].id || '').replace(/^apps\\//, '');
          select.value = defaultAppId;
          currentAppId = defaultAppId;
        } else {
          select.value = selectedAppId || 'all';
        }
      }

      function openAppHistoryModal(targetAppId, targetAppName) {
        var modal = document.getElementById('modal-app-request-history');
        if (!modal) return;

        currentAppId = targetAppId && targetAppId !== 'all' ? targetAppId.replace(/^apps\\//, '') : 'all';
        currentStatusFilter = 'ALL';
        currentSearchQuery = '';

        var searchInput = document.getElementById('app-history-search-input');
        if (searchInput) searchInput.value = '';

        // Reset active tab to ALL
        var tabs = modal.querySelectorAll('.history-tab-btn');
        tabs.forEach(function(t) {
          if (t.getAttribute('data-history-filter') === 'ALL') {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });

        // Update header badges
        var badge = document.getElementById('app-history-modal-app-badge');
        if (badge) {
          badge.textContent = currentAppId === 'all' ? 'All Applications' : (targetAppName || currentAppId);
        }

        populateAppSwitcher(currentAppId);

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        loadAppHistoryData();
      }

      function closeAppHistoryModal() {
        var modal = document.getElementById('modal-app-request-history');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      function loadAppHistoryData() {
        var stream = document.getElementById('app-history-stream');
        if (!stream) return;

        stream.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);">' +
          '<div style="font-size: 0.85rem;">Loading access requests stream...</div></div>';

        var queryParams = [];
        if (currentAppId && currentAppId !== 'all') queryParams.push('appId=' + encodeURIComponent(currentAppId));
        if (currentStatusFilter && currentStatusFilter !== 'ALL') queryParams.push('status=' + encodeURIComponent(currentStatusFilter));
        if (currentSearchQuery) queryParams.push('search=' + encodeURIComponent(currentSearchQuery));

        var url = getApiPrefix() + '/api/v1/portal/apps/requests/history' + (queryParams.length ? '?' + queryParams.join('&') : '');

        fetch(url, { headers: { 'Accept': 'application/json' } })
          .then(function(res) {
            if (!res.ok) throw new Error('Failed to load access request history');
            return res.json();
          })
          .then(function(result) {
            if (result.data.authorizedAppIds) {
              populateAppSwitcher(currentAppId, result.data.authorizedAppIds);
            }
            renderHistoryStream(result.data.requests || [], result.data.counts || {});
          })
          .catch(function(err) {
            stream.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: var(--forge-error);">' +
              '<p style="margin: 0; font-size: 0.88rem;">' + escapeHtml(err.message) + '</p>' +
              '<button type="button" class="astryx-btn btn-sm btn-secondary" id="retry-history-btn" style="margin-top: 0.75rem;">Retry</button>' +
              '</div>';
            var retryBtn = document.getElementById('retry-history-btn');
            if (retryBtn) retryBtn.addEventListener('click', loadAppHistoryData);
          });
      }

      function renderHistoryStream(requests, counts) {
        // Update count badges
        var tabAll = document.getElementById('tab-count-all');
        var tabPending = document.getElementById('tab-count-pending');
        var tabApproved = document.getElementById('tab-count-approved');
        var tabRejected = document.getElementById('tab-count-rejected');
        var headerPending = document.getElementById('app-history-pending-badge');

        if (tabAll) tabAll.textContent = String(counts.all || 0);
        if (tabPending) tabPending.textContent = String(counts.pending || 0);
        if (tabApproved) tabApproved.textContent = String(counts.approved || 0);
        if (tabRejected) tabRejected.textContent = String(counts.rejected || 0);

        if (headerPending) {
          if (counts.pending > 0) {
            headerPending.textContent = counts.pending + ' Pending Review';
            headerPending.style.display = 'inline-flex';
          } else {
            headerPending.style.display = 'none';
          }
        }

        var stream = document.getElementById('app-history-stream');
        if (!stream) return;

        if (requests.length === 0) {
          stream.innerHTML = '<div style="text-align: center; padding: 3.5rem 1.5rem; color: var(--forge-text-muted);">' +
            '<div style="width: 48px; height: 48px; border-radius: 50%; background: var(--forge-bg-card); border: 1px solid var(--forge-border); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.85rem; color: var(--forge-text-subtle);">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
            '</div>' +
            '<h4 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--forge-text-main);">No Access Requests Found</h4>' +
            '<p style="margin: 0.35rem 0 0 0; font-size: 0.8rem; max-width: 360px; margin-inline: auto;">There are no access requests matching the current filters for this application.</p>' +
            '</div>';
          return;
        }

        var currentUserId = (window.__PORTAL_USER__ && window.__PORTAL_USER__.id) || '';

        var html = requests.map(function(req) {
          var initial = (req.userEmail || 'U').charAt(0).toUpperCase();
          var cardClass = 'history-request-card';
          var statusBadge = '';
          var statusUpper = (req.status || 'PENDING').toUpperCase();

          if (statusUpper === 'PENDING') {
            cardClass += ' status-pending-card';
            statusBadge = '<span class="astryx-badge badge-warning" style="font-size: 0.72rem;">Pending Review</span>';
          } else if (statusUpper === 'APPROVED') {
            cardClass += ' status-approved-card';
            statusBadge = '<span class="astryx-badge badge-online" style="font-size: 0.72rem;">Approved</span>';
          } else {
            cardClass += ' status-rejected-card';
            statusBadge = '<span class="astryx-badge badge-danger" style="font-size: 0.72rem;">Declined</span>';
          }

          var reasonTag = (req.reasonType || 'Standard Access').replace(/_/g, ' ');
          var fullDate = formatFullDate(req.createdAt);
          var relTime = formatRelativeTime(req.createdAt);

          var isRequesterSameAsAdmin = req.userId === currentUserId;

          var actionsHtml = '';
          if (statusUpper === 'PENDING') {
            if (isRequesterSameAsAdmin) {
              actionsHtml = '<div style="font-size: 0.75rem; color: var(--forge-text-muted); font-style: italic; background: var(--forge-bg-root); padding: 0.35rem 0.65rem; border-radius: 4px; border: 1px solid var(--forge-border);">' +
                'Anti-Self-Approval Active: A designated co-administrator must review your request.' +
                '</div>';
            } else {
              actionsHtml = '<div class="history-actions-group">' +
                '<button type="button" class="astryx-btn btn-sm btn-primary history-decide-btn" data-id="' + escapeHtml(req.id) + '" data-action="APPROVE" data-email="' + escapeHtml(req.userEmail) + '" style="background: var(--forge-success); border-color: var(--forge-success); color: var(--forge-primary-btn-text);">' +
                '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Approve' +
                '</button>' +
                '<button type="button" class="astryx-btn btn-sm btn-outline history-decide-btn" data-id="' + escapeHtml(req.id) + '" data-action="REJECT" data-email="' + escapeHtml(req.userEmail) + '" style="color: var(--forge-error); border-color: var(--forge-border);">' +
                '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Decline' +
                '</button>' +
                '</div>';
            }
          } else {
            var decidedText = 'Decided on ' + (req.decidedAt ? formatFullDate(req.decidedAt) : fullDate);
            if (req.decidedBy) decidedText += ' by ' + escapeHtml(req.decidedBy);
            actionsHtml = '<div style="font-size: 0.74rem; color: var(--forge-text-subtle);">' + decidedText + '</div>';
          }

          var notesBlock = '';
          if (req.notes) {
            notesBlock = '<div class="history-notes-box">' +
              '<div style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--forge-primary); margin-bottom: 0.25rem;">Business Justification & Context</div>' +
              '<div>' + escapeHtml(req.notes) + '</div>' +
              '</div>';
          }

          return '<div class="' + cardClass + '" id="card-req-' + escapeHtml(req.id) + '">' +
            '<div class="history-card-header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">' +
            '  <div style="display: flex; align-items: center; gap: 0.75rem;">' +
            '    <div class="history-user-avatar">' + escapeHtml(initial) + '</div>' +
            '    <div>' +
            '      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">' +
            '        <span style="font-size: 0.88rem; font-weight: 600; color: var(--forge-text-main);">' + escapeHtml(req.userEmail) + '</span>' +
            '        <span class="astryx-badge" style="font-size: 0.68rem; background: var(--forge-bg-card); color: var(--forge-text-muted); border: 1px solid var(--forge-border);">' + escapeHtml(req.appName || req.appId) + '</span>' +
            '        <span class="astryx-badge" style="font-size: 0.68rem; background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-border);">' + escapeHtml(reasonTag) + '</span>' +
            '      </div>' +
            '      <div style="font-size: 0.74rem; color: var(--forge-text-subtle); margin-top: 0.15rem;" data-astryx-tooltip="' + escapeHtml(fullDate) + '">Requested ' + escapeHtml(relTime) + '</div>' +
            '    </div>' +
            '  </div>' +
            '  <div style="display: flex; align-items: center; gap: 0.75rem;">' +
            '    ' + statusBadge +
            '  </div>' +
            '</div>' +
            notesBlock +
            '<div style="display: flex; align-items: center; justify-content: flex-end; margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--forge-border);">' +
            actionsHtml +
            '</div>' +
            '</div>';
        }).join('');

        stream.innerHTML = html;
      }

      function handleDecideAction(requestId, action, applicantEmail, btn) {
        if (!requestId || !action) return;

        var originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Processing...';

        fetch(getApiPrefix() + '/api/v1/portal/apps/requests/decide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: requestId,
            action: action,
            decision: action,
          }),
        })
          .then(function(res) {
            return res.json().then(function(data) {
              return { ok: res.ok, data: data };
            });
          })
          .then(function(result) {
            if (!result.ok || !result.data.ok) {
              throw new Error(result.data.error || 'Failed to process request decision');
            }

            var actionLabel = action === 'APPROVE' ? 'approved' : 'declined';
            if (typeof window.showAstryxToast === 'function') {
              window.showAstryxToast('Access request for ' + applicantEmail + ' was ' + actionLabel + ' successfully.', 'success');
            }

            loadAppHistoryData();
          })
          .catch(function(err) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            if (typeof window.showAstryxToast === 'function') {
              window.showAstryxToast(err.message || 'Decision failed', 'error');
            }
          });
      }

      // Event Delegation
      document.addEventListener('click', function(e) {
        // Open from app row
        var rowBtn = e.target.closest('.view-app-history-btn');
        if (rowBtn) {
          var appId = rowBtn.getAttribute('data-id');
          var appName = rowBtn.getAttribute('data-name');
          openAppHistoryModal(appId, appName);
          return;
        }

        // Open all from header
        var headerBtn = e.target.closest('#open-all-requests-history-btn');
        if (headerBtn) {
          openAppHistoryModal('all', 'All Applications');
          return;
        }

        // Close modal
        var closeTrigger = e.target.closest('[data-close-modal="modal-app-request-history"]');
        if (closeTrigger) {
          closeAppHistoryModal();
          return;
        }

        // Backdrop click
        if (e.target.id === 'modal-app-request-history') {
          closeAppHistoryModal();
          return;
        }

        // Filter tabs
        var tabBtn = e.target.closest('.history-tab-btn');
        if (tabBtn && tabBtn.closest('#modal-app-request-history')) {
          var filter = tabBtn.getAttribute('data-history-filter');
          var tabs = tabBtn.parentElement.querySelectorAll('.history-tab-btn');
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tabBtn.classList.add('active');
          currentStatusFilter = filter || 'ALL';
          loadAppHistoryData();
          return;
        }

        // Decide buttons (Approve / Decline)
        var decideBtn = e.target.closest('.history-decide-btn');
        if (decideBtn) {
          var reqId = decideBtn.getAttribute('data-id');
          var act = decideBtn.getAttribute('data-action');
          var email = decideBtn.getAttribute('data-email');
          handleDecideAction(reqId, act, email, decideBtn);
          return;
        }

        // Refresh button
        var refreshBtn = e.target.closest('#app-history-refresh-btn');
        if (refreshBtn && refreshBtn.closest('#modal-app-request-history')) {
          loadAppHistoryData();
          return;
        }
      });

      // App Select dropdown change
      document.addEventListener('change', function(e) {
        if (e.target.id === 'app-history-app-select') {
          currentAppId = e.target.value || 'all';
          var badge = document.getElementById('app-history-modal-app-badge');
          if (badge) {
            badge.textContent = e.target.options[e.target.selectedIndex].text;
          }
          loadAppHistoryData();
        }
      });

      // Search input with debounce
      document.addEventListener('input', function(e) {
        if (e.target.id === 'app-history-search-input') {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(function() {
            currentSearchQuery = (e.target.value || '').trim();
            loadAppHistoryData();
          }, 260);
        }
      });

      // Escape key to close
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          var modal = document.getElementById('modal-app-request-history');
          if (modal && modal.classList.contains('active')) {
            closeAppHistoryModal();
          }
        }
      });

      window.openAppHistoryModal = openAppHistoryModal;
    })();
  `;
}
