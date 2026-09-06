/**
 * @forge/portal - Apps & Tools Hub Client Controller (2026 LTS)
 * Human-Factor UI: 2-mode switcher, real-time pinning, unclipped cards, search, category filtering,
 * and database-backed application access request persistence.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export function getAppsClientScript(): string {
  return `
    (function() {
      var PINNED_STORAGE_KEY = 'forge:v1:portal:pinned_apps';
      var VIEW_MODE_KEY = 'forge:v1:portal:apps_view_mode';

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function getApiPrefix() {
        return window.location.pathname.startsWith('/portal') ? '/portal' : '';
      }

      // ── 1. Simple View Mode Switching ──
      function initAppsTabs() {
        var tabBtns = document.querySelectorAll('.apps-tab-btn[data-hub-tab]');
        var tabContents = document.querySelectorAll('.apps-tab-content');

        tabBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var targetTab = btn.getAttribute('data-hub-tab');
            if (!targetTab) return;

            tabBtns.forEach(function(b) {
              b.classList.remove('active');
              b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            tabContents.forEach(function(tc) {
              tc.classList.remove('active');
            });
            var activeContent = document.getElementById('tab-content-' + targetTab);
            if (activeContent) activeContent.classList.add('active');
          });
        });
      }

      // ── 2. Personal App Pinning Engine ──
      function getPinnedAppIds() {
        try {
          var raw = localStorage.getItem(PINNED_STORAGE_KEY);
          if (raw) return JSON.parse(raw);
        } catch(e) {}
        var firstCard = document.querySelector('.app-card-item');
        if (firstCard) {
          var firstId = firstCard.getAttribute('data-app-id');
          if (firstId) return [firstId];
        }
        return [];
      }

      function savePinnedAppIds(ids) {
        try {
          localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(ids));
        } catch(e) {}
      }

      function updatePinnedDockUI() {
        var pinnedIds = getPinnedAppIds();
        var pinnedDock = document.getElementById('pinned-apps-dock');
        var pinnedPanel = document.getElementById('pinned-favorites-panel');

        // Toggle whole panel visibility if no pinned apps
        if (pinnedPanel) {
          pinnedPanel.style.display = pinnedIds.length > 0 ? 'block' : 'none';
        }

        // Update card pin buttons
        document.querySelectorAll('.app-card-item').forEach(function(card) {
          var appId = card.getAttribute('data-app-id');
          var pinBtn = card.querySelector('.app-pin-btn');
          var isPinned = pinnedIds.includes(appId);
          card.classList.toggle('is-pinned', isPinned);
          if (pinBtn) {
            pinBtn.classList.toggle('active', isPinned);
            pinBtn.setAttribute('data-astryx-tooltip', isPinned ? 'Unpin from favorites' : 'Pin to favorites');
            var svg = pinBtn.querySelector('svg');
            if (svg) svg.setAttribute('fill', isPinned ? 'currentColor' : 'none');
          }
        });

        // Rebuild Pinned Dock Cards without truncation
        if (pinnedDock && pinnedIds.length > 0) {
          var cardsHtml = '';
          pinnedIds.forEach(function(id) {
            var card = document.querySelector('.app-card-item[data-app-id="' + id + '"]');
            if (card) {
              var name = card.querySelector('.app-card-title') ? card.querySelector('.app-card-title').textContent.trim() : id;
              var cat = card.querySelector('.app-card-cat') ? card.querySelector('.app-card-cat').textContent.trim() : '';
              var icon = card.querySelector('.app-card-icon-box') ? card.querySelector('.app-card-icon-box').innerHTML : '';
              var launchLink = card.querySelector('.app-launch-action') ? card.querySelector('.app-launch-action').getAttribute('href') : '#';
              
              cardsHtml += '<a href="' + escapeHtml(launchLink) + '" class="pinned-dock-card" data-app-id="' + escapeHtml(id) + '">' +
                '<div class="dock-card-icon">' + icon + '</div>' +
                '<div class="dock-card-info">' +
                  '<span class="dock-card-title">' + escapeHtml(name) + '</span>' +
                  '<span class="dock-card-category">' + escapeHtml(cat) + '</span>' +
                '</div>' +
                '<span class="status-indicator status-online" data-astryx-tooltip="Ready to launch"></span>' +
              '</a>';
            }
          });
          pinnedDock.innerHTML = cardsHtml;
        }
      }

      function togglePin(appId) {
        if (!appId) return;
        var pinned = getPinnedAppIds();
        var index = pinned.indexOf(appId);
        var isNowPinned = false;
        if (index > -1) {
          pinned.splice(index, 1);
          isNowPinned = false;
        } else {
          pinned.push(appId);
          isNowPinned = true;
        }
        savePinnedAppIds(pinned);
        updatePinnedDockUI();
        if (window.astryxToast) {
          window.astryxToast(isNowPinned ? 'Added to Pinned Favorites' : 'Removed from Pinned Favorites', 'info');
        }
      }

      function initPinHandlers() {
        document.addEventListener('click', function(e) {
          var pinBtn = e.target.closest('.app-pin-btn');
          if (pinBtn) {
            e.preventDefault();
            e.stopPropagation();
            var appId = pinBtn.getAttribute('data-pin-id');
            togglePin(appId);
          }
        });
      }

      // ── 3. Search & Category Filter Engine ──
      var currentCategory = 'ALL';
      var currentSearchQuery = '';

      function filterAppCards() {
        var cards = document.querySelectorAll('.app-card-item, .marketplace-card-item');
        var q = currentSearchQuery.toLowerCase().trim();

        cards.forEach(function(card) {
          var cat = card.getAttribute('data-category') || '';
          var tags = card.getAttribute('data-tags') || '';
          var titleEl = card.querySelector('.app-card-title, .market-card-title');
          var descEl = card.querySelector('.app-card-desc, .market-card-desc');
          var title = titleEl ? titleEl.textContent.toLowerCase() : '';
          var desc = descEl ? descEl.textContent.toLowerCase() : '';

          var matchesCat = (currentCategory === 'ALL') || (cat.toLowerCase().includes(currentCategory.toLowerCase()));
          var matchesSearch = !q || title.includes(q) || desc.includes(q) || tags.toLowerCase().includes(q);

          if (matchesCat && matchesSearch) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }

      function initFilterHandlers() {
        var catPills = document.querySelectorAll('.cat-pill');
        catPills.forEach(function(pill) {
          pill.addEventListener('click', function() {
            catPills.forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-cat') || 'ALL';
            filterAppCards();
          });
        });

        var searchInput = document.getElementById('apps-hub-search-input');
        if (searchInput) {
          searchInput.addEventListener('input', function(e) {
            currentSearchQuery = e.target.value || '';
            filterAppCards();
          });
        }
      }

      // ── 4. View Mode Switcher (Grid vs List) ──
      function initViewMode() {
        var gridBtn = document.getElementById('view-mode-grid');
        var listBtn = document.getElementById('view-mode-list');
        var catalogGrid = document.getElementById('apps-catalog-grid');

        function applyViewMode(mode) {
          if (!catalogGrid) return;
          if (mode === 'list') {
            catalogGrid.classList.add('compact-list-mode');
            if (gridBtn) gridBtn.classList.remove('active');
            if (listBtn) listBtn.classList.add('active');
          } else {
            catalogGrid.classList.remove('compact-list-mode');
            if (gridBtn) gridBtn.classList.add('active');
            if (listBtn) listBtn.classList.remove('active');
          }
          try { localStorage.setItem(VIEW_MODE_KEY, mode); } catch(e) {}
        }

        var savedMode = 'grid';
        try { savedMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid'; } catch(e) {}
        applyViewMode(savedMode);

        if (gridBtn) gridBtn.addEventListener('click', function() { applyViewMode('grid'); });
        if (listBtn) listBtn.addEventListener('click', function() { applyViewMode('list'); });
      }

      // ── 5. Real-Time Persistent Request Access Engine ──
      var activeRequests = [];

      function updateRequestsUI() {
        var reqList = document.getElementById('active-user-requests-list');
        var indicator = document.getElementById('pending-requests-indicator');
        var countText = document.getElementById('pending-req-count-text');

        if (indicator && countText) {
          if (activeRequests.length > 0) {
            indicator.style.display = 'inline-flex';
            countText.textContent = activeRequests.length + (activeRequests.length === 1 ? ' Request Pending Review' : ' Requests Pending Review');
          } else {
            indicator.style.display = 'none';
          }
        }

        if (reqList) {
          if (activeRequests.length === 0) {
            reqList.innerHTML = '';
            reqList.style.display = 'none';
            return;
          }

          reqList.style.display = 'block';
          reqList.innerHTML = '<div class="requests-panel-box">' +
            '<div class="requests-panel-title">' +
              '<span class="badge-dot" style="background: var(--forge-warning);"></span>' +
              '<span>Your Submitted Access Requests</span>' +
            '</div>' +
            '<div class="requests-cards-stack">' +
              activeRequests.map(function(r) {
                var safeAppName = escapeHtml(r.appName);
                var safeReason = escapeHtml(r.reasonType + (r.notes ? ' · ' + r.notes : ''));
                var safeId = escapeHtml(r.id);
                return '<div class="user-request-chip">' +
                  '<div class="user-request-info">' +
                    '<strong>' + safeAppName + '</strong>' +
                    '<span class="user-request-reason">' + safeReason + '</span>' +
                  '</div>' +
                  '<div class="user-request-status">' +
                    '<span class="astryx-badge badge-warning">Pending Approval</span>' +
                    '<button class="astryx-btn btn-sm btn-ghost cancel-user-req-btn" data-req-id="' + safeId + '" data-req-app="' + safeAppName + '" style="color: var(--forge-danger);">Cancel</button>' +
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

      function initRequestAccess() {
        var reqModal = document.getElementById('modal-request-access');
        var appNameSpan = document.getElementById('req-access-app-name');
        var submitBtn = document.getElementById('submit-access-req-btn');
        var reasonSelect = document.getElementById('req-access-justification-type');
        var reasonText = document.getElementById('req-access-reason');
        var activeRequestTargetAppId = '';
        var activeRequestTargetAppName = '';

        document.addEventListener('click', function(e) {
          var reqBtn = e.target.closest('.request-access-btn');
          if (reqBtn && reqModal) {
            e.preventDefault();
            activeRequestTargetAppId = reqBtn.getAttribute('data-app-id') || 'app_custom';
            activeRequestTargetAppName = reqBtn.getAttribute('data-app-name') || 'Application';
            if (appNameSpan) appNameSpan.textContent = activeRequestTargetAppName;
            if (reasonText) reasonText.value = '';
            reqModal.classList.add('active');
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
              if (res.ok) {
                if (window.astryxToast) {
                  window.astryxToast('Access request submitted for ' + activeRequestTargetAppName, 'success');
                }
                loadUserAccessRequests();
              }
            } catch(e) {}

            reqModal.classList.remove('active');
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
                if (window.astryxToast) {
                  window.astryxToast('Access request cancelled', 'info');
                }
              }
            } catch(e) {}
          }
        });
      }

      // ── 6. App Details Inspection Modal ──
      function initAppDetailsModal() {
        document.addEventListener('click', function(e) {
          var infoBtn = e.target.closest('.open-app-info-btn');
          if (infoBtn) {
            e.preventDefault();
            var modal = document.getElementById('modal-app-details');
            if (!modal) return;

            var card = infoBtn.closest('.app-card-item, .marketplace-card-item');
            if (card) {
              var title = card.querySelector('.app-card-title, .market-card-title');
              var desc = card.querySelector('.app-card-desc, .market-card-desc');
              var dept = card.getAttribute('data-category') || 'Platform Workspace';
              var tags = card.getAttribute('data-tags') || '';
              var launchLink = card.querySelector('.app-launch-action');

              var dTitle = document.getElementById('app-details-title');
              var dDept = document.getElementById('app-details-dept');
              var dDesc = document.getElementById('app-details-desc');
              var dTags = document.getElementById('app-details-tags');
              var dActionBtn = document.getElementById('app-details-action-btn');

              if (dTitle && title) dTitle.textContent = title.textContent.trim();
              if (dDept) dDept.textContent = dept;
              if (dDesc && desc) dDesc.textContent = desc.textContent.trim();
              if (dTags) {
                var tagArr = tags.split(' ').filter(Boolean);
                dTags.innerHTML = tagArr.map(function(t) {
                  return '<span class="app-tag-pill">' + escapeHtml(t) + '</span>';
                }).join('');
              }
              if (dActionBtn) {
                if (launchLink) {
                  dActionBtn.textContent = 'Open Application';
                  dActionBtn.setAttribute('href', launchLink.getAttribute('href'));
                  dActionBtn.style.display = 'inline-flex';
                } else {
                  dActionBtn.style.display = 'none';
                }
              }

              modal.classList.add('open');
              modal.classList.add('active');
              modal.setAttribute('aria-hidden', 'false');
            }
          }

          var closeBtn = e.target.closest('[data-close-modal="modal-app-details"], .astryx-modal-close');
          if (closeBtn) {
            var modalToClose = document.getElementById('modal-app-details');
            if (modalToClose) {
              modalToClose.classList.remove('open');
              modalToClose.classList.remove('active');
              modalToClose.setAttribute('aria-hidden', 'true');
            }
          }
          if (e.target && e.target.id === 'modal-app-details') {
            e.target.classList.remove('open');
            e.target.classList.remove('active');
            e.target.setAttribute('aria-hidden', 'true');
          }
        });
      }

      // Initializer
      function start() {
        initAppsTabs();
        initPinHandlers();
        updatePinnedDockUI();
        initFilterHandlers();
        initViewMode();
        initRequestAccess();
        initAppDetailsModal();
        loadUserAccessRequests();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    })();
  `;
}
