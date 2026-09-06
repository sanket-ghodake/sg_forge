/**
 * @forge/docs - Core Documentation Server
 * Serves on Port 3005 (Ingress /docs via Unified Reverse Proxy)
 * Astryx Enterprise Baseline (v2.0.0 LTS)
 */

import { existsSync, statSync } from 'node:fs';
import { join, normalize, resolve } from 'node:path';
import { createLogger, createSafeHandler, handleBrandAssetRequest } from '@forge/sdk';
import { renderAstryxErrorHtml } from '@forge/ui';
import { getMimeType, loadDocsConfig } from './config';

const config = loadDocsConfig();
const logger = createLogger('docs');

/**
 * Resolves candidate file path on disk, preventing directory traversal.
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export function resolveSafeFilePath(staticDir: string, relativePath: string): string | null {
  // Normalize and prevent traversal
  const decoded = decodeURIComponent(relativePath);
  if (decoded.includes('\0')) return null;

  const cleanRel = normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
  const candidate = resolve(staticDir, cleanRel.startsWith('/') ? cleanRel.slice(1) : cleanRel);

  // Containment check: must remain inside staticDir
  if (!candidate.startsWith(resolve(staticDir))) {
    return null;
  }

  // Exact file match
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  // Directory index match
  const indexCandidate = join(candidate, 'index.html');
  if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) {
    return indexCandidate;
  }

  // HTML extension shorthand match
  const htmlCandidate = `${candidate}.html`;
  if (existsSync(htmlCandidate) && statSync(htmlCandidate).isFile()) {
    return htmlCandidate;
  }

  return null;
}

/**
 * Creates the request handler for the documentation service.
 * @requirements [SR-DOC-001] [HLR-HUB-601] [LLR-SDK-005]
 */
export function createDocsHandler(staticDir: string = config.staticDir) {
  return createSafeHandler('docs', async (req: Request) => {
    const url = new URL(req.url);

    // 0. Static Brand Asset Interceptor
    const assetRes = handleBrandAssetRequest(req);
    if (assetRes) return assetRes;

    // 1. Dual-Probe Operational Health Endpoints
    if (url.pathname.endsWith('/health')) {
      return Response.json({
        status: 'ok',
        service: 'docs',
        port: config.port,
        uptime: process.uptime(),
        version: config.version,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname.endsWith('/ready')) {
      const isReady = existsSync(staticDir);
      return Response.json({
        ready: isReady,
        service: 'docs',
        staticDirReady: isReady,
        timestamp: new Date().toISOString(),
      }, { status: isReady ? 200 : 503 });
    }

    // 2. Normalize route paths (supporting both direct and reverse-proxied /docs)
    let reqPath = url.pathname;
    if (reqPath.startsWith(config.basePath)) {
      reqPath = reqPath.slice(config.basePath.length);
    }
    if (!reqPath || reqPath === '') {
      reqPath = '/';
    }

    // 3. Resolve static asset file path
    const resolvedPath = resolveSafeFilePath(staticDir, reqPath);

    if (resolvedPath) {
      const file = Bun.file(resolvedPath);
      const mimeType = getMimeType(resolvedPath);
      const stats = statSync(resolvedPath);
      const etag = `W/"${stats.size}-${stats.mtimeMs}"`;

      // Check conditional GET request (If-None-Match)
      const ifNoneMatch = req.headers.get('if-none-match');
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new Response(null, { status: 304 });
      }

      return new Response(file, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': config.cacheControl,
          'ETag': etag,
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 4. Fallback 404 (Astryx Universal Error Standard)
    const errorHtml = renderAstryxErrorHtml({
      statusCode: 404,
      appName: 'Living Documentation',
      title: 'Page Not Found',
      message: 'The requested documentation resource could not be located.',
      primaryActionText: 'Return to Documentation Home',
      primaryActionHref: '/docs/',
    });

    return new Response(errorHtml, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });
}

/**
 * Starts the documentation Bun HTTP server.
 * @requirements [SR-DOC-001] [HLR-HUB-601] [LLR-SDK-005]
 */
export function startDocsServer(port: number = config.port) {
  const handler = createDocsHandler();

  const server = Bun.serve({
    port,
    fetch: handler,
  });

  const shutdown = () => {
    logger.info('Received termination signal. Gracefully shutting down Docs Server...');
    server.stop(true);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

if (import.meta.main) {
  startDocsServer();
  logger.info(`📚 Living Documentation Server running on http://localhost:${config.port}`);
}
