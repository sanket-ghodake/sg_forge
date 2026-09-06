/**
 * @forge/portal - Top Header Bar & User Profile Popover Component (2026 LTS)
 * Modern uncluttered top header with interactive user profile dropdown popover.
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * HeaderUserContext
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface HeaderUserContext {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  isAdmin: boolean;
  userAgent?: string;
  ip?: string;
}

/**
 * renderPortalHeader
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderPortalHeader(user: HeaderUserContext): string {
  const brand = loadBrandConfig();
  const roleDisplay = user.isAdmin ? 'Admin' : 'Employee';
  const initial = (user.displayName || 'U').charAt(0).toUpperCase();

  const safeDisplayName = (user.displayName || 'Authorized Member')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const safeEmail = (user.email || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `
    <header class="portal-header">
      <!-- Left: Brand & Org Switcher -->
      <div class="portal-header-left">
        <a href="/portal" class="portal-brand" style="display: flex; align-items: center; gap: 0.55rem;">
          ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${brand.name}" class="astryx-brand-logo-img" style="height: 32px; max-height: 80%; width: auto; max-width: 180px; object-fit: contain; flex-shrink: 0;" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline-block';" />` : ''}
          <svg style="${brand.logoUrl ? 'display: none;' : ''}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--forge-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span class="portal-app-tag">PORTAL</span>
        </a>

        <div class="portal-header-divider"></div>

        <button class="portal-search-trigger" id="portal-search-btn" data-astryx-tooltip="Open Quick Finder (⌘K)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search anything...</span>
          <kbd class="portal-kbd">⌘K</kbd>
        </button>
      </div>

      <!-- Right: User Avatar & Profile Popup Trigger -->
      <div class="portal-header-right">
        <div class="user-menu-wrapper" style="position: relative;">
          <!-- User Trigger Button (Icon Only) -->
          <button class="user-profile-trigger" id="user-profile-menu-btn" data-astryx-tooltip="Account & Preferences (${safeDisplayName})" aria-haspopup="true" aria-expanded="false" data-user-id="${user.id}">
            <div class="user-avatar-initial">${initial}</div>
          </button>

          <!-- Modern Top-Right Dropdown Popover -->
          <div class="user-dropdown-popover" id="user-profile-popover" role="menu">
            <!-- Header User Card -->
            <div class="popover-user-card">
              <div class="popover-avatar">${initial}</div>
              <div class="popover-user-info">
                <div class="popover-name">${safeDisplayName}</div>
                <div class="popover-email" data-email="${safeEmail}">${safeEmail}</div>
                <div class="popover-role-badge" id="popover-role-badge">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: var(--forge-primary); display: inline-block;"></span>
                  <span id="popover-role-text">${roleDisplay} Access</span>
                </div>
              </div>
            </div>

            ${user.isAdmin ? `
            <div class="popover-divider"></div>

            <!-- Role Mode Switcher (Admin Only) -->
            <div class="popover-section-label" id="workspace-mode-label">Workspace Mode</div>
            <button class="popover-item" id="role-preview-toggle" role="menuitem">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Switch Role Mode</span>
              </div>
              <span class="popover-badge-pill" id="role-preview-label">${roleDisplay}</span>
            </button>
            ` : ''}

            <div class="popover-divider"></div>

            <!-- Theme Switcher -->
            <div class="popover-section-label">Appearance</div>
            <button class="popover-item" id="theme-toggle-btn" role="menuitem">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg id="sun-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                </svg>
                <svg id="moon-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span id="theme-toggle-label">Theme Mode</span>
              </div>
              <span class="popover-badge-pill" id="theme-badge">Dark</span>
            </button>

            <div class="popover-divider"></div>

            <!-- Quick Links -->
            <div class="popover-section-label">Preferences</div>
            <button class="popover-item popover-nav-action" data-nav="profile" role="menuitem">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>My Profile & Account</span>
              </div>
            </button>

            ${user.isAdmin ? `
            <button class="popover-item popover-nav-action" data-nav="admin-settings" role="menuitem">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Workspace Settings</span>
              </div>
            </button>
            ` : ''}

            <div class="popover-divider"></div>

            <!-- Sign Out -->
            <button class="popover-item popover-logout-btn" id="logout-btn" role="menuitem">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}
