/**
 * @forge/portal - Astryx Frontend Styles (2026 LTS)
 * 100% Astryx Token Compliant: SPA Layout, Canvas, Apps Hub, Directory, Admin Suite, Slim Scrollbars & Modals.
 */

import { getInboxStyles } from './ui-styles-inbox';

/**
 * getPortalCustomStyles
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getPortalCustomStyles(): string {
  return `
    :root { --portal-sidebar-width: 56px; --portal-sidebar-expanded-width: 224px; --portal-header-height: 48px; }
    body { background-color: var(--forge-bg-root); color: var(--forge-text-main); overflow-x: hidden; margin: 0; padding: 0; font-family: var(--forge-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif); transition: background-color 0.2s ease, color 0.2s ease; }

    /* ── Custom Astryx Slim Scrollbars ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--forge-border-medium); border-radius: var(--forge-radius-full); }
    ::-webkit-scrollbar-thumb:hover { background: var(--forge-primary); }

    /* ── App Shell (SPA Container) ── */
    .portal-app-shell { display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; }
    .portal-main-body { display: grid; grid-template-columns: var(--portal-sidebar-width) minmax(0, 1fr); flex: 1; height: calc(100vh - var(--portal-header-height)); overflow: hidden; position: relative; }

    /* ── Top Header Bar ── */
    .portal-header {
      height: var(--portal-header-height); background: var(--forge-bg-surface);
      border-bottom: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: space-between;
      padding: 0 1rem; z-index: 40; flex-shrink: 0; box-sizing: border-box; backdrop-filter: blur(8px);
    }
    .portal-header-left { display: flex; align-items: center; gap: 0.75rem; }
    .portal-brand { display: flex; align-items: center; gap: 0.55rem; text-decoration: none; user-select: none; }
    .portal-app-tag {
      display: inline-flex; align-items: center; font-size: 0.76rem; font-weight: 600; letter-spacing: 0.03em;
      color: var(--forge-text-main); background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      padding: 0.18rem 0.52rem; border-radius: 5px; transition: var(--forge-transition);
    }
    .portal-header-divider { width: 1px; height: 16px; background: var(--forge-border); }
    .portal-search-trigger {
      display: inline-flex; align-items: center; gap: 0.6rem; height: 32px; padding: 0 0.75rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      color: var(--forge-text-muted); font-size: 0.78rem; cursor: pointer; transition: var(--forge-transition);
      min-width: 210px; user-select: none; box-sizing: border-box;
    }
    .portal-search-trigger:hover { border-color: var(--forge-border-medium); color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .portal-kbd { font-size: 0.68rem; padding: 0.12rem 0.4rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: 4px; color: var(--forge-text-subtle); margin-left: auto; font-family: var(--forge-font-mono, monospace); }
    .portal-header-right { display: flex; align-items: center; }

    /* ── Right-Side Minimal Icon-Only Profile Trigger ── */
    .user-profile-trigger {
      display: inline-flex; align-items: center; justify-content: center; padding: 0; width: 32px; height: 32px;
      border-radius: 50%; background: transparent; border: 2px solid transparent; cursor: pointer;
      transition: var(--forge-transition); user-select: none; outline: none; box-sizing: border-box;
    }
    .user-profile-trigger:hover, .user-profile-trigger.active { border-color: var(--forge-primary); box-shadow: 0 0 10px -2px var(--forge-primary); }
    .user-avatar-initial {
      width: 28px; height: 28px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root);
      display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 700; flex-shrink: 0;
    }

    /* ── Modern Top-Right Dropdown Popover ── */
    .user-dropdown-popover {
      display: none; position: absolute; right: 0; top: calc(100% + 8px); width: min(270px, calc(100vw - 1.5rem));
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08); padding: 0.5rem;
      box-sizing: border-box; z-index: 1200; backdrop-filter: blur(20px) saturate(180%);
    }
    .user-dropdown-popover.active { display: block; animation: popoverFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes popoverFadeIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .popover-user-card { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.5rem; }
    .popover-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 700; flex-shrink: 0; }
    .popover-user-info { display: flex; flex-direction: column; overflow: hidden; text-align: left; }
    .popover-name { font-size: 0.84rem; font-weight: 700; color: var(--forge-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .popover-email { font-size: 0.72rem; color: var(--forge-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.2rem; }
    .popover-role-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.66rem; font-weight: 600; color: var(--forge-primary); background: var(--forge-success-bg); padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); width: fit-content; }
    .popover-divider { height: 1px; background: var(--forge-border); margin: 0.35rem 0; }
    .popover-section-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--forge-text-subtle); padding: 0.35rem 0.5rem 0.15rem; }
    .popover-item {
      width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.55rem;
      border-radius: var(--forge-radius-sm); border: 1px solid transparent; background: transparent; color: var(--forge-text-main);
      font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      box-sizing: border-box; outline: none; user-select: none;
    }
    .popover-item:hover { background: rgba(62, 207, 142, 0.12); color: var(--forge-primary); border-color: var(--forge-border); }
    .popover-badge-pill { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); background: var(--forge-bg-card); border: 1px solid var(--forge-border); color: var(--forge-text-muted); }

    /* ── Clean Auto-Collapsible Sidebar ── */
    .portal-sidebar {
      background: var(--forge-bg-surface); border-right: 1px solid var(--forge-border);
      display: flex; flex-direction: column; padding: 6px 4px; width: var(--portal-sidebar-width); height: calc(100vh - var(--portal-header-height));
      overflow-x: hidden; overflow-y: auto; z-index: 30; box-sizing: border-box; position: absolute; top: 0; left: 0; backdrop-filter: blur(12px);
      transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .portal-sidebar:hover, .portal-sidebar:focus-within { width: var(--portal-sidebar-expanded-width); box-shadow: var(--forge-shadow-hover); border-color: var(--forge-border-medium); }
    .portal-sidebar-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .portal-nav-section-label {
      font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--forge-text-subtle); padding: 0 0.6rem;
      max-height: 0; margin: 0; overflow: hidden; white-space: nowrap; opacity: 0; transform: translateX(-4px);
      transition: max-height 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease, padding 0.2s ease, transform 0.15s ease; user-select: none;
    }
    .portal-sidebar:hover .portal-nav-section-label, .portal-sidebar:focus-within .portal-nav-section-label { max-height: 28px; padding: 0.55rem 0.6rem 0.25rem; opacity: 1; transform: translateX(0); }
    .portal-nav-divider { height: 1px; background: linear-gradient(90deg, var(--forge-border), transparent); margin: 0.35rem 0.35rem 0.25rem; }
    .portal-nav-item {
      display: flex; align-items: center; height: 36px; padding: 0 8px; border-radius: var(--forge-radius-sm); color: var(--forge-text-muted);
      text-decoration: none; font-size: 0.82rem; font-weight: 500; margin-bottom: 2px; cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; border: 1px solid transparent;
      user-select: none; white-space: nowrap; overflow: hidden; position: relative; background: transparent; width: 100%; box-sizing: border-box; outline: none;
    }
    .portal-nav-item:hover { background: var(--forge-bg-card); color: var(--forge-text-main); border-color: var(--forge-border); }
    .portal-nav-item:focus-visible { box-shadow: 0 0 0 2px var(--forge-primary); }
    .portal-nav-item.active { background: var(--forge-bg-card-hover); color: var(--forge-primary); border-color: var(--forge-border-medium); font-weight: 600; box-shadow: inset 0 0 12px var(--forge-success-bg); }
    .portal-nav-item.active::before { content: ''; position: absolute; left: 2px; top: 6px; bottom: 6px; width: 3px; border-radius: var(--forge-radius-full); background: var(--forge-primary); box-shadow: 0 0 8px var(--forge-primary); }
    .portal-nav-icon { min-width: 24px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 8px; color: var(--forge-text-muted); transition: color 0.15s ease; }
    .portal-nav-item:hover .portal-nav-icon, .portal-nav-item.active .portal-nav-icon { color: var(--forge-primary); }
    .portal-nav-label { opacity: 0; transform: translateX(-4px); transition: opacity 0.15s ease, transform 0.15s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.81rem; letter-spacing: -0.01em; }
    .portal-sidebar:hover .portal-nav-label, .portal-sidebar:focus-within .portal-nav-label { opacity: 1; transform: translateX(0); }
    .portal-nav-badge { margin-left: auto; font-size: 0.64rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); background: var(--forge-bg-card); border: 1px solid var(--forge-border); color: var(--forge-text-muted); opacity: 0; transition: opacity 0.15s ease; }
    .portal-sidebar:hover .portal-nav-badge, .portal-sidebar:focus-within .portal-nav-badge { opacity: 1; }

    /* ── Content Viewport (SPA View Container) ── */
    .portal-viewport { grid-column: 2; height: calc(100vh - var(--portal-header-height)); overflow-y: auto; background: var(--forge-bg-root); padding: 1.25rem 1.75rem; box-sizing: border-box; }
    .portal-page-view { display: none; animation: viewFadeIn 0.18s ease-in-out; }
    .portal-page-view.active { display: block; }
    @keyframes viewFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    html[data-active-view="canvas"] #view-canvas, html[data-active-view="apps"] #view-apps, html[data-active-view="profile"] #view-profile, html[data-active-view="notifications"] #view-notifications, html[data-active-view="admin-members"] #view-admin-members, html[data-active-view="admin-apps"] #view-admin-apps, html[data-active-view="admin-org"] #view-admin-org, html[data-active-view="admin-audit"] #view-admin-audit, html[data-active-view="admin-settings"] #view-admin-settings { display: block !important; }

    /* ── Status Indicators ── */
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .status-online { background: var(--forge-primary); box-shadow: 0 0 6px var(--forge-primary); }
    .status-busy { background: var(--forge-warning); }
    .status-away { background: var(--forge-text-muted); }
    .status-offline { background: var(--forge-border-medium); }

    /* ── Company Map & Org Canvas ── */
    .canvas-hero-banner {
      display: flex; justify-content: space-between; align-items: center; background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.85rem 1.15rem; margin-bottom: 0.85rem;
    }
    .canvas-hero-left { display: flex; align-items: center; gap: 0.75rem; }
    .canvas-status-icon-box { width: 32px; height: 32px; border-radius: var(--forge-radius-sm); background: var(--forge-bg-card); border: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: center; }
    .canvas-hero-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--forge-text-main); letter-spacing: -0.02em; }
    .canvas-hero-subtitle { font-size: 0.76rem; color: var(--forge-text-muted); margin-top: 0.15rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .canvas-hero-actions { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
    .btn-icon { display: flex; align-items: center; justify-content: center; color: currentColor; }

    /* ── Multi-Perspective View Switcher Bar ── */
    .canvas-view-modes-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.65rem; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem; }
    .canvas-tab-pills { display: flex; gap: 0.35rem; background: var(--forge-bg-surface); padding: 3px; border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); }
    .canvas-tab-pill {
      display: inline-flex; align-items: center; gap: 0.4rem; background: transparent; border: none; padding: 0.32rem 0.75rem;
      font-size: 0.76rem; font-weight: 500; color: var(--forge-text-muted); border-radius: 4px; cursor: pointer; transition: var(--forge-transition);
    }
    .canvas-tab-pill:hover { color: var(--forge-text-main); }
    .canvas-tab-pill.active { background: var(--forge-bg-card); color: var(--forge-primary); font-weight: 600; box-shadow: var(--forge-shadow-card); }
    .tab-icon { display: flex; align-items: center; }

    .canvas-mode-container { display: none; }
    .canvas-mode-container.active { display: block; animation: viewFadeIn 0.15s ease; }

    /* ── Canvas Viewport Frame & Pan Surface ── */
    .canvas-search-bar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .canvas-search-input-wrap { display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0 0.65rem; height: 32px; min-width: 270px; }
    .canvas-search-input-wrap input { background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.8rem; width: 100%; }
    .canvas-filter-pills { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .filter-pill { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.18rem 0.55rem; font-size: 0.72rem; color: var(--forge-text-muted); cursor: pointer; transition: var(--forge-transition); }
    .filter-pill:hover, .filter-pill.active { background: var(--forge-bg-card); color: var(--forge-primary); font-weight: 600; border-color: var(--forge-border-medium); }
    .canvas-actions-right { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
    .canvas-depth-selector { display: flex; align-items: center; gap: 0.25rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 2px 4px; }
    .depth-label { font-size: 0.68rem; color: var(--forge-text-muted); font-weight: 600; padding: 0 2px; }
    .depth-btn { background: transparent; border: none; font-size: 0.7rem; color: var(--forge-text-muted); padding: 0.12rem 0.4rem; border-radius: 3px; cursor: pointer; transition: var(--forge-transition); }
    .depth-btn:hover { color: var(--forge-text-main); }
    .depth-btn.active { background: var(--forge-primary); color: var(--forge-bg-root); font-weight: 700; }
    .canvas-zoom-controls { display: flex; align-items: center; gap: 0.25rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 2px 4px; }
    .canvas-zoom-level { font-size: 0.72rem; font-family: var(--forge-font-mono, monospace); color: var(--forge-text-muted); min-width: 36px; text-align: center; }

    /* Viewport Wrapper with Sticky Floating Elements */
    .canvas-viewport-wrapper { position: relative; width: 100%; border-radius: var(--forge-radius); overflow: hidden; border: 1px solid var(--forge-border); }
    .canvas-viewport-frame {
      width: 100%; height: 620px; background: var(--forge-bg-surface);
      position: relative; overflow: auto; cursor: default; user-select: none;
      background-image: radial-gradient(var(--forge-border) 1px, transparent 1px); background-size: 24px 24px;
    }
    .canvas-viewport-frame.is-dragging { cursor: default; }
    .canvas-pan-surface { min-width: 1600px; min-height: 800px; position: relative; transform-origin: 0 0; transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1); }
    .canvas-nodes-layer { position: absolute; inset: 0; width: 100%; height: 100%; }

    /* Node Cards */
    .canvas-org-cluster { position: absolute; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.75rem; width: 280px; box-shadow: var(--forge-shadow-card); transition: opacity 0.2s ease, filter 0.2s ease, border-color 0.2s ease; cursor: pointer; }
    .canvas-org-cluster:hover { border-color: var(--forge-primary); box-shadow: var(--forge-shadow-hover); }
    .canvas-org-cluster.selected-node { border-color: var(--forge-primary); box-shadow: 0 0 0 2px var(--forge-primary); }
    .canvas-org-cluster.in-focused-path { border-color: var(--forge-primary); box-shadow: 0 0 12px rgba(62, 207, 142, 0.25); }
    .cluster-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.25rem; }
    .cluster-badge { font-size: 0.7rem; font-weight: 600; color: var(--forge-text-muted); text-transform: uppercase; }
    .cluster-count { font-size: 0.66rem; color: var(--forge-text-subtle); }
    .org-node-card { display: flex; align-items: center; gap: 0.55rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.4rem 0.55rem; }
    .node-lead { border-left: 3px solid var(--forge-primary); }
    .node-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center; font-size: 0.74rem; font-weight: 700; flex-shrink: 0; }
    .node-avatar-large { width: 44px; height: 44px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center; font-size: 1.05rem; font-weight: 700; flex-shrink: 0; }
    .node-avatar-sm { width: 24px; height: 24px; border-radius: 50%; background: var(--forge-bg-card); border: 1px solid var(--forge-border); color: var(--forge-text-main); display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; flex-shrink: 0; }
    .node-info { flex: 1; overflow: hidden; }
    .node-name { font-size: 0.78rem; color: var(--forge-text-main); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .node-role { font-size: 0.68rem; color: var(--forge-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .node-expand-btn { display: inline-flex; align-items: center; justify-content: center; margin-top: 0.4rem; width: 100%; background: var(--forge-bg-surface); border: 1px dashed var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.2rem; font-size: 0.68rem; color: var(--forge-primary); font-weight: 600; cursor: pointer; transition: var(--forge-transition); }
    .node-expand-btn:hover { background: var(--forge-primary); color: var(--forge-bg-root); }
    .canvas-connections-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
    .canvas-edge-line { fill: none; stroke: var(--forge-border-medium); stroke-width: 1.5; stroke-dasharray: 4 4; transition: stroke 0.15s ease; }
    .canvas-edge-line.active { stroke: var(--forge-primary); stroke-width: 2; stroke-dasharray: none; }

    /* Fixed Minimap Radar Overlay */
    .canvas-minimap-box {
      position: absolute; bottom: 0.85rem; right: 0.85rem; width: 140px; height: 80px;
      background: rgba(18, 18, 18, 0.88); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-sm); z-index: 10; backdrop-filter: blur(12px);
      cursor: default; box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .minimap-viewport-indicator {
      position: absolute; border: 1.5px solid var(--forge-primary);
      background: rgba(62, 207, 142, 0.15); border-radius: 2px; pointer-events: none;
    }

    /* Floating Colleague Inspector Drawer */
    .canvas-inspector-card {
      position: absolute; top: 0.85rem; right: 0.85rem; width: 320px;
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius); box-shadow: 0 16px 40px rgba(0,0,0,0.7);
      z-index: 20; padding: 1.15rem; animation: viewFadeIn 0.15s ease; backdrop-filter: blur(20px);
    }
    .inspector-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.45rem; }
    .inspector-title { font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--forge-text-muted); }
    .inspector-close { background: transparent; border: none; color: var(--forge-text-muted); font-size: 1.1rem; cursor: pointer; }
    .inspector-avatar-row { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.75rem; }
    .inspector-emp-name { font-size: 0.92rem; font-weight: 700; color: var(--forge-text-main); }
    .inspector-emp-role { font-size: 0.74rem; color: var(--forge-text-muted); }
    .inspector-reporting-section { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.5rem; margin-bottom: 0.75rem; }
    .inspector-section-label { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; color: var(--forge-text-subtle); margin-bottom: 0.35rem; }
    .inspector-breadcrumb { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; font-size: 0.72rem; }
    .breadcrumb-chip { color: var(--forge-text-muted); cursor: pointer; padding: 0 0.25rem; border-radius: 2px; }
    .breadcrumb-chip:hover { color: var(--forge-primary); text-decoration: underline; }
    .breadcrumb-chip.active { color: var(--forge-primary); font-weight: 600; }
    .breadcrumb-separator { color: var(--forge-text-subtle); font-size: 0.7rem; }
    .inspector-meta-list { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.76rem; border-top: 1px solid var(--forge-border); padding-top: 0.6rem; }
    .inspector-relation-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.5rem; }
    .relation-label { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; color: var(--forge-text-subtle); margin-bottom: 0.35rem; }
    .relation-person-row { display: flex; align-items: center; gap: 0.5rem; }
    .relation-name { font-size: 0.76rem; font-weight: 600; color: var(--forge-text-main); }
    .relation-role { font-size: 0.68rem; color: var(--forge-text-muted); }
    .reports-chip-grid { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .report-chip { display: inline-flex; align-items: center; gap: 0.35rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.2rem 0.45rem; font-size: 0.72rem; color: var(--forge-text-main); cursor: pointer; }
    .report-chip:hover { border-color: var(--forge-primary); color: var(--forge-primary); }
    .report-chip-avatar { font-size: 0.62rem; font-weight: 700; color: var(--forge-primary); }
    .inspector-actions { display: flex; gap: 0.45rem; margin-top: 0.85rem; }

    /* ── Mode 2: Divisions Matrix ── */
    .divisions-matrix-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .divisions-matrix-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--forge-text-main); }
    .divisions-matrix-desc { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--forge-text-muted); }
    .divisions-fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1rem; }
    .division-fleet-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; transition: var(--forge-transition); }
    .division-fleet-card:hover { border-color: var(--forge-border-medium); box-shadow: var(--forge-shadow-hover); }
    .div-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.65rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.5rem; }
    .div-card-title { margin: 0; font-size: 0.92rem; font-weight: 700; color: var(--forge-text-main); }
    .div-card-subtitle { font-size: 0.7rem; color: var(--forge-text-muted); }
    .div-lead-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; background: var(--forge-bg-card); padding: 0.4rem; border-radius: var(--forge-radius-sm); }
    .div-stats-row { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--forge-text-muted); margin-bottom: 0.5rem; }
    .stacked-avatars-row { display: flex; align-items: center; }
    .stacked-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--forge-bg-card); border: 1.5px solid var(--forge-bg-surface); color: var(--forge-text-muted); display: inline-flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; margin-right: -6px; }
    .div-card-footer { margin-top: 0.75rem; border-top: 1px solid var(--forge-border); padding-top: 0.65rem; }

    /* ── Mode 3: Leadership Pipeline ── */
    .leadership-tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .leadership-tier-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--forge-text-main); }
    .leadership-tier-desc { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--forge-text-muted); }
    .leadership-pipeline-flow { display: flex; flex-direction: column; gap: 1rem; }
    .leadership-tier-block { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; }
    .tier-block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.45rem; }
    .tier-title { font-size: 0.82rem; font-weight: 700; color: var(--forge-text-main); }
    .tier-badge { font-size: 0.68rem; font-family: var(--forge-font-mono, monospace); color: var(--forge-primary); }
    .tier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.65rem; }
    .leadership-node-item { display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.45rem 0.6rem; cursor: pointer; transition: var(--forge-transition); }
    .leadership-node-item:hover { border-color: var(--forge-primary); }

    /* ── Apps Hub Clean & Human-Centric Styles ── */
    .apps-hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 1.25rem; }
    .apps-hub-title-wrap { flex: 1; min-width: 260px; }
    .apps-hub-subtitle { margin: 0.5rem 0 0; font-size: 0.84rem; color: var(--forge-text-muted); line-height: 1.5; max-width: 600px; }
    .apps-header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .apps-search-box { width: 280px; }

    .apps-view-switcher-bar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .apps-nav-tabs { display: flex; gap: 0.35rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.3rem; }
    .apps-tab-btn { display: inline-flex; align-items: center; gap: 0.45rem; background: transparent; border: none; color: var(--forge-text-muted); padding: 0.45rem 1rem; border-radius: var(--forge-radius-full); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: var(--forge-transition); }
    .apps-tab-btn:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .apps-tab-btn.active { background: var(--forge-primary); color: var(--forge-bg-root); }
    .apps-tab-btn .tab-icon { display: flex; align-items: center; }
    .apps-tab-counter { font-size: 0.7rem; padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); background: var(--forge-bg-card); color: var(--forge-text-muted); font-weight: 700; }
    .apps-tab-btn.active .apps-tab-counter { background: rgba(0, 0, 0, 0.2); color: var(--forge-bg-root); }
    .pending-requests-indicator { display: inline-flex; align-items: center; gap: 0.45rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.35rem 0.85rem; font-size: 0.76rem; color: var(--forge-warning); font-weight: 600; }

    .apps-tab-content { display: none; }
    .apps-tab-content.active { display: block; animation: viewFadeIn 0.15s ease; }

    /* Pinned Favorites Panel */
    .pinned-favorites-panel { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.15rem 1.25rem; margin-bottom: 1.25rem; box-shadow: var(--forge-shadow-card); }
    .pinned-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem; }
    .pinned-apps-dock { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }
    .pinned-dock-card { display: flex; flex-direction: row; align-items: center; gap: 0.85rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.75rem 1rem; text-decoration: none; color: var(--forge-text-main); transition: var(--forge-transition); box-sizing: border-box; white-space: nowrap; }
    .pinned-dock-card:hover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); }
    .dock-card-icon { width: 36px; height: 36px; border-radius: 6px; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); display: inline-flex; align-items: center; justify-content: center; color: var(--forge-primary); flex-shrink: 0; }
    .dock-card-icon svg { display: block; flex-shrink: 0; width: 18px; height: 18px; }
    .dock-card-info { display: flex; flex-direction: column; flex: 1; min-width: 0; justify-content: center; }
    .dock-card-title { display: block; font-size: 0.88rem; font-weight: 600; color: var(--forge-text-main); line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dock-card-category { display: block; font-size: 0.72rem; color: var(--forge-text-muted); margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Category Filter Bar */
    .apps-category-filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1.15rem; flex-wrap: wrap; }
    .category-pills-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .cat-pill { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.35rem 0.85rem; font-size: 0.76rem; font-weight: 600; color: var(--forge-text-muted); cursor: pointer; transition: var(--forge-transition); }
    .cat-pill:hover { color: var(--forge-text-main); border-color: var(--forge-border-medium); }
    .cat-pill.active { background: var(--forge-bg-card); color: var(--forge-primary); border-color: var(--forge-primary); font-weight: 700; }
    .view-mode-toggle { display: flex; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.15rem; gap: 0.2rem; }
    .view-mode-btn { background: transparent; border: none; color: var(--forge-text-muted); padding: 0.25rem 0.45rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; }
    .view-mode-btn.active { background: var(--forge-bg-card); color: var(--forge-primary); }

    /* Apps Catalog Grid & Cards */
    .apps-catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1.15rem; }
    .app-card-item { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; transition: var(--forge-transition); box-shadow: var(--forge-shadow-card); position: relative; }
    .app-card-item:hover { border-color: var(--forge-border-medium); box-shadow: var(--forge-shadow-hover); }
    .app-card-item.is-pinned { border-color: rgba(var(--forge-primary-rgb, 99, 102, 241), 0.4); }
    .app-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .app-card-brand { display: flex; align-items: center; gap: 0.65rem; }
    .app-card-icon-box { width: 38px; height: 38px; border-radius: var(--forge-radius-sm); background: var(--forge-bg-card); border: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: center; color: var(--forge-primary); flex-shrink: 0; }
    .app-card-title { margin: 0; font-size: 0.92rem; font-weight: 700; color: var(--forge-text-main); }
    .app-card-cat { font-size: 0.72rem; color: var(--forge-text-muted); }
    .app-pin-btn { background: transparent; border: none; color: var(--forge-text-subtle); cursor: pointer; padding: 0.25rem; display: flex; align-items: center; border-radius: 4px; transition: var(--forge-transition); }
    .app-pin-btn:hover { color: var(--forge-primary); background: var(--forge-bg-card); }
    .app-pin-btn.active { color: var(--forge-primary); }
    .app-card-desc { font-size: 0.82rem; color: var(--forge-text-muted); line-height: 1.45; margin: 0 0 0.85rem; flex: 1; }
    .app-card-tags-row { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
    .app-tag-pill { font-size: 0.68rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); color: var(--forge-text-subtle); padding: 0.15rem 0.45rem; border-radius: 4px; }
    .app-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--forge-border); padding-top: 0.75rem; }
    .app-status-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.74rem; }
    .app-card-actions { display: flex; align-items: center; gap: 0.45rem; }

    /* Compact List Mode */
    .apps-catalog-grid.compact-list-mode { grid-template-columns: 1fr; gap: 0.65rem; }
    .apps-catalog-grid.compact-list-mode .app-card-item { flex-direction: row; align-items: center; padding: 0.75rem 1.15rem; gap: 1rem; }
    .apps-catalog-grid.compact-list-mode .app-card-top { margin-bottom: 0; min-width: 220px; }
    .apps-catalog-grid.compact-list-mode .app-card-desc { margin: 0; font-size: 0.78rem; }
    .apps-catalog-grid.compact-list-mode .app-card-tags-row { display: none; }
    .apps-catalog-grid.compact-list-mode .app-card-footer { border-top: none; padding-top: 0; margin-left: auto; gap: 1rem; }

    /* Marketplace Styles */
    .marketplace-intro-banner { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; box-shadow: var(--forge-shadow-card); }
    .marketplace-title { margin: 0 0 0.25rem; font-size: 1.05rem; font-weight: 700; color: var(--forge-text-main); }
    .marketplace-subtitle { margin: 0; font-size: 0.82rem; color: var(--forge-text-muted); max-width: 600px; }
    .marketplace-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 1.25rem; }
    .marketplace-card-item { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; transition: var(--forge-transition); box-shadow: var(--forge-shadow-card); }
    .marketplace-card-item:hover { border-color: var(--forge-primary); box-shadow: var(--forge-shadow-hover); }
    .market-card-header { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.85rem; }
    .market-card-meta { flex: 1; }
    .market-card-title { margin: 0 0 0.2rem; font-size: 0.95rem; font-weight: 700; color: var(--forge-text-main); }
    .market-card-sub { display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap; }
    .market-dept-tag { font-size: 0.7rem; color: var(--forge-text-muted); }
    .approval-type-tag { font-size: 0.68rem; font-weight: 600; color: var(--forge-primary); background: var(--forge-bg-card); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid var(--forge-border); }
    .market-card-desc { font-size: 0.82rem; color: var(--forge-text-muted); line-height: 1.45; margin: 0 0 0.85rem; flex: 1; }
    .market-features-list { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; border-top: 1px solid var(--forge-border); padding-top: 0.65rem; }
    .market-feature-item { display: flex; align-items: center; gap: 0.45rem; font-size: 0.74rem; color: var(--forge-text-main); }
    .market-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--forge-border); padding-top: 0.75rem; }
    .required-role-pill { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: var(--forge-text-subtle); }
    .market-actions { display: flex; gap: 0.45rem; }

    /* Active User Requests List */
    .active-user-requests-list { margin-bottom: 1.25rem; }
    .requests-panel-box { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem 1.25rem; box-shadow: var(--forge-shadow-card); }
    .requests-panel-title { display: flex; align-items: center; gap: 0.45rem; font-size: 0.82rem; font-weight: 700; color: var(--forge-text-main); margin-bottom: 0.65rem; }
    .requests-cards-stack { display: flex; flex-direction: column; gap: 0.5rem; }
    .user-request-chip { display: flex; justify-content: space-between; align-items: center; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.65rem 0.85rem; }
    .user-request-info { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.8rem; }
    .user-request-reason { font-size: 0.72rem; color: var(--forge-text-muted); }
    .user-request-status { display: flex; align-items: center; gap: 0.65rem; }

    /* ── Profile & Admin Table Layouts ── */
    .profile-grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .profile-card { padding: 1.5rem; }
    .profile-hero-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 1.25rem; }
    .profile-hero-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 700; }
    .profile-hero-name { margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--forge-text-main); }
    .profile-hero-email { font-size: 0.82rem; color: var(--forge-text-muted); margin-bottom: 0.35rem; }
    .profile-hero-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: var(--forge-primary); background: var(--forge-success-bg); padding: 0.15rem 0.55rem; border-radius: var(--forge-radius-full); font-weight: 600; }
    .profile-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-field label { font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); }
    .iam-role-pill { display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.45rem 0.65rem; margin-bottom: 0.5rem; font-size: 0.78rem; font-family: var(--forge-font-mono, monospace); color: var(--forge-text-main); }

    .astryx-table-container { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); overflow-x: auto; margin-top: 1rem; }
    .astryx-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
    .astryx-table th { background: var(--forge-bg-card); color: var(--forge-text-muted); font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); }
    .astryx-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); color: var(--forge-text-main); vertical-align: middle; }
    .astryx-table tr:hover td { background: var(--forge-bg-card-hover); }
    .table-user-cell { display: flex; align-items: center; gap: 0.65rem; }
    .table-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--forge-primary); color: var(--forge-bg-root); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .table-user-name { font-weight: 600; color: var(--forge-text-main); }
    .table-user-email { font-size: 0.72rem; color: var(--forge-text-muted); }
    .table-dept-tag { font-weight: 600; font-size: 0.78rem; }
    .table-div-sub { font-size: 0.7rem; color: var(--forge-text-subtle); }
    .admin-table-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem; }
    .table-summary-pill { font-size: 0.8rem; color: var(--forge-text-muted); }

    /* ── Modals & Backdrop Dialogs ── */
    .astryx-modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(16px); z-index: 2500; align-items: center; justify-content: center; opacity: 0; }
    .astryx-modal-backdrop.active, .astryx-modal-backdrop.open { display: flex !important; opacity: 1 !important; animation: viewFadeIn 0.15s ease; }
    .astryx-modal-backdrop.active .astryx-modal, .astryx-modal-backdrop.open .astryx-modal { transform: scale(1) translateY(0) !important; }
    .astryx-modal-box { width: 90%; max-width: 480px; background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8); overflow: hidden; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--forge-border); }
    .modal-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--forge-text-main); }
    .modal-close-btn { background: transparent; border: none; color: var(--forge-text-muted); cursor: pointer; font-size: 1.1rem; }
    .modal-body { padding: 1.25rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 0.85rem 1.25rem; border-top: 1px solid var(--forge-border); background: var(--forge-bg-card); }

    /* ── Command Palette (⌘K) ── */
    .portal-search-modal { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(16px); z-index: 3000; align-items: flex-start; justify-content: center; padding-top: 12vh; }
    .portal-search-modal.active { display: flex; animation: viewFadeIn 0.15s ease; }
    .portal-search-box { width: 90%; max-width: 580px; background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8); overflow: hidden; }
    .command-palette-header { display: flex; align-items: center; gap: 0.65rem; padding: 0.85rem 1.15rem; border-bottom: 1px solid var(--forge-border); }
    .portal-search-input { flex: 1; background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.95rem; }
    .command-results-list { max-height: 360px; overflow-y: auto; padding: 0.5rem; }
    .command-group-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--forge-text-subtle); padding: 0.35rem 0.65rem 0.2rem; }
    .command-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.75rem; border-radius: var(--forge-radius-sm); cursor: pointer; color: var(--forge-text-main); font-size: 0.84rem; transition: var(--forge-transition); }
    .command-item:hover, .command-item.selected { background: var(--forge-bg-card-hover); color: var(--forge-primary); }
    .cmd-shortcut { margin-left: auto; font-size: 0.72rem; color: var(--forge-text-subtle); font-family: var(--forge-font-mono, monospace); }

    /* ── Responsive Viewport Rules (Down to 320px) ── */
    @media (max-width: 992px) {
      .profile-grid-layout { grid-template-columns: 1fr; }
      .portal-viewport { padding: 1.25rem 1.5rem; }
    }
    @media (max-width: 768px) {
      .portal-viewport { padding: 1rem 0.85rem; }
      .canvas-hero-banner { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .canvas-hero-actions { width: 100%; justify-content: space-between; }
      .canvas-viewport-frame { height: 460px; }
      .canvas-search-input-wrap { min-width: unset; width: 100%; }
      .canvas-search-bar { flex-direction: column; align-items: stretch; gap: 0.5rem; }
      .apps-catalog-grid, .directory-grid, .marketplace-grid, .shortcuts-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.85rem; }
      .directory-filter-bar, .admin-table-controls, .apps-hub-nav-strip, .apps-hub-header { flex-direction: column; align-items: stretch; gap: 0.75rem; }
      .apps-view-controls { width: 100%; }
      .apps-search-box { width: 100%; }
    }
    @media (max-width: 480px) {
      :root { --portal-sidebar-width: 44px; --portal-header-height: 48px; }
      .portal-header { padding: 0 0.5rem; }
      .portal-brand span { display: none; }
      .portal-viewport { padding: 0.75rem 0.5rem; }
      .user-dropdown-popover { right: 0; width: calc(100vw - 1rem); }
      .canvas-viewport-frame { height: 380px; }
      .apps-catalog-grid, .directory-grid, .marketplace-grid, .shortcuts-grid { grid-template-columns: 1fr; }
      .colleague-card-actions, .market-actions { flex-direction: column; width: 100%; }
      .canvas-inspector-card { width: calc(100vw - 1.5rem); right: 0.5rem; top: 0.5rem; }
      .canvas-minimap-box { display: none; }
    }

    ${getInboxStyles()}
  `;
}
