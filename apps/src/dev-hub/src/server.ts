/**
 * @forge/dev-hub - Developer Playground & SDK Documentation Gateway
 * Serves on Port 3003 (Ingress /gateway via Reverse Proxy)
 * Astryx Enterprise Baseline (v2.0.0 LTS)
 */

import { createLogger, createSafeHandler, handleBrandAssetRequest, loadServiceRegistry, renderRouteNotFound } from '@forge/sdk';
import { renderDevHubHtml } from './frontend/hub-view';
import { PLATFORM_API_CATALOG } from './frontend/sections/api-catalog-section';

const PORT = Number(process.env.DEV_HUB_PORT || process.env.PORT || 3003);
const logger = createLogger('dev-hub');

/**
 * startDevHubServer
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function startDevHubServer(port: number = PORT) {
  const handler = createSafeHandler('dev-hub', async (req: Request) => {
    const url = new URL(req.url);

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 1. Dual-Probe Operational Healthcheck
    if (url.pathname.endsWith('/health')) {
      return Response.json({
        status: 'ok',
        service: 'dev-hub',
        port,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Automated Gateway API & Route Contracts Catalog Endpoint
    if (url.pathname.endsWith('/api/gateway/catalog')) {
      const services = loadServiceRegistry();
      return Response.json({
        status: 'ok',
        service: 'dev-hub',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        registeredServices: services,
        apiContracts: PLATFORM_API_CATALOG,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // 2b. Route Boundary: 404 for invalid page subpaths
    const normPath = url.pathname.replace(/^\/gateway/, '') || '/';
    if (normPath !== '/' && normPath !== '') {
      return renderRouteNotFound({
        req,
        appName: 'Developer Hub',
        primaryActionText: 'Developer Hub',
        primaryActionHref: '/gateway',
        secondaryActionText: 'Platform Hub &rarr;',
        secondaryActionHref: '/',
      });
    }

    // 3. Render High-Density Developer Console HTML View
    return new Response(renderDevHubHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Dev Hub...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startDevHubServer();
  logger.info(`📚 Developer Hub running on http://localhost:${PORT}`);
}
