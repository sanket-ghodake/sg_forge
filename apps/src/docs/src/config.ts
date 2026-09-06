/**
 * @forge/docs - Configuration & MIME Type Resolution Engine
 * Handles runtime environment variables, static assets paths, and caching policies.
 * Astryx Enterprise Baseline (v2.0.0 LTS)
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DocsServiceConfig
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export interface DocsServiceConfig {
  port: number;
  basePath: string;
  staticDir: string;
  cacheControl: string;
  version: string;
}

const REPO_ROOT = process.cwd();

/**
 * Resolves canonical directory containing pre-built documentation assets.
 * Resolves apps/src/docs/dist first, falling back to local dist if colocated.
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export function resolveStaticDistDir(): string {
  const candidates = [
    join(REPO_ROOT, 'apps', 'src', 'docs', 'dist'),
    join(REPO_ROOT, 'dist'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return join(REPO_ROOT, 'apps', 'src', 'docs', 'dist');
}

/**
 * Standard MIME type mapping for documentation assets.
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Resolves MIME content-type from file extension.
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export function getMimeType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Loads and validates runtime configuration for the docs service.
 * @requirements [SR-DOC-001] [LLR-SDK-005]
 */
export function loadDocsConfig(): DocsServiceConfig {
  const port = Number(process.env.DOCS_PORT || process.env.PORT || 3005);
  const basePath = (process.env.BASE_PATH || '/docs').replace(/\/$/, '');
  const staticDir = resolveStaticDistDir();
  const isProd = process.env.NODE_ENV === 'production';
  const cacheControl = isProd
    ? 'public, max-age=3600, stale-while-revalidate=86400'
    : 'no-cache, no-store, must-revalidate';

  return {
    port,
    basePath,
    staticDir,
    cacheControl,
    version: '2.0.0',
  };
}
