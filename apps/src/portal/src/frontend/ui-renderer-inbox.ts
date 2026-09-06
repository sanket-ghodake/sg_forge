/**
 * @forge/portal - Live Real-Time Notifications & Company Bulletin Hub (2026 LTS)
 * Zero hardcoded announcements: Pristine empty state, dynamic event calendar, and real preferences.
 */

import { astryxIcons } from '@forge/ui';
import type { HeaderUserContext } from './layout-header';
import {
  renderInboxUpcomingDates,
  renderInboxPreferencesWidget,
  renderInboxSupportWidget,
  DEFAULT_COMPANY_EVENTS,
  type CompanyEventItem,
} from './ui-renderer-inbox-widgets';
import {
  getLiveNotifications,
  getLiveCompanyEvents,
  getUserDeliveryPreference,
  type LiveNotificationItem,
} from '../backend/inbox-service';

/**
 * NotificationItem
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export type NotificationItem = LiveNotificationItem;

/**
 * DEFAULT_NOTIFICATIONS
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];
/**
 * SAMPLE_NOTIFICATIONS
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export const SAMPLE_NOTIFICATIONS = DEFAULT_NOTIFICATIONS;

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * renderInboxView
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function renderInboxView(user?: HeaderUserContext): string {
  let notifications: NotificationItem[] = [];
  let events: CompanyEventItem[] = DEFAULT_COMPANY_EVENTS;
  let deliveryPref = 'instant';

  try {
    notifications = getLiveNotifications(user?.id);
    events = getLiveCompanyEvents();
    if (user?.id) {
      deliveryPref = getUserDeliveryPreference(user.id);
    }
  } catch {
    notifications = [];
    events = DEFAULT_COMPANY_EVENTS;
  }

  if (!notifications) {
    notifications = [];
  }

  const unreadCount = notifications.filter(n => n.isUnread).length;
  const actionCount = notifications.filter(n => n.type === 'ACTION' && n.isUnread).length;
  const celebrationCount = notifications.filter(n => n.type === 'CELEBRATION').length;
  const broadcastCount = notifications.filter(n => n.type === 'BROADCAST').length;
  const mentionCount = notifications.filter(n => n.type === 'MENTION').length;
  const securityCount = notifications.filter(n => n.type === 'SECURITY').length;

  const spotlightBroadcast = notifications.find(n => n.type === 'BROADCAST');
  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Team Member';

  return `
    <div id="view-notifications" class="portal-page-view">
      <!-- Top Morning Pulse & Header Bar -->
      <div class="inbox-hero-banner">
        <div class="inbox-hero-left">
          <div class="inbox-badge-row">
            <div class="portal-view-badge">
              <span class="badge-dot"></span>
              <span>Notifications & Announcements</span>
            </div>
            <span class="portal-view-audience">Audience: <strong>All Employees & Staff</strong></span>
          </div>
          <h1 class="inbox-hero-title">Good morning, ${displayName}! Here is what's happening today 👋</h1>
          <p class="inbox-hero-subtitle">
            Stay up to date with company announcements, pending action items, team celebrations, and workspace notices.
          </p>

          <!-- Quick Pulse Summary Chips -->
          <div class="inbox-pulse-chips">
            <div class="inbox-pulse-badge ${unreadCount > 0 ? 'badge-primary' : 'badge-neutral'} badge-unread-count">
              <span>📬</span>
              <strong>${unreadCount} Unread Updates</strong>
            </div>
            ${actionCount > 0 ? `
              <div class="inbox-pulse-badge badge-warning">
                <span>⚡</span>
                <strong>${actionCount} Action Required</strong>
              </div>
            ` : ''}
            ${celebrationCount > 0 ? `
              <div class="inbox-pulse-badge badge-celebrate">
                <span>🎉</span>
                <strong>${celebrationCount} Milestone Celebration</strong>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="inbox-hero-actions">
          <button class="astryx-btn btn-outline" id="mark-all-read-btn" ${unreadCount === 0 ? 'disabled' : ''}>
            ${astryxIcons.check || '✓'} Mark All as Read
          </button>
        </div>
      </div>

      <!-- Main 2-Column Responsive Workspace Grid -->
      <div class="inbox-layout-grid">
        <!-- Left Main Feed Column -->
        <div class="inbox-main-col">
          <!-- Featured Leadership Spotlight Banner (Renders only if broadcast notice exists) -->
          ${spotlightBroadcast ? `
            <div class="inbox-spotlight-card">
              <div class="spotlight-badge">
                <span class="spotlight-star">⭐</span>
                <span>Featured Broadcast</span>
              </div>
              <div class="spotlight-content">
                <div class="spotlight-text-wrap">
                  <h2 class="spotlight-title">${spotlightBroadcast.title}</h2>
                  <p class="spotlight-desc">${spotlightBroadcast.message}</p>
                  <div class="spotlight-meta-row">
                    <span class="spotlight-date">🗓️ ${spotlightBroadcast.timestamp}</span>
                    <span class="spotlight-host">From: <strong>${spotlightBroadcast.sender}</strong></span>
                  </div>
                </div>
                <div class="spotlight-actions">
                  ${spotlightBroadcast.actionLabel ? `
                    <button class="astryx-btn btn-primary inbox-action-cta" data-action="${spotlightBroadcast.actionType || 'view'}" data-title="${spotlightBroadcast.title}">
                      ${spotlightBroadcast.actionLabel}
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Feed Controls: Filter Tabs, Search & Unread Switch -->
          <div class="inbox-controls-bar">
            <div class="inbox-filter-tabs">
              <button class="inbox-filter-tab active" data-type="all">
                All <span class="tab-count">${notifications.length}</span>
              </button>
              <button class="inbox-filter-tab" data-type="ACTION">
                Action Required <span class="tab-count tag-action">${actionCount}</span>
              </button>
              <button class="inbox-filter-tab" data-type="BROADCAST">
                Announcements <span class="tab-count">${broadcastCount}</span>
              </button>
              <button class="inbox-filter-tab" data-type="CELEBRATION">
                Celebrations <span class="tab-count tag-celebrate">${celebrationCount}</span>
              </button>
              <button class="inbox-filter-tab" data-type="MENTION">
                Mentions <span class="tab-count">${mentionCount}</span>
              </button>
              <button class="inbox-filter-tab" data-type="SECURITY">
                Security <span class="tab-count">${securityCount}</span>
              </button>
            </div>

            <div class="inbox-controls-right">
              <div class="inbox-search-wrap">
                <span class="search-icon">${astryxIcons.search || '🔍'}</span>
                <input type="text" id="inbox-search-input" class="inbox-search-input" placeholder="Filter notices by sender or topic..." />
              </div>
              <label class="inbox-toggle-wrap" data-astryx-tooltip="Show only unread items">
                <input type="checkbox" id="inbox-unread-only-toggle" class="inbox-toggle-input" />
                <span class="inbox-toggle-label">Unread only</span>
              </label>
            </div>
          </div>

          <!-- Notification Feed List -->
          <div class="notifications-feed-list" id="notifications-feed-list">
            ${notifications.map(n => {
              const initial = escapeHtml(n.sender ? n.sender.charAt(0).toUpperCase() : 'U');
              const safeTitle = escapeHtml(n.title);
              const safeMessage = escapeHtml(n.message);
              const safeSender = escapeHtml(n.sender);
              const safeSenderRole = n.senderRole ? escapeHtml(n.senderRole) : '';
              const safeActionLabel = n.actionLabel ? escapeHtml(n.actionLabel) : '';
              return `
                <div class="astryx-card inbox-feed-card type-${n.type.toLowerCase()} ${n.isUnread ? 'is-unread' : ''}" data-id="${n.id}" data-type="${n.type}">
                  ${n.isUnread ? '<span class="unread-indicator-dot" data-astryx-tooltip="Unread"></span>' : ''}
                  
                  <div class="inbox-card-avatar type-${n.type.toLowerCase()}">
                    ${n.type === 'ACTION' ? '⚡' : ''}
                    ${n.type === 'BROADCAST' ? '📢' : ''}
                    ${n.type === 'CELEBRATION' ? '🎉' : ''}
                    ${n.type === 'MENTION' ? '💬' : ''}
                    ${n.type === 'SECURITY' ? '🛡️' : ''}
                  </div>

                  <div class="inbox-card-body">
                    <div class="inbox-card-header-row">
                      <div class="inbox-card-tags">
                        <span class="inbox-category-pill pill-${n.type.toLowerCase()}">${escapeHtml(n.categoryTag)}</span>
                        ${n.priority === 'HIGH' ? '<span class="astryx-badge badge-warning">High Priority</span>' : ''}
                      </div>
                      <span class="inbox-card-time">${escapeHtml(n.timestamp)}</span>
                    </div>

                    <h3 class="inbox-card-title">${safeTitle}</h3>
                    <p class="inbox-card-message">${safeMessage}</p>

                    <div class="inbox-card-footer-row">
                      <div class="inbox-card-sender-info">
                        <div class="sender-mini-avatar">${initial}</div>
                        <div class="sender-text">
                          <span class="inbox-card-sender">${safeSender}</span>
                          ${safeSenderRole ? `<span class="sender-role"> · ${safeSenderRole}</span>` : ''}
                        </div>
                      </div>

                      <div class="inbox-card-actions">
                        ${n.type === 'CELEBRATION' ? `
                          <button class="astryx-btn btn-sm btn-outline inbox-celebrate-btn" data-id="${n.id}">
                            ${safeActionLabel || 'Send Congratulations 🎉'}
                          </button>
                        ` : safeActionLabel ? `
                          <button class="astryx-btn btn-sm ${n.type === 'ACTION' ? 'btn-primary' : 'btn-outline'} inbox-action-cta" data-action="${n.actionType || 'view'}" data-title="${safeTitle}">
                            ${safeActionLabel}
                          </button>
                        ` : ''}
                        
                        <button class="astryx-btn btn-sm btn-ghost inbox-dismiss-btn" data-id="${n.id}" data-astryx-tooltip="Dismiss notice">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}

            <!-- Empty State Container -->
            <div id="inbox-empty-state" class="inbox-empty-state" style="${notifications.length === 0 ? 'display: flex;' : 'display: none;'}">
              <div class="empty-state-icon">🎉</div>
              <h3 class="empty-state-title">You're all caught up!</h3>
              <p class="empty-state-desc">No notifications or announcements at this time. Enjoy the rest of your day!</p>
            </div>
          </div>
        </div>

        <!-- Right Side Utility Widgets Column -->
        <div class="inbox-widgets-col">
          ${renderInboxUpcomingDates(events)}
          ${renderInboxPreferencesWidget(deliveryPref)}
          ${renderInboxSupportWidget()}
        </div>
      </div>
    </div>
  `;
}
