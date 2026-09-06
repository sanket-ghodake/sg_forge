/**
 * @forge/portal - Apps & Tools Hub View Renderer (2026 LTS)
 * Human-Centric, Clean & Simple: Strictly Forge Micro-Apps (Expenses, Billing, Telemetry).
 */

import { astryxIcons } from '@forge/ui';
import { getPortalApps, type MicroAppItem } from './ui-apps-data';

export * from './ui-apps-data';

/**
 * renderAppsView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAppsView(userContextOrAdmin: boolean | string[] = false): string {
  const userRoles = Array.isArray(userContextOrAdmin)
    ? userContextOrAdmin
    : userContextOrAdmin
      ? ['roles/admin']
      : ['roles/employee'];
  const isAdmin = userRoles.some((r) => r.includes('admin') || r.includes('manager'));
  const { activeApps, marketplaceApps } = getPortalApps(userRoles);
  const uniqueCategories = Array.from(new Set([...activeApps, ...marketplaceApps].map((a) => a.category).filter(Boolean)));

  return `
    <div id="view-apps" class="portal-page-view">
      <!-- 1. Clean Human Header with relaxed spacing -->
      <div class="apps-hub-header">
        <div class="apps-hub-title-wrap">
          <h1 class="portal-view-title">Apps & Tools</h1>
          <p class="apps-hub-subtitle">
            Launch your active workplace tools or request access to organization applications.
          </p>
        </div>

        <div class="apps-header-actions">
          <div class="canvas-search-input-wrap apps-search-box">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="apps-hub-search-input" placeholder="Search apps by name or keyword..." />
          </div>
          ${isAdmin ? `
            <button class="astryx-btn btn-outline btn-sm" onclick="if(window.portalSPA){window.portalSPA.navigate('admin-apps');}">
              ${astryxIcons.settings || ''} <span>Admin Catalog</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 2. Simple 2-Mode Segmented View Switcher -->
      <div class="apps-view-switcher-bar">
        <div class="apps-nav-tabs" role="tablist" aria-label="Apps View Modes">
          <button class="apps-tab-btn active" data-hub-tab="my-apps" role="tab" aria-selected="true">
            <span class="tab-icon">${astryxIcons.apps || ''}</span>
            <span>My Active Apps</span>
            <span class="apps-tab-counter">${activeApps.length}</span>
          </button>
          <button class="apps-tab-btn" data-hub-tab="marketplace" role="tab" aria-selected="false">
            <span class="tab-icon">${astryxIcons.sparkles || ''}</span>
            <span>Request Access</span>
            <span class="apps-tab-counter">${marketplaceApps.length}</span>
          </button>
        </div>

        <div id="pending-requests-indicator" class="pending-requests-indicator" style="display: none;">
          <span class="badge-dot" style="background: var(--forge-warning);"></span>
          <span id="pending-req-count-text">1 Request Pending Review</span>
        </div>
      </div>

      <!-- 3. TAB 1: MY ACTIVE APPS -->
      <div id="tab-content-my-apps" class="apps-tab-content active">
        <!-- Pinned Favorites Panel -->
        <div class="pinned-favorites-panel" id="pinned-favorites-panel">
          <div class="pinned-panel-header">
            <div class="section-sub-title" style="margin-bottom: 0;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.sparkles || ''}</span>
              <span>Pinned Favorites</span>
            </div>
            <span style="font-size: 0.74rem; color: var(--forge-text-subtle);">Click the star on any tool card to pin or unpin</span>
          </div>
          <div class="pinned-apps-dock" id="pinned-apps-dock">
            ${activeApps.filter(a => a.isPinned).map(app => `
              <a href="${app.ingressPath}" class="pinned-dock-card" data-app-id="${app.id}">
                <div class="dock-card-icon">${app.iconSvg}</div>
                <div class="dock-card-info">
                  <span class="dock-card-title">${app.name}</span>
                  <span class="dock-card-category">${app.category}</span>
                </div>
                <span class="status-indicator status-online" data-astryx-tooltip="Ready to launch"></span>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Category Filter & View Mode Bar -->
        <div class="apps-category-filter-bar">
          <div class="category-pills-list">
            <button class="cat-pill active" data-cat="ALL">All Tools</button>
            ${uniqueCategories.map((cat) => `<button class="cat-pill" data-cat="${cat}">${cat}</button>`).join('')}
          </div>
          <div class="view-mode-toggle">
            <button class="view-mode-btn active" id="view-mode-grid" data-astryx-tooltip="Grid View">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button class="view-mode-btn" id="view-mode-list" data-astryx-tooltip="Compact List View">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Apps Catalog Grid -->
        <div class="apps-catalog-grid" id="apps-catalog-grid">
          ${activeApps.map(app => `
            <div class="app-card-item ${app.isPinned ? 'is-pinned' : ''}" data-app-id="${app.id}" data-category="${app.category}" data-tags="${(app.tags || []).join(' ')}">
              <div class="app-card-top">
                <div class="app-card-brand">
                  <div class="app-card-icon-box">${app.iconSvg}</div>
                  <div>
                    <h3 class="app-card-title">${app.name}</h3>
                    <span class="app-card-cat">${app.category}</span>
                  </div>
                </div>
                <button class="app-pin-btn ${app.isPinned ? 'active' : ''}" data-pin-id="${app.id}" data-astryx-tooltip="${app.isPinned ? 'Unpin from favorites' : 'Pin to favorites'}">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="${app.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
              </div>

              <p class="app-card-desc">${app.description}</p>

              <div class="app-card-tags-row">
                ${(app.tags || []).map(t => `<span class="app-tag-pill">${t}</span>`).join('')}
              </div>

              <div class="app-card-footer">
                <div class="app-status-badge" data-astryx-tooltip="Single Sign-On Active">
                  <span class="status-indicator status-online"></span>
                  <span style="font-size: 0.74rem; font-weight: 500; color: var(--forge-text-muted);">Active</span>
                </div>
                <div class="app-card-actions">
                  <button class="astryx-btn btn-sm btn-ghost open-app-info-btn" data-info-id="${app.id}" data-astryx-tooltip="App Details">
                    Details
                  </button>
                  <a href="${app.ingressPath}" class="astryx-btn btn-sm btn-primary app-launch-action" target="_self">
                    <span>Open</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. TAB 2: REQUEST ACCESS / MARKETPLACE -->
      <div id="tab-content-marketplace" class="apps-tab-content">
        <div class="marketplace-intro-banner">
          <div class="marketplace-intro-text">
            <h2 class="marketplace-title">Elevated Access Applications</h2>
            <p class="marketplace-subtitle">
              These applications require specific department approval. Click Request Access to submit an approval request to your lead.
            </p>
          </div>
        </div>

        <!-- User Submitted Requests List -->
        <div id="active-user-requests-list" class="active-user-requests-list"></div>

        <div class="marketplace-grid" id="marketplace-grid">
          ${marketplaceApps.map(app => `
            <div class="marketplace-card-item" data-app-id="${app.id}" data-category="${app.category}" data-tags="${(app.tags || []).join(' ')}">
              <div class="market-card-header">
                <div class="app-card-icon-box" style="width: 42px; height: 42px;">${app.iconSvg}</div>
                <div class="market-card-meta">
                  <h3 class="market-card-title">${app.name}</h3>
                  <div class="market-card-sub">
                    <span class="market-dept-tag">${app.departmentOwner || app.category}</span>
                    <span class="approval-type-tag">${app.approvalType || 'Approval Required'}</span>
                  </div>
                </div>
              </div>

              <p class="market-card-desc">${app.description}</p>

              <div class="market-features-list">
                ${(app.tags || []).map(t => `
                  <div class="market-feature-item">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--forge-primary)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>${t}</span>
                  </div>
                `).join('')}
              </div>

              <div class="market-card-footer">
                <div class="required-role-pill">
                  ${astryxIcons.shield || ''}
                  <span>${app.requiredRole ? 'Role: ' + app.requiredRole : 'Department Approval'}</span>
                </div>
                <div class="market-actions">
                  <button class="astryx-btn btn-sm btn-ghost open-app-info-btn" data-info-id="${app.id}">
                    Details
                  </button>
                  <button class="astryx-btn btn-sm btn-primary request-access-btn" data-app-name="${app.name}" data-app-id="${app.id}" data-approval="${app.approvalType || 'Manager Approval'}">
                    Request Access
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
