/**
 * @forge/dev-hub - Developer Hub CSS Styles & Theme Tokens (2026 LTS Baseline)
 * Astryx Enterprise Design Standards.
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function getDevHubStyles(): string {
  return `
    /* Layout & Actions */
    .hub-container { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem 3rem 1rem; }
    .hub-action-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
    .hub-search-box { position: relative; min-width: 280px; flex: 1; max-width: 460px; }
    .hub-search-input { width: 100%; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.6rem 0.85rem 0.6rem 2.2rem; color: var(--forge-text-main); font-size: 0.88rem; outline: none; transition: border-color 0.15s ease; }
    .hub-search-input:focus { border-color: var(--forge-primary); }
    .hub-search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--forge-text-muted); pointer-events: none; font-size: 0.85rem; }

    /* Tab Bar Navigation */
    .hub-tabs-bar { display: flex; gap: 0.4rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.35rem; margin-bottom: 2rem; overflow-x: auto; scrollbar-width: none; }
    .hub-tabs-bar::-webkit-scrollbar { display: none; }
    .hub-tab { background: transparent; border: 1px solid transparent; color: var(--forge-text-muted); padding: 0.55rem 1rem; border-radius: calc(var(--forge-radius) - 2px); font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; }
    .hub-tab:hover { color: var(--forge-text-main); background: rgba(255, 255, 255, 0.04); }
    .hub-tab.active { color: var(--forge-text-main); background: var(--forge-bg-card); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); border: 1px solid var(--forge-border-medium); }

    /* Section Visibility */
    .hub-section { display: none; }
    .hub-section.active { display: block; }

    /* Pre-Hydration Zero-Flicker instant match (Before JS executes) */
    html[data-active-hub-tab="overview"] #section-overview,
    html[data-active-hub-tab="health"] #section-health,
    html[data-active-hub-tab="tokens"] #section-tokens,
    html[data-active-hub-tab="routes"] #section-routes,
    html[data-active-hub-tab="sdk"] #section-sdk,
    html[data-active-hub-tab="ui"] #section-ui,
    html[data-active-hub-tab="gateway"] #section-gateway,
    html[data-active-hub-tab="sandbox"] #section-sandbox,
    html[data-active-hub-tab="security"] #section-security,
    html[data-active-hub-tab="scaffolding"] #section-scaffolding,
    html[data-active-hub-tab="testing"] #section-testing {
      display: block !important;
    }

    html[data-active-hub-tab="overview"] .hub-tab[data-tab="overview"],
    html[data-active-hub-tab="health"] .hub-tab[data-tab="health"],
    html[data-active-hub-tab="tokens"] .hub-tab[data-tab="tokens"],
    html[data-active-hub-tab="routes"] .hub-tab[data-tab="routes"],
    html[data-active-hub-tab="sdk"] .hub-tab[data-tab="sdk"],
    html[data-active-hub-tab="ui"] .hub-tab[data-tab="ui"],
    html[data-active-hub-tab="gateway"] .hub-tab[data-tab="gateway"],
    html[data-active-hub-tab="sandbox"] .hub-tab[data-tab="sandbox"],
    html[data-active-hub-tab="security"] .hub-tab[data-tab="security"],
    html[data-active-hub-tab="scaffolding"] .hub-tab[data-tab="scaffolding"],
    html[data-active-hub-tab="testing"] .hub-tab[data-tab="testing"] {
      color: var(--forge-text-main); background: var(--forge-bg-card); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); border: 1px solid var(--forge-border-medium);
    }

    /* Hero Glow & Stats */
    .hero-glow { position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(62, 207, 142, 0.15) 0%, rgba(62, 207, 142, 0) 70%); pointer-events: none; }
    .quick-stats-box { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; min-width: 240px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.1rem; font-weight: 700; color: var(--forge-primary); font-family: monospace; }
    .stat-label { font-size: 0.72rem; color: var(--forge-text-muted); }

    /* Code Blocks & Badges */
    .code-block { background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.82rem; color: var(--forge-text-main); overflow-x: auto; margin: 0.75rem 0 1rem 0; line-height: 1.5; }
    .endpoint-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--forge-success-bg); border: 1px solid var(--forge-primary); color: var(--forge-primary); padding: 0.2rem 0.6rem; border-radius: var(--forge-radius); font-family: monospace; font-size: 0.78rem; font-weight: 700; }

    /* Multi-Language Switcher */
    .lang-switcher { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .lang-tab { background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-muted); padding: 0.35rem 0.8rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--forge-transition); }
    .lang-tab:hover { color: var(--forge-text-main); border-color: var(--forge-border-medium); }
    .lang-tab.active { color: var(--forge-primary); border-color: var(--forge-primary); background: var(--forge-success-bg); }
    .lang-snippet { display: none; }
    .lang-snippet.active { display: block; }

    /* SDK Modules */
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

    /* Invariants Grid */
    .invariants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .inv-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; position: relative; }
    .inv-num { font-family: monospace; font-size: 0.85rem; font-weight: 800; color: var(--forge-primary); margin-bottom: 0.35rem; }
    .inv-card h4 { font-size: 0.9rem; color: var(--forge-text-main); margin: 0 0 0.35rem 0; }
    .inv-card p { font-size: 0.78rem; color: var(--forge-text-muted); line-height: 1.4; margin: 0; }

    /* Topology Diagram */
    .topology-diagram { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.5rem; }
    .topo-node { display: flex; flex-direction: column; align-items: center; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; min-width: 140px; text-align: center; }
    .topo-icon { font-size: 1.5rem; margin-bottom: 0.35rem; }
    .topo-sub { font-size: 0.72rem; color: var(--forge-text-muted); }
    .topo-arrow { color: var(--forge-primary); font-weight: 800; display: flex; flex-direction: column; align-items: center; }
    .arrow-label { font-size: 0.7rem; color: var(--forge-text-muted); }
    .topo-services-grid { display: flex; gap: 0.6rem; flex-wrap: wrap; flex: 1; }
    .topo-subnode { display: flex; flex-direction: column; background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; flex: 1; min-width: 110px; }
    .topo-subnode.highlight { border-color: var(--forge-primary); box-shadow: 0 0 8px rgba(62, 207, 142, 0.2); }
    .badge-mini { display: inline-block; font-size: 0.65rem; background: var(--forge-success-bg); color: var(--forge-primary); border-radius: 3px; padding: 0.1rem 0.3rem; width: fit-content; margin-bottom: 0.25rem; font-family: monospace; }

    /* Sandbox Elements */
    .sandbox-controls-box { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1.25rem; margin-bottom: 1.5rem; }
    .sandbox-field-group { margin-bottom: 1rem; }
    .sandbox-label { display: block; font-size: 0.78rem; font-weight: 700; color: var(--forge-text-muted); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .astryx-select { width: 100%; background: var(--forge-bg-root); border: 1px solid var(--forge-border); color: var(--forge-text-main); padding: 0.6rem 0.85rem; border-radius: var(--forge-radius); font-size: 0.88rem; outline: none; }
    .sandbox-url-row { display: flex; gap: 0.5rem; align-items: center; }
    .method-tag { background: var(--forge-success-bg); color: var(--forge-primary); padding: 0.55rem 0.85rem; border-radius: var(--forge-radius); font-family: monospace; font-size: 0.85rem; font-weight: 800; border: 1px solid var(--forge-primary); }
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

    /* Testing Tiers & Zero Defaults Grids */
    .testing-tiers-grid, .zero-defaults-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .tier-card, .zero-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 1rem; }
    .tier-badge { font-weight: 700; font-size: 0.85rem; color: var(--forge-primary); margin-bottom: 0.25rem; }
    .tier-path { font-family: monospace; font-size: 0.75rem; color: var(--forge-text-muted); margin-bottom: 0.5rem; }
    .tier-card p, .zero-card p { font-size: 0.78rem; color: var(--forge-text-muted); line-height: 1.4; margin: 0; }
    .zero-icon { font-size: 1.4rem; margin-bottom: 0.35rem; }
    .zero-card h4 { font-size: 0.9rem; color: var(--forge-text-main); margin: 0 0 0.35rem 0; }

    /* Tables & Chips */
    .tokens-table-wrap { overflow-x: auto; border: 1px solid var(--forge-border); border-radius: var(--forge-radius); }
    .astryx-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; text-align: left; }
    .astryx-table th { background: var(--forge-bg-surface); color: var(--forge-text-main); padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); font-weight: 700; }
    .astryx-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--forge-border); color: var(--forge-text-main); }
    .astryx-table tr:last-child td { border-bottom: none; }
    .color-chip { display: inline-block; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--forge-border); vertical-align: middle; }

    /* Astryx Toast Overlay */
    .astryx-toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none; }
    .astryx-toast-item { background: rgba(22, 27, 34, 0.95); border: 1px solid var(--forge-primary); color: var(--forge-text-main); padding: 0.75rem 1.25rem; border-radius: var(--forge-radius); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); font-size: 0.85rem; font-weight: 600; animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .toast-fade-out { opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
    @keyframes toastSlideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `;
}
