/**
 * @forge/dev-hub - Developer Hub & Interactive SDK Explorer View (2026 LTS)
 * Modern Developer Console Architecture: 56px Collapsed Sidebar Rail Expanding on Hover.
 * Astryx Design Standards & Enterprise Documentation UX.
 */

import { getAstryxStyles, getHeadStateScript, astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';
import { getClientScripts } from './client-scripts';
import { getDevHubStyles } from './hub-styles';
import { renderGatewaySection } from './sections/gateway-section';
import { renderHealthMeshSection } from './sections/health-mesh-section';
import { renderOverviewSection } from './sections/overview-section';
import { renderRegistryMatrixSection } from './sections/registry-matrix-section';
import { renderSandboxSection } from './sections/sandbox-section';
import { renderScaffoldingSection } from './sections/scaffolding-section';
import { renderSdkSection } from './sections/sdk-section';
import { renderSecurityMatrixSection } from './sections/security-matrix-section';
import { renderTestingSection } from './sections/testing-section';
import { renderTokenMintSection } from './sections/token-mint-section';
import { renderUiSection } from './sections/ui-section';
import { renderApiCatalogSection } from './sections/api-catalog-section';

/**
 * renderDevHubHtml
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderDevHubHtml(): string {
  const brand = loadBrandConfig();

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - Developer Gateway & SDK Documentation</title>
  ${getHeadStateScript({ defaultTheme: 'dark', enableAuthRedirectBridge: false })}
  <script>
    (function() {
      try {
        var h = window.location.hash ? window.location.hash.slice(1) : 'overview';
        var validTabs = ['overview', 'routes', 'api-catalog', 'sandbox', 'tokens', 'sdk', 'ui', 'scaffolding'];
        var aliases = { 'gateway': 'routes', 'health': 'routes', 'security': 'api-catalog', 'testing': 'scaffolding' };
        if (aliases[h]) h = aliases[h];
        if (!h || validTabs.indexOf(h) === -1) h = 'overview';
        document.documentElement.setAttribute('data-active-hub-tab', h);
      } catch(e) {}
    })();
  </script>
  <style>
    ${getAstryxStyles()}
    ${getDevHubStyles()}
  </style>
</head>
<body>
  <!-- 1. Full-Width Top Header Bar (Console Model) -->
  <header class="sb-global-header">
    <div class="sb-header-left">
      <button class="sb-mobile-menu-btn" id="mobile-menu-toggle" onclick="toggleMobileSidebar()" aria-label="Toggle Navigation">
        ${astryxIcons.layers}
      </button>
      <a href="/" class="sb-brand">
        <span class="astryx-logo-badge">${brand.short}</span>
        <span class="sb-app-tag">DEVELOPER GATEWAY</span>
      </a>
      <div class="sb-header-divider"></div>
      <div class="sb-header-breadcrumb" id="header-active-view">
        <span class="breadcrumb-dot"></span>
        <span id="breadcrumb-title">Overview</span>
      </div>
    </div>

    <!-- Center Search Bar (⌘K / Ctrl+K) -->
    <div class="sb-header-center">
      <div class="sb-quick-find-bar">
        <span class="sb-search-icon">${astryxIcons.search}</span>
        <input type="text" id="global-search-input" class="sb-search-input" placeholder="Search endpoints, SDK methods, status codes... (⌘K)" oninput="filterHubContent(this.value)" autocomplete="off" />
        <kbd class="sb-hotkey-badge">⌘K</kbd>
      </div>
    </div>

    <div class="sb-header-right">
      <div class="watchdog-pill" title="Live Gateway listening on port 3003">
        <span class="watchdog-dot"></span>
        <span>Live Gateway</span>
      </div>

      <button class="astryx-theme-toggle" id="theme-toggle-btn" onclick="toggleDevTheme()" title="Toggle Light / Dark Theme" aria-label="Toggle Dark and Light Theme">
        <span class="theme-icon-sun">${astryxIcons.sun}</span>
        <span class="theme-icon-moon">${astryxIcons.moon}</span>
      </button>
    </div>
  </header>

  <!-- 2. Main Body Container (Hover-Expanding Sidebar Rail + Main Content Canvas) -->
  <div class="sb-body-container">
    <div class="sb-sidebar-wrapper">
      <div class="sb-sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>

      <aside class="sb-sidebar" id="main-sidebar" aria-label="Developer Navigation">
        <!-- Section 1: Platform Ingress & Fleet -->
        <div class="sb-nav-section-label">Platform Core</div>
        <div class="sb-nav-item active" data-tab="overview" onclick="switchTab('overview')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.topology}</span>
          <span class="sb-nav-label">Overview</span>
        </div>
        <div class="sb-nav-item" data-tab="routes" onclick="switchTab('routes')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.table}</span>
          <span class="sb-nav-label">Route Matrix & Fleet</span>
        </div>

        <!-- Section 2: Live APIs & Interactive Tools -->
        <div class="sb-nav-section-label">APIs & Tools</div>
        <div class="sb-nav-item" data-tab="api-catalog" onclick="switchTab('api-catalog')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.bookOpen}</span>
          <span class="sb-nav-label">Live API Explorer</span>
        </div>
        <div class="sb-nav-item" data-tab="sandbox" onclick="switchTab('sandbox')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.zap}</span>
          <span class="sb-nav-label">API Sandbox</span>
        </div>
        <div class="sb-nav-item" data-tab="tokens" onclick="switchTab('tokens')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.key}</span>
          <span class="sb-nav-label">Token Mint</span>
        </div>

        <!-- Section 3: SDK, UI & Architecture -->
        <div class="sb-nav-section-label">SDK & Standards</div>
        <div class="sb-nav-item" data-tab="sdk" onclick="switchTab('sdk')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.code}</span>
          <span class="sb-nav-label">@forge/sdk Reference</span>
        </div>
        <div class="sb-nav-item" data-tab="ui" onclick="switchTab('ui')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.sparkles}</span>
          <span class="sb-nav-label">Astryx UI Tokens</span>
        </div>
        <div class="sb-nav-item" data-tab="scaffolding" onclick="switchTab('scaffolding')" role="button" tabindex="0">
          <span class="sb-nav-icon">${astryxIcons.layers}</span>
          <span class="sb-nav-label">Scaffolding & Testing</span>
        </div>

        <!-- Sidebar Footer -->
        <div class="sb-sidebar-footer">
          <a href="/" class="sb-footer-link" title="Return to Platform Hub">
            <span class="sb-footer-icon">${astryxIcons.home}</span>
            <span class="sb-footer-text">Return to Platform Hub</span>
          </a>
          <a href="/portal" class="sb-footer-link" title="Workspace Portal">
            <span class="sb-footer-icon">${astryxIcons.externalLink}</span>
            <span class="sb-footer-text">Portal &rarr;</span>
          </a>
          <div class="sb-footer-pill" style="margin-top: 0.35rem;">
            <span>${brand.name} &bull; v2.0.0</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Main Content Canvas -->
    <main class="sb-main-canvas" id="main-canvas">
      ${renderOverviewSection()}
      ${renderGatewaySection()}
      ${renderRegistryMatrixSection()}
      ${renderSandboxSection()}
      ${renderHealthMeshSection()}
      ${renderTokenMintSection()}
      ${renderApiCatalogSection()}
      ${renderSdkSection()}
      ${renderUiSection()}
      ${renderSecurityMatrixSection()}
      ${renderScaffoldingSection()}
      ${renderTestingSection()}
    </main>
  </div>

  <script>
    ${getClientScripts()}
  </script>
</body>
</html>`;
}
