/**
 * @forge/dev-hub - Developer Console CSS Styles & Theme Tokens (2026 LTS Baseline)
 * Astryx Enterprise Design Standards: 56px Collapsed Sidebar Rail Expanding on Hover over Page.
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function getDevHubStyles(): string {
  return `
    /* 1. Global Reset & Layout Grid */
    body { margin: 0; padding: 0; background: var(--forge-bg-root); color: var(--forge-text-main); font-family: var(--forge-font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); overflow-x: hidden; }
    
    /* 2. Top Global Header Bar (Console Model) */
    .sb-global-header { position: sticky; top: 0; left: 0; right: 0; height: 54px; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; background: var(--forge-bg-surface); border-bottom: 1px solid var(--forge-border); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-sizing: border-box; }
    .sb-header-left { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .sb-mobile-menu-btn { display: none; background: transparent; border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); color: var(--forge-text-main); width: 32px; height: 32px; align-items: center; justify-content: center; cursor: pointer; }
    .sb-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: inherit; }
    .astryx-logo-badge { background: var(--forge-primary); color: var(--forge-bg-root); font-weight: 800; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: monospace; }
    .sb-app-tag { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; color: var(--forge-text-main); text-transform: uppercase; }
    .sb-header-divider { width: 1px; height: 20px; background: var(--forge-border); margin: 0 0.25rem; }
    .sb-header-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--forge-text-muted); }
    .breadcrumb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--forge-primary); }

    /* 3. Header Center Quick Search & Command Bar */
    .sb-header-center { flex: 1; max-width: 520px; margin: 0 1.5rem; }
    .sb-quick-find-bar { position: relative; width: 100%; display: flex; align-items: center; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.35rem 0.75rem; transition: border-color 0.15s ease, box-shadow 0.15s ease; box-sizing: border-box; }
    .sb-quick-find-bar:focus-within { border-color: var(--forge-primary); box-shadow: 0 0 0 2px rgba(62, 207, 142, 0.15); }
    .sb-search-icon { color: var(--forge-text-muted); display: flex; align-items: center; margin-right: 0.5rem; }
    .sb-search-input { width: 100%; background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.84rem; font-family: inherit; }
    .sb-search-input::placeholder { color: var(--forge-text-muted); }
    .sb-hotkey-badge { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: 4px; color: var(--forge-text-muted); font-size: 0.7rem; font-family: monospace; padding: 0.15rem 0.4rem; pointer-events: none; flex-shrink: 0; }

    /* 4. Header Right Controls */
    .sb-header-right { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }
    .watchdog-pill { display: flex; align-items: center; gap: 0.4rem; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: 20px; padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--forge-text-muted); }
    .watchdog-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--forge-primary); box-shadow: 0 0 6px var(--forge-primary); animation: pulseDot 2s infinite; }
    @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    .astryx-theme-toggle { background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); color: var(--forge-text-main); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; position: relative; }
    .astryx-theme-toggle:hover { border-color: var(--forge-primary); color: var(--forge-primary); }
    .theme-icon-sun, .theme-icon-moon { display: flex; align-items: center; justify-content: center; width: 15px; height: 15px; }
    html[data-theme="dark"] .theme-icon-moon { display: none !important; }
    html[data-theme="dark"] .theme-icon-sun { display: flex !important; color: var(--forge-warning); }
    html[data-theme="light"] .theme-icon-sun { display: none !important; }
    html[data-theme="light"] .theme-icon-moon { display: flex !important; color: var(--forge-primary); }

    /* 5. Main Body Layout & Hover-Expanding Sidebar Rail (Dev Dashboard Model) */
    .sb-body-container { display: flex; width: 100%; min-height: calc(100vh - 54px); position: relative; }
    .sb-sidebar-wrapper { position: relative; width: 56px; flex-shrink: 0; height: calc(100vh - 54px); z-index: 60; }
    .sb-sidebar-backdrop { display: none; }
    .sb-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 56px;
      background: var(--forge-bg-surface);
      border-right: 1px solid var(--forge-border);
      padding: 8px 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: none;
      z-index: 60;
      transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .sb-sidebar::-webkit-scrollbar { display: none; }
    .sb-sidebar:hover, .sb-sidebar:focus-within {
      width: 230px;
      box-shadow: 6px 0 28px rgba(0, 0, 0, 0.45);
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-surface);
    }

    .sb-nav-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--forge-text-muted);
      padding: 0.6rem 0.6rem 0.25rem 0.6rem;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      user-select: none;
    }
    .sb-sidebar:hover .sb-nav-section-label,
    .sb-sidebar:focus-within .sb-nav-section-label {
      opacity: 1;
      transform: translateX(0);
    }

    .sb-nav-item {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 8px;
      border-radius: var(--forge-radius-sm, 6px);
      color: var(--forge-text-muted);
      font-size: 0.82rem;
      font-weight: 500;
      margin-bottom: 2px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      outline: none;
    }
    .sb-nav-item:hover { color: var(--forge-text-main); background: rgba(255, 255, 255, 0.05); border-color: var(--forge-border); }
    .sb-nav-item.active {
      color: var(--forge-primary);
      background: var(--forge-success-bg, rgba(62, 207, 142, 0.12));
      border-color: rgba(62, 207, 142, 0.3);
      font-weight: 600;
    }
    .sb-nav-item.active::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 6px;
      bottom: 6px;
      width: 3px;
      border-radius: var(--forge-radius-full, 9999px);
      background: var(--forge-primary);
      box-shadow: 0 0 6px var(--forge-primary);
    }

    .sb-nav-icon {
      min-width: 24px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: 8px;
      text-align: center;
      color: var(--forge-text-muted);
      transition: color 0.15s ease;
    }
    .sb-nav-item:hover .sb-nav-icon { color: var(--forge-text-main); }
    .sb-nav-item.active .sb-nav-icon { color: var(--forge-primary); }

    .sb-nav-label {
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sb-sidebar:hover .sb-nav-label,
    .sb-sidebar:focus-within .sb-nav-label {
      opacity: 1;
      transform: translateX(0);
    }

    .sb-sidebar-footer {
      margin-top: auto;
      padding: 0.5rem 0.25rem 0.25rem;
      border-top: 1px solid var(--forge-border);
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .sb-footer-link {
      display: flex;
      align-items: center;
      height: 32px;
      padding: 0 8px;
      border-radius: var(--forge-radius-sm, 6px);
      color: var(--forge-text-muted);
      font-size: 0.78rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
    }
    .sb-footer-link:hover { color: var(--forge-text-main); background: rgba(255, 255, 255, 0.05); }
    .sb-footer-icon {
      min-width: 24px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: 8px;
      color: var(--forge-text-muted);
      transition: color 0.15s ease;
    }
    .sb-footer-link:hover .sb-footer-icon { color: var(--forge-text-main); }
    .sb-footer-text {
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sb-sidebar:hover .sb-footer-text,
    .sb-sidebar:focus-within .sb-footer-text {
      opacity: 1;
      transform: translateX(0);
    }
    .sb-footer-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      color: var(--forge-text-muted);
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .sb-sidebar:hover .sb-footer-pill,
    .sb-sidebar:focus-within .sb-footer-pill {
      opacity: 1;
    }

    /* 6. Main Canvas */
    .sb-main-canvas { flex: 1; min-width: 0; padding: 1.5rem 2.5rem 3rem 2.5rem; box-sizing: border-box; overflow-y: auto; height: calc(100vh - 54px); scrollbar-width: thin; }
    .hub-section { display: none; animation: fadeInSection 0.18s ease-out; }
    .hub-section.active { display: block; }
    @keyframes fadeInSection { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* Pre-Hydration Zero-Flicker Instant Match */
    html[data-active-hub-tab="overview"] #section-overview,
    html[data-active-hub-tab="gateway"] #section-gateway,
    html[data-active-hub-tab="routes"] #section-routes,
    html[data-active-hub-tab="sandbox"] #section-sandbox,
    html[data-active-hub-tab="health"] #section-health,
    html[data-active-hub-tab="tokens"] #section-tokens,
    html[data-active-hub-tab="api-catalog"] #section-api-catalog,
    html[data-active-hub-tab="sdk"] #section-sdk,
    html[data-active-hub-tab="ui"] #section-ui,
    html[data-active-hub-tab="security"] #section-security,
    html[data-active-hub-tab="scaffolding"] #section-scaffolding,
    html[data-active-hub-tab="testing"] #section-testing {
      display: block !important;
    }

    html[data-active-hub-tab="overview"] .sb-nav-item[data-tab="overview"],
    html[data-active-hub-tab="gateway"] .sb-nav-item[data-tab="gateway"],
    html[data-active-hub-tab="routes"] .sb-nav-item[data-tab="routes"],
    html[data-active-hub-tab="sandbox"] .sb-nav-item[data-tab="sandbox"],
    html[data-active-hub-tab="health"] .sb-nav-item[data-tab="health"],
    html[data-active-hub-tab="tokens"] .sb-nav-item[data-tab="tokens"],
    html[data-active-hub-tab="api-catalog"] .sb-nav-item[data-tab="api-catalog"],
    html[data-active-hub-tab="sdk"] .sb-nav-item[data-tab="sdk"],
    html[data-active-hub-tab="ui"] .sb-nav-item[data-tab="ui"],
    html[data-active-hub-tab="security"] .sb-nav-item[data-tab="security"],
    html[data-active-hub-tab="scaffolding"] .sb-nav-item[data-tab="scaffolding"],
    html[data-active-hub-tab="testing"] .sb-nav-item[data-tab="testing"] {
      color: var(--forge-primary); background: var(--forge-success-bg, rgba(62, 207, 142, 0.12)); border-color: rgba(62, 207, 142, 0.3); font-weight: 600;
    }

    /* 7. Cards, Code Blocks & Badges */
    .astryx-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.5rem; }
    .hero-glow { position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(62, 207, 142, 0.15) 0%, rgba(62, 207, 142, 0) 70%); pointer-events: none; }
    .quick-stats-box { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; min-width: 240px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.1rem; font-weight: 700; color: var(--forge-primary); font-family: monospace; }
    .stat-label { font-size: 0.72rem; color: var(--forge-text-muted); }
    .code-block { background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.82rem; color: var(--forge-text-main); overflow-x: auto; margin: 0.75rem 0 1rem 0; line-height: 1.5; }
    
    /* 8. Method Tags & API Explorer */
    .method-tag { display: inline-flex; align-items: center; justify-content: center; padding: 0.2rem 0.55rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    .method-get { background: rgba(56, 189, 248, 0.15); color: var(--forge-accent); border: 1px solid rgba(56, 189, 248, 0.4); }
    .method-post { background: rgba(52, 211, 153, 0.15); color: var(--forge-primary); border: 1px solid rgba(52, 211, 153, 0.4); }
    .method-put { background: rgba(251, 191, 36, 0.15); color: var(--forge-warning); border: 1px solid rgba(251, 191, 36, 0.4); }
    .method-delete { background: rgba(248, 113, 113, 0.15); color: var(--forge-danger); border: 1px solid rgba(248, 113, 113, 0.4); }
    .lang-switcher { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .lang-tab { background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-muted); padding: 0.35rem 0.8rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--forge-transition); }
    .lang-tab:hover { color: var(--forge-text-main); border-color: var(--forge-border-medium); }
    .lang-tab.active { color: var(--forge-primary); border-color: var(--forge-primary); background: var(--forge-success-bg); }
    .lang-snippet { display: none; }
    .lang-snippet.active { display: block; }

    /* 9. SDK Modules & Sandbox */
    .sdk-modules-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .sdk-module-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; transition: var(--forge-transition); }
    .sdk-module-card:hover { border-color: var(--forge-border-medium); }
    .sdk-mod-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
    .sdk-mod-title { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    .sdk-mod-title h3 { font-size: 1.05rem; color: var(--forge-text-main); margin: 0; }
    .mod-pill { background: rgba(112, 83, 255, 0.15); border: 1px solid var(--forge-accent); color: var(--forge-accent); padding: 0.15rem 0.45rem; border-radius: 3px; font-size: 0.72rem; font-weight: 700; }
    .sdk-mod-desc { font-size: 0.85rem; color: var(--forge-text-muted); line-height: 1.5; margin: 0 0 0.5rem 0; }
    .copy-btn { background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-muted); padding: 0.25rem 0.65rem; border-radius: var(--forge-radius-sm); font-size: 0.75rem; cursor: pointer; transition: all 0.15s ease; }
    .copy-btn:hover { color: var(--forge-text-main); border-color: var(--forge-primary); }

    /* 10. Tables & Invariants */
    .tokens-table-wrap { overflow-x: auto; border: 1px solid var(--forge-border); border-radius: var(--forge-radius); }
    .astryx-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left; }
    .astryx-table th { background: var(--forge-bg-surface); color: var(--forge-text-main); padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); font-weight: 700; }
    .astryx-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); color: var(--forge-text-main); }
    .astryx-table tr:last-child td { border-bottom: none; }
    .invariants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .inv-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; position: relative; }
    .inv-num { font-family: monospace; font-size: 0.85rem; font-weight: 800; color: var(--forge-primary); margin-bottom: 0.35rem; }
    .inv-card h4 { font-size: 0.9rem; color: var(--forge-text-main); margin: 0 0 0.35rem 0; }
    .inv-card p { font-size: 0.78rem; color: var(--forge-text-muted); line-height: 1.4; margin: 0; }

    /* 11. Topology & Sandbox Elements */
    .topology-diagram { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.5rem; }
    .topo-node { display: flex; flex-direction: column; align-items: center; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; min-width: 140px; text-align: center; }
    .topo-icon { display: flex; align-items: center; justify-content: center; margin-bottom: 0.35rem; color: var(--forge-primary); }
    .topo-sub { font-size: 0.72rem; color: var(--forge-text-muted); }
    .topo-arrow { color: var(--forge-primary); font-weight: 800; display: flex; flex-direction: column; align-items: center; }
    .arrow-label { font-size: 0.7rem; color: var(--forge-text-muted); }
    .topo-services-grid { display: flex; gap: 0.6rem; flex-wrap: wrap; flex: 1; }
    .topo-subnode { display: flex; flex-direction: column; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; flex: 1; min-width: 110px; }
    .topo-subnode.highlight { border-color: var(--forge-primary); box-shadow: 0 0 8px rgba(62, 207, 142, 0.2); }
    .sandbox-controls-box { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; margin-bottom: 1.5rem; }
    .sandbox-field-group { margin-bottom: 1rem; }
    .sandbox-label { display: block; font-size: 0.78rem; font-weight: 700; color: var(--forge-text-muted); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .astryx-select { width: 100%; background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-main); padding: 0.6rem 0.85rem; border-radius: var(--forge-radius); font-size: 0.88rem; outline: none; }
    .sandbox-url-row { display: flex; gap: 0.5rem; align-items: center; }
    .astryx-input { flex: 1; background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-main); padding: 0.6rem 0.85rem; border-radius: var(--forge-radius); font-size: 0.88rem; outline: none; }
    .astryx-input:focus { border-color: var(--forge-primary); }
    .sandbox-response-container { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; }
    .response-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .status-pill { font-size: 0.75rem; font-weight: 800; font-family: monospace; padding: 0.2rem 0.5rem; border-radius: 3px; }
    .status-ready { background: rgba(139, 148, 158, 0.2); color: var(--forge-text-muted); }
    .status-loading { background: rgba(227, 179, 65, 0.2); color: var(--forge-warning); }
    .status-success { background: var(--forge-success-bg); color: var(--forge-primary); }
    .status-error { background: rgba(248, 81, 73, 0.2); color: var(--forge-danger); }
    .response-body { max-height: 380px; overflow-y: auto; margin-bottom: 0; }

    /* 12. Testing Tiers & Zero Defaults Grids */
    .testing-tiers-grid, .zero-defaults-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .tier-card, .zero-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; }
    .tier-badge { font-weight: 700; font-size: 0.85rem; color: var(--forge-primary); margin-bottom: 0.25rem; }
    .tier-path { font-family: monospace; font-size: 0.75rem; color: var(--forge-text-muted); margin-bottom: 0.5rem; }
    .tier-card p, .zero-card p { font-size: 0.78rem; color: var(--forge-text-muted); line-height: 1.4; margin: 0; }
    .zero-icon { display: flex; align-items: center; margin-bottom: 0.35rem; color: var(--forge-primary); }
    .zero-card h4 { font-size: 0.9rem; color: var(--forge-text-main); margin: 0 0 0.35rem 0; }

    /* 13. Toast Overlay */
    .astryx-toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    .astryx-toast-item { background: rgba(22, 27, 34, 0.95); border: 1px solid var(--forge-primary); color: var(--forge-text-main); padding: 0.75rem 1.25rem; border-radius: var(--forge-radius); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); font-size: 0.85rem; font-weight: 600; animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .toast-fade-out { opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
    @keyframes toastSlideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    /* 14. Mobile Drawer Responsiveness */
    @media (max-width: 768px) {
      .sb-mobile-menu-btn { display: flex; }
      .sb-header-center { display: none; }
      .sb-sidebar-wrapper { width: 0; }
      .sb-sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); z-index: 998; opacity: 0; pointer-events: none; transition: opacity 0.25s ease; }
      .sb-sidebar-backdrop.active { opacity: 1; pointer-events: auto; }
      .sb-sidebar { position: fixed; top: 54px; bottom: 0; left: 0; z-index: 999; width: 240px; transform: translateX(-100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 6px 0 28px rgba(0, 0, 0, 0.5); }
      .sb-sidebar.open { transform: translateX(0); width: 240px; }
      .sb-sidebar.open .sb-nav-label, .sb-sidebar.open .sb-nav-section-label, .sb-sidebar.open .sb-footer-pill { opacity: 1; transform: translateX(0); }
      .sb-main-canvas { padding: 1.25rem 1rem 3rem 1rem; }
    }
  `;
}
