/**
 * SG Forge Micro-App Submodule - Portable Error Screen Renderer (2026 LTS)
 * 100% Isolated: Zero external monorepo dependencies.
 * Lucide vector SVGs, dual-theme parity, SEO defense, and SRE trace correlation.
 * @requirements [HLR-UI-401] [LLR-SUB-001]
 */

import { icons } from './icons';
import { getHeadStateScript, getModernUiStyles } from './ui';

export interface SubmoduleErrorOptions {
  statusCode: number;
  appName: string;
  appBaseHref?: string;
  title?: string;
  message?: string;
  traceId?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * renderSubmoduleErrorHtml
 * @requirements [HLR-UI-401] [LLR-SUB-001]
 */
export function renderSubmoduleErrorHtml(options: SubmoduleErrorOptions): string {
  const code = options.statusCode || 404;
  const title = options.title || (code === 404 ? 'Page Not Found' : 'Error');
  const message = options.message || 'The requested resource or subpath could not be located on this service.';
  const appName = options.appName || 'Micro-App';
  const baseHref = options.appBaseHref || './';
  const traceId = options.traceId || crypto.randomUUID();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>${code} - ${escapeHtml(title)} | ${escapeHtml(appName)}</title>
  ${getHeadStateScript({ defaultTheme: 'dark', enableAuthRedirectBridge: false })}
  <style>
    ${getModernUiStyles()}
    .err-card {
      max-width: 480px;
      margin: 4rem auto;
      padding: 2.25rem 2rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--radius);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      text-align: center;
    }
    .err-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.12);
      color: var(--forge-error);
      border: 1px solid rgba(239, 68, 68, 0.25);
      margin-bottom: 1.25rem;
    }
    .err-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1.25rem;
      color: var(--forge-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--forge-bg-surface);
      border-radius: 50%;
      border: 1px solid var(--forge-border);
    }
    .err-icon svg { width: 24px; height: 24px; }
    .err-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--forge-text-main);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }
    .err-msg {
      font-size: 0.875rem;
      color: var(--forge-text-muted);
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    .err-trace {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-family: monospace;
      color: var(--forge-text-subtle);
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      cursor: pointer;
    }
    .err-actions {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  </style>
</head>
<body class="aceternity-hero-grid">
  <main class="astryx-container">
    <div class="err-card">
      <div class="err-pill">
        ${icons.alertCircle} ${code} STATUS
      </div>
      <div class="err-icon">
        ${icons.search}
      </div>
      <h1 class="err-title">${escapeHtml(title)}</h1>
      <p class="err-msg">${escapeHtml(message)}</p>

      <div class="err-trace" onclick="navigator.clipboard.writeText('${traceId}').then(() => { this.style.borderColor='var(--forge-primary)'; setTimeout(() => this.style.borderColor='', 1500); })" title="Click to copy trace ID">
        ${icons.copy} <span>Trace: ${traceId.slice(0, 18)}...</span>
      </div>

      <div class="err-actions">
        <a href="${baseHref}" class="shadcn-btn">${icons.arrowLeft} Return to App</a>
        <a href="/portal" class="shadcn-btn">Workspace Portal ${icons.arrowRight}</a>
      </div>
    </div>
  </main>
</body>
</html>`;
}
