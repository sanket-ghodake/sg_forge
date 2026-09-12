#!/usr/bin/env bun
/**
 * SG Forge - Landing Discovery Hub & Universal Route Directory
 * Astryx Design Standards & Enterprise SRE Observability (2026 LTS Baseline)
 * 100% Dynamically driven by @forge/sdk service registry (.env)
 * Supports In-Repo Zero-Drift custom overrides via git-ignored custom/ directory.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CANDIDATE_CUSTOM_DIRS = [
  join(SCRIPT_DIR, '..', 'custom'),
  join(process.cwd(), 'apps', 'src', 'landing', 'custom'),
];
export const CUSTOM_DIR = CANDIDATE_CUSTOM_DIRS.find((p) => existsSync(p)) || join(SCRIPT_DIR, '..', 'custom');
export const CUSTOM_INDEX_HTML = join(CUSTOM_DIR, 'index.html');
export const CUSTOM_TEMPLATE_TS = join(CUSTOM_DIR, 'template.ts');

export type LandingMode = 'custom-static' | 'custom-template' | 'platform-hub';

/**
 * resolveLandingMode
 * Evaluates whether custom in-repo overrides are present or default Platform Hub is active.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function resolveLandingMode(): LandingMode {
  if (existsSync(CUSTOM_INDEX_HTML)) return 'custom-static';
  if (existsSync(CUSTOM_TEMPLATE_TS)) return 'custom-template';
  return 'platform-hub';
}

/**
 * renderLandingHtml
 * Default Astryx Platform Hub rendering registered services dynamically from .env.
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
 * resolveLandingHtml
 * Resolves HTML in priority order: (1) custom static HTML, (2) custom TS template, (3) Platform Hub.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export async function resolveLandingHtml(): Promise<string> {
  if (existsSync(CUSTOM_INDEX_HTML)) {
    return readFileSync(CUSTOM_INDEX_HTML, 'utf8');
  }
  if (existsSync(CUSTOM_TEMPLATE_TS)) {
    try {
      const customModule = await import(CUSTOM_TEMPLATE_TS);
      if (typeof customModule.renderCustomLandingHtml === 'function') {
        return customModule.renderCustomLandingHtml();
      }
      if (typeof customModule.default === 'function') {
        return customModule.default();
      }
    } catch (err) {
      logger.error('Failed to load custom template, falling back to Platform Hub', { error: String(err) });
    }
  }
  return renderLandingHtml();
}

/**
 * resolveCustomAsset
 * Resolves static assets from the git-ignored custom/ directory with path traversal defense.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function resolveCustomAsset(pathname: string): { filePath: string; contentType: string } | null {
  if (!existsSync(CUSTOM_DIR)) return null;

  const relPath = pathname.startsWith('/custom/') ? pathname.replace(/^\/custom\//, '') : pathname.replace(/^\//, '');
  const safePath = resolve(CUSTOM_DIR, relPath);

  // Prevent path traversal outside CUSTOM_DIR
  if (!safePath.startsWith(CUSTOM_DIR + '/') && safePath !== CUSTOM_DIR) {
    return null;
  }

  if (existsSync(safePath) && statSync(safePath).isFile()) {
    const ext = safePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      css: 'text/css; charset=utf-8',
      js: 'application/javascript; charset=utf-8',
      svg: 'image/svg+xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      avif: 'image/avif',
      ico: 'image/x-icon',
      json: 'application/json',
      woff2: 'font/woff2',
      woff: 'font/woff',
      ttf: 'font/ttf',
    };
    return {
      filePath: safePath,
      contentType: mimeTypes[ext || ''] || 'application/octet-stream',
    };
  }

  return null;
}

/**
 * renderHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export const renderHtml = renderLandingHtml;

/**
 * createLandingHandler
 * Creates the HTTP request handler with health probes, asset resolution, and Astryx error boundaries.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function createLandingHandler(port: number = PORT) {
  return createSafeHandler('landing-hub', async (req: Request) => {
    const url = new URL(req.url);

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 0.1 Service Worker & Offline Cache Asset Interceptor
    const swRes = handleServiceWorkerRequest(req);
    if (swRes) return swRes;

    // 0.2 In-Repo Custom Landing Static Asset Interceptor (/custom/*)
    const customAsset = resolveCustomAsset(url.pathname);
    if (customAsset) {
      return new Response(Bun.file(customAsset.filePath), {
        headers: { 'Content-Type': customAsset.contentType },
      });
    }

    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'landing',
        port,
        mode: resolveLandingMode(),
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

    const html = await resolveLandingHtml();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });
}

/**
 * startLandingServer
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function startLandingServer(port: number = PORT) {
  const handler = createLandingHandler(port);

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
