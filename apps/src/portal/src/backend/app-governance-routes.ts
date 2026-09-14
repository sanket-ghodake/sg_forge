/**
 * @forge/portal - Application Governance API Route Handlers (2026 LTS)
 * Modular route dispatching for App Admins, Policies, and Ingress routing.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { getDatabaseClient } from '@forge/sdk';
import {
  getAppGovernance,
  addAppAdmin,
  removeAppAdmin,
  updateAppPolicy,
  getAppAccessRequestsHistory,
} from './app-governance-service';
import { getAppActiveUsers, revokeUserAppAccess } from './app-users-service';
import { markEmployeeRequestsInactive } from './app-requests-service';

function isAuthorizedForApp(
  authContext: { user?: { id: string; email: string; roles: string[] } },
  appId: string
): boolean {
  const roles = authContext.user?.roles || [];
  if (roles.some((r) => r.includes('super_admin') || r === 'roles/admin' || r === 'admin')) return true;

  const cleanAppId = appId.replace(/^apps\//, '');
  try {
    const db = getDatabaseClient('portal.db');
    const record = db.query<any, [string, string, string, string]>(
      `SELECT id FROM portal_app_admins 
       WHERE (app_id = ? OR app_id = ?) AND (user_id = ? OR LOWER(user_email) = LOWER(?)) 
       LIMIT 1;`
    ).get(cleanAppId, `apps/${cleanAppId}`, authContext.user?.id || '', authContext.user?.email || '');
    return Boolean(record);
  } catch {
    return false;
  }
}

/**
 * Handle application governance API requests
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export async function handleAppGovernanceRoutes(
  req: Request,
  url: URL,
  authContext: { authenticated: boolean; user?: { id: string; email: string; roles: string[] } },
  forwardHeaders: Record<string, string> = {}
): Promise<Response | null> {
  const path = url.pathname.replace(/^\/portal/, '');

  // 1. GET /api/v1/portal/apps/:appId/governance
  const govMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/governance$/);
  if (govMatch && req.method === 'GET') {
    const appId = decodeURIComponent(govMatch[1]);
    try {
      const data = getAppGovernance(appId);
      return Response.json({ ok: true, data });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to fetch governance data' }, { status: 400 });
    }
  }

  // 2. GET /api/v1/portal/apps/:appId/users (List Active Entitled Users)
  const usersMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/users$/);
  if (usersMatch && req.method === 'GET') {
    const appId = decodeURIComponent(usersMatch[1]);
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Administrative role required' }, { status: 403 });
    }
    if (!isAuthorizedForApp(authContext, appId)) {
      return Response.json({ ok: false, error: 'Forbidden: You are not designated as an administrator for this application' }, { status: 403 });
    }
    try {
      const users = getAppActiveUsers(appId);
      return Response.json({ ok: true, data: users });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to fetch entitled users' }, { status: 400 });
    }
  }

  // 3. POST /api/v1/portal/apps/:appId/users/:userId/revoke (Revoke User Access)
  const revokeMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/users\/([^/]+)\/revoke$/);
  if (revokeMatch && req.method === 'POST') {
    const appId = decodeURIComponent(revokeMatch[1]);
    const targetUserId = decodeURIComponent(revokeMatch[2]);
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Administrative role required to revoke access' }, { status: 403 });
    }
    if (!isAuthorizedForApp(authContext, appId)) {
      return Response.json({ ok: false, error: 'Forbidden: You are not designated as an administrator for this application' }, { status: 403 });
    }
    try {
      const body = await req.json().catch(() => ({}));
      const result = revokeUserAppAccess(appId, targetUserId, authContext.user?.id || 'admin_actor', { notes: body.notes });
      return Response.json({ ok: true, data: result });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to revoke user access' }, { status: 400 });
    }
  }

  // 4. POST /api/v1/portal/apps/:appId/admins (Assign App Admin)
  const addAdminMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/admins$/);
  if (addAdminMatch && req.method === 'POST') {
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Assigning app administrators requires administrative privileges' }, { status: 403 });
    }

    const appId = decodeURIComponent(addAdminMatch[1]);
    if (!isAuthorizedForApp(authContext, appId)) {
      return Response.json({ ok: false, error: 'Forbidden: You do not have administrative authority to manage admins for this application' }, { status: 403 });
    }

    try {
      const body = await req.json();
      if (!body.userId || !body.userName || !body.userEmail) {
        return Response.json({ ok: false, error: 'userId, userName, and userEmail are required' }, { status: 400 });
      }

      const created = await addAppAdmin(
        appId,
        {
          userId: body.userId,
          userName: body.userName,
          userEmail: body.userEmail,
          userTitle: body.userTitle || 'Team Administrator',
          userDept: body.userDept || 'Operations',
          roleType: body.roleType || 'ADMIN',
          avatarInitial: body.avatarInitial,
        },
        authContext.user?.id || 'admin_actor',
        { headers: forwardHeaders }
      );
      return Response.json({ ok: true, data: created });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to assign administrator' }, { status: 400 });
    }
  }

  // 5. DELETE /api/v1/portal/apps/:appId/admins/:userId (Revoke App Admin)
  const delAdminMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/admins\/([^/]+)$/);
  if (delAdminMatch && req.method === 'DELETE') {
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Revoking app administrators requires administrative privileges' }, { status: 403 });
    }

    const appId = decodeURIComponent(delAdminMatch[1]);
    if (!isAuthorizedForApp(authContext, appId)) {
      return Response.json({ ok: false, error: 'Forbidden: You do not have administrative authority to revoke admins for this application' }, { status: 403 });
    }

    const targetUserId = decodeURIComponent(delAdminMatch[2]);
    try {
      const result = removeAppAdmin(appId, targetUserId, authContext.user?.id || 'admin_actor');
      return Response.json({ ok: true, data: result });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to revoke administrator' }, { status: 400 });
    }
  }

  // 6. PUT /api/v1/portal/apps/:appId/policy (Update Access Policy & Routing)
  const updatePolicyMatch = path.match(/^\/api\/v1\/portal\/apps\/([^/]+)\/policy$/);
  if (updatePolicyMatch && (req.method === 'PUT' || req.method === 'POST')) {
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Policy updates require administrative privileges' }, { status: 403 });
    }

    const appId = decodeURIComponent(updatePolicyMatch[1]);
    if (!isAuthorizedForApp(authContext, appId)) {
      return Response.json({ ok: false, error: 'Forbidden: You do not have administrative authority to configure policy for this application' }, { status: 403 });
    }

    const isSuperAdmin = roles.some((r) => r.includes('super_admin'));

    try {
      const body = await req.json();
      const updated = updateAppPolicy(appId, body, authContext.user?.id || 'admin_actor', isSuperAdmin);
      return Response.json({ ok: true, data: updated });
    } catch (err: any) {
      return Response.json({ ok: false, error: err?.message || 'Failed to update access policy' }, { status: 400 });
    }
  }

  // 7. GET /api/v1/portal/apps/requests/history (or /api/v1/portal/apps/:appId/requests/history)
  const historyMatch = path.match(/^\/api\/v1\/portal\/apps(?:\/([^/]+))?\/requests\/history$/);
  if (historyMatch && req.method === 'GET') {
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Request history requires administrative privileges' }, { status: 403 });
    }

    const isSuperAdmin = roles.some((r) => r.includes('super_admin'));
    const urlAppId = historyMatch[1] ? decodeURIComponent(historyMatch[1]) : undefined;
    const qAppId = url.searchParams.get('appId') || urlAppId;
    const status = url.searchParams.get('status') || 'ALL';
    const search = url.searchParams.get('search') || '';
    const limit = Number(url.searchParams.get('limit') || 100);

    const historyData = getAppAccessRequestsHistory({
      appId: qAppId && qAppId !== 'all' ? qAppId : undefined,
      status,
      search,
      limit,
      adminContext: {
        userId: authContext.user?.id,
        userEmail: authContext.user?.email,
        isSuperAdmin,
        userRoles: roles,
      },
    });

    return Response.json({ ok: true, data: historyData });
  }

  // 8. POST /api/v1/portal/employees/:userId/offboard
  const offboardMatch = path.match(/^\/api\/v1\/portal\/employees\/([^/]+)\/offboard$/);
  if (offboardMatch && req.method === 'POST') {
    const roles = authContext.user?.roles || [];
    const isAdmin = roles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('super_admin'));
    if (!isAdmin) {
      return Response.json({ ok: false, error: 'Forbidden: Admin access required for employee offboarding' }, { status: 403 });
    }
    const targetUserId = decodeURIComponent(offboardMatch[1]);
    const result = markEmployeeRequestsInactive(targetUserId);
    return Response.json({ ok: true, data: result });
  }

  return null;
}
