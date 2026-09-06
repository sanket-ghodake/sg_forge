#!/usr/bin/env bun
/**
 * Custom Landing Server (Starter Base)
 * Fast, standalone Bun HTTP server for custom landing page implementations.
 * Designed for independent Git Submodule / isolated repository workflows.
 */

import { createLogger, createSafeHandler } from '@forge/sdk';
import { renderAstryxErrorHtml } from '@forge/ui';
import { renderCustomLandingHtml } from './template.html';

const logger = createLogger('landing-custom');
const PORT = Number(process.env.LANDING_PORT || process.env.PORT || 3000);

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
      const html = renderCustomLandingHtml();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
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
