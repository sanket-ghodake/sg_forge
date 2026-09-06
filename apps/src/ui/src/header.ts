/**
 * @forge/ui - Astryx Navigation Header & Theme Engine (2026 LTS)
 * Enterprise top navigation header with Sun/Moon theme toggler and cross-tab sync.
 */

import { getAstryxToastScript } from './toast';

/**
 * Options for configuring Astryx navigation header.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface AstryxHeaderOptions {
  badgeLabel?: string;
  title?: string;
}

/**
 * Renders standard Astryx Navigation Header throughout the website with non-clickable branding and theme toggler.
 * Enterprise Standard: Namespaced storage key, cross-tab BroadcastChannel sync, and resilient fallback.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAstryxHeaderHtml(
  badgeLabel?: string,
  title?: string,
  options?: AstryxHeaderOptions
): string {
  const defaultShort = process.env.NEXT_PUBLIC_BRAND_SHORT || 'AG';
  const defaultName = 'WORKSPACE';
  const logoUrl =
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL ||
    process.env.BRAND_LOGO_URL ||
    process.env.BRAND_LOGO_PATH ||
    '/brand/logo.png';
  const badge = options?.badgeLabel || badgeLabel || defaultShort;
  const heading = options?.title || title || defaultName;

  return `
  <header class="astryx-header">
    <div class="astryx-logo" style="display: flex; align-items: center; gap: 0.65rem;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${heading}" class="astryx-brand-logo-img" style="height: 32px; max-height: 80%; width: auto; max-width: 180px; object-fit: contain; flex-shrink: 0;" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-flex';" />` : ''}
      <span class="astryx-logo-badge" style="${logoUrl ? 'display: none;' : ''}">${badge}</span>
      <span class="astryx-app-tag">${heading}</span>
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <button class="astryx-theme-toggle" id="theme-toggle-btn" title="Toggle Light / Dark Theme" aria-label="Toggle Theme">
        <!-- Sun Icon (shown in dark mode) -->
        <svg id="sun-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <!-- Moon Icon (shown in light mode) -->
        <svg id="moon-icon" viewBox="0 0 24 24" style="display: none;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    </div>
  </header>
  <script>
    (function() {
      var THEME_KEY = 'forge:v1:platform:theme';
      var LEGACY_KEY = 'sg-forge-theme';
      var CHANNEL_NAME = 'sg_forge_state_sync_bus';

      function readTheme() {
        try {
          var raw = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_KEY);
          if (!raw) return 'dark';
          try {
            var env = JSON.parse(raw);
            return (env && typeof env === 'object' && env.data) ? env.data : (env || 'dark');
          } catch(e) {
            return raw || 'dark';
          }
        } catch(e) {
          return 'dark';
        }
      }

      function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
      }

      function persistTheme(theme) {
        try {
          var env = { version: 1, updatedAt: new Date().toISOString(), data: theme };
          localStorage.setItem(THEME_KEY, JSON.stringify(env));
          localStorage.setItem(LEGACY_KEY, theme);
          if (typeof BroadcastChannel !== 'undefined') {
            var bc = new BroadcastChannel(CHANNEL_NAME);
            bc.postMessage({ key: THEME_KEY, data: theme, timestamp: Date.now() });
            bc.close();
          }
        } catch(e) {}
      }

      var current = readTheme();
      applyTheme(current);

      var btn = document.getElementById('theme-toggle-btn');
      if (btn) {
        btn.addEventListener('click', function() {
          var active = document.documentElement.getAttribute('data-theme') || 'dark';
          var next = active === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          persistTheme(next);
        });
      }

      function updateThemeIcons(theme) {
        var sun = document.getElementById('sun-icon');
        var moon = document.getElementById('moon-icon');
        if (sun && moon) {
          sun.style.display = theme === 'dark' ? 'block' : 'none';
          moon.style.display = theme === 'dark' ? 'none' : 'block';
        }
      }

      // Cross-tab real-time listener
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          var receiver = new BroadcastChannel(CHANNEL_NAME);
          receiver.onmessage = function(e) {
            if (e.data && (e.data.key === THEME_KEY || e.data.key === LEGACY_KEY)) {
              applyTheme(e.data.data);
            }
          };
        } catch(e) {}
      }
      window.addEventListener('storage', function(e) {
        if (e.key === THEME_KEY || e.key === LEGACY_KEY) {
          applyTheme(readTheme());
        }
      });
    })();
  </script>
  <script>${getAstryxToastScript()}</script>
  `;
}
