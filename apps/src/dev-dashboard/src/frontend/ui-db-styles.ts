/**
 * @forge/dev-dashboard - Database Studio Styles (2026 LTS)
 * High-density layout, telemetry grid, dynamic query chips, and visual ER schema graph.
  * @requirements [HLR-SDK-302] [LLR-DB-001]
 */

export function getDbStudioStyles(): string {
  return `
    /* Table Browser & Schema Drawer */
    .schema-code-box { background: var(--forge-bg-elevated); padding: 0.75rem; border-radius: var(--forge-radius-sm); border: 1px solid var(--forge-border); font-family: monospace; font-size: 0.78rem; color: var(--forge-text-main); overflow-x: auto; white-space: pre-wrap; }

    /* Unified Database Studio Layout (Developer POV / Full-Screen IDE) */
    .db-studio-layout { display: grid; grid-template-columns: 240px 1fr; gap: 0.85rem; align-items: stretch; min-height: 520px; }
    @media (max-width: 1024px) { .db-studio-layout { grid-template-columns: 1fr; } }
    .db-studio-sidebar { display: flex; flex-direction: column; gap: 0.65rem; min-width: 0; }
    .db-studio-main { display: flex; flex-direction: column; gap: 0.65rem; min-width: 0; }
    .db-studio-fullscreen { position: fixed; inset: 0; z-index: 500; background: var(--forge-bg-surface); padding: 0.85rem; overflow: auto; display: flex; flex-direction: column; }
    .db-subtab-bar { display: flex; gap: 0.35rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.45rem; margin-bottom: 0.65rem; }
    .db-subtab-btn { padding: 0.3rem 0.75rem; border-radius: var(--forge-radius-sm); font-size: 0.8rem; font-weight: 600; border: 1px solid var(--forge-border); background: var(--forge-bg-card); color: var(--forge-text-muted); cursor: pointer; transition: var(--forge-transition); }
    .db-subtab-btn:hover { color: var(--forge-text-main); border-color: var(--forge-border-medium); }
    .db-subtab-btn.active { background: var(--forge-bg-card-hover); color: var(--forge-primary); border-color: var(--forge-primary); box-shadow: 0 0 8px rgba(62, 207, 142, 0.15); }
    .db-table-item { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.6rem; border-radius: var(--forge-radius-sm); cursor: pointer; border: 1px solid transparent; transition: var(--forge-transition); font-size: 0.8rem; }
    .db-table-item:hover { background: var(--forge-bg-card-hover); border-color: var(--forge-border); }
    .db-table-item.active { background: rgba(62, 207, 142, 0.1); border-color: var(--forge-primary); color: var(--forge-primary); font-weight: 600; }

    /* DB Live Telemetry Bar & Metrics */
    .db-telemetry-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.45rem; margin-top: 0.65rem; padding-top: 0.65rem; border-top: 1px solid var(--forge-border); }
    .db-metric-chip { background: var(--forge-bg-elevated); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.4rem 0.6rem; display: flex; flex-direction: column; gap: 0.1rem; }
    .db-metric-val { font-size: 0.92rem; font-weight: 700; color: var(--forge-text-main); font-family: monospace; }
    .db-metric-lbl { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--forge-text-muted); }
    .db-perf-badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; font-family: monospace; padding: 0.15rem 0.45rem; border-radius: var(--forge-radius-full); font-weight: 600; }
    .db-perf-fast { background: rgba(62, 207, 142, 0.15); color: var(--forge-primary); border: 1px solid var(--forge-primary); }
    .db-perf-med { background: rgba(245, 166, 35, 0.15); color: var(--forge-accent); border: 1px solid var(--forge-border); }
    .db-perf-slow { background: rgba(255, 77, 79, 0.15); color: var(--forge-accent); border: 1px solid var(--forge-border); }

    /* Dynamic Query Chips & Resizable Data Grid */
    .db-query-chip { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-full); padding: 0.2rem 0.6rem; font-size: 0.72rem; color: var(--forge-text-muted); cursor: pointer; transition: var(--forge-transition); display: inline-flex; align-items: center; gap: 0.25rem; font-family: monospace; }
    .db-query-chip:hover { border-color: var(--forge-primary); color: var(--forge-primary); background: rgba(62,207,142,0.08); }
    .col-resizable-th { position: relative; user-select: none; }
    .col-resizer { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; cursor: col-resize; z-index: 20; background: transparent; transition: background 0.15s; }
    .col-resizer:hover, .col-resizer.resizing { background: var(--forge-primary); }
    .cell-null { font-style: italic; color: var(--forge-text-muted); opacity: 0.6; font-size: 0.74rem; }
    .cell-pk { color: var(--forge-primary); margin-right: 0.25rem; font-size: 0.75rem; }
    .cell-row-num { color: var(--forge-text-muted); font-size: 0.7rem; text-align: center; width: 34px; background: rgba(255,255,255,0.02); font-family: monospace; }
    .cell-copyable { cursor: pointer; transition: background 0.12s ease; font-family: monospace; font-size: 0.8rem; }
    .cell-copyable:hover { background: rgba(62, 207, 142, 0.12); color: var(--forge-primary); }

    /* Visual ER Schema Relationship Graph */
    .db-er-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.85rem; padding: 0.4rem 0; }
    .db-er-card { background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: var(--forge-transition); }
    .db-er-card:hover { border-color: var(--forge-primary); }
    .db-er-header { background: var(--forge-bg-elevated); padding: 0.45rem 0.65rem; border-bottom: 1px solid var(--forge-border); display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 0.82rem; }
    .db-er-cols { padding: 0.35rem 0.45rem; display: flex; flex-direction: column; gap: 0.15rem; max-height: 240px; overflow-y: auto; font-size: 0.74rem; }
    .db-er-col { display: flex; justify-content: space-between; align-items: center; padding: 0.15rem 0.3rem; border-radius: var(--forge-radius-xs); }
    .db-er-col:hover { background: var(--forge-bg-elevated); }
    .db-er-pk { color: var(--forge-primary); font-weight: 700; }
    .db-er-fk { color: var(--forge-accent); font-weight: 600; }
    .db-er-edge-badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.68rem; background: rgba(62, 207, 142, 0.08); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-xs); padding: 0.15rem 0.35rem; color: var(--forge-text-main); margin-top: 0.2rem; }
  `;
}
