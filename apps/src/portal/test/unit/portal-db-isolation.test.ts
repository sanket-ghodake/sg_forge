/**
 * @forge/portal - Tier 1 Unit Test: Dedicated Database Isolation & Multi-User State
 * Tests multi-user notification read/dismissal isolation, dynamic relative dates,
 * real SQLite access requests persistence, and personal API tokens.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  clearAllNotifications,
  createNotification,
  getLiveNotifications,
  markAllNotificationsAsRead,
  dismissNotification,
  computeRelativeTime,
  formatEventDate,
  createAppAccessRequest,
  getUserAppAccessRequests,
  cancelAppAccessRequest,
  createApiToken,
  getUserApiTokens,
  revokeApiToken,
} from '../../src/backend/inbox-service';

describe('Tier 1 Unit: Portal DB Multi-User Isolation & Real-Time State', () => {
  beforeEach(() => {
    clearAllNotifications();
  });

  it('multi-user junction reads: marking broadcast notification read by User A leaves it unread for User B', () => {
    // Arrange: create broadcast notification with no specific user_id
    const notifId = 'notif_broadcast_test_01';
    createNotification({
      id: notifId,
      userId: null,
      orgId: 'org_sg_forge',
      type: 'BROADCAST',
      title: 'Global System Update',
      message: 'Platform scheduled maintenance complete',
      sender: 'DevOps Central',
      timestamp: 'Just now',
      isUnread: true,
      categoryTag: 'Maintenance',
    });

    // Act: User A marks all as read
    markAllNotificationsAsRead('user_alice');

    // Assert: User A sees 0 unread, User B still sees 1 unread
    const aliceNotifs = getLiveNotifications('user_alice');
    const bobNotifs = getLiveNotifications('user_bob');

    const aliceItem = aliceNotifs.find(n => n.id === notifId);
    const bobItem = bobNotifs.find(n => n.id === notifId);

    expect(aliceItem).toBeDefined();
    expect(aliceItem?.isUnread).toBe(false);

    expect(bobItem).toBeDefined();
    expect(bobItem?.isUnread).toBe(true);
  });

  it('multi-user junction dismissals: dismissing broadcast notification by User A does not hide it from User B', () => {
    // Arrange: create broadcast notification
    const notifId = 'notif_broadcast_test_02';
    createNotification({
      id: notifId,
      userId: null,
      orgId: 'org_sg_forge',
      type: 'BROADCAST',
      title: 'Company Picnic Announcement',
      message: 'Annual company picnic next Friday',
      sender: 'People Operations',
      timestamp: '1 hour ago',
      isUnread: true,
      categoryTag: 'Social',
    });

    // Act: User A dismisses it
    dismissNotification(notifId, 'user_alice');

    // Assert: User A no longer sees it, User B still sees it
    const aliceNotifs = getLiveNotifications('user_alice');
    const bobNotifs = getLiveNotifications('user_bob');

    expect(aliceNotifs.find(n => n.id === notifId)).toBeUndefined();
    expect(bobNotifs.find(n => n.id === notifId)).toBeDefined();
  });

  it('dynamic relative time computation: formats relative time without hardcoded mock strings', () => {
    const now = 1756857600000; // Fixed epoch for testing
    const dayMs = 86400000;

    expect(computeRelativeTime(now, now)).toBe('Today');
    expect(computeRelativeTime(now + dayMs, now)).toBe('Tomorrow');
    expect(computeRelativeTime(now + 4 * dayMs, now)).toBe('In 4 days');
    expect(computeRelativeTime(now + 14 * dayMs, now)).toBe('In 2 weeks');
    expect(computeRelativeTime(now + 60 * dayMs, now)).toBe('In 2 months');
    expect(computeRelativeTime(now - dayMs, now)).toBe('Yesterday');
    expect(computeRelativeTime(now - 5 * dayMs, now)).toBe('5 days ago');
  });

  it('access requests lifecycle: creates, queries by user, and cancels access requests in SQLite', () => {
    const userId = 'usr_engineer_01';
    const email = 'engineer@forge.internal';

    // Act 1: Create request
    const req = createAppAccessRequest({
      userId,
      userEmail: email,
      appId: 'telemetry',
      appName: 'Observability Cloud',
      reasonType: 'Daily Core Job Responsibility',
      notes: 'Need access to debug production metrics',
    });

    expect(req).toBeDefined();
    expect(req?.status).toBe('PENDING');

    // Act 2: Query user requests
    const userReqs = getUserAppAccessRequests(userId);
    expect(userReqs).toHaveLength(1);
    expect(userReqs[0].appId).toBe('telemetry');
    expect(userReqs[0].notes).toBe('Need access to debug production metrics');

    // Act 3: Cancel request
    const cancelled = cancelAppAccessRequest(userId, req!.id);
    expect(cancelled).toBe(true);

    const remainingReqs = getUserAppAccessRequests(userId);
    expect(remainingReqs).toHaveLength(0);
  });

  it('personal API tokens lifecycle: generates hashed token, stores prefix, and revokes', () => {
    const userId = 'usr_developer_02';

    // Act 1: Generate token
    const tokenResult = createApiToken(userId, 'CLI Automation Key');
    expect(tokenResult).toBeDefined();
    expect(tokenResult?.token).toStartWith('forge_pat_');
    expect(tokenResult?.item.prefix).toStartWith('forge_pat_');

    // Act 2: List tokens
    const tokens = getUserApiTokens(userId);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].name).toBe('CLI Automation Key');

    // Act 3: Revoke token
    const revoked = revokeApiToken(userId, tokenResult!.item.id);
    expect(revoked).toBe(true);

    const remainingTokens = getUserApiTokens(userId);
    expect(remainingTokens).toHaveLength(0);
  });
});
