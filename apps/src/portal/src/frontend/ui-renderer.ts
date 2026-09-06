/**
 * @forge/portal - Master UI HTML Renderer (2026 LTS)
 * Combines Header, Expandable Sidebar, Viewport Containers, Modals, and Scripts into a cohesive Astryx layout.
 */

import { getAstryxStyles, getHeadStateScript, getAstryxToastScript, getAstryxDropdownScript, getAstryxTooltipScript } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';
import { getPortalCustomStyles } from './ui-styles';
import { renderPortalHeader, type HeaderUserContext } from './layout-header';
import { renderPortalSidebar } from './layout-sidebar';
import { renderPageCards } from './page-cards';
import { renderPortalModals } from './ui-modals';
import { renderCommandPalette } from './ui-command-palette';
import { getPortalClientScript } from './ui-scripts';
import { getPortalApps } from './ui-apps-data';
import { getLiveNotifications } from '../backend/inbox-service';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * renderPortalHtml
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderPortalHtml(user?: HeaderUserContext): string {
  const brand = loadBrandConfig();
  const userContext: HeaderUserContext = {
    id: user?.id || 'usr_guest',
    email: user?.email || 'employee@forge.internal',
    displayName: user?.displayName || 'Authorized Member',
    roles: user?.roles || ['roles/employee'],
    isAdmin: user?.isAdmin ?? Boolean(user?.roles?.some(r => r.includes('admin') || r.includes('manager'))),
  };

  const { allApps } = getPortalApps(userContext.roles);
  let unreadCount = 0;
  try {
    const notifs = getLiveNotifications(userContext.id);
    unreadCount = notifs.filter((n) => n.isUnread).length;
  } catch {}

  const safeBrandName = escapeHtml(brand.name);
  const safeUserJson = JSON.stringify(userContext).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrandName} Portal - Workspace & Admin Console</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><polygon points='12 2 2 7 12 12 22 7 12 2'/><polyline points='2 17 12 22 22 17'/><polyline points='2 12 12 17 22 12'/></svg>">
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <script>
    (function() {
      try {
        var isNoise = function(m, s, stk) {
          var str = ((m || '') + ' ' + (s || '') + ' ' + (stk || '')).toLowerCase();
          return (
            str.indexOf("reading 'starttime'") !== -1 ||
            str.indexOf("reportallchanges") !== -1 ||
            str.indexOf("chrome-extension:") !== -1 ||
            (str.indexOf("starttime") !== -1 && (str.indexOf("vm") !== -1 || str.indexOf("<anonymous>") !== -1))
          );
        };
        window.addEventListener('error', function(e) {
          if (isNoise(e.message, e.filename, e.error && e.error.stack)) {
            e.preventDefault();
            if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
            return true;
          }
        }, true);
        var prevOnError = window.onerror;
        window.onerror = function(msg, url, line, col, err) {
          if (isNoise(msg, url, err && err.stack)) return true;
          if (typeof prevOnError === 'function') return prevOnError.apply(this, arguments);
        };
      } catch(e) {}

      try {
        var p = new URLSearchParams(window.location.search);
        var v = p.get('view') || (window.location.hash ? window.location.hash.slice(1) : '');
        if (!v) {
          try { v = sessionStorage.getItem('forge:v1:portal:active-view'); } catch(e) {}
        }
        if (!v) v = 'canvas';
        document.documentElement.setAttribute('data-active-view', v);
      } catch(e) {}
    })();
  </script>
  <style>
    ${getAstryxStyles()}
    ${getPortalCustomStyles()}
  </style>
</head>
<body>
  <div class="portal-app-shell">
    <!-- Top Header Bar -->
    ${renderPortalHeader(userContext)}

    <!-- Main Workspace Area -->
    <div class="portal-main-body">
      <!-- Auto-Expandable Left Sidebar -->
      ${renderPortalSidebar(userContext.isAdmin, { appsCount: allApps.length, unreadCount })}

      <!-- Main Content Viewport -->
      <main class="portal-viewport">
        <div class="portal-view-container">
          ${renderPageCards(userContext)}
        </div>
      </main>
    </div>
  </div>

  <!-- Command Palette / Quick Search Modal (⌘K) -->
  ${renderCommandPalette()}

  <!-- Viewport-Safe Modals & Action Drawers -->
  ${renderPortalModals()}

  <!-- Interactive Scripts -->
  <script>
    window.__PORTAL_USER__ = ${safeUserJson};
    ${getAstryxToastScript()}
    ${getAstryxDropdownScript()}
    ${getAstryxTooltipScript()}
    ${getPortalClientScript()}
  </script>
</body>
</html>`;
}
