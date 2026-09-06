/**
 * @forge/dev-dashboard - Astryx Styles for Employee Studio & Org Chart (2026 LTS)
 * Design Tokens & Glassmorphic Components compliant with Astryx Standards.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getEmployeeStyles(): string {
  return `
    /* Ultra-Premium Glassmorphic Statistics Cards */
    .emp-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.85rem; margin-top: 1rem; }
    .emp-stat-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 1rem; display: flex; align-items: center; gap: 0.85rem; box-shadow: var(--forge-shadow-card); transition: var(--forge-transition); position: relative; overflow: hidden; }
    .emp-stat-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--forge-primary), var(--forge-accent)); opacity: 0.7; }
    .emp-stat-card:hover { border-color: var(--forge-border-medium); box-shadow: var(--forge-shadow-hover); }
    .emp-stat-icon { width: 38px; height: 38px; border-radius: var(--forge-radius-sm); background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0; color: var(--forge-primary); }
    .emp-stat-info { display: flex; flex-direction: column; }
    .emp-stat-val { font-size: 1.35rem; font-weight: 800; color: var(--forge-text-main); line-height: 1.1; letter-spacing: -0.02em; }
    .emp-stat-lbl { font-size: 0.72rem; color: var(--forge-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.2rem; }

    /* Horizontal 3-Tab Segmented Slider Navigation */
    .emp-subtab-slider-wrap { margin-top: 1rem; border-top: 1px solid var(--forge-border); padding-top: 0.85rem; }
    .emp-subtab-bar { display: inline-flex; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.25rem; gap: 0.25rem; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
    .emp-subtab-bar::-webkit-scrollbar { display: none; }
    .emp-subtab-btn { border: none; background: transparent; color: var(--forge-text-muted); font-size: 0.78rem; font-weight: 600; padding: 0.42rem 1.1rem; border-radius: var(--forge-radius-full); cursor: pointer; transition: var(--forge-transition); display: inline-flex; align-items: center; gap: 0.45rem; white-space: nowrap; outline: none; }
    .emp-subtab-btn:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .emp-subtab-btn.active { background: var(--forge-bg-card); color: var(--forge-primary); border: 1px solid var(--forge-border-medium); box-shadow: var(--forge-shadow-card); }
    .emp-subtab-icon { display: flex; align-items: center; font-size: 0.9rem; }
    .emp-tab-badge { font-size: 0.68rem; font-weight: 700; background: var(--forge-bg-elevated); color: var(--forge-text-main); padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); border: 1px solid var(--forge-border); margin-left: 0.15rem; }
    .emp-subtab-btn.active .emp-tab-badge { background: var(--forge-primary-bg); color: var(--forge-primary); border-color: var(--forge-border-medium); }

    /* Subtab Panes */
    .emp-subtab-pane { animation: fadeIn 0.16s ease-in-out; }

    /* Overview Hub Grid & Cards */
    .emp-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1rem; }
    .emp-hub-card { display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
    .emp-hub-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--forge-primary), transparent); opacity: 0.6; }
    .emp-hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
    .emp-export-box { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.85rem; }
    .emp-dept-pill-list { display: flex; flex-wrap: wrap; gap: 0.4rem; max-height: 120px; overflow-y: auto; scrollbar-width: thin; }
    .emp-dept-chip { background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.2rem 0.6rem; font-size: 0.72rem; color: var(--forge-text-main); display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: var(--forge-transition); }
    .emp-dept-chip:hover { border-color: var(--forge-primary); color: var(--forge-primary); }
    .emp-dept-chip-count { font-size: 0.68rem; font-weight: 700; background: var(--forge-bg-card); color: var(--forge-text-muted); padding: 0.05rem 0.35rem; border-radius: var(--forge-radius-full); }

    /* Integrated Enterprise Table Footer */
    .emp-table-footer {
      display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1rem;
      border-top: 1px solid var(--forge-border); background: var(--forge-bg-card); flex-wrap: wrap; gap: 0.75rem;
    }
    .emp-footer-metrics { font-size: 0.76rem; color: var(--forge-text-muted); font-weight: 500; font-family: monospace; }
    .emp-footer-center { display: flex; align-items: center; gap: 0.5rem; }
    .emp-footer-pagination { display: flex; align-items: center; gap: 0.4rem; }
    .emp-table-keyboard-hints {
      display: flex; gap: 1.25rem; font-size: 0.72rem; color: var(--forge-text-subtle);
      padding: 0.5rem 0.25rem 0; margin-top: 0.35rem; flex-wrap: wrap;
    }
    .emp-table-keyboard-hints kbd {
      font-family: monospace; font-size: 0.68rem; background: var(--forge-bg-elevated);
      border: 1px solid var(--forge-border); padding: 0.05rem 0.35rem; border-radius: 3px; color: var(--forge-text-main);
    }

    /* Floating Batch Action Toolbar */
    .emp-batch-bar {
      position: fixed; bottom: 2rem; left: 50%;
      transform: translateX(-50%) translateY(160%) scale(0.96); opacity: 0; pointer-events: none;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-full); padding: 0.45rem 0.75rem 0.45rem 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: var(--forge-shadow-hover), 0 0 0 1px var(--forge-border);
      backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
      z-index: 900; transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .emp-batch-bar.show { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; pointer-events: auto; }
    .emp-batch-label { font-size: 0.78rem; font-weight: 700; color: var(--forge-text-main); display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
    .emp-batch-actions-group { display: flex; align-items: center; gap: 0.4rem; }
    .emp-batch-btn { padding: 0.3rem 0.65rem !important; font-size: 0.74rem !important; border-radius: var(--forge-radius-full) !important; }
    .emp-batch-close-btn {
      background: transparent; border: none; color: var(--forge-text-muted);
      cursor: pointer; font-size: 1.2rem; line-height: 1; padding: 0.2rem 0.4rem;
      border-radius: 50%; transition: color 0.15s ease;
    }
    .emp-batch-close-btn:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }

    /* Status Pulse Dots */
    .status-pulse-dot { width: 7px; height: 7px; border-radius: var(--forge-radius-full); display: inline-block; flex-shrink: 0; }
    .status-pulse-dot.active { background: var(--forge-success); box-shadow: 0 0 6px var(--forge-success); }
    .status-pulse-dot.invited { background: var(--forge-accent); box-shadow: 0 0 6px var(--forge-accent); }
    .status-pulse-dot.suspended { background: var(--forge-text-muted); }

    /* Interactive Org Chart Canvas & Zoom Toolbar */
    .org-chart-wrapper { position: relative; width: 100%; height: calc(100vh - 200px); min-height: 400px; max-height: calc(100vh - 200px); overflow: hidden; background: radial-gradient(var(--forge-border) 1px, transparent 1px); background-size: 20px 20px; background-color: var(--forge-bg-surface); border-radius: var(--forge-radius-md); border: 1px solid var(--forge-border); user-select: none; cursor: default; display: flex; justify-content: center; align-items: flex-start; }
    .org-chart-wrapper.panning { cursor: default; }
    .org-chart-canvas { position: absolute; top: 0; left: 0; right: 0; min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem 4rem; transform-origin: top center; transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1); width: 100%; max-width: 100%; box-sizing: border-box; }
    
    /* Floating Zoom & Pan Toolbar */
    .org-floating-controls { position: absolute; bottom: 1.25rem; right: 1.25rem; display: flex; align-items: center; gap: 0.35rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius-full); padding: 0.3rem 0.5rem; box-shadow: var(--forge-shadow-hover); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); z-index: 100; }
    .org-zoom-btn { background: transparent; border: 1px solid transparent; color: var(--forge-text-main); font-size: 0.85rem; width: 28px; height: 28px; border-radius: var(--forge-radius-full); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--forge-transition); font-weight: 700; outline: none; }
    .org-zoom-btn:hover { background: var(--forge-bg-card-hover); border-color: var(--forge-border); color: var(--forge-primary); }
    .org-zoom-level { font-size: 0.72rem; font-weight: 700; font-family: monospace; color: var(--forge-text-main); padding: 0 0.35rem; min-width: 42px; text-align: center; }

    /* Top Breadcrumbs & Search Toolbar */
    .org-tree-toolbar { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; padding: 0.55rem 0.85rem; background: var(--forge-bg-card); border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); flex-wrap: wrap; gap: 0.65rem; }
    .org-tree-breadcrumbs { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--forge-text-muted); flex-wrap: wrap; flex: 1; min-width: 220px; }
    .org-tree-breadcrumb-item { cursor: pointer; color: var(--forge-primary); font-weight: 600; transition: var(--forge-transition); }
    .org-tree-breadcrumb-item:hover { text-decoration: underline; }
    .org-tree-breadcrumb-current { color: var(--forge-text-main); font-weight: 700; }
    .org-search-wrap { position: relative; display: flex; align-items: center; gap: 0.4rem; }
    .org-search-input-box { display: flex; align-items: center; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.15rem 0.55rem; gap: 0.35rem; transition: var(--forge-transition); width: 230px; }
    .org-search-input-box:focus-within { border-color: var(--forge-primary); box-shadow: 0 0 0 2px var(--forge-primary-bg); }
    .org-search-input { background: transparent; border: none; outline: none; font-size: 0.76rem; color: var(--forge-text-main); width: 100%; }
    .org-search-dropdown { position: absolute; top: calc(100% + 6px); right: 0; width: 300px; max-height: 280px; overflow-y: auto; background: var(--forge-bg-surface); border: 1px solid var(--forge-border-medium); border-radius: var(--forge-radius-md); box-shadow: var(--forge-shadow-hover), 0 8px 30px rgba(0,0,0,0.25); z-index: 1200; display: flex; flex-direction: column; padding: 0.35rem; scrollbar-width: thin; backdrop-filter: blur(16px); }
    .org-search-item { display: flex; align-items: center; gap: 0.65rem; padding: 0.45rem 0.65rem; border-radius: var(--forge-radius-sm); cursor: pointer; transition: var(--forge-transition); }
    .org-search-item:hover { background: var(--forge-bg-card-hover); }
    .org-search-item-info { flex: 1; min-width: 0; }
    .org-search-item-name { font-size: 0.82rem; font-weight: 700; color: var(--forge-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .org-search-item-role { font-size: 0.7rem; color: var(--forge-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Small Navigation Buttons (Upward Manager & Peer Traversal) */
    .org-tree-up-nav-btn { background: var(--forge-bg-elevated); border: 1px dashed var(--forge-border-medium); border-radius: var(--forge-radius-full); padding: 0.28rem 0.85rem; font-size: 0.74rem; font-weight: 600; color: var(--forge-primary); display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; transition: var(--forge-transition); box-shadow: var(--forge-shadow-card); margin-bottom: 0.35rem; }
    .org-tree-up-nav-btn:hover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); box-shadow: var(--forge-shadow-hover); }
    
    /* Manager Node Card */
    .org-tree-manager-node { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-md); padding: 0.75rem 1.1rem; width: min(92vw, 380px); min-width: 260px; display: flex; align-items: center; gap: 0.85rem; cursor: pointer; transition: var(--forge-transition); box-shadow: var(--forge-shadow-card); position: relative; }
    .org-tree-manager-node:hover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); box-shadow: var(--forge-shadow-hover); }
    .org-tree-connector-vertical { width: 2px; height: 26px; background: linear-gradient(180deg, var(--forge-border-medium), var(--forge-primary)); margin: 0 auto; position: relative; }
    .org-tree-connector-vertical::after { content: ""; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: var(--forge-primary); }

    /* Focused Hero Person Card (Center of Org View) */
    .org-tree-hero-card { background: var(--forge-bg-surface); border: 2px solid var(--forge-primary); border-radius: var(--forge-radius-md); padding: 1.1rem 1.35rem; width: min(92vw, 480px); min-width: 280px; box-shadow: 0 6px 24px var(--forge-primary-bg), var(--forge-shadow-card); position: relative; transition: var(--forge-transition); }
    .org-tree-hero-header { display: flex; align-items: flex-start; gap: 1rem; }
    .org-tree-hero-avatar-wrap { position: relative; flex-shrink: 0; }
    .org-tree-hero-avatar { width: 52px; height: 52px; border-radius: var(--forge-radius-full); background: linear-gradient(135deg, var(--forge-primary), var(--forge-accent)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; color: var(--forge-text-contrast) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2px solid var(--forge-bg-surface); }
    .org-tree-hero-status-dot { position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--forge-bg-surface); }
    .org-tree-hero-name { font-size: 1.1rem; font-weight: 800; color: var(--forge-text-main); letter-spacing: -0.01em; margin-bottom: 0.15rem; }
    .org-tree-hero-title { font-size: 0.85rem; color: var(--forge-text-muted); font-weight: 500; }
    .org-tree-hero-meta { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.55rem; font-size: 0.74rem; color: var(--forge-text-muted); }
    .org-tree-hero-meta span { display: flex; align-items: center; gap: 0.4rem; }
    .org-tree-hero-meta code { font-family: inherit; font-size: inherit; color: var(--forge-text-main); background: var(--forge-bg-elevated); padding: 0.1rem 0.35rem; border-radius: 3px; border: 1px solid var(--forge-border); }
    .org-tree-hero-actions { display: flex; gap: 0.45rem; margin-top: 0.75rem; padding-top: 0.65rem; border-top: 1px solid var(--forge-border); justify-content: flex-end; flex-wrap: wrap; }

    /* Direct Reports Branch & Grid */
    .org-tree-reports-section { width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 0.25rem; }
    .org-tree-branch-header { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--forge-primary); background: var(--forge-bg-card); padding: 0.28rem 0.85rem; border-radius: var(--forge-radius-full); border: 1px solid var(--forge-border); margin-bottom: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; }
    .org-tree-reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; width: 100%; max-width: 1050px; justify-content: center; }
    .org-tree-report-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-md); padding: 0.8rem 0.95rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.6rem; transition: var(--forge-transition); box-shadow: var(--forge-shadow-card); cursor: pointer; position: relative; min-width: 200px; }
    .org-tree-report-card:hover { border-color: var(--forge-primary); box-shadow: var(--forge-shadow-hover); background: var(--forge-bg-card-hover); }
    .org-tree-report-header { display: flex; align-items: center; gap: 0.75rem; }
    .org-tree-report-name { font-size: 0.88rem; font-weight: 700; color: var(--forge-text-main); }
    .org-tree-report-title { font-size: 0.74rem; color: var(--forge-text-muted); }
    .org-tree-report-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--forge-border); font-size: 0.72rem; }

    /* Modal Scoped Hierarchy Specifics */
    .org-tree-modal-chain { display: flex; flex-direction: column; align-items: center; width: 100%; gap: 0; }
    .org-tree-modal-step { display: flex; flex-direction: column; align-items: center; width: 100%; }
    .org-tree-modal-person-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-md); padding: 0.85rem 1.15rem; width: min(100%, 420px); display: flex; align-items: center; gap: 0.85rem; box-shadow: var(--forge-shadow-card); cursor: pointer; transition: var(--forge-transition); position: relative; }
    .org-tree-modal-person-card:hover { border-color: var(--forge-primary); box-shadow: var(--forge-shadow-hover); background: var(--forge-bg-card-hover); }
    .org-tree-modal-level-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--forge-primary); background: var(--forge-bg-elevated); padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full); border: 1px solid var(--forge-border); display: inline-block; margin-bottom: 0.2rem; }
    .org-tree-modal-connector { display: flex; flex-direction: column; align-items: center; height: 26px; justify-content: center; color: var(--forge-text-muted); font-size: 0.8rem; }
    .org-tree-modal-connector-line { width: 2px; height: 100%; background: linear-gradient(180deg, var(--forge-primary), var(--forge-border-medium)); }
    .org-tree-modal-hero { background: var(--forge-bg-surface); border: 2px solid var(--forge-primary); border-radius: var(--forge-radius-md); padding: 1.1rem 1.35rem; width: min(100%, 460px); box-shadow: 0 6px 20px var(--forge-primary-bg); position: relative; }
    .org-tree-modal-reports-container { width: 100%; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--forge-border); }
    .org-tree-modal-reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.65rem; width: 100%; margin-top: 0.65rem; }
    .org-tree-modal-report-item { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.65rem 0.85rem; display: flex; align-items: center; gap: 0.65rem; cursor: pointer; transition: var(--forge-transition); }
    .org-tree-modal-report-item:hover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); }

    /* Slide-Over Employee Detail Drawer */
    .emp-drawer-backdrop { position: fixed; top: 48px; left: 0; right: 0; bottom: 0; width: 100vw; height: calc(100vh - 48px); background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; z-index: 90; opacity: 0; pointer-events: none; transition: opacity 0.22s ease; }
    .emp-drawer { position: fixed; top: 48px; right: 0; bottom: 0; width: min(94vw, 560px); height: calc(100vh - 48px); background: var(--forge-bg-surface); border-left: 1px solid var(--forge-border-medium); box-shadow: none; visibility: hidden; pointer-events: none; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s, box-shadow 0.25s; z-index: 95; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
    .emp-drawer.open { transform: translateX(0); visibility: visible; pointer-events: auto; box-shadow: -16px 0 40px rgba(0, 0, 0, 0.35); }
    .emp-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card); flex-shrink: 0; }
    .emp-drawer-tabs { display: flex; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card); padding: 0 1.25rem; gap: 0.5rem; flex-shrink: 0; }
    .emp-tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--forge-text-muted); font-size: 0.78rem; font-weight: 600; padding: 0.6rem 0.5rem; cursor: pointer; transition: var(--forge-transition); outline: none; }
    .emp-tab-btn:hover { color: var(--forge-text-main); }
    .emp-tab-btn.active { color: var(--forge-primary); border-bottom-color: var(--forge-primary); }
    .emp-drawer-body { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent; }

    /* Avatar, Pills & Dropzone */
    .emp-avatar { width: 32px; height: 32px; border-radius: var(--forge-radius-full); background: linear-gradient(135deg, var(--forge-primary), var(--forge-accent)); color: var(--forge-text-contrast) !important; font-weight: 700; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .emp-mgr-pill { background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.15rem 0.5rem; font-size: 0.72rem; color: var(--forge-text-main); cursor: pointer; transition: var(--forge-transition); }
    .emp-mgr-pill:hover { border-color: var(--forge-primary); color: var(--forge-primary); }
    .import-dropzone { border: 2px dashed var(--forge-border-medium); border-radius: var(--forge-radius-md); padding: 2.5rem 1.5rem; text-align: center; background: var(--forge-bg-card); transition: var(--forge-transition); cursor: pointer; }
    .import-dropzone:hover, .import-dropzone.dragover { border-color: var(--forge-primary); background: var(--forge-bg-card-hover); }

    /* Fluid Responsiveness (Down to 320px Mobile) */
    @media (max-width: 768px) {
      .emp-stats-grid { grid-template-columns: repeat(2, 1fr); }
      .emp-overview-grid { grid-template-columns: 1fr; }
      .org-tree-toolbar { flex-direction: column; align-items: stretch; }
      .org-tree-hero-card { width: 100%; padding: 1rem; }
      .org-tree-manager-node { width: 100%; }
      .org-tree-reports-grid { grid-template-columns: 1fr; }
      .org-chart-wrapper { min-height: 440px; height: 60vh; }
    }
    @media (max-width: 480px) {
      .emp-stats-grid { grid-template-columns: 1fr; }
      .emp-subtab-bar { width: 100%; display: flex; justify-content: space-between; padding: 0.2rem; }
      .emp-subtab-btn { padding: 0.35rem 0.6rem; font-size: 0.72rem; }
      .org-tree-hero-header { flex-direction: column; }
      .org-tree-hero-actions { flex-direction: column; align-items: stretch; }
      .org-tree-hero-actions button { width: 100%; justify-content: center; }
      .org-floating-controls { bottom: 0.75rem; right: 0.75rem; scale: 0.9; }
    }
  `;
}
