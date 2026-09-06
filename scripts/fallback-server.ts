#!/usr/bin/env bun
/**
 * SG Forge - Standalone Host Fallback Server (2026 LTS)
 * Approach A: Serves pre-rendered Astryx system-down error pages directly from disk
 * when Caddy / Docker / backend services are completely offline.
 * 100% Zero-External Dependencies & Air-Gapped Compliant.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createLogger } from '../apps/src/sdk/src/logger';
import { generateStaticErrorPages } from './generate-error-pages';

const logger = createLogger('fallback-server');
const REPO_ROOT = process.cwd();
const ERRORS_DIR = join(REPO_ROOT, 'proxy', 'errors');

/**
 * FallbackServerOptions
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export interface FallbackServerOptions {
  port?: number;
  quiet?: boolean;
}

/**
 * getOfflinePageHtml
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function getOfflinePageHtml(): string {
  const file503 = join(ERRORS_DIR, '503.html');
  const file502 = join(ERRORS_DIR, '502.html');

  if (existsSync(file503)) {
    return readFileSync(file503, 'utf8');
  }
  if (existsSync(file502)) {
    return readFileSync(file502, 'utf8');
  }

  // Pre-render on the fly if files were deleted
  generateStaticErrorPages();
  if (existsSync(file503)) {
    return readFileSync(file503, 'utf8');
  }

  // Minimal safe fallback
  return `<!DOCTYPE html><html><head><title>System Offline</title></head><body style="background:#0b0f19;color:#f3f4f6;font-family:sans-serif;text-align:center;padding:5rem;"><h1>Platform Offline</h1><p>The platform is undergoing maintenance. Please check back shortly.</p></body></html>`;
}

/**
 * startFallbackServer
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function startFallbackServer(options: FallbackServerOptions = {}) {
  const envPort = process.env.HTTP_PORT || process.env.PORT || '8080';
  const port = options.port !== undefined ? options.port : Number(envPort);

  // Guarantee error pages exist
  if (!existsSync(join(ERRORS_DIR, '503.html'))) {
    generateStaticErrorPages();
  }

  const server = Bun.serve({
    port,
    fetch(req: Request) {
      const url = new URL(req.url);

      // 1. Dual-Probe Health Endpoint
      if (url.pathname === '/health' || url.pathname === '/healthz') {
        return Response.json({
          status: 'fallback-active',
          mode: 'maintenance',
          service: 'host-fallback-daemon',
          port,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Return Astryx Maintenance / Outage Screen for all incoming routes
      const html = getOfflinePageHtml();
      return new Response(html, {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '30',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Forge-Fallback': 'active',
        },
      });
    },
  });

  if (!options.quiet) {
    logger.info(`🛡️ [Host Fallback Active] Serving Astryx Maintenance Screen on http://localhost:${port}/`);
    logger.info(`   ├─ All routes (/, /portal, /apps/*) -> Astryx 503 Maintenance`);
    logger.info(`   └─ Health Probe: http://localhost:${port}/health`);
  }

  const shutdown = () => {
    if (!options.quiet) {
      logger.info('Shutting down Host Fallback Server...');
    }
    server.stop(true);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

if (import.meta.main) {
  const customPort = process.argv[2] ? Number(process.argv[2]) : undefined;
  startFallbackServer({ port: customPort });
}
