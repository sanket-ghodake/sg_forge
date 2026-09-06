/**
 * @forge/portal - Tier 1 Unit: Notifications & Company Bulletin Hub
 * 3A Pattern (Arrange, Act, Assert) Testing Suite for Clean State & Dynamic Non-Technical Employee UI
 */

import { describe, expect, it } from 'bun:test';
import {
  renderInboxView,
  renderInboxUpcomingDates,
  renderInboxPreferencesWidget,
  renderInboxSupportWidget,
  getInboxClientScript,
  DEFAULT_NOTIFICATIONS,
} from '../../src/frontend';
import {
  createNotification,
  getLiveNotifications,
  dismissNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '../../src/backend/inbox-service';

describe('Tier 1 Unit: Portal Notifications & Bulletin Hub', () => {
  clearAllNotifications();

  it('renderInboxView renders morning pulse header and clean empty state with 0 unread updates', () => {
    // Arrange & Act
    const html = renderInboxView();
    const personalizedHtml = renderInboxView({
      id: 'usr_sarah',
      email: 'sarah@forge.internal',
      displayName: 'Sarah Connor',
      roles: ['roles/employee'],
      isAdmin: false,
    });

    // Assert
    expect(html).toContain('id="view-notifications"');
    expect(html).toContain('Good morning, Team Member! Here is what\'s happening today');
    expect(personalizedHtml).toContain('Good morning, Sarah! Here is what\'s happening today');
    expect(html).toContain('0 Unread Updates');
    expect(html).toContain('You\'re all caught up!');
    expect(html).toContain('No notifications or announcements at this time.');
    expect(DEFAULT_NOTIFICATIONS).toHaveLength(0);
  });

  it('renders dynamically created notifications and updates counters properly', () => {
    // Arrange
    const testId = `notif_dyn_${Date.now()}`;
    createNotification({
      id: testId,
      userId: null,
      orgId: null,
      type: 'ACTION',
      title: 'Sign Quarterly Compliance Acknowledgment',
      message: 'Please review and submit your compliance confirmation.',
      sender: 'Legal & Risk Ops',
      senderRole: 'Compliance Desk',
      timestamp: 'Just now',
      isUnread: true,
      priority: 'HIGH',
      actionLabel: 'Sign Now',
      actionType: 'form',
      categoryTag: 'Action Required',
    });

    // Act
    const liveList = getLiveNotifications();
    const html = renderInboxView();

    // Assert
    expect(liveList.some(n => n.id === testId)).toBe(true);
    expect(html).toContain('Sign Quarterly Compliance Acknowledgment');
    expect(html).toContain('Sign Now');
    expect(html).toContain('Action Required');

    // Cleanup
    dismissNotification(testId);
  });

  it('renderInboxUpcomingDates renders company events and public holidays widget', () => {
    // Arrange & Act
    const html = renderInboxUpcomingDates();

    // Assert
    expect(html).toContain('Upcoming Dates & Holidays');
    expect(html).toContain('Q3 Global All-Hands');
    expect(html).toContain('Labor & Wellness Recharge Day');
    expect(html).toContain('Virtual Coffee & Team Trivia');
  });

  it('renderInboxPreferencesWidget renders simple delivery preference options', () => {
    // Arrange & Act
    const html = renderInboxPreferencesWidget();

    // Assert
    expect(html).toContain('Delivery Preferences');
    expect(html).toContain('Instant Alerts');
    expect(html).toContain('Daily Morning Digest (9:00 AM)');
  });

  it('renderInboxSupportWidget renders workplace concierge and team contacts', () => {
    // Arrange & Act
    const html = renderInboxSupportWidget();

    // Assert
    expect(html).toContain('Workplace Concierge');
    expect(html).toContain('People & HR Operations');
    expect(html).toContain('IT & Access Helpdesk');
    expect(html).toContain('Workplace & Office Facilities');
  });

  it('getInboxClientScript returns functional client event handlers', () => {
    // Arrange & Act
    const script = getInboxClientScript();

    // Assert
    expect(script).toContain('inbox-filter-tab');
    expect(script).toContain('inbox-search-input');
    expect(script).toContain('inbox-unread-only-toggle');
    expect(script).toContain('inbox-dismiss-btn');
    expect(script).toContain('inbox-celebrate-btn');
    expect(script).toContain('AstryxToast');
  });
});
