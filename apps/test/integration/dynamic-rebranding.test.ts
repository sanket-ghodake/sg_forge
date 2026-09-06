/**
 * @forge/platform - Tier 2 Integration: Cross-Service Dynamic Rebranding Engine
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 * Verifies that all platform microservices dynamically adapt brand identity, page titles, and logos from .env,
 * while header navigation cleanly renders respective app names (DEVELOPER CENTER, PORTAL, DEVELOPER GATEWAY, etc.).
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import { renderDashboardHtml } from '../../src/dev-dashboard/src/frontend/ui-renderer';
import { renderPortalHtml } from '../../src/portal/src/frontend/ui-renderer';
import { renderDevHubHtml } from '../../src/dev-hub/src/frontend/hub-view';
import { renderLoginHtml } from '../../src/auth/src/frontend/login-view';
import { renderLandingHtml } from '../../src/landing/src/server';
import { renderAstryxErrorHtml } from '../../src/ui/src/error-page';

describe('Tier 2 Integration: Dynamic White-Label Rebranding Across All Services', () => {
  const originalBrandName = process.env.NEXT_PUBLIC_BRAND_NAME;
  const originalBrandShort = process.env.NEXT_PUBLIC_BRAND_SHORT;
  const originalBrandTagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE;

  afterAll(() => {
    if (originalBrandName) process.env.NEXT_PUBLIC_BRAND_NAME = originalBrandName;
    if (originalBrandShort) process.env.NEXT_PUBLIC_BRAND_SHORT = originalBrandShort;
    if (originalBrandTagline) process.env.NEXT_PUBLIC_BRAND_TAGLINE = originalBrandTagline;
  });

  it('Arrange, Act, Assert: renders AG Dashboard branding across all UI frontends with active .env configuration', () => {
    // 1. Arrange
    process.env.NEXT_PUBLIC_BRAND_NAME = 'AG Dashboard';
    process.env.NEXT_PUBLIC_BRAND_SHORT = 'AG';
    process.env.NEXT_PUBLIC_BRAND_TAGLINE = 'Modular Corporate Portal & Sandboxing Engine';

    // 2. Act
    const brand = loadBrandConfig();
    const devDashboardHtml = renderDashboardHtml();
    const portalHtml = renderPortalHtml();
    const devHubHtml = renderDevHubHtml();
    const loginHtml = renderLoginHtml();
    const landingHtml = renderLandingHtml();
    const errorHtml = renderAstryxErrorHtml({ statusCode: 404, title: 'Not Found' });

    // 3. Assert
    expect(brand.name).toBe('AG Dashboard');
    expect(brand.short).toBe('AG');

    // Landing Discovery Hub
    expect(landingHtml).toContain('<title>AG Dashboard - Modular Corporate Portal & Micro-App Engine</title>');
    expect(landingHtml).toContain('AG Dashboard Workspace Platform');
    expect(landingHtml).toContain(`&copy; ${brand.currentYear} AG Dashboard. All rights reserved.`);

    // Dev Dashboard
    expect(devDashboardHtml).toContain('<title>AG Dashboard - Developer Dashboard & Diagnostics</title>');
    expect(devDashboardHtml).toContain('DEVELOPER CENTER');
    expect(devDashboardHtml).toContain('src="/brand/logo.png"');

    // Portal
    expect(portalHtml).toContain('<title>AG Dashboard Portal - Workspace & Admin Console</title>');
    expect(portalHtml).toContain('PORTAL');
    expect(portalHtml).toContain('src="/brand/logo.png"');

    // Dev Hub
    expect(devHubHtml).toContain('<title>AG Dashboard - Developer Gateway & SDK Documentation</title>');
    expect(devHubHtml).toContain('DEVELOPER GATEWAY');

    // Auth Login
    expect(loginHtml).toContain('<title>Sign In - AG Dashboard</title>');
    expect(loginHtml).toContain('<h1 class="auth-title">AG Dashboard</h1>');
    expect(loginHtml).toContain('Modular Corporate Portal & Sandboxing Engine');
    expect(loginHtml).toContain('src="/brand/logo.png"');

    // Error Page
    expect(errorHtml).toContain('<title>404 Not Found - AG Dashboard</title>');
  });

  it('Arrange, Act, Assert: dynamically updates brand tokens and page titles when switched to custom enterprise brand', () => {
    // 1. Arrange: Switch brand dynamically
    const origBrand = process.env.NEXT_PUBLIC_BRAND_NAME;
    const origShort = process.env.NEXT_PUBLIC_BRAND_SHORT;
    const origTagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE;
    const origDomain = process.env.AUTH_ORG_DOMAIN;

    process.env.NEXT_PUBLIC_BRAND_NAME = 'Starlight Portal';
    process.env.NEXT_PUBLIC_BRAND_SHORT = 'SL';
    process.env.NEXT_PUBLIC_BRAND_TAGLINE = 'Unified Enterprise Sandboxing Cloud';
    process.env.AUTH_ORG_DOMAIN = 'starlight.internal';

    try {
      // 2. Act
      const brand = loadBrandConfig();
      const devDashboardHtml = renderDashboardHtml();
      const portalHtml = renderPortalHtml();
      const devHubHtml = renderDevHubHtml();
      const loginHtml = renderLoginHtml();
      const landingHtml = renderLandingHtml();
      const errorHtml = renderAstryxErrorHtml({ statusCode: 500, title: 'Server Error' });

      // 3. Assert
      expect(brand.name).toBe('Starlight Portal');
      expect(brand.short).toBe('SL');
      expect(brand.domain).toBe('starlight.internal');

      // Landing Discovery Hub reflects Starlight
      expect(landingHtml).toContain('<title>Starlight Portal - Modular Corporate Portal & Micro-App Engine</title>');
      expect(landingHtml).toContain('Starlight Portal Workspace Platform');
      expect(landingHtml).toContain(`&copy; ${brand.currentYear} Starlight Portal. All rights reserved.`);

      // Dev Dashboard reflects Starlight title and clean DEVELOPER CENTER app header
      expect(devDashboardHtml).toContain('Starlight Portal - Developer Dashboard & Diagnostics');
      expect(devDashboardHtml).toContain('DEVELOPER CENTER');

      // Portal reflects Starlight title and clean PORTAL app header
      expect(portalHtml).toContain('Starlight Portal Portal - Workspace & Admin Console');
      expect(portalHtml).toContain('PORTAL');

      // Dev Hub reflects Starlight title and DEVELOPER GATEWAY app header
      expect(devHubHtml).toContain('Starlight Portal - Developer Gateway & SDK Documentation');
      expect(devHubHtml).toContain('DEVELOPER GATEWAY');

      // Auth reflects Starlight & dynamic domain
      expect(loginHtml).toContain('Sign In - Starlight Portal');
      expect(loginHtml).toContain('Unified Enterprise Sandboxing Cloud');
      expect(loginHtml).toContain('placeholder="user@starlight.internal"');

      // Error page reflects Starlight
      expect(errorHtml).toContain('500 Server Error - Starlight Portal');
    } finally {
      if (origBrand !== undefined) process.env.NEXT_PUBLIC_BRAND_NAME = origBrand;
      else delete process.env.NEXT_PUBLIC_BRAND_NAME;
      if (origShort !== undefined) process.env.NEXT_PUBLIC_BRAND_SHORT = origShort;
      else delete process.env.NEXT_PUBLIC_BRAND_SHORT;
      if (origTagline !== undefined) process.env.NEXT_PUBLIC_BRAND_TAGLINE = origTagline;
      else delete process.env.NEXT_PUBLIC_BRAND_TAGLINE;
      if (origDomain !== undefined) process.env.AUTH_ORG_DOMAIN = origDomain;
      else delete process.env.AUTH_ORG_DOMAIN;
    }
  });
});
