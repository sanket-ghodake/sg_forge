/**
 * @forge/sdk - Enterprise Error & Request Handler Wrapper (RFC 7807) (v2.0.0 LTS)
 * Enterprise SRE Standard:
 * - RFC 7807 problem details error responses (application/problem+json)
 * - Automatic immutable x-trace-id injection & propagation
 * - Execution duration measurement & structured request logging
 */

import { createLogger } from './logger';
import { applySecurityHeaders } from './security-headers';
import { loadBrandConfig } from './branding';
import { renderAstryxErrorHtml } from '@forge/ui';

/**
 * Wraps an HTTP route handler in RFC 7807 problem details error boundary with immutable trace correlation.
 * @requirements [HLR-SDK-303] [LLR-SDK-004]
 */
export function createSafeHandler(
  serviceName: string,
  handler: (req: Request, context?: { traceId: string }) => Promise<Response> | Response,
  customLogDir?: string
): (req: Request) => Promise<Response> {
  const logger = createLogger(serviceName, customLogDir);

  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    const url = new URL(req.url);
    const traceId =
      req.headers.get('x-trace-id') ||
      req.headers.get('x-request-id') ||
      crypto.randomUUID();

    try {
      const response = await handler(req, { traceId });
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      logger.info(
        `${req.method} ${url.pathname} -> ${response.status} (${durationMs}ms)`,
        { durationMs, path: url.pathname },
        traceId
      );

      // Inject immutable trace ID and apply strict air-gapped security headers
      const securedResponse = applySecurityHeaders(response);
      const headers = new Headers(securedResponse.headers);
      if (!headers.has('x-trace-id')) {
        headers.set('x-trace-id', traceId);
      }

      // Asynchronously dispatch real request telemetry without blocking response
      dispatchRequestTelemetry(serviceName, req, response.status, durationMs, traceId);

      return new Response(securedResponse.body, {
        status: securedResponse.status,
        statusText: securedResponse.statusText,
        headers,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      logger.error(
        `Unhandled error during ${req.method} ${url.pathname} (${durationMs}ms)`,
        error,
        { durationMs, path: url.pathname },
        traceId
      );

      // Asynchronously dispatch error telemetry
      dispatchRequestTelemetry(serviceName, req, 500, durationMs, traceId);

      const acceptHeader = req.headers.get('accept') || '';
      const isHtmlRequest =
        acceptHeader.includes('text/html') &&
        !url.pathname.startsWith('/api/') &&
        req.method === 'GET';

      if (isHtmlRequest) {
        const html = renderAstryxErrorHtml({
          statusCode: 500,
          title: 'Internal Server Error',
          message:
            'An unexpected system error occurred. System telemetry has logged this incident for review.',
          appName: serviceName,
          traceId,
          primaryActionText: '↻ Reload Page',
          primaryActionHref: 'javascript:window.location.reload()',
          secondaryActionText: 'Platform Hub &rarr;',
          secondaryActionHref: '/',
        });

        const htmlResponse = new Response(html, {
          status: 500,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'x-trace-id': traceId,
          },
        });
        return applySecurityHeaders(htmlResponse);
      }

      const brand = loadBrandConfig();
      const domain = brand.domain || 'forge.internal';
      const errResponse = Response.json(
        {
          type: `https://${domain}/errors/internal-server-error`,
          title: 'Internal Server Error',
          status: 500,
          detail: 'An unexpected system error occurred. Please contact support.',
          service: serviceName,
          traceId,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/problem+json; charset=utf-8',
            'x-trace-id': traceId,
          },
        }
      );
      return applySecurityHeaders(errResponse);
    }
  };
}

/**
 * Asynchronously dispatches server request telemetry without blocking response delivery.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
function dispatchRequestTelemetry(
  serviceName: string,
  req: Request,
  status: number,
  durationMs: number,
  traceId: string
): void {
  try {
    const url = new URL(req.url);
    if (
      url.pathname.includes('/api/analytics') ||
      url.pathname.includes('/api/logs/stream') ||
      url.pathname.endsWith('/health') ||
      url.pathname.endsWith('/livez') ||
      url.pathname.endsWith('/readyz')
    ) {
      return;
    }

    const clientIp =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    const devDashboardPort = process.env.DEV_DASHBOARD_PORT || '3002';
    const ingestUrl = `http://127.0.0.1:${devDashboardPort}/api/analytics/collect`;

    fetch(ingestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: serviceName,
        path: url.pathname,
        method: req.method,
        statusCode: status,
        durationMs,
        clientIp,
        userAgent,
        referer,
        traceId,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    }).catch(() => {
      // Silently ignore if Dev Dashboard is not running during isolated tests
    });
  } catch {}
}

