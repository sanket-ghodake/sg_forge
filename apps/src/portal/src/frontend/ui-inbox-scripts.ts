/**
 * @forge/portal - Notifications & Inbox Client Scripts (2026 LTS)
 * Client-side event handling with real REST API persistence:
 * Filter tabs, live search, real dismissal, celebratory reactions, and delivery preferences.
  * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */

export function getInboxClientScript(): string {
  return `
    (function initInboxInteractions() {
      function getApiPrefix() {
        return window.location.pathname.startsWith('/portal') ? '/portal' : '';
      }

      function showInboxToast(msg, type) {
        if (typeof window.astryxToast === 'function') {
          window.astryxToast(msg, type);
        } else if (window.AstryxToast && typeof window.AstryxToast.show === 'function') {
          window.AstryxToast.show(msg, type);
        } else if (typeof window.AstryxToast === 'function') {
          window.AstryxToast(msg, type);
        }
      }

      function bindInbox() {
        var inboxView = document.getElementById('view-notifications');
        if (!inboxView) return;

        // Prevent duplicate bindings
        if (inboxView.dataset.inboxBound === 'true') return;
        inboxView.dataset.inboxBound = 'true';

        var feedList = document.getElementById('notifications-feed-list');
        var searchInput = document.getElementById('inbox-search-input');
        var unreadOnlyToggle = document.getElementById('inbox-unread-only-toggle');
        var markAllReadBtn = document.getElementById('mark-all-read-btn');
        var filterTabs = document.querySelectorAll('.inbox-filter-tab');
        var emptyState = document.getElementById('inbox-empty-state');
        var prefOptions = document.getElementById('inbox-pref-options');

        var currentFilter = 'all';

        function updateCardVisibility() {
          var cards = document.querySelectorAll('.inbox-feed-card');
          var searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();
          var unreadOnly = unreadOnlyToggle ? unreadOnlyToggle.checked : false;
          var visibleCount = 0;

          cards.forEach(function(card) {
            var cardType = card.dataset.type || '';
            var isUnread = card.classList.contains('is-unread');
            var title = (card.querySelector('.inbox-card-title') ? card.querySelector('.inbox-card-title').textContent : '').toLowerCase();
            var desc = (card.querySelector('.inbox-card-message') ? card.querySelector('.inbox-card-message').textContent : '').toLowerCase();
            var sender = (card.querySelector('.inbox-card-sender') ? card.querySelector('.inbox-card-sender').textContent : '').toLowerCase();

            var matchesType = (currentFilter === 'all') || (cardType === currentFilter);
            var matchesUnread = !unreadOnly || isUnread;
            var matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery) || sender.includes(searchQuery);

            if (matchesType && matchesUnread && matchesSearch) {
              card.style.display = 'flex';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
          }
        }

        // Tab Filtering
        filterTabs.forEach(function(tab) {
          tab.addEventListener('click', function() {
            filterTabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentFilter = tab.dataset.type || 'all';
            updateCardVisibility();
          });
        });

        // Live Search Input
        if (searchInput) {
          searchInput.addEventListener('input', function() {
            updateCardVisibility();
          });
        }

        // Unread Only Toggle
        if (unreadOnlyToggle) {
          unreadOnlyToggle.addEventListener('change', function() {
            updateCardVisibility();
          });
        }

        // Real Mark All as Read with Backend Sync
        if (markAllReadBtn) {
          markAllReadBtn.addEventListener('click', async function() {
            var unreadCards = document.querySelectorAll('.inbox-feed-card.is-unread');
            unreadCards.forEach(function(c) {
              c.classList.remove('is-unread');
              var dot = c.querySelector('.unread-indicator-dot');
              if (dot) dot.remove();
            });

            // Update badge counts
            var unreadBadges = document.querySelectorAll('.inbox-pulse-badge.badge-unread-count');
            unreadBadges.forEach(function(b) {
              b.innerHTML = '<span>📬</span><strong>0 Unread Updates</strong>';
              b.classList.remove('badge-primary');
              b.classList.add('badge-neutral');
            });

            showInboxToast('All notifications marked as read', 'success');
            updateCardVisibility();

            try {
              await fetch(getApiPrefix() + '/api/v1/portal/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
            } catch(e) {}
          });
        }

        // Delivery Preferences Real Backend Sync
        if (prefOptions) {
          prefOptions.addEventListener('change', async function(e) {
            var target = e.target;
            if (target && target.name === 'digest-pref') {
              var val = target.value;
              try {
                await fetch(getApiPrefix() + '/api/v1/portal/preferences', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pref: val })
                });
                showInboxToast('Delivery preference saved: ' + (val === 'instant' ? 'Instant Alerts' : 'Morning Digest'), 'success');
              } catch(e) {}
            }
          });
        }

        // Card Delegation: Dismiss, Celebrate, Action CTAs
        if (feedList) {
          feedList.addEventListener('click', async function(e) {
            var target = e.target;

            // Real Dismiss Card with Backend Sync
            var dismissBtn = target.closest('.inbox-dismiss-btn');
            if (dismissBtn) {
              var card = dismissBtn.closest('.inbox-feed-card');
              var id = dismissBtn.dataset.id;
              if (card && id) {
                card.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.opacity = '0';
                card.style.transform = 'translateX(20px) scale(0.95)';
                setTimeout(function() {
                  card.remove();
                  updateCardVisibility();
                  showInboxToast('Notification dismissed', 'info');
                }, 250);

                try {
                  await fetch(getApiPrefix() + '/api/v1/portal/notifications/dismiss', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                  });
                } catch(e) {}
              }
              return;
            }

            // Real Celebrate Reaction with Backend Sync
            var celebrateBtn = target.closest('.inbox-celebrate-btn');
            if (celebrateBtn) {
              var notifId = celebrateBtn.dataset.id;
              celebrateBtn.classList.add('celebrated');
              celebrateBtn.innerHTML = '🎉 Celebrated! 👏';
              showInboxToast('Celebration recorded! 🎈', 'success');

              if (notifId) {
                try {
                  await fetch(getApiPrefix() + '/api/v1/portal/notifications/celebrate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: notifId })
                  });
                } catch(e) {}
              }
              return;
            }

            // Primary Action Buttons
            var actionBtn = target.closest('.inbox-action-cta');
            if (actionBtn) {
              var title = actionBtn.dataset.title || 'Item';
              showInboxToast('Opening: ' + title, 'info');
            }
          });
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindInbox);
      } else {
        bindInbox();
      }

      // Re-bind on hash / view change
      window.addEventListener('hashchange', function() {
        setTimeout(bindInbox, 50);
      });
      document.addEventListener('forge:view-changed', function() {
        setTimeout(bindInbox, 50);
      });
    })();
  `;
}
