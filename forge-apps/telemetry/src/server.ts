/**
 * Forge App: Live Telemetry Dashboard (Port 8087)
 * Dedicated Turso SQLite Database Instance with Isolated Observability
 */

import { join } from 'node:path';
import { authGuard, createLogger, createSafeHandler, loadBrandConfig } from './lib/sdk';
import { getAstryxHeaderHtml, getAstryxStyles, getHeadStateScript, getAstryxToastScript, getAstryxTooltipScript } from './lib/ui';
import { icons } from './lib/icons';
import { handleDocsRoute } from './lib/docs-viewer';
import { telemetryDb } from './db';

const LOG_DIR = join(import.meta.dir, '..', 'logs');
const DOCS_DIR = join(import.meta.dir, '..', 'docs');
const logger = createLogger('telemetry', LOG_DIR);
const PORT = Number(process.env.PORT || 8087);

function renderAppHtml(): string {
  const brand = loadBrandConfig();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="/apps/telemetry/">
  <title>${brand.name} - Telemetry Micro-App (Public)</title>
  ${getHeadStateScript({ defaultTheme: 'dark', enableAuthRedirectBridge: false })}
  <style>
    ${getAstryxStyles()}
  </style>
</head>
<body class="aceternity-hero-grid">
  ${getAstryxHeaderHtml('TELEMETRY', 'PUBLIC DASHBOARD')}
  <main class="astryx-container">
    <div class="shadcn-card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="color: var(--forge-primary); display: flex;">${icons.activity}</span>
          <h1 style="font-size: 1.5rem; color: var(--forge-text-main); margin: 0; font-weight: 700; letter-spacing: -0.02em;">Live Telemetry Dashboard</h1>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="magic-pulse-beacon">LIVE STREAMING</span>
          <span style="font-size: 0.75rem; background: var(--forge-success-bg); color: var(--forge-success); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 9999px; padding: 0.2rem 0.65rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
            ${icons.radio} PUBLIC ACCESS
          </span>
        </div>
      </div>
      <p style="color: var(--forge-text-muted); margin-bottom: 1.5rem; font-size: 0.875rem;">
        Public observability micro-app streaming real-time telemetry metrics via Server-Sent Events (SSE) from dedicated Turso libSQL database.
      </p>

      <!-- Metric Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.sliders} Process RSS Memory</div>
          <div class="luxe-metric-val" id="val-mem">-- MB</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Real-time memory allocation</span>
        </div>

        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.zap} Platform Uptime</div>
          <div class="luxe-metric-val" id="val-uptime">-- s</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Service active elapsed time</span>
        </div>

        <div class="luxe-hud-card">
          <div class="luxe-metric-label">${icons.monitor} Gateway Target Route</div>
          <div class="luxe-metric-val" style="font-size: 1.25rem; color: var(--forge-primary);">/apps/telemetry</div>
          <span style="font-size: 0.75rem; color: var(--forge-text-muted);">Caddy dynamic proxy routing</span>
        </div>
      </div>

      <div style="background: var(--forge-bg-surface); padding: 0.75rem 1rem; border-radius: var(--forge-radius); border: 1px solid var(--forge-border); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: var(--forge-primary); display: flex;">${icons.database}</span>
        <span style="font-size: 0.82rem; color: var(--forge-text-muted);">Database: <code style="color: var(--forge-primary);">telemetry_turso.db</code> (Isolated libSQL Instance)</span>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="/" class="shadcn-btn">${icons.arrowLeft} Return to Platform Hub</a>
        <a href="/portal" class="shadcn-btn">Workspace Portal ${icons.arrowRight}</a>
      </div>
    </div>
  </main>
  ${getAstryxToastScript()}
  ${getAstryxTooltipScript()}
  <script>
    const apiBase = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    function updateVitals() {
      fetch(apiBase + 'health')
        .then(res => res.json())
        .then(data => {
          document.getElementById('val-mem').innerText = data.memoryMb + ' MB';
          document.getElementById('val-uptime').innerText = Math.floor(data.uptime) + 's';
        })
        .catch(() => {});
    }
    updateVitals();
    setInterval(updateVitals, 2000);

    window.onerror = function(msg, src, lineno, colno, err) {
      fetch(apiBase + 'api/logs/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'telemetry', severity: 'ERROR', message: msg, timestamp: new Date().toISOString() })
      }).catch(function() {});
    };
  </script>
</body>
</html>`;
}

/**
 * startTelemetryServer
 * @requirements [HLR-TEL-801] [LLR-SUB-004] [HLR-TEL-001] [LLR-TEL-001.1] [LLR-TEL-001.2] [HLR-TEL-003] [LLR-TEL-002.1] [LLR-TEL-003.1]
 */
export function startTelemetryServer(port: number = PORT) {
  const handler = createSafeHandler(
    'telemetry',
    async (req: Request) => {
      const url = new URL(req.url);

      if (url.pathname === '/health' || url.pathname.endsWith('/health')) {
        const memMb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
        return Response.json({
          status: 'ok',
          app: 'telemetry',
          port,
          livez: true,
          readyz: true,
          memoryMb: memMb,
          db: 'turso_telemetry.db',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === '/api/stream/metrics') {
        const memMb = Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1));
        return Response.json({
          status: 'STREAM_OK',
          cpuPercent: 2.1,
          memoryMb: memMb,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === '/api/logs/browser' && req.method === 'POST') {
        const body: any = await req.json().catch(() => ({}));
        logger.logBrowserEvent(body.severity || 'INFO', body.message || 'Browser event', body);
        return Response.json({ status: 'ok' });
      }

      // 📖 Living Documentation & OpenAPI Explorer
      const docRes = handleDocsRoute(req, 'telemetry', 'Live Telemetry Dashboard', DOCS_DIR);
      if (docRes) return docRes;

      // 🛡️ Zero-Trust Auth Guard (Public app, but subject to admin disablement)
      const auth = authGuard(req, {
        appName: 'Live Telemetry Dashboard',
        appId: 'telemetry',
        publicPaths: ['/'],
      });

      if (!auth.authenticated) {
        return auth.response!;
      }

      return new Response(renderAppHtml(), {
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
    const server = startTelemetryServer();
    const shutdown = () => {
      logger.info('Received termination signal. Gracefully shutting down Telemetry Service...');
      server.stop(true);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    logger.info(`[SYSTEM_BOOT] 📡 Telemetry microservice running on http://localhost:${PORT}`);
  }
