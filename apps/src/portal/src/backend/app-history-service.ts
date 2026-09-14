/**
 * @forge/portal - Application Access Requests & Audit History Service (2026 LTS)
 * Handles historical requests querying, status aggregation, and admin-scoped filtering.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { createLogger, getDatabaseClient } from '@forge/sdk';

const logger = createLogger('app-history-service');

/**
 * AppAccessRequestHistoryItem
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AppAccessRequestHistoryItem {
  id: string;
  userId: string;
  userEmail: string;
  appId: string;
  appName: string;
  reasonType: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  createdAt: number;
  decidedBy?: string;
  decidedAt?: number;
  decisionNotes?: string;
}

/**
 * Fetch application access requests and full decision audit history
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getAppAccessRequestsHistory(options: {
  appId?: string;
  status?: string;
  search?: string;
  limit?: number;
  adminContext?: {
    userId?: string;
    userEmail?: string;
    isSuperAdmin?: boolean;
    userRoles?: string[];
  };
}): {
  requests: AppAccessRequestHistoryItem[];
  counts: { all: number; pending: number; approved: number; rejected: number };
  authorizedAppIds?: string[];
} {
  const db = getDatabaseClient('portal.db');
  try {
    let baseSql = 'SELECT id, user_id, user_email, app_id, appName, reason_type, notes, status, created_at, decided_by, decided_at, decision_notes FROM portal_app_access_requests WHERE 1=1';
    const params: any[] = [];

    const isPlatformAdmin = Boolean(
      options.adminContext?.isSuperAdmin ||
      options.adminContext?.userRoles?.some((r: string) => r.includes('super_admin') || r === 'roles/admin' || r === 'admin')
    );

    // 🔒 Admin Scoping: Delegated App Admins only see request history for their assigned apps
    let authorizedAppIds: string[] = ['all'];
    if (options.adminContext && !isPlatformAdmin && (options.adminContext.userId || options.adminContext.userEmail)) {
      baseSql += `
        AND (
          app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
          OR 'apps/' || app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
        )
      `;
      params.push(
        options.adminContext.userId || '',
        options.adminContext.userEmail || '',
        options.adminContext.userId || '',
        options.adminContext.userEmail || ''
      );

      const adminApps = db.query<{ app_id: string }, [string, string]>(
        'SELECT DISTINCT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?)'
      ).all(options.adminContext.userId || '', options.adminContext.userEmail || '');
      authorizedAppIds = adminApps.map(a => a.app_id.replace(/^apps\//, ''));
    }

    const cleanAppId = options.appId && options.appId !== 'all' ? options.appId.replace(/^apps\//, '') : null;
    if (cleanAppId) {
      baseSql += ' AND (app_id = ? OR app_id = ?)';
      params.push(cleanAppId, `apps/${cleanAppId}`);
    }

    if (options.status && options.status !== 'ALL') {
      baseSql += ' AND UPPER(status) = ?';
      params.push(options.status.toUpperCase());
    }

    if (options.search && options.search.trim()) {
      const q = `%${options.search.trim().toLowerCase()}%`;
      baseSql += ' AND (LOWER(user_email) LIKE ? OR LOWER(appName) LIKE ? OR LOWER(COALESCE(notes, "")) LIKE ?)';
      params.push(q, q, q);
    }

    baseSql += ' ORDER BY created_at DESC';

    if (options.limit && options.limit > 0) {
      baseSql += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = db.query<any, any[]>(baseSql).all(...params);

    // Compute status counts for filter pills
    let countSql = 'SELECT status, count(*) as count FROM portal_app_access_requests WHERE 1=1';
    const countParams: any[] = [];
    if (options.adminContext && !options.adminContext.isSuperAdmin && (options.adminContext.userId || options.adminContext.userEmail)) {
      countSql += `
        AND (
          app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
          OR 'apps/' || app_id IN (SELECT app_id FROM portal_app_admins WHERE user_id = ? OR LOWER(user_email) = LOWER(?))
        )
      `;
      countParams.push(
        options.adminContext.userId || '',
        options.adminContext.userEmail || '',
        options.adminContext.userId || '',
        options.adminContext.userEmail || ''
      );
    }
    if (cleanAppId) {
      countSql += ' AND (app_id = ? OR app_id = ?)';
      countParams.push(cleanAppId, `apps/${cleanAppId}`);
    }
    countSql += ' GROUP BY status';
    const countRows = db.query<any, any[]>(countSql).all(...countParams);

    const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
    for (const r of countRows) {
      const s = (r.status || '').toUpperCase();
      const c = Number(r.count || 0);
      counts.all += c;
      if (s === 'PENDING') counts.pending += c;
      else if (s === 'APPROVED') counts.approved += c;
      else if (s === 'REJECTED' || s === 'DECLINED') counts.rejected += c;
    }

    const requests: AppAccessRequestHistoryItem[] = rows.map((r: any) => ({
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

    return { requests, counts, authorizedAppIds };
  } catch (err) {
    logger.error('Failed to query app access requests history', err);
    return { requests: [], counts: { all: 0, pending: 0, approved: 0, rejected: 0 }, authorizedAppIds: [] };
  }
}
