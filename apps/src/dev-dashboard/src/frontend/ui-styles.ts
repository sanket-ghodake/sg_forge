/**
 * @forge/dev-dashboard - Astryx Dashboard Styles (2026 LTS)
 * High-density responsive CSS styles strictly consuming Astryx design tokens.
 */

import { getAstryxStyles } from '@forge/ui';
import { getEmployeeStyles } from './ui-employee-styles';
import { getDbStudioStyles } from './ui-db-styles';
import { getServicesStyles } from './ui-services-styles';
import { getDropdownStyles } from './ui-dropdown-styles';
import { getOverviewStyles } from './ui-overview-styles';
import { getTrafficStyles } from './ui-traffic-styles';
import { getIssuesStyles } from './ui-issues-styles';
import { getHostStyles } from './ui-host-styles';
import { getAppsStyles } from './ui-apps-styles';

/**
 * getDashboardStyles
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getDashboardStyles(): string {
  return `
    ${getAstryxStyles()}
    ${getEmployeeStyles()}
    ${getDropdownStyles()}
    
    html, body { height: 100vh; max-height: 100vh; overflow: hidden; margin: 0; padding: 0; display: flex; flex-direction: column; background: var(--forge-bg-root); font-family: var(--forge-font-sans, 'Geist', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif); color: var(--forge-text-main); }
    *, *::before, *::after { box-sizing: border-box; }

    /* 1. Global Top Header Bar */
    .sb-global-header {
      width: 100%; height: 48px; min-height: 48px; max-height: 48px; flex-shrink: 0; background: var(--forge-bg-surface); border-bottom: 1px solid var(--forge-border);
      display: flex; align-items: center; justify-content: space-between; padding: 0 1rem; z-index: 100;
      backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);
    }
    .sb-header-left, .sb-header-right { display: flex; align-items: center; gap: 0.65rem; }
    .sb-header-center { display: flex; align-items: center; flex: 1; max-width: 440px; margin: 0 1rem; }
    .sb-mobile-menu-btn {
      display: none; background: transparent; border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main); font-size: 1.1rem; padding: 0.2rem 0.45rem; cursor: pointer; line-height: 1; transition: var(--forge-transition);
    }
    .sb-mobile-menu-btn:hover { background: var(--forge-bg-card-hover); border-color: var(--forge-border-medium); }
    .sb-brand { display: flex; align-items: center; gap: 0.55rem; text-decoration: none; user-select: none; }
    .sb-app-tag {
      display: inline-flex; align-items: center;
      font-size: 0.76rem; font-weight: 600; letter-spacing: 0.03em;
      color: var(--forge-text-main); background: var(--forge-bg-card);
      border: 1px solid var(--forge-border); padding: 0.18rem 0.52rem;
      border-radius: 5px; transition: var(--forge-transition);
    }
    .sb-header-divider { width: 1px; height: 18px; background: var(--forge-border); margin: 0 0.35rem; }
    .sb-header-breadcrumb {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.55rem; background: var(--forge-bg-card);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); font-size: 0.72rem; font-weight: 600; color: var(--forge-text-muted);
    }
    .sb-header-breadcrumb .breadcrumb-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--forge-primary); box-shadow: 0 0 6px var(--forge-primary); }
    .sb-quick-find-bar {
      width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; height: 32px; padding: 0 0.75rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      cursor: pointer; color: var(--forge-text-muted); font-size: 0.78rem; transition: var(--forge-transition); user-select: none; box-sizing: border-box;
    }
    .sb-quick-find-bar:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
      color: var(--forge-text-main);
    }

    /* 2. Body Container & Left Sidebar */
    .sb-body-container {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr);
      flex: 1;
      height: calc(100vh - 48px);
      max-height: calc(100vh - 48px);
      overflow: hidden;
      background: var(--forge-bg-root);
      position: relative;
    }

    .sb-sidebar-backdrop {
      display: none;
      position: fixed;
      top: 48px; left: 0;
      width: 100vw; height: calc(100vh - 48px);
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 45;
    }

    .sb-sidebar {
      background: var(--forge-bg-surface);
      border-right: 1px solid var(--forge-border);
      display: flex;
      flex-direction: column;
      padding: 8px 4px;
      position: relative;
      width: 56px;
      height: 100%;
      max-height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: none;
      z-index: 50;
      transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .sb-sidebar::-webkit-scrollbar { display: none; }
    .sb-sidebar:hover, .sb-sidebar:focus-within {
      width: 220px;
      box-shadow: var(--forge-shadow-hover);
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-surface);
    }

    .sb-nav-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--forge-text-subtle);
      padding: 0.55rem 0.5rem 0.2rem;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      user-select: none;
    }
    .sb-sidebar:hover .sb-nav-section-label,
    .sb-sidebar:focus-within .sb-nav-section-label { opacity: 1; transform: translateX(0); }

    .sb-nav-item {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 8px;
      border-radius: var(--forge-radius-sm);
      color: var(--forge-text-muted);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      margin-bottom: 2px;
      cursor: pointer;
      transition: var(--forge-transition);
      border: 1px solid transparent;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      outline: none;
    }
    .sb-nav-item:hover { background: var(--forge-bg-card); color: var(--forge-text-main); border-color: var(--forge-border); }
    .sb-nav-item:focus-visible { box-shadow: 0 0 0 2px var(--forge-primary); }
    .sb-nav-item.active {
      background: var(--forge-bg-card-hover);
      color: var(--forge-primary);
      border-color: var(--forge-border-medium);
      font-weight: 600;
      box-shadow: inset 0 0 12px rgba(62, 207, 142, 0.08);
    }
    .sb-nav-item.active::before {
      content: '';
      position: absolute;
      left: 2px; top: 6px; bottom: 6px; width: 3px;
      border-radius: var(--forge-radius-full);
      background: var(--forge-primary);
      box-shadow: 0 0 6px var(--forge-primary);
    }

    .sb-nav-icon {
      min-width: 24px; width: 24px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-right: 8px; text-align: center;
      color: var(--forge-text-muted);
      transition: color 0.15s ease;
    }
    .sb-nav-icon svg {
      width: 15px; height: 15px;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .sb-nav-item:hover .sb-nav-icon {
      color: var(--forge-text-main);
    }
    .sb-nav-item.active .sb-nav-icon {
      color: var(--forge-primary);
    }
    .sb-nav-label {
      opacity: 0; transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      flex: 1; overflow: hidden; text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }
    .sb-hotkey-badge {
      opacity: 0; transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.65rem; padding: 1px 4px; border-radius: 3px;
      background: var(--forge-bg-elevated); color: var(--forge-text-subtle);
      border: 1px solid var(--forge-border); margin-left: auto; flex-shrink: 0;
    }
    .sb-sidebar:hover .sb-nav-label, .sb-sidebar:focus-within .sb-nav-label,
    .sb-sidebar:hover .sb-hotkey-badge, .sb-sidebar:focus-within .sb-hotkey-badge { opacity: 1; transform: translateX(0); }

    .sb-sidebar-footer {
      margin-top: auto; padding: 0.5rem 0.25rem 0.25rem;
      border-top: 1px solid var(--forge-border);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .sb-footer-pill {
      display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.68rem; color: var(--forge-text-subtle); white-space: nowrap;
      opacity: 0; transition: opacity 0.15s ease;
    }
    .sb-sidebar:hover .sb-footer-pill, .sb-sidebar:focus-within .sb-footer-pill { opacity: 1; }

    .sb-content {
      padding: 1.1rem 1.4rem;
      width: 100%;
      height: 100%;
      max-height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }
    
    /* Pre-Hydration Zero-Flicker instant match (Before JS executes) */
    html[data-active-tab="overview"] #tab-overview,
    html[data-active-tab="services"] #tab-services,
    html[data-active-tab="apps"] #tab-apps,
    html[data-active-tab="traffic"] #tab-traffic,
    html[data-active-tab="database"] #tab-database,
    html[data-active-tab="logs"] #tab-logs,
    html[data-active-tab="issues"] #tab-issues,
    html[data-active-tab="employees"] #tab-employees,
    html[data-active-tab="host"] #tab-host,
    html[data-active-tab="settings"] #tab-settings { display: block !important; }

    html[data-active-tab="overview"] .sb-nav-item[data-tab="overview"],
    html[data-active-tab="services"] .sb-nav-item[data-tab="services"],
    html[data-active-tab="apps"] .sb-nav-item[data-tab="apps"],
    html[data-active-tab="traffic"] .sb-nav-item[data-tab="traffic"],
    html[data-active-tab="database"] .sb-nav-item[data-tab="database"],
    html[data-active-tab="logs"] .sb-nav-item[data-tab="logs"],
    html[data-active-tab="issues"] .sb-nav-item[data-tab="issues"],
    html[data-active-tab="employees"] .sb-nav-item[data-tab="employees"],
    html[data-active-tab="host"] .sb-nav-item[data-tab="host"],
    html[data-active-tab="settings"] .sb-nav-item[data-tab="settings"] {
      background: var(--forge-bg-hover); color: var(--forge-text-main); border-left-color: var(--forge-primary);
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }

    /* 4 Golden Vitals Summary Cards */
    .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
    .vitals-card {
      background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius); padding: 1rem 1.15rem;
      box-shadow: var(--forge-shadow-card); display: flex; flex-direction: column;
      justify-content: space-between; min-height: 105px;
    }
    .vitals-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
    .vitals-title { font-size: 0.76rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--forge-text-muted); }
    .vitals-value { font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main); display: flex; align-items: baseline; gap: 0.35rem; line-height: 1.2; }
    .vitals-subtext { font-size: 0.72rem; color: var(--forge-text-subtle); margin-top: 0.35rem; display: flex; align-items: center; justify-content: space-between; }
    .vitals-bar-container { width: 100%; height: 6px; background: var(--forge-bg-elevated); border-radius: 3px; overflow: hidden; margin-top: 0.4rem; }
    .vitals-bar-fill { height: 100%; background: var(--forge-primary-gradient); border-radius: 3px; transition: width 0.3s ease; }

    /* Status Badges */
    .badge-running { background: var(--forge-success-bg); color: var(--forge-success); border: 1px solid var(--forge-success); font-weight: 700; }
    .badge-stopped { background: var(--forge-bg-elevated); color: var(--forge-text-muted); border: 1px solid var(--forge-border-medium); font-weight: 700; }
    .badge-disabled { background: var(--forge-bg-elevated); color: var(--forge-text-muted); border: 1px solid var(--forge-border-medium); font-weight: 700; }
    .badge-degraded { background: var(--forge-bg-elevated); color: var(--forge-accent); border: 1px solid var(--forge-accent); font-weight: 700; }
    .badge-starting { background: var(--forge-bg-elevated); color: var(--forge-primary); border: 1px solid var(--forge-primary); font-weight: 700; }
    .card-disabled { opacity: 0.82; border-color: var(--forge-border-medium); }
    .drawer-banner-disabled { border-left: 3px solid var(--forge-accent); background: var(--forge-bg-elevated); }
    .btn-toggle-disable { color: var(--forge-accent); border-color: var(--forge-border-medium); }
    .btn-toggle-enable { color: var(--forge-primary); border-color: var(--forge-primary); }

    .help-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%; background: var(--forge-bg-elevated);
      border: 1px solid var(--forge-border); color: var(--forge-text-muted);
      font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: var(--forge-transition); margin-left: 0.5rem;
    }
    .help-btn:hover { border-color: var(--forge-primary); color: var(--forge-primary); background: var(--forge-bg-card-hover); }

    /* Modal Dialog & Overlay */
    .astryx-modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      z-index: 3000; display: none; align-items: center; justify-content: center; padding: 1rem;
      box-sizing: border-box;
    }
    .astryx-modal-backdrop.open { display: flex; animation: fadeIn 0.15s ease-in-out; }
    .astryx-modal {
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08);
      width: 100%; max-width: min(680px, 92vw); max-height: 88vh; display: flex; flex-direction: column; overflow: hidden;
      box-sizing: border-box;
    }
    .log-modal-content { max-width: min(1050px, 94vw); height: 82vh; }
    .astryx-modal-header {
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--forge-border);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--forge-bg-card); flex-shrink: 0;
    }
    .astryx-modal-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--forge-text-main); margin: 0; }
    .astryx-modal-close {
      background: transparent; border: none; color: var(--forge-text-muted);
      font-size: 1.25rem; cursor: pointer; padding: 0.25rem 0.5rem;
      border-radius: var(--forge-radius-sm); transition: var(--forge-transition);
    }
    .astryx-modal-close:hover { background: var(--forge-bg-card-hover); color: var(--forge-text-main); }
    .astryx-modal-body { padding: 1.25rem; overflow-y: auto; font-size: 0.85rem; color: var(--forge-text-main); line-height: 1.55; flex: 1; scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }

    /* Sparkline SVG Graphs & Latency Pills */
    .sparkline-cell { display: flex; align-items: center; gap: 0.5rem; }
    .sparkline-svg { width: 84px; height: 20px; overflow: visible; }
    .latency-pill { font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; }
    .latency-fast { background: var(--forge-success-bg); color: var(--forge-success); }
    .latency-medium { background: var(--forge-bg-elevated); color: var(--forge-text-muted); }
    .latency-slow { background: var(--forge-bg-elevated); color: var(--forge-accent); }

    .terminal-window {
      background: var(--forge-bg-root); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.78rem; color: var(--forge-text-muted); padding: 0.75rem;
      height: 250px; overflow-y: auto; white-space: pre-wrap; line-height: 1.45;
    }
    .sql-input {
      width: 100%; height: 110px; background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main); font-family: ui-monospace, SFMono-Regular, monospace;
      padding: 0.75rem; font-size: 0.85rem; resize: vertical; margin-bottom: 0.65rem;
    }

    /* Table Wrapping & Responsiveness */
    .astryx-table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: var(--forge-radius-sm); }
    .data-table { width: 100%; min-width: 650px; border-collapse: collapse; font-size: 0.82rem; margin-top: 0.5rem; }
    .data-table th {
      text-align: left; padding: 0.55rem 0.75rem; background: var(--forge-bg-elevated);
      color: var(--forge-text-muted); border-bottom: 1px solid var(--forge-border); font-weight: 600; white-space: nowrap;
    }
    .data-table td {
      padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--forge-border);
      color: var(--forge-text-main); vertical-align: middle; white-space: nowrap;
    }
    .data-table tr:hover { background: var(--forge-bg-card-hover); }

    /* Universal Modern Form & Astryx Dropdown Elements */
    .form-input {
      padding: 0.4rem 0.65rem; background: var(--forge-bg-card);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main); font-size: 0.82rem; outline: none;
      transition: var(--forge-transition);
    }
    .form-input:focus { border-color: var(--forge-primary); box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.2); }

    select, select.form-input, .astryx-select {
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      background-color: var(--forge-bg-card) !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%233ecf8e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.75rem center !important;
      background-size: 13px 13px !important;
      padding: 0.42rem 2.2rem 0.42rem 0.75rem !important;
      border: 1px solid var(--forge-border) !important;
      border-radius: var(--forge-radius-sm) !important;
      color: var(--forge-text-main) !important;
      font-size: 0.82rem !important;
      font-family: inherit !important;
      outline: none !important;
      cursor: pointer !important;
      transition: var(--forge-transition) !important;
    }
    select:focus, select.form-input:focus, .astryx-select:focus {
      border-color: var(--forge-primary) !important;
      box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.2) !important;
    }
    select option, select optgroup {
      background-color: var(--forge-bg-surface) !important;
      color: var(--forge-text-main) !important;
      padding: 0.5rem !important;
    }

    /* Universal Slim Astryx Scrollbars (Anti-Browser OS Defaults) */
    *, *::before, *::after {
      scrollbar-width: thin !important;
      scrollbar-color: var(--forge-border-medium) transparent !important;
    }
    *::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }
    *::-webkit-scrollbar-track {
      background: transparent !important;
    }
    *::-webkit-scrollbar-thumb {
      background: var(--forge-border-medium) !important;
      border-radius: 9999px !important;
      border: 1px solid transparent !important;
      background-clip: padding-box !important;
      transition: background-color 0.2s ease !important;
    }
    *::-webkit-scrollbar-thumb:hover {
      background: var(--forge-primary) !important;
    }
    *::-webkit-scrollbar-corner {
      background: transparent !important;
    }

    /* Modern Astryx Glassmorphic Toast Notifications */
    .astryx-toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; display: flex; flex-direction: column; gap: 0.65rem; z-index: 9999; pointer-events: none; max-width: 420px; width: calc(100vw - 3rem); }
    .astryx-toast { pointer-events: auto; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius-sm); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(62, 207, 142, 0.1); backdrop-filter: blur(12px); color: var(--forge-text-main); font-size: 0.84rem; font-weight: 500; animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes toastSlideIn { from { opacity: 0; transform: translateY(16px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .astryx-toast-success { border-left: 4px solid var(--forge-success); }
    .astryx-toast-error, .astryx-toast-warning { border-left: 4px solid var(--forge-accent); }
    .astryx-toast-info { border-left: 4px solid var(--forge-primary); }
    .astryx-toast-icon { font-size: 1.1rem; flex-shrink: 0; }
    .astryx-toast-content { flex: 1; line-height: 1.4; word-break: break-word; }
    .astryx-toast-close { background: none; border: none; color: var(--forge-text-muted); cursor: pointer; font-size: 1.1rem; padding: 0 0.2rem; transition: color 0.15s ease; }
    .astryx-toast-close:hover { color: var(--forge-text-main); }

    /* Watchdog Heartbeat Pill */
    .watchdog-pill {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.25rem 0.65rem; background: var(--forge-bg-card);
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full);
      font-size: 0.75rem; font-weight: 600; cursor: pointer; user-select: none;
      transition: var(--forge-transition);
    }
    .watchdog-pill:hover { background: var(--forge-bg-card-hover); }
    .watchdog-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
    .watchdog-dot.live { background: var(--forge-success); box-shadow: 0 0 6px var(--forge-success); animation: pulse 2s infinite; }
    .watchdog-dot.reconnecting { background: var(--forge-accent); box-shadow: 0 0 6px var(--forge-accent); }
    .watchdog-dot.frozen { background: var(--forge-accent); box-shadow: 0 0 6px var(--forge-accent); }

    /* Plain English Insights Card */
    .plain-english-card {
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium);
      border-left: 4px solid var(--forge-primary); border-radius: var(--forge-radius-sm);
      padding: 0.75rem 1rem; margin-bottom: 1rem; box-shadow: var(--forge-shadow-card);
    }

    /* Structured High-Density Log Row & Trace Tags */
    .log-row { padding: 0.15rem 0; border-bottom: 1px solid var(--forge-border); display: flex; gap: 0.45rem; word-break: break-all; line-height: 1.4; }
    .log-ts { color: var(--forge-text-subtle); flex-shrink: 0; }
    .log-lvl-info { color: var(--forge-primary); font-weight: 600; flex-shrink: 0; }
    .log-lvl-warn { color: var(--forge-accent); font-weight: 600; flex-shrink: 0; }
    .log-lvl-error { color: var(--forge-accent); font-weight: 700; flex-shrink: 0; }
    .log-lvl-debug { color: var(--forge-text-muted); flex-shrink: 0; }
    .log-svc { color: var(--forge-text-main); font-weight: 600; flex-shrink: 0; }
    .log-source { font-size: 0.7rem; padding: 0.05rem 0.3rem; border-radius: 3px; background: var(--forge-bg-elevated); color: var(--forge-text-muted); flex-shrink: 0; }
    .log-trace-tag { font-size: 0.68rem; padding: 0.05rem 0.25rem; border-radius: 3px; background: rgba(62, 207, 142, 0.15); color: var(--forge-primary); cursor: pointer; }
    .log-msg { color: var(--forge-text-muted); flex: 1; }
    .log-msg.highlight { color: var(--forge-text-main); background: rgba(245, 158, 11, 0.2); }

    /* Command Palette (Cmd+K) */
    .palette-modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); z-index: 3000; align-items: flex-start; justify-content: center; padding-top: 10vh; box-sizing: border-box; }
    .palette-modal-backdrop.open { display: flex; }
    .palette-box { width: 90%; max-width: 580px; background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius-md); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08); overflow: hidden; }
    .palette-input-wrap { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); }
    .palette-input { flex: 1; background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.95rem; }
    .palette-list { max-height: 320px; overflow-y: auto; padding: 0.4rem; margin: 0; list-style: none; scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }
    .palette-item { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.75rem; border-radius: var(--forge-radius-sm); cursor: pointer; color: var(--forge-text-main); font-size: 0.84rem; }
    .palette-item:hover, .palette-item.active { background: rgba(62, 207, 142, 0.12); color: var(--forge-primary); }

    ${getDbStudioStyles()}
    ${getServicesStyles()}
    ${getOverviewStyles()}
    ${getTrafficStyles()}
    ${getIssuesStyles()}
    ${getHostStyles()}
    ${getAppsStyles()}

    /* Responsive Mobile Breakpoint */
    @media (max-width: 900px) {
      .sb-mobile-menu-btn { display: inline-flex; }
      .sb-header-center { display: none; }
      .sb-body-container { grid-template-columns: 1fr; }
      .sb-sidebar { position: fixed; left: 0; top: 48px; width: 220px; height: calc(100vh - 48px); transform: translateX(-100%); box-shadow: var(--forge-shadow-hover); }
      .sb-sidebar .sb-nav-label, .sb-sidebar .sb-hotkey-badge, .sb-sidebar .sb-nav-section-label, .sb-sidebar .sb-footer-pill { opacity: 1; transform: none; }
      .sb-sidebar.open { transform: translateX(0); }
      .sb-sidebar-backdrop.open { display: block; }
      .sb-content { padding: 0.85rem; }
    }
  `;
}
