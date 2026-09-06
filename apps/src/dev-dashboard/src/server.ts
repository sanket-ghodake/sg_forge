/**
 * @forge/dev-dashboard - Developer Monitoring & Live Telemetry Server (2026 LTS)
 * Serves on Port 3002 (Ingress /devcenter via Reverse Proxy)
 * Enforces Single-Session Password-Protected Access Control.
 * Enterprise SRE Observability & Astryx Enterprise Baseline (v2.0.0 LTS)
 */

import { createLogger, createSafeHandler, handleBrandAssetRequest } from '@forge/sdk';
import { handleApiRequest } from './backend/api-handlers';
import { devAuthManager } from './backend/auth-session';
import { renderDashboardHtml, renderDevLoginHtml } from './frontend';
import { platformDb } from './db';

const PORT = Number(process.env.DEV_DASHBOARD_PORT || process.env.PORT || 3002);
const logger = createLogger('dev-dashboard');

/**
 * startDevDashboardServer
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export function startDevDashboardServer(port: number = PORT) {
  const handler = createSafeHandler('dev-dashboard', async (req: Request) => {
    const startMs = performance.now();
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/devcenter/, '') || '/';

    // 0. Static Brand Asset Interceptor (Public)
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 1. Dual-Probe Health Probes (Public)
    if (url.pathname.endsWith('/health') || url.pathname.endsWith('/livez') || url.pathname.endsWith('/readyz')) {
      const res = Response.json({
        status: 'ok',
        service: 'dev-dashboard',
        port,
        uptime: process.uptime(),
        memoryMb: Number((process.memoryUsage().rss / (1024 * 1024)).toFixed(1)),
        timestamp: Date.now(),
      });
      platformDb.recordTraffic('dev-dashboard', url.pathname, req.method, 200, Number((performance.now() - startMs).toFixed(2)));
      return res;
    }

    // 2. Public Auth API Endpoints (Login / Logout / Session Check)
    if (path.startsWith('/api/auth')) {
      const authRes = await handleApiRequest(req, url);
      if (authRes) return authRes;
    }

    // 2b. Internal Service Telemetry Log Ingest (Cluster Log Forwarding)
    if (path === '/api/logs/ingest' && req.method === 'POST') {
      const ingestRes = await handleApiRequest(req, url);
      if (ingestRes) return ingestRes;
    }

    // 3. Single Active Session Authentication Guard
    const token = devAuthManager.extractToken(req);
    const isAuthenticated = devAuthManager.validateSession(token);

    if (!isAuthenticated) {
      if (path.startsWith('/api/')) {
        return Response.json(
          {
            error: 'Unauthorized: Session invalid, expired, or superseded by another operator login',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        );
      }

      // Render Astryx Single-Session Login UI
      return new Response(renderDevLoginHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 4. Authenticated API Endpoints
    const apiResponse = await handleApiRequest(req, url);
    if (apiResponse) {
      if (!url.pathname.includes('/api/logs/stream') && !url.pathname.includes('/api/analytics/traffic')) {
        const duration = Number((performance.now() - startMs).toFixed(2));
        platformDb.recordTraffic('dev-dashboard', url.pathname, req.method, apiResponse.status || 200, duration);
      }
      return apiResponse;
    }

    // 4b. Strict RFC 7807 Problem Details for Unmatched API Routes (Prevents HTML delivery crashes)
    if (path.startsWith('/api/')) {
      return Response.json(
        {
          type: 'https://forge.internal/errors/not-found',
          title: 'API Endpoint Not Found',
          status: 404,
          detail: `The requested endpoint '${path}' does not exist on Dev Dashboard.`,
          path,
        },
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json; charset=utf-8' },
        }
      );
    }

    // 5. Authenticated UI Dashboard Delivery
    const duration = Number((performance.now() - startMs).toFixed(2));
    platformDb.recordTraffic('dev-dashboard', url.pathname, req.method, 200, duration);
    return new Response(renderDashboardHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Developer Dashboard...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startDevDashboardServer();
  logger.info(`📊 Developer Dashboard running on http://localhost:${PORT}`);
}
