#!/usr/bin/env bun
/**
 * SG Forge - Landing Discovery Hub & Universal Route Directory
 * Astryx Design Standards & Enterprise SRE Observability (2026 LTS Baseline)
 * 100% Dynamically driven by @forge/sdk service registry (.env)
 */

import {
  createLogger,
  createSafeHandler,
  loadServiceRegistry,
  loadBrandConfig,
  handleBrandAssetRequest,
  handleServiceWorkerRequest,
  type ServiceEntry,
} from '@forge/sdk';
import { getAstryxHeaderHtml, getAstryxFooterHtml, getAstryxStyles, getHeadStateScript, renderAstryxErrorHtml } from '@forge/ui';

const logger = createLogger('landing-hub');
const PORT = Number(process.env.LANDING_PORT || process.env.PORT || 3000);

/**
 * renderLandingHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderLandingHtml(): string {
  const brand = loadBrandConfig();
  const services = loadServiceRegistry({ includeDisabled: false });

  // Group services by category
  const categories: Record<string, ServiceEntry[]> = {};
  for (const s of services) {
    if (!categories[s.category]) {
      categories[s.category] = [];
    }
    categories[s.category].push(s);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - Modular Corporate Portal & Micro-App Engine</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
  </style>
</head>
<body>
  ${getAstryxHeaderHtml(brand.short, 'PLATFORM HUB')}

  <main class="astryx-container">
    <section class="astryx-hero">
      <div style="display: inline-block; margin-bottom: 0.75rem;">
        <span class="astryx-badge badge-pill">${brand.name} Workspace Platform</span>
      </div>
      <h1>Enterprise Workspace & Micro-App Engine</h1>
      <p>Universal routing hub connecting core organizational workspaces and sandboxed micro-frontends with dedicated Turso DB instances.</p>
    </section>

    ${Object.entries(categories)
      .map(
        ([categoryName, items]) => `
      <div style="margin-top: 2.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.65rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--forge-text-main); letter-spacing: -0.01em;">${categoryName}</h2>
          <span style="font-size: 0.8rem; color: var(--forge-text-subtle);">${items.length} Registered Endpoints</span>
        </div>
        <div class="astryx-grid">
          ${items
            .map(
              (item) => `
            <div class="astryx-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <span class="astryx-code-badge">${item.path}</span>
                <span class="astryx-badge badge-online" id="status-${item.port}">
                  <span class="badge-dot"></span> :${item.port}
                </span>
              </div>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--forge-text-main);">${item.name}</h3>
              <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1.25rem; min-height: 42px;">
                ${item.category} &bull; Internal container port ${item.port}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--forge-border); padding-top: 0.85rem;">
                <span style="font-size: 0.75rem; color: var(--forge-text-subtle);">Access: <strong style="color: var(--forge-text-muted);">${item.role}</strong></span>
                <a href="${item.path}" 
                   class="astryx-btn btn-primary" 
                   style="font-size: 0.8rem; padding: 0.4rem 0.9rem;"
                   ${item.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                  ${item.isExternal ? 'Launch App &#x2197;' : 'Current Page'}
                </a>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('')}
  </main>

  ${getAstryxFooterHtml({ orgName: brand.name, year: brand.currentYear, secondaryText: 'Enterprise Workspace Platform &bull; Dynamic Service Registry' })}
</body>
</html>`;
}

/**
 * renderHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export const renderHtml = renderLandingHtml;

/**
 * startLandingServer
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function startLandingServer(port: number = PORT) {
  const handler = createSafeHandler('landing-hub', async (req: Request) => {
    const url = new URL(req.url);

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 0.1 Service Worker & Offline Cache Asset Interceptor
    const swRes = handleServiceWorkerRequest(req);
    if (swRes) return swRes;

    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'landing',
        port,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname !== '/' && url.pathname !== '') {
      const brand = loadBrandConfig();
      return new Response(
        renderAstryxErrorHtml({
          statusCode: 404,
          title: 'Page Not Found',
          message: `The requested path "${url.pathname}" does not exist on ${brand.name} Platform.`,
          primaryActionText: '&larr; Return to Platform Hub',
          primaryActionHref: '/',
          secondaryActionText: 'Workspace Portal &rarr;',
          secondaryActionHref: '/portal',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    return new Response(renderHtml(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Landing Hub...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startLandingServer();
  logger.info(`🌐 Landing Hub running on http://localhost:${PORT}`);
}
