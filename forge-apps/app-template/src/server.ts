/**
 * Forge App Template: Standard Microservice Reference (2026 LTS)
 * Dedicated Turso SQLite Database Instance with Isolated Observability & Scoped Hierarchy
 */

import { join } from 'node:path';
import {
  authGuard,
  createLogger,
  createSafeHandler,
  getScopedHierarchy,
  loadBrandConfig,
} from './lib/sdk';
import { getAstryxHeaderHtml, getAstryxStyles, getHeadStateScript } from './lib/ui';
import type { AuthUser, ScopedHierarchyResponse } from './lib/types';

const LOG_DIR = join(import.meta.dir, '..', 'logs');
const logger = createLogger('app-template', LOG_DIR);
const PORT = Number(process.env.PORT || 8099);

function renderAppHtml(user?: AuthUser, hierarchy?: ScopedHierarchyResponse | null): string {
  const brand = loadBrandConfig();
  const userName = user?.displayName || 'Authorized User';
  const userEmail = user?.email || `user@${brand.domain || 'forge.internal'}`;
  const userRole = user?.roles?.[0] || 'Standard Access';
  const approver = hierarchy?.managementChain?.[0];
  const dept = hierarchy?.employee?.departmentName || 'Engineering Squad';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - Micro-App Template</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
  </style>
</head>
<body>
  ${getAstryxHeaderHtml('TEMPLATE', 'FORGE MICRO-APP')}
  <main class="astryx-container">
    <div class="astryx-card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <h1 style="font-size: 1.5rem; color: var(--forge-text-main); margin: 0;">🚀 Forge App Template</h1>
        <span style="font-size: 0.8rem; background: var(--forge-success-bg); color: var(--forge-primary); border: 1px solid var(--forge-primary); border-radius: 9999px; padding: 0.25rem 0.6rem; font-weight: 600;">🛡️ ${userRole}</span>
      </div>
      <p style="color: var(--forge-text-muted); margin-bottom: 1.25rem;">
        Verified session for <strong>${userName}</strong> (<code>${userEmail}</code>) &bull; Department: <strong style="color: var(--forge-text-main);">${dept}</strong>
      </p>

      <div style="background: var(--forge-bg-root); padding: 1.25rem; border-radius: var(--forge-radius); border: 1px solid var(--forge-border); margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.95rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">🏢 Organization Hierarchy</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin: 0;">
          Direct Manager / Approver: <strong style="color: var(--forge-primary);">${approver?.displayName || 'Executive'}</strong>
        </p>
      </div>

      <div style="background: var(--forge-bg-root); padding: 0.75rem 1rem; border-radius: var(--forge-radius); border: 1px solid var(--forge-border); margin-bottom: 1.5rem;">
        <span style="font-size: 0.82rem; color: var(--forge-primary);">Database: <code>template.db</code> (Isolated libSQL Instance)</span>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <a href="/portal" class="astryx-btn btn-outline">&larr; Return to Workspace Portal</a>
        <a href="/" class="astryx-btn btn-outline">Platform Hub &rarr;</a>
      </div>
    </div>
  </main>
  <script>
    window.onerror = function(msg, src, lineno, colno, err) {
      fetch('/api/logs/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'app-template', severity: 'ERROR', message: msg, timestamp: new Date().toISOString() })
      }).catch(function() {});
    };
  </script>
</body>
</html>`;
}

/**
 * startTemplateServer
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function startTemplateServer(port: number = PORT) {
  const handler = createSafeHandler(
    'app-template',
    async (req: Request) => {
      const url = new URL(req.url);

      if (url.pathname === '/health' || url.pathname.endsWith('/health')) {
        const memMb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
        return Response.json({
          status: 'ok',
          app: 'app-template',
          port,
          livez: true,
          readyz: true,
          memoryMb: memMb,
          db: 'template.db',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === '/api/logs/browser' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        logger.logBrowserEvent(body.severity || 'INFO', body.message || 'Browser event', body);
        return Response.json({ status: 'ok' });
      }

      // 🛡️ Zero-Trust Auth Guard (Requires Employee or Admin role)
      const auth = authGuard(req, {
        appName: 'Micro-App Template',
        requiredRoles: ['roles/employee', 'roles/super_admin'],
      });

      if (!auth.authenticated) {
        return auth.response!;
      }

      let hierarchy: ScopedHierarchyResponse | null = null;
      try {
        if (auth.user?.id) {
          hierarchy = await getScopedHierarchy(auth.user.id);
        }
      } catch {
        // Fallback for tests
      }

      return new Response(renderAppHtml(auth.user, hierarchy), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
    LOG_DIR
  );

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  return server;
}

if (import.meta.main) {
  const server = startTemplateServer();
  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down App Template...');
    server.stop(true);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  logger.info(`[SYSTEM_BOOT] 🚀 App Template microservice running on http://localhost:${PORT}`);
}
