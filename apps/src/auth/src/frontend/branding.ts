/**
 * @forge/auth/frontend - Dynamic White-Label Brand Resolver (2026 LTS)
 * Reads brand tokens from .env with enterprise fallbacks.
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * BrandConfig
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface BrandConfig {
  name: string;
  short: string;
  tagline: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  domain?: string;
}

/**
 * resolveBrandConfig
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function resolveBrandConfig(): BrandConfig {
  const brand = loadBrandConfig();
  return {
    name: brand.name,
    short: brand.short,
    tagline: brand.tagline,
    logoText: brand.short,
    logoUrl: brand.logoUrl,
    faviconUrl: brand.faviconUrl,
    domain: brand.domain,
  };
}
