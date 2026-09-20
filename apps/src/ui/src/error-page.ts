/**
 * @forge/ui - Astryx Universal Error Page Engine (2026 LTS)
 * Enterprise SRE & AppSec Zero-Leak Error Boundaries.
 * Renders consistent, high-aesthetic Astryx error screens for all HTTP error codes.
 */

import { getAstryxHeaderHtml } from './header';
import { getAstryxStyles } from './styles';
import { getHeadStateScript } from './state';
import { astryxIcons } from './icons';

/**
 * Options for configuring Astryx full-page error template.
 * @requirements [HLR-UI-401] [LLR-UI-008]
 */
export interface ErrorPageOptions {
  statusCode: number;
  appName?: string;
  title?: string;
  message?: string;
  userEmail?: string;
  traceId?: string;
  primaryActionText?: string;
  primaryActionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  brandName?: string;
}

export interface StatusConfig {
  icon: string;
  pill: string;
  title: string;
  message: string;
  badgeStyle?: string;
}

const STATUS_DEFAULTS: Record<number, StatusConfig> = {
  400: {
    icon: astryxIcons.alertTriangle,
    pill: '400 BAD REQUEST',
    title: 'Invalid Request',
    message: 'The request could not be processed due to invalid parameters or formatting.',
  },
  401: {
    icon: astryxIcons.lock,
    pill: '401 UNAUTHORIZED',
    title: 'Authentication Required',
    message: 'Your session has expired or authentication is required to access this resource.',
  },
  403: {
    icon: astryxIcons.shieldAlert,
    pill: '403 ACCESS RESTRICTED',
    title: 'Access Restricted',
    message: 'You do not have permission to access this application. Please contact your organization administrator if you require access.',
  },
  404: {
    icon: astryxIcons.search,
    pill: '404 NOT FOUND',
    title: 'Page Not Found',
    message: 'The requested resource, service, or destination route could not be located.',
  },
  405: {
    icon: astryxIcons.slash,
    pill: '405 METHOD NOT ALLOWED',
    title: 'Method Not Permitted',
    message: 'The requested HTTP method is not supported for this route.',
  },
  429: {
    icon: astryxIcons.clock,
    pill: '429 RATE LIMITED',
    title: 'Too Many Requests',
    message: 'Request volume has exceeded safe thresholds. Please wait a moment before trying again.',
  },
  500: {
    icon: astryxIcons.zap,
    pill: '500 INTERNAL ERROR',
    title: 'Internal Server Error',
    message: 'An unexpected system condition occurred. System telemetry has logged this incident for review.',
  },
  502: {
    icon: astryxIcons.powerOff,
    pill: '502 BAD GATEWAY',
    title: 'Service Upstream Unavailable',
    message: 'The target microservice is temporarily unreachable, deploying, or restarting.',
  },
  503: {
    icon: astryxIcons.wrench,
    pill: '503 SERVICE UNAVAILABLE',
    title: 'Service Under Maintenance',
    message: 'The platform or requested application is currently undergoing brief maintenance. Please check back shortly.',
  },
  504: {
    icon: astryxIcons.clock,
    pill: '504 GATEWAY TIMEOUT',
    title: 'Gateway Timeout',
    message: 'The target microservice or upstream process timed out before completing the request.',
  },
};

/**
 * Renders standard Astryx system down maintenance screen.
 * @requirements [HLR-UI-401] [LLR-UI-008]
 */
export function renderAstryxSystemDownPage(options: { brandName?: string; message?: string } = {}): string {
  return renderAstryxErrorHtml({
    statusCode: 503,
    title: 'System Under Maintenance',
    message:
      options.message ||
      'The platform is currently undergoing scheduled maintenance or system updates. All services will resume shortly.',
    primaryActionText: '↻ Check Again',
    primaryActionHref: 'javascript:window.location.reload()',
    secondaryActionText: 'Platform Hub &rarr;',
    secondaryActionHref: '/',
    brandName: options.brandName,
  });
}

/**
 * Renders consistent, high-aesthetic Astryx error screens for all HTTP error codes.
 * 100% Vector SVGs (zero OS emojis), SEO robots defense, and SRE trace correlation.
 * @requirements [HLR-UI-401] [LLR-UI-008]
 */
export function renderAstryxErrorHtml(options: ErrorPageOptions): string {
  const code = options.statusCode || 500;
  const config = STATUS_DEFAULTS[code] || {
    icon: astryxIcons.alertTriangle,
    pill: `${code} ERROR`,
    title: 'System Notice',
    message: 'An unexpected status code was returned by the system.',
  };

  const iconSvg = config.icon;
  const pillText = config.pill;
  const heading = options.title || config.title;
  const description = options.message || (options.appName ? `${config.message} for <strong>${options.appName}</strong>` : config.message);

  const primaryText = options.primaryActionText || (code === 401 ? 'Sign In &rarr;' : '&larr; Return to Workspace Portal');
  const primaryHref = options.primaryActionHref || (code === 401 ? '/auth/login' : '/portal');
  
  const secondaryText = options.secondaryActionText || (code === 403 ? 'Switch Account &rarr;' : 'Platform Hub &rarr;');
  const secondaryHref = options.secondaryActionHref || (code === 403 ? '/auth/login' : '/');

  const brandName =
    options.brandName ||
    process.env.NEXT_PUBLIC_BRAND_NAME ||
    process.env.BRAND_NAME ||
    'SG Forge';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${code} ${heading} - ${brandName}</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    .error-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 60px);
      padding: 1.5rem;
      box-sizing: border-box;
      width: 100%;
    }
    .error-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 2.5rem;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: var(--forge-shadow-card);
      box-sizing: border-box;
    }
    .badge-error-status {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.85rem;
      background: rgba(239, 68, 68, 0.12);
      color: var(--forge-danger, rgba(239, 68, 68, 1));
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--forge-radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      margin-bottom: 1.25rem;
    }
    .badge-error-status svg {
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }
    .user-pill {
      display: inline-block;
      font-size: 0.82rem;
      color: var(--forge-text-muted);
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      padding: 0.35rem 0.75rem;
      border-radius: var(--forge-radius-sm);
      margin-bottom: 1.25rem;
    }
    .trace-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--forge-text-subtle);
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.35rem 0.65rem;
      margin-top: 1.5rem;
      font-family: monospace;
      cursor: pointer;
      user-select: all;
      transition: border-color 0.15s ease, color 0.15s ease;
    }
    .trace-pill:hover {
      border-color: var(--forge-primary);
      color: var(--forge-text-main);
    }
    .trace-pill.copied {
      border-color: var(--forge-success, #3ecf8e);
      color: var(--forge-success, #3ecf8e);
    }
    .trace-pill code {
      font-family: inherit;
    }
    @media (max-width: 480px) {
      .error-card {
        padding: 1.5rem 1rem;
      }
    }
  </style>
</head>
<body>
  ${getAstryxHeaderHtml('ERROR', `HTTP ${code}`)}
  <main class="error-wrapper">
    <div class="error-card">
      <div class="badge-error-status">${iconSvg}<span>${pillText}</span></div>
      <h1 style="font-size: 1.65rem; color: var(--forge-text-main); margin: 0 0 0.6rem 0;">${heading}</h1>
      
      <p style="color: var(--forge-text-muted); font-size: 0.92rem; line-height: 1.55; margin-bottom: 1.25rem;">
        ${description}
      </p>

      ${options.userEmail ? `<div class="user-pill">Signed in as <strong style="color: var(--forge-text-main);">${options.userEmail}</strong></div>` : ''}

      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem;">
        <a href="${primaryHref}" class="astryx-btn btn-outline">${primaryText}</a>
        <a href="${secondaryHref}" class="astryx-btn btn-outline" style="border-color: var(--forge-border);">${secondaryText}</a>
      </div>

      ${options.traceId ? `
      <div class="trace-pill" id="trace-btn" onclick="navigator.clipboard.writeText('${options.traceId}').then(()=>{this.classList.add('copied');var l=this.querySelector('.trace-lbl');if(l)l.textContent='Copied!';setTimeout(()=>{this.classList.remove('copied');if(l)l.textContent='Incident Trace:'},1500)});" title="Click to copy Trace ID">
        <span class="trace-lbl">Incident Trace:</span>
        <code>${options.traceId}</code>
        <span style="display:inline-flex;opacity:0.7;">${astryxIcons.copy}</span>
      </div>` : ''}
    </div>
  </main>
</body>
</html>`;
}

