/**
 * @forge/portal - Apps & Tools Hub Client Controller (2026 LTS)
 * Human-Factor UI: 2-mode switcher, real-time pinning, unclipped cards, search, category filtering,
 * and database-backed application access request persistence.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { getAppsRequestsScript } from './ui-apps-requests-scripts';
import { getAppsModalsScript } from './ui-apps-modals-scripts';

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

      ${getAppsRequestsScript()}
      ${getAppsModalsScript()}

      // Initializer
      function start() {
        initAppsTabs();
        initPinHandlers();
        updatePinnedDockUI();
        initFilterHandlers();
        initViewMode();
        initRequestAccess();
        initRequestDetailsModal();
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
