/**
 * @forge/portal - Main Workspace Portal & Org Canvas Service (2026 LTS)
 * Serves on Port 3001 (Ingress /portal via Reverse Proxy)
 * Integrated with Central Auth Microservice & ASVS 5.0 Authentication Gate.
 */

import {
  authGuard, createLogger, createSafeHandler, handleBrandAssetRequest,
  handleServiceWorkerRequest, fetchOrgTree, fetchEmployeesList, createEmployeeApi,
  batchImportEmployeesApi, fetchManagersList, fetchAuditLogs, fetchUserSessions, renderRouteNotFound,
} from '@forge/sdk';
import { renderPortalHtml, type HeaderUserContext, getPortalApps } from './frontend';
import {
  getLiveNotifications, markAllNotificationsAsRead, dismissNotification,
  recordCelebration, getLiveCompanyEvents, getUserDeliveryPreference,
  setUserDeliveryPreference, createAppAccessRequest, getUserAppAccessRequests,
  getUserApprovedAppIds, cancelAppAccessRequest, getPendingAppAccessRequests,
  decideAppAccessRequest, createApiToken, getUserApiTokens, revokeApiToken,
} from './backend/inbox-service';
import { handleAppGovernanceRoutes } from './backend/app-governance-routes';
import { validateMutatingRequest, checkPortalRateLimit, sanitizeEmployeeDirectory } from './backend/security-middleware';


const PORT = Number(process.env.PORTAL_PORT || process.env.PORT || 3001);
const logger = createLogger('portal-service');

/**
 * startPortalServer
 * @requirements [HLR-PORTAL-201] [LLR-SUB-006]
 */
export function startPortalServer(port: number = PORT) {
  const handler = createSafeHandler('portal-service', async (req: Request) => {
    const url = new URL(req.url);

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 0.1 Service Worker & Offline Cache Asset Interceptor
    const swRes = handleServiceWorkerRequest(req);
    if (swRes) return swRes;

    if (url.pathname === '/favicon.ico' || url.pathname === '/portal/favicon.ico') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--forge-primary)"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    }

    if (url.pathname.endsWith('/health')) {
      return Response.json({ status: 'ok', service: 'portal', port, uptime: process.uptime() });
    }

    // Pillar 2: Browser Telemetry Log Bridge
    if (url.pathname === '/api/logs/browser' || url.pathname === '/portal/api/logs/browser') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      try {
        const body = await req.json();
        logger.logBrowserEvent(
          body.severity || 'INFO',
          body.message || 'Browser event',
          body.metadata,
          body.error ? new Error(body.error.message || body.message) : undefined
        );
        return Response.json({ ok: true });
      } catch {
        return Response.json({ ok: false }, { status: 400 });
      }
    }

    // 🛡️ Zero-Trust SSO Auth Gate & RBAC Verification
    const auth = authGuard(req, {
      appName: 'Main Portal & Org Canvas',
      requiredRoles: ['roles/employee', 'roles/super_admin'],
    });

    if (!auth.authenticated) {
      return auth.response!;
    }

    const csrfRes = validateMutatingRequest(req);
    if (csrfRes) return csrfRes;

    const userRoles = auth.user?.roles || [];
    const isAdmin = userRoles.some((r: string) => r.includes('admin') || r.includes('manager'));
    const isSuperAdmin = userRoles.some((r: string) => r.includes('super_admin'));

    // Extract authorization headers to safely forward to internal microservices
    const cookie = req.headers.get('cookie') || '';
    const authorization = req.headers.get('authorization') || '';
    const forwardHeaders: Record<string, string> = {};
    if (cookie) forwardHeaders['cookie'] = cookie;
    if (authorization) forwardHeaders['authorization'] = authorization;

    // JSON API Endpoints for dynamic hydration
    if (url.pathname === '/api/v1/portal/canvas/tree' || url.pathname === '/portal/api/v1/portal/canvas/tree') {
      const rl = checkPortalRateLimit(`tree:${auth.user!.id}`, 60, 60);
      if (rl) return rl;
      try {
        const maxDepth = url.searchParams.get('max_depth') ? Number(url.searchParams.get('max_depth')) : 10;
        const rootId = url.searchParams.get('root_id') || undefined;
        const tree = await fetchOrgTree({ maxDepth, rootId, headers: forwardHeaders });
        return Response.json({ ok: true, data: tree });
      } catch (err: any) {
        logger.error('Failed to fetch org tree from Auth service:', err);
        return Response.json({ ok: false, error: err?.message || 'Failed to fetch tree' }, { status: 500 });
      }
    }

    if (url.pathname === '/api/v1/portal/apps' || url.pathname === '/portal/api/v1/portal/apps') {
      const appBindings = getUserApprovedAppIds(auth.user!.id, auth.user!.email);
      const { activeApps, marketplaceApps, allApps } = getPortalApps(userRoles, {
        appBindings,
      });
      return Response.json({ ok: true, data: activeApps, marketplace: marketplaceApps, all: allApps });
    }

    // ── App Access Requests API ──
    if (url.pathname === '/api/v1/portal/apps/requests' || url.pathname === '/portal/api/v1/portal/apps/requests') {
      if (req.method === 'GET') {
        const requests = getUserAppAccessRequests(auth.user!.id);
        return Response.json({ ok: true, data: requests });
      }
      if (req.method === 'POST') {
        try {
          const body = await req.json();
          if (!body.appId || !body.appName) {
            return Response.json({ ok: false, error: 'appId and appName are required' }, { status: 400 });
          }
          const created = createAppAccessRequest({
            userId: auth.user!.id,
            userEmail: auth.user!.email,
            appId: body.appId,
            appName: body.appName,
            reasonType: body.reasonType || 'Daily Core Job Responsibility',
            notes: body.notes,
          });
          return Response.json({ ok: true, data: created });
        } catch (err: any) {
          return Response.json({ ok: false, error: err?.message || 'Invalid request body' }, { status: 400 });
        }
      }
      return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
    }

    if (url.pathname === '/api/v1/portal/apps/requests/cancel' || url.pathname === '/portal/api/v1/portal/apps/requests/cancel') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      try {
        const body = await req.json();
        const ok = cancelAppAccessRequest(auth.user!.id, body.id);
        return Response.json({ ok });
      } catch {
        return Response.json({ ok: false, error: 'Invalid request' }, { status: 400 });
      }
    }

    if (url.pathname === '/api/v1/portal/apps/requests/pending' || url.pathname === '/portal/api/v1/portal/apps/requests/pending') {
      if (!isAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Administrative role required to review requests' }, { status: 403 });
      }
      const pending = getPendingAppAccessRequests({ userId: auth.user!.id, userEmail: auth.user!.email, userRoles, isSuperAdmin });
      return Response.json({ ok: true, data: pending });
    }

    if (
      url.pathname === '/api/v1/portal/apps/requests/decide' ||
      url.pathname === '/portal/api/v1/portal/apps/requests/decide' ||
      (url.pathname.startsWith('/api/v1/portal/apps/requests/') && url.pathname.endsWith('/decide')) ||
      (url.pathname.startsWith('/portal/api/v1/portal/apps/requests/') && url.pathname.endsWith('/decide'))
    ) {
      if (req.method !== 'POST') return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      if (!isAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Administrative role required to decide requests' }, { status: 403 });
      }
      try {
        const body = await req.json();
        const pathParts = url.pathname.split('/');
        const urlId = pathParts.length >= 2 && pathParts[pathParts.length - 1] === 'decide' && pathParts[pathParts.length - 2] !== 'requests' ? pathParts[pathParts.length - 2] : null;
        const requestId = body.requestId || body.id || urlId;
        if (!requestId) return Response.json({ ok: false, error: 'Request ID is required' }, { status: 400 });

        const decision = body.action === 'APPROVE' || body.decision === 'APPROVE' || body.decision === 'APPROVED' ? 'APPROVE' : 'REJECT';
        const result = await decideAppAccessRequest(requestId, auth.user!.id, decision, {
          notes: body.notes || body.reason,
          headers: forwardHeaders,
          adminUserEmail: auth.user!.email,
          isSuperAdmin,
          userRoles,
        });

        if (!result.ok) {
          const isUserError = result.error?.includes('Anti-Self-Approval') || result.error?.includes('not found');
          return Response.json({ ok: false, error: result.error }, { status: isUserError ? 400 : 403 });
        }
        return Response.json({ ok: true, status: result.status });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Failed to decide request' }, { status: 400 });
      }
    }

    // ── Application Governance & Admins API ──
    const govResponse = await handleAppGovernanceRoutes(req, url, auth as any, forwardHeaders);
    if (govResponse) return govResponse;

    // ── Developer Personal Access Tokens API ──
    if (url.pathname === '/api/v1/portal/tokens' || url.pathname === '/portal/api/v1/portal/tokens') {
      if (req.method === 'GET') {
        const tokens = getUserApiTokens(auth.user!.id);
        return Response.json({ ok: true, data: tokens });
      }
      if (req.method === 'POST') {
        const rl = checkPortalRateLimit(`tok:${auth.user!.id}`, 10, 60);
        if (rl) return rl;
        try {
          const body = await req.json();
          const result = createApiToken(auth.user!.id, body.name || 'Personal Developer Token');
          if (!result) return Response.json({ ok: false, error: 'Failed to create token' }, { status: 500 });
          return Response.json({ ok: true, data: result });
        } catch {
          return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
        }
      }
      return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
    }

    if (url.pathname === '/api/v1/portal/tokens/revoke' || url.pathname === '/portal/api/v1/portal/tokens/revoke') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      try {
        const body = await req.json();
        const ok = revokeApiToken(auth.user!.id, body.id);
        return Response.json({ ok });
      } catch {
        return Response.json({ ok: false, error: 'Invalid request' }, { status: 400 });
      }
    }

    // ── Security & Audit: Role-Guarded ──
    if (url.pathname === '/api/v1/portal/audit' || url.pathname === '/portal/api/v1/portal/audit') {
      if (!isAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Security & Audit logs require administrative roles' }, { status: 403 });
      }
      try {
        const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));
        const logs = await fetchAuditLogs({ limit, headers: forwardHeaders });
        return Response.json({ ok: true, data: logs });
      } catch (err: any) {
        logger.error('Failed to fetch audit logs from Auth service:', err);
        return Response.json({ ok: false, error: err?.message || 'Failed to fetch audit logs' }, { status: 500 });
      }
    }

    if (url.pathname === '/api/v1/portal/sessions' || url.pathname === '/portal/api/v1/portal/sessions') {
      try {
        const sessions = await fetchUserSessions({ headers: forwardHeaders });
        return Response.json({ ok: true, data: sessions });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Failed to fetch sessions' }, { status: 500 });
      }
    }

    if (url.pathname === '/api/v1/portal/members' || url.pathname === '/portal/api/v1/portal/members') {
      const rl = checkPortalRateLimit(`mem:${auth.user!.id}`, 60, 60);
      if (rl) return rl;
      try {
        const empData = await fetchEmployeesList({ limit: 500, headers: forwardHeaders });
        const rawMembers = (empData.items || []).map((m: any) => ({
          id: m.id,
          name: m.display_name,
          email: m.email,
          jobTitle: m.job_title || 'Team Member',
          department: m.department_name || 'Enterprise',
          division: m.department_path ? m.department_path.split('/')[1] || m.department_name || 'General' : m.department_name || 'General',
          status: m.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE',
          avatarInitial: m.display_name ? m.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '--',
          roles: m.roles || [],
        }));
        return Response.json({ ok: true, data: sanitizeEmployeeDirectory(rawMembers, userRoles) });
      } catch (err: any) {
        logger.error('Failed to fetch members list from Auth service:', err);
        return Response.json({ ok: false, error: err?.message || 'Failed to fetch members' }, { status: 500 });
      }
    }

    // ── Member Invitation: Strict RBAC & Role Whitelisting ──
    if (url.pathname === '/api/v1/portal/members/invite' || url.pathname === '/portal/api/v1/portal/members/invite') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      if (!isAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Inviting team members requires administrative roles' }, { status: 403 });
      }
      try {
        const body = await req.json();
        const requestedRole = body.role || 'roles/employee';

        // Privilege escalation defense: non-super_admins cannot grant super_admin
        if (requestedRole.includes('super_admin') && !isSuperAdmin) {
          return Response.json({ ok: false, error: 'Forbidden: Super Admin role can only be assigned by a Super Admin' }, { status: 403 });
        }

        const created = await createEmployeeApi(
          {
            display_name: body.name || body.display_name || 'New Member',
            email: body.email,
            job_title: body.jobTitle || body.job_title || 'Team Member',
            department_id: body.department_id,
            manager_id: body.manager_id,
            role: requestedRole,
          },
          { headers: forwardHeaders }
        );
        return Response.json({ ok: true, data: created });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Failed to invite member' }, { status: 400 });
      }
    }

    if (url.pathname === '/api/v1/portal/managers' || url.pathname === '/portal/api/v1/portal/managers') {
      try {
        const managers = await fetchManagersList({ headers: forwardHeaders });
        return Response.json({ ok: true, data: managers });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Failed to fetch managers' }, { status: 500 });
      }
    }

    if (url.pathname === '/api/v1/portal/members/import' || url.pathname === '/portal/api/v1/portal/members/import') {
      if (req.method !== 'POST') return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      if (!isAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Bulk import requires administrative roles' }, { status: 403 });
      }
      try {
        const body = await req.json();
        const records = body.records || [];
        const options = body.options || { dryRun: Boolean(body.dry_run) };
        const result = await batchImportEmployeesApi(records, options, {
          headers: forwardHeaders,
          csv_data: typeof body.csv_data === 'string' ? body.csv_data : undefined,
        });
        const summary = result.summary || result;
        return Response.json({
          ok: true,
          summary,
          valid_count: summary.valid,
          imported_count: summary.created,
          errors: summary.errors || [],
        });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Bulk import failed' }, { status: 400 });
      }
    }

    // ── Live Notifications & Announcements API ──
    if (url.pathname === '/api/v1/portal/notifications' || url.pathname === '/portal/api/v1/portal/notifications') {
      const notifs = getLiveNotifications(auth.user!.id, auth.user!.orgId);
      return Response.json({ ok: true, data: notifs });
    }

    if (url.pathname === '/api/v1/portal/notifications/mark-read' || url.pathname === '/portal/api/v1/portal/notifications/mark-read') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      const ok = markAllNotificationsAsRead(auth.user!.id);
      return Response.json({ ok });
    }

    if (url.pathname === '/api/v1/portal/notifications/dismiss' || url.pathname === '/portal/api/v1/portal/notifications/dismiss') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      try {
        const body = await req.json();
        // User-scoped dismissal: users cannot globally delete notifications belonging to others
        const ok = dismissNotification(body.id, auth.user!.id);
        return Response.json({ ok });
      } catch {
        return Response.json({ ok: false }, { status: 400 });
      }
    }

    if (url.pathname === '/api/v1/portal/notifications/celebrate' || url.pathname === '/portal/api/v1/portal/notifications/celebrate') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      try {
        const body = await req.json();
        const ok = recordCelebration(body.id, auth.user!.id);
        return Response.json({ ok });
      } catch {
        return Response.json({ ok: false }, { status: 400 });
      }
    }

    if (url.pathname === '/api/v1/portal/events' || url.pathname === '/portal/api/v1/portal/events') {
      const events = getLiveCompanyEvents();
      return Response.json({ ok: true, data: events });
    }

    if (url.pathname === '/api/v1/portal/preferences' || url.pathname === '/portal/api/v1/portal/preferences') {
      if (req.method === 'POST') {
        try {
          const body = await req.json();
          const ok = setUserDeliveryPreference(auth.user!.id, body.pref || 'instant');
          return Response.json({ ok });
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
      }
      const pref = getUserDeliveryPreference(auth.user!.id);
      return Response.json({ ok: true, data: { digestPref: pref } });
    }

    // ── Branding Settings API: Super Admin Guarded ──
    if (url.pathname === '/api/v1/portal/settings/branding' || url.pathname === '/portal/api/v1/portal/settings/branding') {
      if (req.method !== 'POST') {
        return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
      }
      if (!isSuperAdmin) {
        return Response.json({ ok: false, error: 'Forbidden: Super Admin access required to update company branding' }, { status: 403 });
      }
      try {
        const body = await req.json();
        if (body.name) process.env.BRAND_NAME = String(body.name);
        if (body.tagline) process.env.BRAND_TAGLINE = String(body.tagline);
        return Response.json({ ok: true });
      } catch (err: any) {
        return Response.json({ ok: false, error: err?.message || 'Failed to save branding' }, { status: 400 });
      }
    }

    const userAgent = req.headers.get('user-agent') || 'Browser Session';
    const approvedApps = getUserApprovedAppIds(auth.user!.id, auth.user!.email);
    const user: HeaderUserContext = {
      id: auth.user!.id,
      email: auth.user!.email,
      displayName: auth.user!.displayName,
      roles: userRoles,
      isAdmin,
      userAgent,
      approvedApps,
    };

    if (url.pathname !== '/' && url.pathname !== '' && url.pathname !== '/portal' && url.pathname !== '/portal/') {
      return renderRouteNotFound({
        req,
        appName: 'Workspace Portal',
        userEmail: user.email,
        primaryActionText: 'Workspace Portal',
        primaryActionHref: '/portal',
      });
    }

    return new Response(renderPortalHtml(user), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Portal Service...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startPortalServer();
  logger.info(`🏢 Main Portal running on http://localhost:${PORT}`);
}
