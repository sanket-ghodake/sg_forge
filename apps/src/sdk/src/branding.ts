/**
 * @forge/sdk - Dynamic White-Label Brand Resolver (2026 LTS)
 * Reads white-label brand tokens from process.env and .env configuration.
 * Single Source of Truth for Platform & Microservice Dynamic Rebranding and Logo Assets.
 */

import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

/**
 * White-label brand configuration attributes.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface BrandConfig {
  name: string;
  short: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  orgName?: string;
  currentYear?: number;
  copyrightText?: string;
  domain?: string;
  supportEmail?: string;
}

function findEnvPath(explicitPath?: string): string | null {
  if (explicitPath && existsSync(explicitPath)) return explicitPath;
  let curr = process.cwd();
  for (let i = 0; i < 4; i++) {
    const candidate = join(curr, '.env');
    if (existsSync(candidate)) return candidate;
    const parent = join(curr, '..');
    if (parent === curr) break;
    curr = parent;
  }
  return null;
}

function findBrandAssetPath(filename: string): string | null {
  let curr = process.cwd();
  for (let i = 0; i < 4; i++) {
    // 1. Check for git-ignored organization custom logo overrides first (SVG, PNG, WebP, AVIF)
    if (filename === 'logo.png' || filename === 'logo.svg') {
      const supportedExtensions = ['.svg', '.png', '.webp', '.avif', '.jpg', '.jpeg'];
      for (const ext of supportedExtensions) {
        const customCandidates = [
          join(curr, 'public', 'brand', `custom-logo${ext}`),
          join(curr, 'public', 'brand', 'custom', `logo${ext}`),
          join(curr, 'public', 'brand', `logo.custom${ext}`),
        ];
        for (const customPath of customCandidates) {
          if (existsSync(customPath)) return customPath;
        }
      }
    }

    const candidatePublic = join(curr, 'public', 'brand', filename);
    if (existsSync(candidatePublic)) return candidatePublic;
    const candidateDirect = join(curr, 'public', filename);
    if (existsSync(candidateDirect)) return candidateDirect;
    const parent = join(curr, '..');
    if (parent === curr) break;
    curr = parent;
  }
  return null;
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

/**
 * Dynamically loads and resolves brand tokens from process.env with fallback to .env parsing.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function loadBrandConfig(envPath?: string): BrandConfig {
  const diskMap: Record<string, string> = {};

  const resolvedEnvPath = findEnvPath(envPath);
  if (resolvedEnvPath && existsSync(resolvedEnvPath)) {
    try {
      const rawContent = readFileSync(resolvedEnvPath, 'utf8');
      for (const line of rawContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          diskMap[key] = val;
        }
      }
    } catch {
      // Fallback gracefully on parsing errors
    }
  }

  // Priority 1: Direct runtime process.env overrides
  // Priority 2: Disk .env configuration
  // Priority 3: Sensible defaults
  const procBrandName = process.env.NEXT_PUBLIC_BRAND_NAME || process.env.BRAND_NAME;
  const procOrgName = process.env.NEXT_PUBLIC_ORG_NAME || process.env.ORGANIZATION_NAME;

  const diskBrandName = diskMap.NEXT_PUBLIC_BRAND_NAME || diskMap.BRAND_NAME;
  const diskOrgName = diskMap.NEXT_PUBLIC_ORG_NAME || diskMap.ORGANIZATION_NAME;

  const resolvedOrg =
    procOrgName ||
    (procBrandName ? procBrandName : (diskOrgName || diskBrandName || 'AG Dashboard'));
  const resolvedBrand =
    procBrandName ||
    (procOrgName ? procOrgName : (diskBrandName || diskOrgName || 'AG Dashboard'));

  const short =
    process.env.NEXT_PUBLIC_BRAND_SHORT ||
    process.env.BRAND_SHORT ||
    diskMap.NEXT_PUBLIC_BRAND_SHORT ||
    diskMap.BRAND_SHORT ||
    'AG';

  const tagline =
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    process.env.BRAND_TAGLINE ||
    diskMap.NEXT_PUBLIC_BRAND_TAGLINE ||
    diskMap.BRAND_TAGLINE ||
    'Modular Corporate Portal & Sandboxing Engine';

  const logoUrl =
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL ||
    process.env.BRAND_LOGO_URL ||
    process.env.BRAND_LOGO_PATH ||
    diskMap.NEXT_PUBLIC_BRAND_LOGO_URL ||
    diskMap.BRAND_LOGO_URL ||
    diskMap.BRAND_LOGO_PATH ||
    '/brand/logo.png';

  const faviconUrl =
    process.env.NEXT_PUBLIC_BRAND_FAVICON_URL ||
    diskMap.NEXT_PUBLIC_BRAND_FAVICON_URL ||
    '/favicon.ico';

  const currentYear = new Date().getFullYear();
  const copyrightText = `© ${currentYear} ${resolvedOrg}. All rights reserved.`;

  const domain =
    process.env.AUTH_ORG_DOMAIN ||
    diskMap.AUTH_ORG_DOMAIN ||
    process.env.PUBLIC_DOMAIN ||
    diskMap.PUBLIC_DOMAIN ||
    'forge.internal';

  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    diskMap.SUPPORT_EMAIL ||
    `support@${domain}`;

  return {
    name: resolvedBrand,
    short,
    tagline,
    logoUrl,
    faviconUrl,
    orgName: resolvedOrg,
    currentYear,
    copyrightText,
    domain,
    supportEmail,
  };
}

/**
 * Intercepts and serves static brand assets from public/brand/ directory.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function handleBrandAssetRequest(req: Request): Response | null {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (
    pathname.startsWith('/brand/') ||
    pathname.startsWith('/public/brand/') ||
    pathname === '/favicon.ico'
  ) {
    const rawFilename = pathname.startsWith('/brand/')
      ? pathname.replace('/brand/', '')
      : pathname.startsWith('/public/brand/')
      ? pathname.replace('/public/brand/', '')
      : 'favicon.ico';

    const safeFilename = basename(rawFilename);
    const assetPath = findBrandAssetPath(safeFilename);

    if (assetPath && existsSync(assetPath)) {
      try {
        const ext = extname(assetPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const file = (globalThis as any).Bun?.file ? (globalThis as any).Bun.file(assetPath) : readFileSync(assetPath);
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Renders HTML markup for dynamic brand logo with automatic SVG/text badge fallback.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderBrandLogoHtml(
  brand: BrandConfig,
  options?: { height?: number; className?: string; style?: string }
): string {
  const height = options?.height || 32;
  const customClass = options?.className || 'astryx-brand-logo-img';
  const customStyle = options?.style || '';

  if (!brand.logoUrl) {
    return `<span class="astryx-logo-badge">${brand.short}</span>`;
  }

  return `
    <img src="${brand.logoUrl}" 
         alt="${brand.name}" 
         class="${customClass}" 
         style="height: ${height}px; max-height: 80%; width: auto; max-width: 180px; object-fit: contain; vertical-align: middle; ${customStyle}" 
         onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-flex';" />
    <span class="astryx-logo-badge" style="display: none;">${brand.short}</span>
  `.trim();
}
