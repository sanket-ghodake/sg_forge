/**
 * @forge/portal - Application Entitled Users & Access Revocation Service (2026 LTS)
 * Provides real-time visibility into active users possessing authorized access to
 * an application, along with administrator-driven access revocation.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001] [LLR-UI-003]
 */

import type { Database } from 'bun:sqlite';
import { createLogger, getDatabaseClient } from '@forge/sdk';

const logger = createLogger('app-users-service');

/** @requirements [HLR-PORTAL-201] [LLR-UI-001] */
export interface AppEntitledUserRecord {
  requestId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userTitle: string;
  userDept: string;
  avatarInitial: string;
  grantedAt: number;
  approvedBy: string;
  notes?: string;
}

function getDatabase(): Database {
  return getDatabaseClient('portal.db');
}

/**
 * Retrieve the live roster of users who have approved active access to an application.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getAppActiveUsers(appId: string): AppEntitledUserRecord[] {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');

  try {
    const rows = db.query<any, [string, string]>(`
      SELECT id as request_id, user_id, user_email, app_id, appName, reason_type, notes,
             status, created_at, decided_by, decided_at, decision_notes
      FROM portal_app_access_requests
      WHERE (app_id = ? OR app_id = ?) AND status = 'APPROVED'
      ORDER BY decided_at DESC, created_at DESC;
    `).all(cleanAppId, `apps/${cleanAppId}`);

    return rows.map((r: any) => {
      const emailParts = (r.user_email || '').split('@')[0].split('.');
      const formattedName = emailParts
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || 'Authorized User';

      const initial = formattedName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AU';

      return {
        requestId: r.request_id,
        userId: r.user_id,
        userEmail: r.user_email,
        userName: formattedName,
        userTitle: r.reason_type || 'Active Entitlement',
        userDept: 'Enterprise Operations',
        avatarInitial: initial,
        grantedAt: r.decided_at || r.created_at,
        approvedBy: r.decided_by || 'System Administrator',
        notes: r.decision_notes || r.notes || undefined,
      };
    });
  } catch (err: any) {
    logger.error('Failed to query app entitled active users:', err);
    return [];
  }
}

/**
 * Revoke an entitled user's application access.
 * Updates request status to 'REVOKED' and dispatches notification.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function revokeUserAppAccess(
  appId: string,
  userId: string,
  actorId: string,
  options: { notes?: string } = {}
): { ok: boolean; revokedCount: number } {
  const db = getDatabase();
  const cleanAppId = appId.replace(/^apps\//, '');
  const now = Date.now();

  try {
    const res = db.run(
      `UPDATE portal_app_access_requests 
       SET status = 'REVOKED', decided_by = ?, decided_at = ?, decision_notes = ?
       WHERE (app_id = ? OR app_id = ?) AND user_id = ? AND status = 'APPROVED';`,
      [actorId, now, options.notes || 'Access administratively revoked', cleanAppId, `apps/${cleanAppId}`, userId]
    );

    if (res.changes > 0) {
      db.run(`
        INSERT INTO portal_notifications (id, user_id, org_id, type, title, message, sender, timestamp_text, is_unread, priority, category_tag, created_at)
        VALUES (?, ?, NULL, 'ACTION', 'App Access Revoked', ?, 'Security & App Governance', 'Just now', 1, 'HIGH', 'APP_ACCESS', ?);
      `, [
        `notif_${now}_${Math.random().toString(36).slice(2, 6)}`,
        userId,
        `Your access to application ${cleanAppId} has been administratively revoked.`,
        now,
      ]);
    }

    return { ok: true, revokedCount: res.changes };
  } catch (err: any) {
    logger.error('Failed to revoke user app access:', err);
    throw err;
  }
}
