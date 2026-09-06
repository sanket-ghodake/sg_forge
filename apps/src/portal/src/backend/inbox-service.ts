/**
 * @forge/portal - Live Real-Time Notifications & Portal Backend Service (2026 LTS)
 * Zero-hardcoding: Dedicated Turso / SQLite (portal.db) storage with real-time state.
 * Multi-tenant safe: Isolated user read status, user-scoped dismissals, access requests, and API tokens.
 */

import type { Database } from 'bun:sqlite';
import { randomBytes } from 'node:crypto';
import { createLogger, getDatabaseClient } from '@forge/sdk';

const logger = createLogger('portal-inbox-service');

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export interface LiveNotificationItem {
  id: string;
  userId: string | null;
  orgId: string | null;
  type: 'ACTION' | 'BROADCAST' | 'CELEBRATION' | 'MENTION' | 'SECURITY';
  title: string;
  message: string;
  sender: string;
  senderRole?: string;
  timestamp: string;
  isUnread: boolean;
  priority?: 'HIGH' | 'NORMAL';
  actionLabel?: string;
  actionType?: string;
  categoryTag: string;
  createdAt: number;
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export interface LiveCompanyEvent {
  id: string;
  title: string;
  date: string;
  type: 'HOLIDAY' | 'ALL_HANDS' | 'SOCIAL';
  relativeTime: string;
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export interface AppAccessRequestItem {
  id: string;
  userId: string;
  userEmail: string;
  appId: string;
  appName: string;
  reasonType: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export interface UserApiTokenItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function computeRelativeTime(targetDateMs: number, nowMs: number = Date.now()): string {
  const diffMs = targetDateMs - nowMs;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? 'Yesterday' : `${absDays} days ago`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 6) return `In ${diffDays} days`;
  const weeks = Math.round(diffDays / 7);
  if (weeks <= 4) return weeks === 1 ? 'In 1 week' : `In ${weeks} weeks`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? 'In 1 month' : `In ${months} months`;
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function formatEventDate(targetDateMs: number): string {
  const d = new Date(targetDateMs);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDatabase(): Database {
  const db = getDatabaseClient('portal.db');
  initPortalTables(db);
  return db;
}

function initPortalTables(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_notifications (id TEXT PRIMARY KEY, user_id TEXT, org_id TEXT, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, sender TEXT NOT NULL, sender_role TEXT, timestamp_text TEXT NOT NULL, is_unread INTEGER NOT NULL DEFAULT 1, priority TEXT DEFAULT 'NORMAL', action_label TEXT, action_type TEXT, category_tag TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS portal_notification_reads (user_id TEXT NOT NULL, notification_id TEXT NOT NULL, read_at INTEGER NOT NULL, PRIMARY KEY (user_id, notification_id));
    CREATE TABLE IF NOT EXISTS portal_notification_dismissals (user_id TEXT NOT NULL, notification_id TEXT NOT NULL, dismissed_at INTEGER NOT NULL, PRIMARY KEY (user_id, notification_id));
    CREATE TABLE IF NOT EXISTS portal_company_events (id TEXT PRIMARY KEY, title TEXT NOT NULL, event_date INTEGER NOT NULL, event_type TEXT NOT NULL, location TEXT, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS portal_user_preferences (user_id TEXT PRIMARY KEY, digest_pref TEXT NOT NULL DEFAULT 'instant', updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS portal_notification_reactions (id TEXT PRIMARY KEY, notification_id TEXT NOT NULL, user_id TEXT NOT NULL, reaction_type TEXT NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY (notification_id) REFERENCES portal_notifications(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS portal_app_access_requests (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, user_email TEXT NOT NULL, app_id TEXT NOT NULL, appName TEXT NOT NULL, reason_type TEXT NOT NULL, notes TEXT, status TEXT NOT NULL DEFAULT 'PENDING', created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS portal_user_tokens (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, token_hash TEXT NOT NULL, prefix TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER);
  `);

  const eventCount = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM portal_company_events').get();
  if (!eventCount || eventCount.count === 0) {
    const now = Date.now();
    const dayMs = 86400000;
    const evt1Date = now + 12 * dayMs;
    const evt2Date = now + 28 * dayMs;
    const evt3Date = now + 65 * dayMs;
    db.run(`
      INSERT INTO portal_company_events (id, title, event_date, event_type, location, created_at)
      VALUES 
        ('evt_all_hands_01', 'Q3 Global All-Hands & Product Roadmap', ?, 'ALL_HANDS', 'Main Auditorium & Live Stream', ?),
        ('evt_tech_summit_02', 'Annual Architecture & Cloud Summit', ?, 'SOCIAL', 'San Francisco Innovation Hub', ?),
        ('evt_holiday_03', 'Labor & Foundation Day Holiday', ?, 'HOLIDAY', 'Company-wide Recharge Day', ?)
    `, [evt1Date, now, evt2Date, now, evt3Date, now]);
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function clearAllNotifications(): void {
  const db = getDatabase();
  db.exec('DELETE FROM portal_notifications; DELETE FROM portal_notification_reads; DELETE FROM portal_notification_dismissals;');
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function getLiveNotifications(userId?: string, orgId?: string): LiveNotificationItem[] {
  const db = getDatabase();
  try {
    const uid = userId || null;
    const oid = orgId || null;
    const rows = db.query<any, [string | null, string | null, string | null, string | null, string | null]>(`
      SELECT n.id, n.user_id, n.org_id, n.type, n.title, n.message, n.sender, n.sender_role,
             n.timestamp_text, n.is_unread, n.priority, n.action_label, n.action_type, n.category_tag, n.created_at,
             (CASE 
               WHEN nr.read_at IS NOT NULL THEN 1 
               WHEN n.user_id IS NOT NULL AND n.is_unread = 0 THEN 1 
               ELSE 0 
              END) as user_read_flag
      FROM portal_notifications n
      LEFT JOIN portal_notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
      LEFT JOIN portal_notification_dismissals nd ON nd.notification_id = n.id AND nd.user_id = ?
      WHERE (n.user_id IS NULL OR n.user_id = ?)
        AND (n.org_id IS NULL OR ? IS NULL OR n.org_id = ?)
        AND (nd.dismissed_at IS NULL)
      ORDER BY n.created_at DESC
    `).all(uid, uid, uid, oid, oid);

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      orgId: r.org_id,
      type: r.type,
      title: r.title,
      message: r.message,
      sender: r.sender,
      senderRole: r.sender_role,
      timestamp: r.timestamp_text,
      isUnread: r.user_read_flag === 0,
      priority: r.priority,
      actionLabel: r.action_label,
      actionType: r.action_type,
      categoryTag: r.category_tag,
      createdAt: r.created_at,
    }));
  } catch (err: any) {
    logger.error('Failed to query notifications from database', err);
    return [];
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function createNotification(notif: Omit<LiveNotificationItem, 'createdAt'>): boolean {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO portal_notifications (
        id, user_id, org_id, type, title, message, sender, sender_role,
        timestamp_text, is_unread, priority, action_label, action_type, category_tag, created_at
      ) VALUES (
        $id, $user_id, $org_id, $type, $title, $message, $sender, $sender_role,
        $timestamp_text, $is_unread, $priority, $action_label, $action_type, $category_tag, $created_at
      )
    `);

    stmt.run({
      $id: notif.id,
      $user_id: notif.userId || null,
      $org_id: notif.orgId || null,
      $type: notif.type,
      $title: notif.title,
      $message: notif.message,
      $sender: notif.sender,
      $sender_role: notif.senderRole || null,
      $timestamp_text: notif.timestamp,
      $is_unread: notif.isUnread ? 1 : 0,
      $priority: notif.priority || 'NORMAL',
      $action_label: notif.actionLabel || null,
      $action_type: notif.actionType || null,
      $category_tag: notif.categoryTag,
      $created_at: Date.now(),
    });
    return true;
  } catch (err: any) {
    logger.error('Failed to create notification', err);
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function markAllNotificationsAsRead(userId?: string): boolean {
  const db = getDatabase();
  try {
    const now = Date.now();
    if (userId) {
      const unread = db.query<{ id: string }, [string, string, string]>(`
        SELECT n.id 
        FROM portal_notifications n
        LEFT JOIN portal_notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
        LEFT JOIN portal_notification_dismissals nd ON nd.notification_id = n.id AND nd.user_id = ?
        WHERE (n.user_id IS NULL OR n.user_id = ?)
          AND (nd.dismissed_at IS NULL)
          AND (nr.read_at IS NULL)
      `).all(userId, userId, userId);

      const stmt = db.prepare('INSERT OR IGNORE INTO portal_notification_reads (user_id, notification_id, read_at) VALUES (?, ?, ?)');
      for (const u of unread) {
        stmt.run(userId, u.id, now);
      }
      db.run('UPDATE portal_notifications SET is_unread = 0 WHERE user_id = ?', [userId]);
    } else {
      db.run('UPDATE portal_notifications SET is_unread = 0');
    }
    return true;
  } catch (err: any) {
    logger.error('Failed to mark notifications as read', err);
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function dismissNotification(notificationId: string, userId?: string): boolean {
  const db = getDatabase();
  try {
    const now = Date.now();
    if (userId) {
      db.run('INSERT OR IGNORE INTO portal_notification_dismissals (user_id, notification_id, dismissed_at) VALUES (?, ?, ?)', [userId, notificationId, now]);
      db.run('DELETE FROM portal_notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
    } else {
      db.run('DELETE FROM portal_notifications WHERE id = ?', [notificationId]);
    }
    return true;
  } catch (err: any) {
    logger.error('Failed to dismiss notification', err);
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function recordCelebration(notificationId: string, userId: string): boolean {
  const db = getDatabase();
  try {
    db.run(
      'INSERT OR IGNORE INTO portal_notification_reactions (id, notification_id, user_id, reaction_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [`rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, notificationId, userId, 'CELEBRATE', Date.now()]
    );
    return true;
  } catch (err: any) {
    logger.error('Failed to record celebration reaction', err);
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function getLiveCompanyEvents(): LiveCompanyEvent[] {
  const db = getDatabase();
  try {
    const rows = db.query<any, []>('SELECT id, title, event_date, event_type, location FROM portal_company_events ORDER BY event_date ASC').all();
    const now = Date.now();
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      date: formatEventDate(r.event_date),
      type: r.event_type,
      relativeTime: computeRelativeTime(r.event_date, now),
    }));
  } catch (err: any) {
    logger.error('Failed to query company events', err);
    return [];
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function getUserDeliveryPreference(userId: string): string {
  const db = getDatabase();
  try {
    const row = db.query<{ digest_pref: string }, [string]>('SELECT digest_pref FROM portal_user_preferences WHERE user_id = ?').get(userId);
    return row?.digest_pref || 'instant';
  } catch {
    return 'instant';
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function setUserDeliveryPreference(userId: string, pref: string): boolean {
  const db = getDatabase();
  try {
    db.run(`
      INSERT INTO portal_user_preferences (user_id, digest_pref, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET digest_pref = excluded.digest_pref, updated_at = excluded.updated_at
    `, [userId, pref, Date.now()]);
    return true;
  } catch (err: any) {
    logger.error('Failed to save user delivery preference', err);
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function createAppAccessRequest(req: {
  userId: string;
  userEmail: string;
  appId: string;
  appName: string;
  reasonType: string;
  notes?: string;
}): AppAccessRequestItem | null {
  const db = getDatabase();
  try {
    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    db.run(`
      INSERT INTO portal_app_access_requests (id, user_id, user_email, app_id, appName, reason_type, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `, [id, req.userId, req.userEmail, req.appId, req.appName, req.reasonType, req.notes || null, now]);

    return {
      id,
      userId: req.userId,
      userEmail: req.userEmail,
      appId: req.appId,
      appName: req.appName,
      reasonType: req.reasonType,
      notes: req.notes,
      status: 'PENDING',
      createdAt: now,
    };
  } catch (err: any) {
    logger.error('Failed to create app access request', err);
    return null;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function getUserAppAccessRequests(userId: string): AppAccessRequestItem[] {
  const db = getDatabase();
  try {
    const rows = db.query<any, [string]>(`
      SELECT id, user_id, user_email, app_id, appName, reason_type, notes, status, created_at
      FROM portal_app_access_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      userEmail: r.user_email,
      appId: r.app_id,
      appName: r.appName,
      reasonType: r.reason_type,
      notes: r.notes || undefined,
      status: r.status,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function cancelAppAccessRequest(userId: string, requestId: string): boolean {
  const db = getDatabase();
  try {
    db.run('DELETE FROM portal_app_access_requests WHERE id = ? AND user_id = ?', [requestId, userId]);
    return true;
  } catch {
    return false;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function createApiToken(userId: string, name: string): { token: string; item: UserApiTokenItem } | null {
  const db = getDatabase();
  try {
    const id = `pat_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const secret = randomBytes(24).toString('hex');
    const token = `forge_pat_${secret}`;
    const prefix = token.slice(0, 14) + '...';
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(token);
    const tokenHash = hasher.digest('hex');
    const now = Date.now();
    const expiresAt = now + 90 * 86400000;
    db.run('INSERT INTO portal_user_tokens (id, user_id, name, token_hash, prefix, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, userId, name, tokenHash, prefix, now, expiresAt]);
    return { token, item: { id, name, prefix, createdAt: now } };
  } catch (err: any) {
    logger.error('Failed to create user API token', err);
    return null;
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function getUserApiTokens(userId: string): UserApiTokenItem[] {
  try {
    const rows = getDatabase().query<any, [string]>('SELECT id, name, prefix, created_at FROM portal_user_tokens WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    return rows.map((r: any) => ({ id: r.id, name: r.name, prefix: r.prefix, createdAt: r.created_at }));
  } catch {
    return [];
  }
}

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export function revokeApiToken(userId: string, tokenId: string): boolean {
  try {
    getDatabase().run('DELETE FROM portal_user_tokens WHERE id = ? AND user_id = ?', [tokenId, userId]);
    return true;
  } catch {
    return false;
  }
}
