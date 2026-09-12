#!/usr/bin/env bun
/**
 * Custom Landing Server (Starter Base)
 * Fast, standalone Bun HTTP server for custom landing page implementations.
 * Designed for independent Git Submodule / isolated repository workflows.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger, createSafeHandler } from '@forge/sdk';
import { renderAstryxErrorHtml } from '@forge/ui';
import { renderCustomLandingHtml } from './template.html';

const logger = createLogger('landing-custom');
const PORT = Number(process.env.LANDING_PORT || process.env.PORT || 3000);

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CUSTOM_DIR = join(PACKAGE_ROOT, 'custom');
export const CUSTOM_INDEX_HTML = join(CUSTOM_DIR, 'index.html');
export const CUSTOM_TEMPLATE_TS = join(CUSTOM_DIR, 'template.ts');

export type LandingMode = 'custom-static' | 'custom-template' | 'starter-baseline';

/**
 * resolveLandingMode
 * Evaluates which landing page implementation is currently active.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function resolveLandingMode(): LandingMode {
  if (existsSync(CUSTOM_INDEX_HTML)) return 'custom-static';
  if (existsSync(CUSTOM_TEMPLATE_TS)) return 'custom-template';
  return 'starter-baseline';
}

/**
 * resolveLandingHtml
 * Resolves HTML in priority order: (1) custom static HTML, (2) custom TS template, (3) starter baseline.
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
      logger.error('Failed to load custom template, falling back to starter baseline', { error: String(err) });
    }
  }
  return renderCustomLandingHtml();
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
 * createLandingHandler
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function createLandingHandler() {
  return createSafeHandler('landing-custom', async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    // Operational Dual-Probe Health Endpoint
    if (url.pathname === '/health' || url.pathname === '/live') {
      return new Response(
        JSON.stringify({
          status: 'pass',
          service: 'landing-custom',
          mode: resolveLandingMode(),
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // Root Landing Page
    if (url.pathname === '/') {
      const html = await resolveLandingHtml();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    // Static assets from custom/ folder
    const asset = resolveCustomAsset(url.pathname);
    if (asset) {
      const content = readFileSync(asset.filePath);
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': asset.contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 404 Fallback
    return new Response(
      renderAstryxErrorHtml({
        statusCode: 404,
        title: 'Page Not Found',
        message: `The requested path "${url.pathname}" does not exist.`,
        primaryActionText: '&larr; Return to Landing Page',
        primaryActionHref: '/',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  });
}

/**
 * startServer
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function startServer(port: number = PORT) {
  const handler = createLandingHandler();
  const server = Bun.serve({
    port,
    fetch: handler,
  });

  logger.info(`🌐 [Custom Landing] Server listening on http://localhost:${server.port}`);
  return server;
}

if (import.meta.main) {
  startServer();
}
