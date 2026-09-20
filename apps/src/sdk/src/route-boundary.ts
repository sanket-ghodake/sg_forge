/**
 * @forge/sdk - Enterprise Route Boundary & Content Negotiation Engine (2026 LTS)
 * Industry Standard (Stripe, Cloudflare, Google SRE, AWS):
 * - Strict Content Negotiation: RFC 7807 JSON for API clients vs Astryx UI for browsers
 * - Cache-Control: no-cache, no-store, must-revalidate on error states
 * - Immutable X-Trace-Id header correlation
 * - Zero internal stack trace leakage
 */

import { renderAstryxErrorHtml } from '@forge/ui';
import { applySecurityHeaders } from './security-headers';

/**
 * Options for route not found error response.
 * @requirements [HLR-SDK-303] [LLR-SDK-004] [LLR-UI-008]
 */
export interface RouteNotFoundOptions {
  req: Request;
  appName: string;
  traceId?: string;
  userEmail?: string;
  primaryActionText?: string;
  primaryActionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  customDetail?: string;
  message?: string;
}

/**
 * Options for generic status error response.
 * @requirements [HLR-SDK-303] [LLR-SDK-004] [LLR-UI-008]
 */
export interface StatusErrorOptions {
  req: Request;
  statusCode: number;
  appName: string;
  title?: string;
  message?: string;
  traceId?: string;
  userEmail?: string;
  primaryActionText?: string;
  primaryActionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
}

/**
 * Helper to determine if a request is expecting JSON (API) vs HTML (Browser Navigation).
 * @requirements [HLR-SDK-303] [LLR-SDK-004]
 */
export function isApiRequest(req: Request): boolean {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return true;

  const accept = req.headers.get('accept') || '';
  if (accept.includes('application/json') || accept.includes('application/problem+json')) {
    return !accept.includes('text/html');
  }

  return false;
}

/**
 * Renders a standardized 404 response with strict content negotiation.
 * @requirements [HLR-SDK-303] [LLR-SDK-004] [LLR-UI-008]
 */
export function renderRouteNotFound(options: RouteNotFoundOptions): Response {
  return renderStatusError({
    req: options.req,
    statusCode: 404,
    appName: options.appName,
    message: options.customDetail,
    traceId: options.traceId,
    userEmail: options.userEmail,
    primaryActionText: options.primaryActionText,
    primaryActionHref: options.primaryActionHref,
    secondaryActionText: options.secondaryActionText,
    secondaryActionHref: options.secondaryActionHref,
  });
}

/**
 * Renders a standardized status error response (400-504) with strict content negotiation.
 * @requirements [HLR-SDK-303] [LLR-SDK-004] [LLR-UI-008]
 */
export function renderStatusError(options: StatusErrorOptions): Response {
  const { req, statusCode, appName } = options;
  const url = new URL(req.url);
  const traceId =
    options.traceId ||
    req.headers.get('x-trace-id') ||
    req.headers.get('x-request-id') ||
    crypto.randomUUID();

  const isApi = isApiRequest(req);

  if (isApi) {
    const detail =
      options.message ||
      (statusCode === 404
        ? `The requested endpoint '${url.pathname}' does not exist on ${appName}.`
        : `An error occurred while processing request to '${url.pathname}'.`);

    const jsonRes = Response.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: options.title || (statusCode === 404 ? 'Not Found' : `HTTP ${statusCode} Error`),
        status: statusCode,
        detail,
        service: appName,
        path: url.pathname,
        traceId,
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/problem+json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Trace-Id': traceId,
        },
      }
    );
    return applySecurityHeaders(jsonRes);
  }

  const html = renderAstryxErrorHtml({
    statusCode,
    appName,
    title: options.title,
    message: options.message || (statusCode === 404 ? `The requested path "${url.pathname}" does not exist on ${appName}.` : undefined),
    traceId,
    userEmail: options.userEmail,
    primaryActionText: options.primaryActionText,
    primaryActionHref: options.primaryActionHref,
    secondaryActionText: options.secondaryActionText,
    secondaryActionHref: options.secondaryActionHref,
  });

  const htmlRes = new Response(html, {
    status: statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Trace-Id': traceId,
    },
  });

  return applySecurityHeaders(htmlRes);
}
