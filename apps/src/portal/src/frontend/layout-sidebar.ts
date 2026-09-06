/**
 * @forge/portal - Premium Auto-Collapsible Sidebar Component (2026 LTS)
 * Precision monochrome SVG stroke icons, smooth micro-interactions, and role elevation.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export interface SidebarNavOption {
  id: string;
  label: string;
  iconSvg: string;
  badge?: string;
  isAdminOnly?: boolean;
}

/**
 * WORKSPACE_NAV_ITEMS
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const WORKSPACE_NAV_ITEMS: SidebarNavOption[] = [
  {
    id: 'canvas',
    label: 'Company Map',
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`,
  },
  {
    id: 'apps',
    label: 'Apps & Tools',
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  },
  {
    id: 'notifications',
    label: 'Announcements',
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  },
];

/**
 * ADMIN_NAV_ITEMS
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const ADMIN_NAV_ITEMS: SidebarNavOption[] = [
  {
    id: 'admin-members',
    label: 'Team & Members',
    isAdminOnly: true,
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>`,
  },
  {
    id: 'admin-apps',
    label: 'App Permissions',
    isAdminOnly: true,
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  },
  {
    id: 'admin-org',
    label: 'Org Chart Editor',
    isAdminOnly: true,
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
  },
  {
    id: 'admin-audit',
    label: 'Security & Audit',
    isAdminOnly: true,
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  },
  {
    id: 'admin-settings',
    label: 'Workspace Settings',
    isAdminOnly: true,
    iconSvg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  },
];

/**
 * renderPortalSidebar
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderPortalSidebar(isAdmin: boolean, counts?: { appsCount?: number; unreadCount?: number }): string {
  const appsBadge = counts?.appsCount !== undefined ? String(counts.appsCount) : undefined;
  const unreadBadge = counts?.unreadCount !== undefined && counts.unreadCount > 0 ? String(counts.unreadCount) : undefined;

  const navItems = WORKSPACE_NAV_ITEMS.map((item) => {
    let badge = item.badge;
    if (item.id === 'apps' && appsBadge !== undefined) badge = appsBadge;
    if (item.id === 'notifications') badge = unreadBadge;
    return { ...item, badge };
  });

  return `
    <aside class="portal-sidebar" id="portal-sidebar" aria-label="Portal Navigation Sidebar">
      <div class="portal-sidebar-nav">
        <!-- Section: Workspace -->
        <div class="portal-nav-section-label">Workspace</div>
        ${navItems.map(item => `
          <button class="portal-nav-item" data-view="${item.id}" data-astryx-tooltip="${item.label}">
            <span class="portal-nav-icon">${item.iconSvg}</span>
            <span class="portal-nav-label">${item.label}</span>
            ${item.badge ? `<span class="portal-nav-badge">${item.badge}</span>` : ''}
          </button>
        `).join('')}

        <!-- Section: Admin Console (Role Guarded) -->
        <div class="portal-admin-section" id="portal-admin-section" style="${isAdmin ? '' : 'display: none;'}">
          <div class="portal-nav-divider"></div>
          <div class="portal-nav-section-label" style="color: var(--forge-primary); display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 4px; height: 4px; border-radius: 50%; background: var(--forge-primary); display: inline-block;"></span>
            <span>Admin Console</span>
          </div>
          ${ADMIN_NAV_ITEMS.map(item => `
            <button class="portal-nav-item" data-view="${item.id}" data-astryx-tooltip="${item.label}">
              <span class="portal-nav-icon">${item.iconSvg}</span>
              <span class="portal-nav-label">${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </aside>
  `;
}
