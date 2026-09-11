/**
 * @forge/sdk - Tier 1 Unit: Dynamic Brand Configuration Resolver & Logo Handler
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { handleBrandAssetRequest, loadBrandConfig, renderBrandLogoHtml } from '../../src/branding';

describe('Tier 1 Unit: Brand Configuration Resolver Engine', () => {
  const originalBrandName = process.env.NEXT_PUBLIC_BRAND_NAME;
  const originalOrgName = process.env.NEXT_PUBLIC_ORG_NAME;
  const originalBrandShort = process.env.NEXT_PUBLIC_BRAND_SHORT;
  const originalBrandTagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE;
  const originalBrandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_BRAND_NAME;
    delete process.env.NEXT_PUBLIC_ORG_NAME;
    delete process.env.NEXT_PUBLIC_BRAND_SHORT;
    delete process.env.NEXT_PUBLIC_BRAND_TAGLINE;
    delete process.env.NEXT_PUBLIC_BRAND_LOGO_URL;
  });

  afterEach(() => {
    if (originalBrandName) process.env.NEXT_PUBLIC_BRAND_NAME = originalBrandName;
    if (originalOrgName) process.env.NEXT_PUBLIC_ORG_NAME = originalOrgName;
    if (originalBrandShort) process.env.NEXT_PUBLIC_BRAND_SHORT = originalBrandShort;
    if (originalBrandTagline) process.env.NEXT_PUBLIC_BRAND_TAGLINE = originalBrandTagline;
    if (originalBrandLogo) process.env.NEXT_PUBLIC_BRAND_LOGO_URL = originalBrandLogo;
  });

  it('Arrange, Act, Assert: loads default AG Dashboard branding when env vars are unset', () => {
    // Act
    const brand = loadBrandConfig();

    // Assert
    expect(brand.name).toBeDefined();
    expect(brand.short).toBeDefined();
    expect(brand.tagline).toBeDefined();
    expect(brand.logoUrl).toBeDefined();
  });

  it('Arrange, Act, Assert: dynamically resolves custom brand tokens from process.env', () => {
    // Arrange
    process.env.NEXT_PUBLIC_BRAND_NAME = 'Acme Global Cloud';
    process.env.NEXT_PUBLIC_BRAND_SHORT = 'AGC';
    process.env.NEXT_PUBLIC_BRAND_TAGLINE = 'Next-Gen Enterprise Cloud Engine';
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL = '/custom/logo.svg';

    // Act
    const brand = loadBrandConfig();

    // Assert
    expect(brand.name).toBe('Acme Global Cloud');
    expect(brand.orgName).toBe('Acme Global Cloud');
    expect(brand.short).toBe('AGC');
    expect(brand.tagline).toBe('Next-Gen Enterprise Cloud Engine');
    expect(brand.logoUrl).toBe('/custom/logo.svg');
    expect(brand.currentYear).toBe(new Date().getFullYear());
    expect(brand.copyrightText).toContain('Acme Global Cloud');
    expect(brand.copyrightText).toContain(String(new Date().getFullYear()));
  });

  it('Arrange, Act, Assert: resolves NEXT_PUBLIC_ORG_NAME when set independently', () => {
    // Arrange
    process.env.NEXT_PUBLIC_ORG_NAME = 'Starlight Technologies Ltd';

    // Act
    const brand = loadBrandConfig();

    // Assert
    expect(brand.orgName).toBe('Starlight Technologies Ltd');
    expect(brand.name).toBe('Starlight Technologies Ltd');
    expect(brand.copyrightText).toContain('Starlight Technologies Ltd');
  });

  it('Arrange, Act, Assert: dynamically resolves AG Dashboard branding and logo from .env', () => {
    // Arrange
    process.env.NEXT_PUBLIC_BRAND_NAME = 'AG Dashboard';
    process.env.NEXT_PUBLIC_BRAND_SHORT = 'AG';
    process.env.NEXT_PUBLIC_BRAND_TAGLINE = 'Modular Corporate Portal & Sandboxing Engine';
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL = '/brand/logo.png';

    // Act
    const brand = loadBrandConfig();

    // Assert
    expect(brand.name).toBe('AG Dashboard');
    expect(brand.short).toBe('AG');
    expect(brand.tagline).toContain('Modular Corporate Portal');
    expect(brand.logoUrl).toBe('/brand/logo.png');
  });

  it('Arrange, Act, Assert: handleBrandAssetRequest serves static brand logo file with correct content type', async () => {
    // Arrange
    const req = new Request('http://localhost:3000/brand/logo.png');

    // Act
    const res = handleBrandAssetRequest(req);

    // Assert
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);
    expect(res?.headers.get('Content-Type')).toBe('image/png');
    expect(res?.headers.get('Cache-Control')).toContain('max-age=86400');
  });

  it('Arrange, Act, Assert: handleBrandAssetRequest automatically prioritizes custom-logo override when present', async () => {
    // Arrange: Create a temporary custom-logo.png in public/brand/
    const { writeFileSync, unlinkSync } = await import('node:fs');
    const { join } = await import('node:path');
    const customPath = join(process.cwd(), 'public', 'brand', 'custom-logo.png');
    writeFileSync(customPath, Buffer.from('CUSTOM_LOGO_PNG_DATA'));

    try {
      // Act: Request default /brand/logo.png
      const req = new Request('http://localhost:3000/brand/logo.png');
      const res = handleBrandAssetRequest(req);

      // Assert: The custom logo was served
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      const text = await res?.text();
      expect(text).toBe('CUSTOM_LOGO_PNG_DATA');
      expect(res?.headers.get('Content-Type')).toBe('image/png');
    } finally {
      unlinkSync(customPath);
    }
  });

  it('Arrange, Act, Assert: handleBrandAssetRequest serves custom SVG override with image/svg+xml when requesting logo.png', async () => {
    // Arrange: Create a temporary custom-logo.svg in public/brand/
    const { writeFileSync, unlinkSync } = await import('node:fs');
    const { join } = await import('node:path');
    const customSvgPath = join(process.cwd(), 'public', 'brand', 'custom-logo.svg');
    writeFileSync(customSvgPath, Buffer.from('<svg>CUSTOM_SVG_DATA</svg>'));

    try {
      // Act: Request default /brand/logo.png (standard .env default)
      const req = new Request('http://localhost:3000/brand/logo.png');
      const res = handleBrandAssetRequest(req);

      // Assert: Custom SVG is served with correct SVG Content-Type header despite .png URL
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      expect(res?.headers.get('Content-Type')).toBe('image/svg+xml');
      const text = await res?.text();
      expect(text).toBe('<svg>CUSTOM_SVG_DATA</svg>');
    } finally {
      unlinkSync(customSvgPath);
    }
  });

  it('Arrange, Act, Assert: handleBrandAssetRequest serves custom folder logo override (public/brand/custom/logo.svg)', async () => {
    // Arrange: Create public/brand/custom/logo.svg
    const { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } = await import('node:fs');
    const { join } = await import('node:path');
    const customDir = join(process.cwd(), 'public', 'brand', 'custom');
    if (!existsSync(customDir)) mkdirSync(customDir, { recursive: true });
    const customFilePath = join(customDir, 'logo.svg');
    writeFileSync(customFilePath, Buffer.from('<svg>FOLDER_CUSTOM_SVG</svg>'));

    try {
      // Act: Request /brand/logo.png
      const req = new Request('http://localhost:3000/brand/logo.png');
      const res = handleBrandAssetRequest(req);

      // Assert
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      expect(res?.headers.get('Content-Type')).toBe('image/svg+xml');
      const text = await res?.text();
      expect(text).toBe('<svg>FOLDER_CUSTOM_SVG</svg>');
    } finally {
      unlinkSync(customFilePath);
      try { rmdirSync(customDir); } catch {}
    }
  });

  it('Arrange, Act, Assert: handleBrandAssetRequest returns null for non-asset routes', () => {
    // Arrange
    const req = new Request('http://localhost:3000/api/users');

    // Act
    const res = handleBrandAssetRequest(req);

    // Assert
    expect(res).toBeNull();
  });

  it('Arrange, Act, Assert: renderBrandLogoHtml renders accessible img with fallback', () => {
    // Arrange
    const brand = {
      name: 'AG Dashboard',
      short: 'AG',
      tagline: 'Engine',
      logoUrl: '/brand/logo.png',
    };

    // Act
    const html = renderBrandLogoHtml(brand, { height: 28 });

    // Assert
    expect(html).toContain('src="/brand/logo.png"');
    expect(html).toContain('alt="AG Dashboard"');
    expect(html).toContain('height: 28px');
    expect(html).toContain('astryx-logo-badge');
  });

  it('Arrange, Act, Assert: dynamically resolves custom domain and supportEmail', () => {
    // Arrange
    const origDomain = process.env.AUTH_ORG_DOMAIN;
    const origSupport = process.env.SUPPORT_EMAIL;
    process.env.AUTH_ORG_DOMAIN = 'acme.corp';
    process.env.SUPPORT_EMAIL = 'help@acme.corp';

    try {
      // Act
      const brand = loadBrandConfig();

      // Assert
      expect(brand.domain).toBe('acme.corp');
      expect(brand.supportEmail).toBe('help@acme.corp');
    } finally {
      if (origDomain !== undefined) process.env.AUTH_ORG_DOMAIN = origDomain;
      else delete process.env.AUTH_ORG_DOMAIN;
      if (origSupport !== undefined) process.env.SUPPORT_EMAIL = origSupport;
      else delete process.env.SUPPORT_EMAIL;
    }
  });
});
