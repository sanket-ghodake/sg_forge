/**
 * @forge-apps/code - Cloud VS Code Microservice Server (2026 LTS)
 * Single-Seat Remote Concurrency with Discard-on-Exit Architecture
 */

import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  authGuard,
  createLogger,
  createSafeHandler,
} from './lib/sdk';
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getUserProjectRole,
  listProjects,
  removeProjectMember,
} from './db';
import {
  checkSessionHealth,
  claimSession,
  leaveSession,
  recordHeartbeat,
  requestTakeover,
  respondToTakeover,
} from './session-coordinator';
import { ensureVsCodeDaemon, getVsCodeTargetUrl } from './vscode-bridge';
import { validateRepoPath } from './git-sanitizer';
import { renderCatalogHtml } from './ui/catalog';
import { renderWorkbenchHtml } from './ui/workbench';
import { auditIngressCall, ingestBrowserTelemetry } from './network-auditor';

const LOG_DIR = join(import.meta.dir, '..', 'logs');
const logger = createLogger('code-app', LOG_DIR);
const PORT = Number(process.env.PORT || 8088);

/**
 * startCodeServer
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function startCodeServer(port: number = PORT) {
  const handler = createSafeHandler(
    'code-app',
    async (req: Request) => {
      const url = new URL(req.url);
      const path = url.pathname.replace(/^\/apps\/code/, '') || '/';

      // 1. Health Probe
      if (path === '/health' || path.endsWith('/health')) {
        const memMb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
        return Response.json({
          status: 'ok',
          app: 'code',
          port,
          livez: true,
          readyz: true,
          memoryMb: memMb,
          db: 'code.db',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Browser Telemetry Bridge
      if (path === '/api/logs/browser' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        logger.logBrowserEvent(body.severity || 'INFO', body.message || 'Browser event', body);
        return Response.json({ status: 'ok' });
      }

      // 2b. Browser Network Telemetry Bridge
      if (path === '/api/telemetry/network' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        const events = Array.isArray(body.events) ? body.events : [];
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const count = ingestBrowserTelemetry(events, body.userId || 'anonymous', clientIp, userAgent);
        return Response.json({ status: 'ok', ingested: count });
      }

      // 3. Zero-Trust Auth Guard
      const auth = authGuard(req, {
        appName: 'VS Code Cloud Workspaces',
        requiredRoles: ['roles/employee', 'roles/super_admin'],
      });
      if (!auth.authenticated) return auth.response!;
      const user = auth.user!;
      const isSuperAdmin = user.principalType === 'ADMIN' || user.roles?.includes('roles/super_admin');

      // 4. API Routes: Heartbeat & Takeover
      if (path === '/api/session/heartbeat' && req.method === 'GET') {
        const projectId = url.searchParams.get('projectId') || '';
        const session = checkSessionHealth(projectId);

        if (!session || session.active_user_id !== user.id) {
          return Response.json({ kicked: true, reason: 'Session expired or transferred' });
        }

        recordHeartbeat(projectId, user.id);
        const isTakeover = session.status === 'PENDING_TAKEOVER';
        const secondsLeft = session.takeover_expires_at
          ? Math.max(0, Math.ceil((session.takeover_expires_at - Date.now()) / 1000))
          : 0;

        return Response.json({
          ok: true,
          takeoverPending: isTakeover,
          secondsLeft,
          requesterEmail: session.takeover_requester_email,
        });
      }

      if (path === '/api/session/takeover' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        const res = requestTakeover(body.projectId, user.id, user.email, user.displayName || user.email);
        return Response.json(res, { status: res.success ? 200 : 409 });
      }

      if (path === '/api/session/respond-takeover' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        const res = respondToTakeover(body.projectId, user.id, body.decision);
        return Response.json(res);
      }

      if (path === '/api/session/leave' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        leaveSession(body.projectId, user.id);
        return Response.json({ ok: true });
      }

      // 5. API Routes: Projects CRUD
      if (path === '/api/projects' && req.method === 'POST') {
        if (!isSuperAdmin) {
          return Response.json({ error: 'Superadmin privileges required to register repos' }, { status: 403 });
        }
        const body: any = await req.json().catch(() => ({}));
        const validation = validateRepoPath(body.fsPath);
        if (!validation.valid) {
          return Response.json({ error: validation.error }, { status: 400 });
        }

        const slug = body.name.toLowerCase().replace(/[^a-z0-9\-]/g, '-');
        const project = createProject({
          id: `proj-${randomUUID().slice(0, 8)}`,
          name: body.name,
          slug,
          description: body.description || '',
          fs_path: validation.normalizedPath,
          default_branch: 'main',
          is_active: 1,
          created_by: user.id,
        });
        return Response.json({ ok: true, project });
      }

      // 6. API Routes: Members Management
      if (path.startsWith('/api/projects/') && path.endsWith('/members') && req.method === 'GET') {
        const parts = path.split('/');
        const projectId = parts[3];
        const members = getProjectMembers(projectId);
        return Response.json({ members });
      }

      if (path.startsWith('/api/projects/') && path.endsWith('/members') && req.method === 'POST') {
        const parts = path.split('/');
        const projectId = parts[3];
        const role = getUserProjectRole(projectId, user.id, isSuperAdmin);
        if (role !== 'SUPER_ADMIN' && role !== 'PROJECT_ADMIN') {
          return Response.json({ error: 'Forbidden: Project Admin access required' }, { status: 403 });
        }

        const body: any = await req.json().catch(() => ({}));
        const newMember = addProjectMember({
          id: `pmem-${randomUUID().slice(0, 8)}`,
          project_id: projectId,
          user_id: body.userId || `user-${randomUUID().slice(0, 6)}`,
          user_email: body.email,
          user_name: body.name || body.email.split('@')[0],
          role: body.role || 'DEVELOPER',
        });
        return Response.json({ ok: true, member: newMember });
      }

      if (path.startsWith('/api/projects/') && path.includes('/members/') && req.method === 'DELETE') {
        const parts = path.split('/');
        const projectId = parts[3];
        const targetUserId = parts[5];
        const role = getUserProjectRole(projectId, user.id, isSuperAdmin);
        if (role !== 'SUPER_ADMIN' && role !== 'PROJECT_ADMIN') {
          return Response.json({ error: 'Forbidden: Project Admin access required' }, { status: 403 });
        }
        removeProjectMember(projectId, targetUserId);
        return Response.json({ ok: true });
      }

      // 7. View Route: IDE Workbench
      if (path.startsWith('/ide/')) {
        const projectId = path.replace('/ide/', '').split('/')[0];
        const project = getProjectById(projectId);
        if (!project) {
          return new Response('Repository not found', { status: 404 });
        }

        const userRole = getUserProjectRole(projectId, user.id, isSuperAdmin);
        if (!userRole) {
          return new Response('Access Forbidden: You are not assigned to this repository', { status: 403 });
        }

        const claim = claimSession(projectId, user.id, user.email, user.displayName || user.email);
        if (!claim.success) {
          // Locked by another user -> Redirect to catalog
          return new Response(null, {
            status: 302,
            headers: { Location: `/apps/code?locked=${encodeURIComponent(claim.message)}` },
          });
        }

        // Ensure VS Code headless daemon is up
        await ensureVsCodeDaemon();
        const vsCodeUrl = getVsCodeTargetUrl(project.fs_path);

        return new Response(renderWorkbenchHtml(user, project, vsCodeUrl), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // 8. View Route: Main Projects Catalog
      const projects = listProjects(user.id, isSuperAdmin);
      return new Response(renderCatalogHtml(user, projects), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
    LOG_DIR
  );

  const server = Bun.serve({
    port,
    fetch: async (req: Request) => {
      const start = performance.now();
      const res = await handler(req);
      const duration = performance.now() - start;
      auditIngressCall(req, res.status, duration);
      return res;
    },
  });

  const shutdown = () => {
    logger.info('Shutting down VS Code microservice server...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

/**
 * startTemplateServer
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export const startTemplateServer = startCodeServer;

if (import.meta.main) {
  startCodeServer();
  logger.info(`[SYSTEM_BOOT] 🚀 VS Code microservice running on http://localhost:${PORT}`);
}
