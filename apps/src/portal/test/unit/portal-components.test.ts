/**
 * @forge/portal - Tier 1 Unit: Portal Layout & Component Rendering
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { loadBrandConfig } from '@forge/sdk';
import {
  renderPortalHeader,
  renderPortalSidebar,
  renderPageCards,
  renderPortalHtml,
  PORTAL_PAGES,
  WORKSPACE_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
} from '../../src/frontend';

describe('Tier 1 Unit: Portal Layout Components', () => {
  it('renderPortalHeader renders organization title, search bar, and user profile', () => {
    // Arrange
    const brand = loadBrandConfig();
    const adminUser = {
      id: 'usr_admin_01',
      email: 'admin@forge.internal',
      displayName: 'System Admin',
      roles: ['roles/super_admin'],
      isAdmin: true,
    };

    // Act
    const html = renderPortalHeader(adminUser);

    // Assert
    expect(html).toContain('PORTAL');
    expect(html).toContain('Search anything...');
    expect(html).toContain('Admin');
    expect(html).toContain('user-dropdown-popover');
    expect(html).toContain('S'); // Avatar initial
  });

  it('renderPortalSidebar properly renders workspace items and role-guarded admin console', () => {
    // Arrange & Act
    const adminSidebar = renderPortalSidebar(true);
    const employeeSidebar = renderPortalSidebar(false);

    // Assert
    expect(adminSidebar).toContain('Company Map');
    expect(adminSidebar).toContain('Apps & Tools');
    expect(adminSidebar).toContain('Admin Console');
    expect(adminSidebar).toContain('Team & Members');
    expect(adminSidebar).toContain('Workspace Settings');

    // Employee sidebar hides admin section via inline display: none
    expect(employeeSidebar).toContain('Company Map');
    expect(employeeSidebar).toContain('display: none;');
  });

  it('renderPageCards defines and renders all 9 distinct pages', () => {
    // Arrange
    expect(PORTAL_PAGES).toHaveLength(9);
    const workspacePages = PORTAL_PAGES.filter(p => p.category === 'Workspace');
    const adminPages = PORTAL_PAGES.filter(p => p.category === 'Admin Console');

    expect(workspacePages).toHaveLength(4);
    expect(adminPages).toHaveLength(5);

    // Act
    const html = renderPageCards();

    // Assert
    PORTAL_PAGES.forEach(page => {
      expect(html).toContain(`id="view-${page.id}"`);
      expect(html).toContain(page.title);
      expect(html).toContain(page.targetAudience);
    });
  });

  it('renderPortalHtml returns complete valid HTML document with Astryx styles and scripts', () => {
    // Arrange & Act
    const html = renderPortalHtml({
      id: 'usr_member_02',
      email: 'member@forge.internal',
      displayName: 'Jane Doe',
      roles: ['roles/employee'],
      isAdmin: false,
    });

    // Assert
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('portal-app-shell');
    expect(html).toContain('portal-header');
    expect(html).toContain('portal-sidebar');
    expect(html).toContain('portal-viewport');
    expect(html).toContain('portal-search-modal');
  });

  it('strictly enforces Single Page Application (SPA) architecture and responsive rules', () => {
    // Arrange & Act
    const html = renderPortalHtml({
      id: 'usr_member_03',
      email: 'member3@forge.internal',
      displayName: 'Alex Jordan',
      roles: ['roles/employee'],
      isAdmin: false,
    });

    // Assert: SPA navigation uses data-view attributes with zero full-page hard navigation hrefs
    expect(html).toContain('data-view="canvas"');
    expect(html).toContain('data-view="apps"');
    expect(html).toContain('data-view="notifications"');

    // Assert: Responsive viewport meta tag and CSS media queries
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(html).toContain('@media (max-width: 768px)');
    expect(html).toContain('@media (max-width: 480px)');
  });

  it('renders Company Map & Org Canvas with progressive tree controls, multi-perspective tabs, and zero emoji clutter', () => {
    // Arrange & Act
    const html = renderPortalHtml();

    // Assert: Uncluttered layout without unneeded vitals grid cards
    expect(html).not.toContain('canvas-vitals-grid');
    expect(html).toContain('canvas-hero-banner');
    expect(html).toContain('canvas-total-summary');
    expect(html).toContain('canvas-div-summary');

    // Assert: Progressive depth scope selector with default Heads (L2)
    expect(html).toContain('canvas-depth-selector');
    expect(html).toContain('data-depth="2"');

    // Assert: Multi-View Tabs
    expect(html).toContain('canvas-tab-pills');
    expect(html).toContain('data-mode="canvas"');
    expect(html).toContain('data-mode="divisions"');
    expect(html).toContain('data-mode="leadership"');

    // Assert: Fixed Minimap Wrapper & Inspector
    expect(html).toContain('canvas-viewport-wrapper');
    expect(html).toContain('canvas-minimap-box');
    expect(html).toContain('canvas-inspector-card');
    expect(html).toContain('inspector-chain');
    expect(html).toContain('inspector-manager-box');
    expect(html).toContain('inspector-reports-box');

    // Assert: Zero emoji characters in the rendered canvas view
    const canvasSection = html.slice(html.indexOf('id="view-canvas"'), html.indexOf('id="view-apps"'));
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(canvasSection)).toBe(false);
  });

  it('renders redesigned My Apps & Tools Hub with human-centric layout, real apps, and zero emojis', () => {
    // Arrange & Act
    const html = renderPortalHtml();

    // Assert: Clean Hub header
    expect(html).toContain('apps-hub-header');
    expect(html).toContain('id="apps-hub-search-input"');

    // Assert: 2-Mode Segmented Switcher
    expect(html).toContain('data-hub-tab="my-apps"');
    expect(html).toContain('data-hub-tab="marketplace"');

    // Assert: Tab Contents
    expect(html).toContain('id="tab-content-my-apps"');
    expect(html).toContain('id="tab-content-marketplace"');

    // Assert: Pinned dock & category pills
    expect(html).toContain('id="pinned-favorites-panel"');
    expect(html).toContain('id="pinned-apps-dock"');
    expect(html).toContain('apps-category-filter-bar');
    expect(html).toContain('data-cat="ALL"');
    expect(html).toContain('data-cat="Operations"');

    // Assert: Real active and requestable Forge apps rendered
    expect(html).toContain('data-app-id="telemetry"');
    expect(html).toContain('data-app-id="code"');

    // Assert: Marketplace and Request Access
    expect(html).toContain('id="marketplace-grid"');
    expect(html).toContain('request-access-btn');
    expect(html).toContain('id="modal-request-access"');
    expect(html).toContain('id="modal-app-details"');

    // Assert: Zero emojis in apps hub section
    const appsSection = html.slice(html.indexOf('id="view-apps"'), html.indexOf('id="view-profile"'));
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(appsSection)).toBe(false);
  });
});
