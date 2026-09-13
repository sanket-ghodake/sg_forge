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
import { getAstryxHeaderHtml, getAstryxStyles, getHeadStateScript, getAstryxToastScript, getAstryxTooltipScript } from './lib/ui';
import { icons } from './lib/icons';
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
  <base href="/apps/template/">
  <title>${brand.name} - Micro-App Template</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
  </style>
</head>
<body class="aceternity-hero-grid">
  ${getAstryxHeaderHtml('TEMPLATE', 'FORGE MICRO-APP')}
  <main class="astryx-container">
    <div class="shadcn-card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="color: var(--forge-primary); display: flex;">${icons.layers}</span>
          <h1 style="font-size: 1.5rem; color: var(--forge-text-main); margin: 0; font-weight: 700; letter-spacing: -0.02em;">Forge App Template</h1>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="magic-pulse-beacon">ACTIVE SESSION</span>
          <span style="font-size: 0.75rem; background: var(--forge-success-bg); color: var(--forge-success); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 9999px; padding: 0.2rem 0.65rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
            ${icons.shieldAlert} ${userRole}
          </span>
        </div>
      </div>

      <p style="color: var(--forge-text-muted); margin-bottom: 1.5rem; font-size: 0.875rem;">
        Verified session for <strong style="color: var(--forge-text-main);">${userName}</strong> (<code>${userEmail}</code>) &bull; Department: <strong style="color: var(--forge-text-main);">${dept}</strong>
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.monitor} Organization Unit</div>
          <div class="luxe-metric-val" style="font-size: 1.15rem;">${dept}</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Assigned functional team</span>
        </div>

        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.sliders} Direct Approver</div>
          <div class="luxe-metric-val" style="font-size: 1.15rem;">${approver?.displayName || 'Executive'}</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Management chain tier 1</span>
        </div>

        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.database} Database State</div>
          <div class="luxe-metric-val" style="font-size: 1.15rem; color: var(--forge-primary);">template.db</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Isolated libSQL instance</span>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="/portal" class="shadcn-btn">${icons.arrowLeft} Return to Workspace Portal</a>
        <a href="/" class="shadcn-btn">Platform Hub ${icons.arrowRight}</a>
      </div>
    </div>
  </main>
  ${getAstryxToastScript()}
  ${getAstryxTooltipScript()}
  <script>
    const apiBase = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    window.onerror = function(msg, src, lineno, colno, err) {
      fetch(apiBase + 'api/logs/browser', {
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
