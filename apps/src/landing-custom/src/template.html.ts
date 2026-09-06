/**
 * Custom Landing Page - HTML Template Renderer
 * Astryx Design Standards & Fluid Responsive Architecture (2026 LTS Baseline)
 * Fully customizable starter layout connecting to SG Forge workspaces and auth.
 */

import { getAstryxStyles, getHeadStateScript } from '@forge/ui';

/**
 * LandingConfig
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface LandingConfig {
  brandName?: string;
  brandTagline?: string;
  heroHeadline?: string;
  heroSubheading?: string;
  portalUrl?: string;
  authUrl?: string;
  devcenterUrl?: string;
}

/**
 * Renders the production-ready custom landing page HTML.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderCustomLandingHtml(config: LandingConfig = {}): string {
  const brandName = config.brandName || process.env.NEXT_PUBLIC_BRAND_NAME || 'AG Dashboard';
  const brandTagline = config.brandTagline || process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Modular Corporate Portal & Sandboxing Engine';
  const heroHeadline = config.heroHeadline || 'Your Modular Enterprise Canvas';
  const heroSubheading = config.heroSubheading || 'Unified access to organizational workspaces, sandboxed polyglot micro-apps, and automated dev tools.';
  const portalUrl = config.portalUrl || '/portal';
  const authUrl = config.authUrl || '/auth';
  const devcenterUrl = config.devcenterUrl || '/devcenter';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} - ${brandTagline}</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--forge-bg-root);
      color: var(--forge-text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.6;
    }
    /* Astryx Slim Themed Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--forge-bg-root); }
    ::-webkit-scrollbar-thumb { background: var(--forge-border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--forge-text-subtle); }

    .nav-header {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(16px);
      background: var(--forge-bg-card);
      border-bottom: 1px solid var(--forge-border);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--forge-text-main);
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      background: rgba(59, 130, 246, 0.15);
      color: var(--forge-primary);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 20px;
      font-weight: 600;
    }
    .nav-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.55rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: var(--forge-transition);
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: var(--forge-primary);
      color: var(--forge-text-main);
    }
    .btn-primary:hover {
      background: var(--forge-primary-hover);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--forge-text-main);
      border-color: var(--forge-border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .main-container {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 4rem 1.5rem 2rem;
    }
    .hero-section {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 5rem;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--forge-accent);
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 1.25rem;
      background: linear-gradient(135deg, var(--forge-text-main) 30%, var(--forge-text-muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 1.125rem;
      color: var(--forge-text-muted);
      margin-bottom: 2.25rem;
    }
    .hero-cta {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 5rem;
    }
    .card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 2rem;
      backdrop-filter: blur(12px);
      transition: var(--forge-transition);
    }
    .card:hover {
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-3px);
      box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
    }
    .card-icon {
      font-size: 1.75rem;
      margin-bottom: 1rem;
      display: inline-block;
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--forge-text-main);
    }
    .card-desc {
      font-size: 0.9rem;
      color: var(--forge-text-muted);
      line-height: 1.5;
    }

    .callout-box {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: var(--forge-radius);
      padding: 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
      margin-bottom: 4rem;
    }
    .callout-content h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .callout-content p {
      font-size: 0.95rem;
      color: var(--forge-text-muted);
    }

    footer {
      border-top: 1px solid var(--forge-border);
      padding: 2rem 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--forge-text-subtle);
    }
    @media (max-width: 640px) {
      .hero-cta { flex-direction: column; }
      .btn { width: 100%; }
      .callout-box { text-align: center; justify-content: center; }
    }
  </style>
</head>
<body>
  <header class="nav-header">
    <a href="/" class="brand-logo">
      <span>${brandName}</span>
      <span class="brand-badge">Custom Landing</span>
    </a>
    <nav class="nav-actions">
      <a href="${authUrl}" class="btn btn-secondary">Sign In</a>
      <a href="${portalUrl}" class="btn btn-primary">Open Portal &rarr;</a>
    </nav>
  </header>

  <main class="main-container">
    <section class="hero-section">
      <div class="hero-pill">&#x2728; Custom Landing Base &bull; Isolated Git Submodule</div>
      <h1>${heroHeadline}</h1>
      <p class="hero-sub">${heroSubheading}</p>
      <div class="hero-cta">
        <a href="${portalUrl}" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-size: 1rem;">Launch Portal Workspace</a>
        <a href="${devcenterUrl}" class="btn btn-secondary" style="padding: 0.75rem 1.75rem; font-size: 1rem;">Developer Center</a>
      </div>
    </section>

    <section class="features-grid">
      <div class="card">
        <div class="card-icon">&#x1F680;</div>
        <h3 class="card-title">Polyglot Micro-Apps</h3>
        <p class="card-desc">Embed and launch isolated micro-frontends with dedicated Turso (libSQL) database per service.</p>
      </div>

      <div class="card">
        <div class="card-icon">&#x1F510;</div>
        <h3 class="card-title">Zero-Trust SSO & IAM</h3>
        <p class="card-desc">Centralized authentication and RBAC session cookies with automatic token signing and permission enforcement.</p>
      </div>

      <div class="card">
        <div class="card-icon">&#x1F4E6;</div>
        <h3 class="card-title">Zero Main Repo Drift</h3>
        <p class="card-desc">Maintained in an independent Git submodule with ignore flags, guaranteeing zero merge conflicts during platform pulls.</p>
      </div>
    </section>

    <div class="callout-box">
      <div class="callout-content">
        <h2>Ready to customize this landing page?</h2>
        <p>Edit <code>landing-custom/src/template.html.ts</code> or replace with your own framework container.</p>
      </div>
      <a href="${portalUrl}" class="btn btn-primary">Get Started Now &rarr;</a>
    </div>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved. &bull; Enterprise Workspace Platform</p>
  </footer>
</body>
</html>`;
}
