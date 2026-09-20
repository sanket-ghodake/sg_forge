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
import {
  RequestContext,
  formatTraceparent,
  type CanonicalRequestEvent,
} from './canonical-event';

/**
 * Wraps an HTTP route handler in RFC 7807 problem details error boundary with immutable W3C trace correlation.
 * Emits strictly one canonical request event upon completion.
 * @requirements [HLR-SDK-303] [LLR-SDK-004] [LLR-OBS-001]
 */
export function createSafeHandler(
  serviceName: string,
  handler: (req: Request, context: RequestContext) => Promise<Response> | Response,
  customLogDir?: string
): (req: Request) => Promise<Response> {
  const logger = createLogger(serviceName, customLogDir);

  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    const url = new URL(req.url);
    const ctx = new RequestContext(serviceName, req);

    try {
      const response = await handler(req, ctx);
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const canonical = ctx.toCanonicalEvent(response.status, durationMs);

      logger.info(
        `${req.method} ${url.pathname} -> ${response.status} (${durationMs}ms)`,
        { canonical, durationMs, path: url.pathname },
        ctx.traceId
      );

      // Inject immutable W3C trace IDs and apply strict air-gapped security headers
      const securedResponse = applySecurityHeaders(response);
      const headers = new Headers(securedResponse.headers);
      if (!headers.has('x-trace-id')) {
        headers.set('x-trace-id', ctx.traceId);
      }
      if (!headers.has('traceparent')) {
        headers.set('traceparent', formatTraceparent(ctx.traceContext));
      }
      if (!headers.has('x-incident-token')) {
        headers.set('x-incident-token', ctx.incidentToken);
      }

      // Asynchronously dispatch canonical request telemetry without blocking response
      dispatchRequestTelemetry(canonical, req);

      return new Response(securedResponse.body, {
        status: securedResponse.status,
        statusText: securedResponse.statusText,
        headers,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      const canonical = ctx.toCanonicalEvent(500, durationMs, {
        type: error.name,
        message: error.message,
      });

      logger.error(
        `Unhandled error during ${req.method} ${url.pathname} (${durationMs}ms)`,
        error,
        { canonical, durationMs, path: url.pathname },
        ctx.traceId
      );

      // Asynchronously dispatch error telemetry
      dispatchRequestTelemetry(canonical, req);

      const acceptHeader = req.headers.get('accept') || '';
      const isHtmlRequest =
        acceptHeader.includes('text/html') &&
        !url.pathname.startsWith('/api/') &&
        req.method === 'GET';

      if (isHtmlRequest) {
        const isDev = process.env.NODE_ENV !== 'production';
        const html = renderAstryxErrorHtml({
          statusCode: 500,
          title: 'Internal Server Error',
          message:
            'An unexpected system error occurred. System telemetry has logged this incident for review.',
          appName: serviceName,
          traceId: ctx.traceId,
          incidentToken: ctx.incidentToken,
          devDetails: isDev
            ? {
                stack: error.stack,
                route: url.pathname,
                method: req.method,
              }
            : undefined,
          primaryActionText: '↻ Reload Page',
          primaryActionHref: 'javascript:window.location.reload()',
          secondaryActionText: 'Platform Hub &rarr;',
          secondaryActionHref: '/',
        });

        const htmlResponse = new Response(html, {
          status: 500,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'x-trace-id': ctx.traceId,
            'traceparent': formatTraceparent(ctx.traceContext),
            'x-incident-token': ctx.incidentToken,
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
          detail: 'An unexpected system error occurred. Please contact support with incidentToken.',
          service: serviceName,
          traceId: ctx.traceId,
          incidentToken: ctx.incidentToken,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/problem+json; charset=utf-8',
            'x-trace-id': ctx.traceId,
            'traceparent': formatTraceparent(ctx.traceContext),
            'x-incident-token': ctx.incidentToken,
          },
        }
      );
      return applySecurityHeaders(errResponse);
    }
  };
}

/**
 * Asynchronously dispatches server request telemetry without blocking response delivery.
 * @requirements [HLR-DEV-501] [LLR-TEL-001] [LLR-OBS-001]
 */
function dispatchRequestTelemetry(
  canonical: CanonicalRequestEvent,
  req: Request
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
        service: canonical.service,
        path: canonical.route,
        method: canonical.method,
        statusCode: canonical.statusCode,
        durationMs: canonical.durationMs,
        clientIp,
        userAgent,
        referer,
        traceId: canonical.traceId,
        incidentToken: canonical.incidentToken,
        orgId: canonical.tenant.orgId,
        userId: canonical.tenant.userId,
        tier: canonical.tenant.tier,
        metrics: canonical.metrics,
        spans: canonical.spans,
        error: canonical.error,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    }).catch(() => {
      // Silently ignore if Dev Dashboard is not running during isolated tests
    });
  } catch {}
}


