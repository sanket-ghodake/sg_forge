/**
 * @forge/dev-dashboard - Services & Processes Styles (2026 LTS)
 * High-density toolbar, filter chips, service row states, and flyout drawer styling.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getServicesStyles(): string {
  return `
    /* 2026 Services & Processes Command Center (Option C) */
    .services-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .services-search-box { display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.35rem 0.85rem; flex: 1; max-width: 360px; min-width: 220px; }
    .services-search-box input { background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.82rem; width: 100%; -webkit-appearance: none; appearance: none; }
    .services-search-box input::-webkit-search-cancel-button,
    .services-search-box input::-webkit-search-decoration { -webkit-appearance: none; display: none; }
    .filter-chip-group { display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; }
    .filter-chip { padding: 0.25rem 0.65rem; border-radius: var(--forge-radius-full); font-size: 0.72rem; font-weight: 600; border: 1px solid var(--forge-border); background: var(--forge-bg-card); color: var(--forge-text-muted); cursor: pointer; transition: var(--forge-transition); user-select: none; }
    .filter-chip:hover { color: var(--forge-text-main); border-color: var(--forge-border-medium); }
    .filter-chip.active { background: var(--forge-bg-card-hover); color: var(--forge-primary); border-color: var(--forge-primary); box-shadow: 0 0 8px rgba(62, 207, 142, 0.15); }
    
    .service-row-clickable { cursor: pointer; transition: background 0.15s ease; }
    .service-row-clickable:hover { background: var(--forge-bg-card-hover) !important; }
    .service-row-clickable.selected-row { background: rgba(62, 207, 142, 0.08) !important; outline: 1px solid var(--forge-primary); }
    
    /* Option C Flyout Service Inspector Drawer */
    .service-drawer-backdrop { position: fixed; top: 48px; left: 0; right: 0; bottom: 0; width: 100vw; height: calc(100vh - 48px); background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; z-index: 90; opacity: 0; pointer-events: none; transition: opacity 0.22s ease; }
    .service-drawer { position: fixed; top: 48px; right: 0; bottom: 0; width: min(94vw, 540px); height: calc(100vh - 48px); background: var(--forge-bg-surface); border-left: 1px solid var(--forge-border-medium); box-shadow: none; visibility: hidden; pointer-events: none; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s, box-shadow 0.25s; z-index: 95; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
    .service-drawer.open { transform: translateX(0); visibility: visible; pointer-events: auto; box-shadow: -16px 0 40px rgba(0, 0, 0, 0.75); }
    .drawer-resizer { position: absolute; left: 0; top: 0; bottom: 0; width: 8px; cursor: ew-resize; z-index: 50; background: transparent; transition: background 0.15s ease, box-shadow 0.15s ease; user-select: none; }
    .drawer-resizer::after { content: ''; position: absolute; left: 2px; top: 50%; transform: translateY(-50%); height: 36px; width: 3px; border-radius: var(--forge-radius-full); background: var(--forge-border-medium); opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
    .drawer-resizer:hover, .drawer-resizer.resizing { background: rgba(62, 207, 142, 0.12); }
    .drawer-resizer:hover::after, .drawer-resizer.resizing::after { opacity: 1; background: var(--forge-primary); box-shadow: 0 0 8px var(--forge-primary); }
    body.is-resizing-drawer { cursor: ew-resize !important; user-select: none !important; }
    .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card); flex-shrink: 0; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }
    .drawer-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 1rem; }
    .drawer-card-title { font-size: 0.85rem; font-weight: 700; color: var(--forge-text-main); margin-bottom: 0.65rem; display: flex; align-items: center; justify-content: space-between; }
    .drawer-probe-result { font-family: monospace; font-size: 0.74rem; background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.65rem; max-height: 160px; overflow-y: auto; white-space: pre-wrap; color: var(--forge-text-main); scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }
    .service-port-tag { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.74rem; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); padding: 0.15rem 0.45rem; border-radius: 4px; }
    .service-port-tag code { color: var(--forge-text-main); font-family: 'Geist Mono', monospace; }
    .service-ingress-link { display: inline-flex; align-items: center; gap: 0.3rem; text-decoration: none; color: var(--forge-primary); font-size: 0.76rem; background: var(--forge-primary-bg); border: 1px solid var(--forge-border); padding: 0.18rem 0.5rem; border-radius: 4px; transition: var(--forge-transition); }
    .service-ingress-link:hover { background: var(--forge-bg-card-hover); border-color: var(--forge-primary); }
    .service-ingress-link code { font-family: 'Geist Mono', monospace; font-size: 0.74rem; }
    .latency-pill { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 12px; }
    .latency-fast { background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-primary); }
    .latency-medium { background: var(--forge-warning-bg); color: var(--forge-warning); border: 1px solid var(--forge-warning); }
    .latency-slow { background: var(--forge-error-bg); color: var(--forge-error); border: 1px solid var(--forge-error); }
    .svc-action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.22rem 0.48rem; font-size: 0.72rem; border-radius: 4px; line-height: 1; }
    .svc-action-btn.btn-danger-hover:hover { border-color: var(--forge-error) !important; color: var(--forge-error) !important; background: var(--forge-error-bg) !important; }
    .svc-row-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 4px; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); color: var(--forge-primary); flex-shrink: 0; }
    .drawer-title-icon { display: inline-flex; align-items: center; color: var(--forge-primary); }
  `;
}
