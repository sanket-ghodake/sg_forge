/**
 * @forge/dev-dashboard - Forge Apps Command Center Styles (2026 LTS)
 * Astryx tokens, high-density toolbar, grid cards, matrix table, inspector drawer, and pixel-perfect wizard modal.
 * Enterprise Micro-App Console Standard
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getAppsStyles(): string {
  return `
    /* ==============================================================================
       1. Forge Apps Command Center Toolbar & Vitals
       ============================================================================== */
    .apps-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .apps-search-box { display: flex; align-items: center; gap: 0.5rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.35rem 0.85rem; flex: 1; max-width: 380px; min-width: 220px; }
    .apps-search-box input { background: transparent; border: none; outline: none; color: var(--forge-text-main); font-size: 0.82rem; width: 100%; -webkit-appearance: none; appearance: none; }
    .apps-search-box input::-webkit-search-cancel-button { display: none; }

    .apps-view-toggle { display: flex; border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); overflow: hidden; background: var(--forge-bg-card); }
    .apps-view-btn { padding: 0.3rem 0.65rem; border: none; background: transparent; color: var(--forge-text-muted); cursor: pointer; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; transition: var(--forge-transition); }
    .apps-view-btn:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .apps-view-btn.active { background: var(--forge-bg-card-hover); color: var(--forge-primary); }

    /* ==============================================================================
       2. Rich App Cards Grid View
       ============================================================================== */
    .apps-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .app-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-md); padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; transition: border-color 0.2s ease, box-shadow 0.2s ease; position: relative; }
    .app-card:hover { border-color: var(--forge-border-medium); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); }
    .app-card.card-stopped { opacity: 0.85; border-style: dashed; }

    .app-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; }
    .app-card-title-group { display: flex; align-items: center; gap: 0.6rem; }
    .app-card-icon { width: 36px; height: 36px; border-radius: var(--forge-radius-sm); background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .app-card-name { font-size: 0.96rem; font-weight: 650; color: var(--forge-text-main); margin: 0; line-height: 1.25; }
    .app-card-id { font-size: 0.72rem; font-family: 'Geist Mono', monospace; color: var(--forge-text-subtle); margin-top: 0.15rem; }

    .app-card-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; margin: 0.65rem 0; }
    .app-card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: var(--forge-bg-elevated); padding: 0.55rem 0.75rem; border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); font-size: 0.74rem; margin-bottom: 0.75rem; }
    .app-card-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .app-card-meta-label { color: var(--forge-text-muted); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.03em; }
    .app-card-meta-val { font-weight: 600; color: var(--forge-text-main); font-family: 'Geist Mono', monospace; }

    .app-card-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--forge-border); padding-top: 0.75rem; margin-top: 0.5rem; gap: 0.4rem; flex-wrap: wrap; }
    .app-card-btn-group { display: flex; gap: 0.3rem; align-items: center; }

    /* ==============================================================================
       3. High-Density Matrix Table View
       ============================================================================== */
    .apps-table-container { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-md); overflow: hidden; margin-top: 1rem; }
    .apps-table-container table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; }
    .apps-table-container th { background: var(--forge-bg-surface); padding: 0.65rem 0.85rem; font-weight: 650; color: var(--forge-text-muted); border-bottom: 1px solid var(--forge-border); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .apps-table-container td { padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--forge-border); vertical-align: middle; color: var(--forge-text-main); }
    .apps-table-container tr:last-child td { border-bottom: none; }
    .apps-table-container tr:hover td { background: var(--forge-bg-card-hover); }

    /* ==============================================================================
       4. Slide-Out App Inspector Drawer
       ============================================================================== */
    .app-drawer-backdrop { position: fixed; top: 48px; left: 0; right: 0; bottom: 0; width: 100vw; height: calc(100vh - 48px); background: transparent; z-index: 90; opacity: 0; pointer-events: none; transition: opacity 0.22s ease; }
    .app-drawer { position: fixed; top: 48px; right: 0; bottom: 0; width: min(94vw, 560px); height: calc(100vh - 48px); background: var(--forge-bg-surface); border-left: 1px solid var(--forge-border-medium); box-shadow: none; visibility: hidden; pointer-events: none; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s, box-shadow 0.25s; z-index: 95; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
    .app-drawer.open { transform: translateX(0); visibility: visible; pointer-events: auto; box-shadow: -16px 0 40px rgba(0, 0, 0, 0.8); }
    .app-drawer-resizer { position: absolute; left: 0; top: 0; bottom: 0; width: 8px; cursor: ew-resize; z-index: 50; }
    .app-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card); flex-shrink: 0; }
    .app-drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }

    /* ==============================================================================
       5. Interactive Sandboxed Iframe Preview Modal
       ============================================================================== */
    .sandbox-modal-container { display: flex; flex-direction: column; height: 85vh; max-height: 850px; }
    .sandbox-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: var(--forge-bg-elevated); border-bottom: 1px solid var(--forge-border); flex-wrap: wrap; }
    .sandbox-viewport-controls { display: flex; gap: 0.3rem; align-items: center; background: var(--forge-bg-card); padding: 0.2rem; border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); }
    .sandbox-vp-btn { padding: 0.2rem 0.55rem; border: none; background: transparent; color: var(--forge-text-muted); cursor: pointer; font-size: 0.72rem; font-weight: 600; border-radius: 3px; }
    .sandbox-vp-btn.active { background: var(--forge-bg-card-hover); color: var(--forge-primary); }
    .sandbox-frame-wrapper { flex: 1; background: var(--forge-bg-root); display: flex; justify-content: center; align-items: center; overflow: hidden; padding: 0.75rem; }
    .sandbox-iframe { width: 100%; height: 100%; border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius-sm); background: var(--forge-bg-surface); transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

    /* ==============================================================================
       6. Pixel-Perfect Astryx Form & Wizard Modal Styling (Enterprise SRE Baseline)
       ============================================================================== */
    .app-wizard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .app-wizard-full { grid-column: 1 / -1; }
    
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; width: 100%; box-sizing: border-box; }
    .form-label { font-size: 0.76rem; font-weight: 650; color: var(--forge-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; display: block; line-height: 1.2; }
    .form-label-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .required-star { color: var(--forge-accent); font-weight: 700; margin-left: 2px; }
    
    .astryx-micro-btn { background: var(--forge-bg-card-hover); border: 1px solid var(--forge-border); color: var(--forge-primary); font-size: 0.68rem; font-weight: 650; padding: 0.15rem 0.5rem; border-radius: var(--forge-radius-sm); cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 0.25rem; }
    .astryx-micro-btn:hover { border-color: var(--forge-primary); background: rgba(62, 207, 142, 0.12); color: var(--forge-primary-hover); }
    
    .font-mono { font-family: 'Geist Mono', ui-monospace, SFMono-Regular, monospace !important; }
    
    .app-options-section { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .app-options-title { font-size: 0.72rem; font-weight: 750; color: var(--forge-text-subtle); letter-spacing: 0.06em; text-transform: uppercase; }
    .app-options-list { display: flex; flex-direction: column; gap: 0.55rem; }
    
    .app-option-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.75rem 0.95rem; display: flex; align-items: center; gap: 0.85rem; cursor: pointer; transition: all 0.2s ease; user-select: none; }
    .app-option-card:hover { border-color: var(--forge-border-medium); background: var(--forge-bg-card-hover); }
    .app-option-card:has(input:checked) { border-color: rgba(62, 207, 142, 0.45); background: rgba(62, 207, 142, 0.04); }
    .app-option-checkbox { accent-color: var(--forge-primary); width: 16px; height: 16px; cursor: pointer; margin: 0; flex-shrink: 0; }
    .app-option-icon { font-size: 1.15rem; line-height: 1; flex-shrink: 0; }
    .app-option-text { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
    .app-option-title { font-size: 0.84rem; font-weight: 650; color: var(--forge-text-main); }
    .app-option-desc { font-size: 0.73rem; color: var(--forge-text-muted); line-height: 1.35; }
    .app-option-desc code { font-family: 'Geist Mono', monospace; font-size: 0.7rem; padding: 0.1rem 0.3rem; background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: 3px; color: var(--forge-primary); }
    
    .astryx-modal-footer { display: flex; justify-content: flex-end; align-items: center; gap: 0.65rem; padding-top: 1rem; border-top: 1px solid var(--forge-border); margin-top: 0.5rem; }
  `;
}
