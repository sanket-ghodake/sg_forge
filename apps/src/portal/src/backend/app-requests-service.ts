/**
 * @forge/portal - Application Access Requests Service (2026 LTS)
 * Manages user access requests, deduplication guards, scoped reviewer queues,
 * Anti-Self-Approval defense, and live approval-to-catalog synchronization.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001] [LLR-UI-003]
 */

import type { Database } from 'bun:sqlite';
import { createLogger, getDatabaseClient, bindAppPolicyApi } from '@forge/sdk';

const logger = createLogger('app-requests-service');

/** @requirements [HLR-PORTAL-201] [LLR-UI-003] */
export interface AppAccessRequestItem {
  id: string;
  userId: string;
  userEmail: string;
  appId: string;
  appName: string;
  reasonType: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USER_INACTIVE' | 'REVOKED_INACTIVE' | 'REVOKED' | string;
  createdAt: number;
  decidedBy?: string;
  decidedAt?: number;
  decisionNotes?: string;
}

function getDatabase(): Database {
  const db = getDatabaseClient('portal.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_app_access_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      app_id TEXT NOT NULL,
      appName TEXT NOT NULL,
      reason_type TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at INTEGER NOT NULL
    );
  `);
  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decided_by TEXT;'); } catch {}
  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decided_at INTEGER;'); } catch {}
  try { db.exec('ALTER TABLE portal_app_access_requests ADD COLUMN decision_notes TEXT;'); } catch {}
  return db;
}

/**
 * Create a new application access request with duplicate prevention guard.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
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
    const cleanAppId = req.appId.replace(/^apps\//, '');
    const now = Date.now();

    // 🛡️ Deduplication Guard: Check for existing PENDING or APPROVED requests
    const existing = db.query<any, [string, string, string]>(
      `SELECT id, status FROM portal_app_access_requests 
       WHERE user_id = ? AND (app_id = ? OR app_id = ?) AND status IN ('PENDING', 'APPROVED') 
       LIMIT 1;`
    ).get(req.userId, cleanAppId, `apps/${cleanAppId}`);

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('You already have an active request pending review for this application.');
      }
      if (existing.status === 'APPROVED') {
        throw new Error('You already have approved active access to this application.');
      }
    }

    const id = `req_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const sanitizedNotes = req.notes ? req.notes.trim().slice(0, 300) : null;

    db.run(`
      INSERT INTO portal_app_access_requests (id, user_id, user_email, app_id, appName, reason_type, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `, [id, req.userId, req.userEmail, cleanAppId, req.appName, req.reasonType, sanitizedNotes, now]);

    // 🔔 Real-Time Notification: Alert designated App Admins of new pending request
    try {
      const admins = db.query<any, [string, string]>(
        'SELECT user_id, user_email FROM portal_app_admins WHERE app_id = ? OR app_id = ?;'
      ).all(cleanAppId, `apps/${cleanAppId}`);

      for (const adm of admins) {
        if (adm.user_id && adm.user_id !== req.userId) {
          db.run(`
            INSERT INTO portal_notifications (id, user_id, org_id, type, title, message, sender, timestamp_text, is_unread, priority, category_tag, created_at)
            VALUES (?, ?, NULL, 'ACTION', 'New App Access Request', ?, 'App Governance', 'Just now', 1, 'HIGH', 'APP_ACCESS', ?);
          `, [
            `notif_${now}_${Math.random().toString(36).slice(2, 6)}`,
            adm.user_id,
            `${req.userEmail} requested access to ${req.appName}. Justification: ${req.reasonType}`,
            now,
          ]);
        }
      }
    } catch (notifErr) {
      logger.warn('Failed to dispatch app admin review notification:', { error: String(notifErr) });
    }

    return {
      id,
      userId: req.userId,
      userEmail: req.userEmail,
      appId: cleanAppId,
      appName: req.appName,
      reasonType: req.reasonType,
      notes: sanitizedNotes || undefined,
      status: 'PENDING',
      createdAt: now,
    };
  } catch (err: any) {
    logger.error('Failed to create app access request', err);
    throw err;
  }
}

/**
 * Retrieve all access requests submitted by a specific user.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function getUserAppAccessRequests(userId: string): AppAccessRequestItem[] {
  const db = getDatabase();
  try {
    const rows = db.query<any, [string]>(`
      SELECT id, user_id, user_email, app_id, appName, reason_type, notes, status, created_at, decided_by, decided_at, decision_notes
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
      decidedBy: r.decided_by || undefined,
      decidedAt: r.decided_at || undefined,
      decisionNotes: r.decision_notes || undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Retrieve all approved app IDs for a user to dynamically unlock launchable apps.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function getUserApprovedAppIds(userId: string, userEmail?: string): string[] {
  const db = getDatabase();
  try {
    let sql = `
      SELECT DISTINCT app_id FROM portal_app_access_requests
      WHERE (user_id = ?
    `;
    const params: string[] = [userId];
    if (userEmail) {
      sql += ' OR (user_email IS NOT NULL AND LOWER(user_email) = LOWER(?))';
      params.push(userEmail);
    }
    sql += ") AND status = 'APPROVED'";
    const rows = db.query<{ app_id: string }, any[]>(sql).all(...params);
    return rows.map((r) => r.app_id.replace(/^apps\//, ''));
  } catch {
    return [];
  }
}

/**
 * Cancel an active pending access request (user-scoped IDOR protected).
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function cancelAppAccessRequest(userId: string, requestId: string): boolean {
  const db = getDatabase();
  try {
    const res = db.run('DELETE FROM portal_app_access_requests WHERE id = ? AND user_id = ?', [requestId, userId]);
    return res.changes > 0;
  } catch {
    return false;
  }
}

/**
 * Retrieve pending access requests scoped to the authenticated admin's appointed applications.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function getPendingAppAccessRequests(adminContext?: {
  userId?: string;
  userEmail?: string;
  isSuperAdmin?: boolean;
  userRoles?: string[];
}): any[] {
  const db = getDatabase();
  try {
    let sql = `
      SELECT r.id, r.user_id, r.user_email, r.app_id, r.appName, r.reason_type, r.notes, r.status, r.created_at
      FROM portal_app_access_requests r
      WHERE r.status = 'PENDING'
    `;
    const params: any[] = [];

    const isPlatformAdmin = Boolean(
      adminContext?.isSuperAdmin ||
      adminContext?.userRoles?.some((r: string) => r.includes('super_admin') || r === 'roles/admin' || r === 'admin')
    );

    // 🔒 Admin Scoping: Delegated App Admins only see pending requests for their assigned apps
    if (adminContext && !isPlatformAdmin && (adminContext.userId || adminContext.userEmail)) {
      sql += `
        AND (
          r.app_id IN (
            SELECT app_id FROM portal_app_admins
            WHERE user_id = ? OR LOWER(user_email) = LOWER(?)
          )
          OR 'apps/' || r.app_id IN (
            SELECT app_id FROM portal_app_admins
            WHERE user_id = ? OR LOWER(user_email) = LOWER(?)
          )
        )
      `;
      params.push(
        adminContext.userId || '',
        adminContext.userEmail || '',
        adminContext.userId || '',
        adminContext.userEmail || ''
      );
    }

    sql += ' ORDER BY r.created_at DESC';
    const rows = db.query<any, any[]>(sql).all(...params);
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      userEmail: r.user_email,
      appId: r.app_id,
      app_id: r.app_id,
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

/**
 * Decide an application access request with Anti-Self-Approval and App-Admin boundary checks.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export async function decideAppAccessRequest(
  requestId: string,
  adminUserId: string,
  decision: 'APPROVE' | 'REJECT',
  options: {
    notes?: string;
    headers?: Record<string, string>;
    adminUserEmail?: string;
    isSuperAdmin?: boolean;
    userRoles?: string[];
  } = {}
): Promise<{ ok: boolean; status: string; error?: string }> {
  const db = getDatabase();
  try {
    const req = db.query<any, [string]>('SELECT * FROM portal_app_access_requests WHERE id = ?').get(requestId);
    if (!req) return { ok: false, status: 'error', error: 'Request not found' };

    // 🛡️ Anti-Self-Approval Security Defense: Admin cannot approve their own access request
    if (
      req.user_id === adminUserId ||
      (options.adminUserEmail && req.user_email.toLowerCase() === options.adminUserEmail.toLowerCase())
    ) {
      return {
        ok: false,
        status: 'error',
        error: 'Forbidden: Anti-Self-Approval policy active. You cannot approve your own access request.',
      };
    }

    // 🔒 Admin Scoping: Verify admin authority for this application
    const cleanAppId = req.app_id.replace(/^apps\//, '');
    const isPlatformAdmin = Boolean(
      options.isSuperAdmin ||
      options.userRoles?.some((r: string) => r.includes('super_admin') || r === 'roles/admin' || r === 'admin')
    );
    if (!isPlatformAdmin) {
      const isAssigned = db.query<any, [string, string, string, string]>(
        `SELECT id FROM portal_app_admins 
         WHERE (app_id = ? OR app_id = ?) AND (user_id = ? OR LOWER(user_email) = LOWER(?)) 
         LIMIT 1;`
      ).get(cleanAppId, `apps/${cleanAppId}`, adminUserId, options.adminUserEmail || '');

      if (!isAssigned) {
        return {
          ok: false,
          status: 'error',
          error: 'Forbidden: You are not designated as an administrator for this application.',
        };
      }
    }

    const now = Date.now();
    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    db.run(
      'UPDATE portal_app_access_requests SET status = ?, decided_by = ?, decided_at = ?, decision_notes = ? WHERE id = ?',
      [newStatus, adminUserId, now, options.notes || null, requestId]
    );

    const targetAppName = req.appName || req.app_id || 'Application';
    if (decision === 'APPROVE') {
      try {
        await bindAppPolicyApi({ userId: req.user_id, appId: req.app_id }, { headers: options.headers });
      } catch (err: any) {
        logger.warn('Inter-service app policy binding note:', err instanceof Error ? { error: err.message } : undefined);
      }

      db.run(`
        INSERT INTO portal_notifications (id, user_id, org_id, type, title, message, sender, timestamp_text, is_unread, priority, category_tag, created_at)
        VALUES (?, ?, NULL, 'ACTION', 'App Access Approved', ?, 'Security & App Governance', 'Just now', 1, 'NORMAL', 'APP_ACCESS', ?);
      `, [
        `notif_${now}_${Math.random().toString(36).slice(2, 6)}`,
        req.user_id,
        `Your request for ${targetAppName} was approved. You can now launch this tool from your Apps hub.`,
        now,
      ]);
    } else {
      db.run(`
        INSERT INTO portal_notifications (id, user_id, org_id, type, title, message, sender, timestamp_text, is_unread, priority, category_tag, created_at)
        VALUES (?, ?, NULL, 'ACTION', 'App Access Declined', ?, 'Security & App Governance', 'Just now', 1, 'NORMAL', 'APP_ACCESS', ?);
      `, [
        `notif_${now}_${Math.random().toString(36).slice(2, 6)}`,
        req.user_id,
        `Your request for ${targetAppName} was declined by the administrator.`,
        now,
      ]);
    }

    return { ok: true, status: newStatus };
  } catch (err: any) {
    logger.error('Failed to decide app access request', err);
    return { ok: false, status: 'error', error: err?.message || 'Failed to process decision' };
  }
}

/**
 * Invalidate pending access requests and mark approved requests inactive when an employee is offboarded.
 * @requirements [HLR-PORTAL-201] [LLR-UI-003]
 */
export function markEmployeeRequestsInactive(userId: string): {
  invalidatedPending: number;
  revokedApproved: number;
} {
  const db = getDatabase();
  try {
    const resPending = db.run(
      "UPDATE portal_app_access_requests SET status = 'USER_INACTIVE' WHERE user_id = ? AND status = 'PENDING'",
      [userId]
    );
    const resApproved = db.run(
      "UPDATE portal_app_access_requests SET status = 'REVOKED_INACTIVE' WHERE user_id = ? AND status = 'APPROVED'",
      [userId]
    );
    db.run('DELETE FROM portal_app_admins WHERE user_id = ?', [userId]);

    return {
      invalidatedPending: resPending.changes,
      revokedApproved: resApproved.changes,
    };
  } catch (err: any) {
    logger.error('Failed to mark employee requests inactive', err);
    return { invalidatedPending: 0, revokedApproved: 0 };
  }
}
