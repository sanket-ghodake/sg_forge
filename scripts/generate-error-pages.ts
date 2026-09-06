#!/usr/bin/env bun
/**
 * SG Forge - Static Error Page Generator (2026 LTS)
 * Pre-renders high-aesthetic Astryx error pages for Caddy reverse proxy & host fallback.
 * 100% Air-Gapped: Zero external network or CDN calls, completely self-contained.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBrandConfig } from '../apps/src/sdk/src/branding';
import { renderAstryxErrorHtml } from '../apps/src/ui/src/error-page';

const REPO_ROOT = process.cwd();
const ERRORS_DIR = join(REPO_ROOT, 'proxy', 'errors');

/**
 * GeneratedErrorPage
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export interface GeneratedErrorPage {
  statusCode: number;
  filename: string;
  html: string;
}

/**
 * generateStaticErrorPages
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function generateStaticErrorPages(): GeneratedErrorPage[] {
  if (!existsSync(ERRORS_DIR)) {
    mkdirSync(ERRORS_DIR, { recursive: true });
  }

  const brand = loadBrandConfig();

  const pagesConfig = [
    {
      statusCode: 502,
      filename: '502.html',
      title: 'Service Temporarily Offline',
      message:
        'The requested service or micro-app is currently offline, restarting, or unreachable. Telemetry has been notified.',
      primaryActionText: '↻ Retry Connection',
      primaryActionHref: 'javascript:window.location.reload()',
      secondaryActionText: 'Platform Hub &rarr;',
      secondaryActionHref: '/',
    },
    {
      statusCode: 503,
      filename: '503.html',
      title: 'System Under Maintenance',
      message:
        'The platform is currently undergoing scheduled maintenance or system updates. All services will resume shortly.',
      primaryActionText: '↻ Check Again',
      primaryActionHref: 'javascript:window.location.reload()',
      secondaryActionText: 'Platform Hub &rarr;',
      secondaryActionHref: '/',
    },
    {
      statusCode: 500,
      filename: '500.html',
      title: 'Internal Server Error',
      message:
        'An unexpected condition occurred. System telemetry has logged this incident for review.',
      primaryActionText: '&larr; Platform Hub',
      primaryActionHref: '/',
      secondaryActionText: '↻ Reload Page',
      secondaryActionHref: 'javascript:window.location.reload()',
    },
    {
      statusCode: 404,
      filename: '404.html',
      title: 'Page Not Found',
      message:
        'The requested resource, microservice, or destination route could not be found.',
      primaryActionText: '&larr; Platform Hub',
      primaryActionHref: '/',
      secondaryActionText: 'Workspace Portal &rarr;',
      secondaryActionHref: '/portal',
    },
  ];

  const generated: GeneratedErrorPage[] = [];

  for (const cfg of pagesConfig) {
    const html = renderAstryxErrorHtml({
      statusCode: cfg.statusCode,
      title: cfg.title,
      message: cfg.message,
      primaryActionText: cfg.primaryActionText,
      primaryActionHref: cfg.primaryActionHref,
      secondaryActionText: cfg.secondaryActionText,
      secondaryActionHref: cfg.secondaryActionHref,
      brandName: brand.name,
    });

    const targetPath = join(ERRORS_DIR, cfg.filename);
    writeFileSync(targetPath, html, 'utf8');
    generated.push({
      statusCode: cfg.statusCode,
      filename: cfg.filename,
      html,
    });
  }

  return generated;
}

if (import.meta.main) {
  const pages = generateStaticErrorPages();
  const brand = loadBrandConfig();
  console.log(`✨ [${brand.name}] Pre-rendered ${pages.length} static Astryx error pages in proxy/errors/:`);
  for (const p of pages) {
    console.log(`   ├─ ${p.filename.padEnd(12)} (HTTP ${p.statusCode})`);
  }
}
