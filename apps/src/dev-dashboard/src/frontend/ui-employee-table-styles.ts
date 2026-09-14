/**
 * @forge/dev-dashboard - Astryx Employee Directory Table & Fullscreen Styles (2026 LTS)
 * Premium Glassmorphic Table — Redesigned for Fluid Responsiveness, Visual Hierarchy,
 * and Zero Browser Defaults. Single-page, no horizontal overflow.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getEmployeeTableStyles(): string {
  return `
    /* ============================================================
       Table Container & Fullscreen Canvas
    ============================================================ */
    .emp-table-container {
      display: flex; flex-direction: column; gap: 0.75rem;
      position: relative;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .emp-table-container.emp-table-fullscreen {
      position: fixed; top: 48px; left: 56px; right: 0; bottom: 0;
      width: calc(100vw - 56px); height: calc(100vh - 48px);
      z-index: 45; background: var(--forge-bg-root);
      padding: 0.85rem 1.25rem 0.65rem; box-sizing: border-box;
      overflow: hidden; display: flex; flex-direction: column;
    }

    /* ============================================================
       Fullscreen HUD Notification Banner
    ============================================================ */
    .emp-fullscreen-hud {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.45rem 0.85rem;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-sm); box-shadow: var(--forge-shadow-card);
      animation: fadeIn 0.18s ease-out; flex-shrink: 0;
    }
    .emp-fullscreen-hud-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; }
    .emp-fullscreen-hud-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--forge-primary); box-shadow: 0 0 8px var(--forge-primary);
    }
    .emp-fullscreen-hud-title { font-weight: 700; color: var(--forge-text-main); }
    .emp-fullscreen-hud-hint { color: var(--forge-text-muted); font-size: 0.72rem; }
    .emp-fullscreen-hud-hint kbd {
      background: var(--forge-bg-elevated); border: 1px solid var(--forge-border);
      padding: 0.05rem 0.3rem; border-radius: 3px;
      color: var(--forge-text-main); font-family: monospace; font-size: 0.68rem;
    }
    .emp-fullscreen-hud-btn { padding: 0.22rem 0.6rem !important; font-size: 0.74rem !important; }

    /* ============================================================
       Directory Toolbar — card-style container for visual separation
    ============================================================ */
    .emp-table-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 0.6rem; flex-shrink: 0;
      padding: 0.6rem 0.85rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      box-shadow: var(--forge-shadow-card);
    }
    .emp-toolbar-left {
      display: flex; align-items: center; flex-wrap: wrap;
      gap: 0.45rem; flex: 1; min-width: 0;
    }
    .emp-toolbar-right { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }

    /* Search box — full pill with focus ring */
    .emp-search-box {
      position: relative; display: flex; align-items: center;
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-full);
      padding: 0 0.65rem; height: 34px;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      min-width: 200px; max-width: 300px; flex: 1;
    }
    .emp-search-box:focus-within {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 3px var(--forge-primary-bg);
    }
    .emp-search-icon {
      display: flex; align-items: center; color: var(--forge-text-muted);
      flex-shrink: 0; margin-right: 0.35rem;
    }
    .emp-search-box input[type="search"] {
      background: transparent; border: none; outline: none;
      font-size: 0.8rem; color: var(--forge-text-main);
      width: 100%; height: 100%; -webkit-appearance: none;
    }
    .emp-search-box input[type="search"]::placeholder { color: var(--forge-text-muted); }
    .emp-search-clear-btn {
      position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
      background: transparent; border: none; color: var(--forge-text-muted);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      padding: 2px; border-radius: 50%; flex-shrink: 0;
      transition: color 0.15s ease;
    }
    .emp-search-clear-btn:hover { color: var(--forge-text-main); }

    /* Dept select — custom styled, appearance: none, no browser defaults */
    .emp-dept-select {
      height: 34px; padding: 0 2rem 0 0.75rem;
      background: var(--forge-bg-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 0.55rem center;
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-full);
      color: var(--forge-text-main); font-size: 0.78rem; font-weight: 500;
      cursor: pointer; appearance: none; -webkit-appearance: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      max-width: 185px;
    }
    .emp-dept-select:focus {
      outline: none; border-color: var(--forge-primary);
      box-shadow: 0 0 0 3px var(--forge-primary-bg);
    }
    .emp-dept-select:hover { border-color: var(--forge-border-medium); }

    /* Filter chip pill-group */
    .emp-status-chips {
      display: inline-flex; align-items: center; gap: 0.2rem;
      background: var(--forge-bg-surface); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-full); padding: 0.18rem;
    }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.22rem 0.7rem; border-radius: var(--forge-radius-full);
      background: transparent; border: none;
      font-size: 0.74rem; font-weight: 600; cursor: pointer;
      color: var(--forge-text-muted);
      transition: background 0.16s ease, color 0.16s ease; white-space: nowrap;
    }
    .filter-chip:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .filter-chip.active {
      background: var(--forge-bg-card); color: var(--forge-text-main);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px var(--forge-border-medium);
    }

    /* Toolbar metrics + btn icons */
    .emp-toolbar-metrics { display: flex; align-items: center; }
    .emp-metric-pill {
      font-size: 0.72rem; font-weight: 700; font-family: monospace;
      padding: 0.22rem 0.6rem;
      background: var(--forge-primary-bg); border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-full); color: var(--forge-primary);
    }
    .emp-btn-icon { display: inline-flex; align-items: center; justify-content: center; }
    .emp-btn-fullscreen-toggle {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.78rem; font-weight: 600;
    }

    /* ============================================================
       Glassmorphic Data Table Card
    ============================================================ */
    .emp-table-card {
      padding: 0 !important; overflow: hidden;
      display: flex; flex-direction: column; flex: 1; min-height: 340px;
      background: var(--forge-bg-card); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm); box-shadow: var(--forge-shadow-card);
    }
    .emp-table-container.emp-table-fullscreen .emp-table-card { min-height: 0; flex: 1; height: 100%; }
    .emp-table-scroll-wrap {
      flex: 1; overflow-y: auto; overflow-x: auto;
      scrollbar-width: thin; scrollbar-color: var(--forge-border-medium) transparent;
      min-height: 260px;
    }
    .emp-table-scroll-wrap::-webkit-scrollbar { width: 5px; height: 5px; }
    .emp-table-scroll-wrap::-webkit-scrollbar-thumb { background: var(--forge-border-medium); border-radius: 99px; }
    .emp-table-scroll-wrap::-webkit-scrollbar-track { background: transparent; }

    /* ============================================================
       Table Core — sticky header, alternating rows, fixed-layout
    ============================================================ */
    .emp-modern-table {
      width: 100%; border-collapse: separate; border-spacing: 0;
      margin: 0 !important; font-size: 0.82rem; table-layout: fixed;
    }

    /* Sticky header */
    .emp-modern-table thead th {
      position: sticky; top: 0; z-index: 10;
      background: var(--forge-bg-surface);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      border-bottom: 1.5px solid var(--forge-border-medium);
      padding: 0.65rem 0.8rem;
      font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--forge-text-muted); white-space: nowrap; user-select: none;
    }
    .emp-sortable-th { cursor: pointer; transition: color 0.15s ease; }
    .emp-sortable-th:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); }
    .emp-th-inner { display: inline-flex; align-items: center; gap: 0.3rem; }
    .emp-sort-indicator {
      display: inline-flex; align-items: center;
      color: var(--forge-text-subtle); transition: color 0.15s ease; opacity: 0.5;
    }
    .emp-sort-indicator.active { color: var(--forge-primary); opacity: 1; }

    /* Row Styling — alternating bg + hover */
    .emp-row { transition: background 0.12s ease; cursor: pointer; }
    .emp-row:nth-child(even) { background: var(--forge-bg-surface); }
    .emp-row:hover { background: var(--forge-bg-card-hover) !important; }

    /* Cells */
    .emp-modern-table tbody td {
      padding: 0.6rem 0.8rem;
      border-bottom: 1px solid var(--forge-border);
      vertical-align: middle; overflow: hidden;
    }
    .emp-modern-table tbody tr:last-child td { border-bottom: none; }

    /* Checkbox column */
    .emp-cell-checkbox { width: 38px; text-align: center; padding: 0 !important; }
    .emp-checkbox { width: 15px; height: 15px; cursor: pointer; accent-color: var(--forge-primary); }

    /* Identity cell */
    .emp-identity-wrap { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
    .emp-avatar-wrap { position: relative; flex-shrink: 0; }
    .emp-avatar-beacon {
      position: absolute; bottom: -1px; right: -1px;
      width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--forge-bg-card);
    }
    .emp-avatar-beacon.active { background: var(--forge-success); }
    .emp-avatar-beacon.invited { background: var(--forge-accent); }
    .emp-avatar-beacon.suspended { background: var(--forge-text-muted); }
    .emp-identity-info { display: flex; flex-direction: column; gap: 0.08rem; min-width: 0; flex: 1; }
    .emp-name-text {
      font-weight: 600; font-size: 0.83rem; color: var(--forge-text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
    }
    .emp-email-row { display: flex; align-items: center; gap: 0.3rem; min-width: 0; }
    .emp-email-text {
      font-family: monospace; font-size: 0.70rem; color: var(--forge-text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;
    }
    .emp-copy-email-btn {
      background: transparent; border: none; color: var(--forge-text-subtle);
      cursor: pointer; display: inline-flex; align-items: center;
      padding: 2px; opacity: 0; flex-shrink: 0;
      transition: opacity 0.15s ease, color 0.15s ease; border-radius: 3px;
    }
    .emp-row:hover .emp-copy-email-btn { opacity: 0.7; }
    .emp-copy-email-btn:hover { opacity: 1 !important; color: var(--forge-primary); }

    /* Department cell */
    .emp-dept-cell { display: flex; flex-direction: column; gap: 0.08rem; min-width: 0; }
    .emp-dept-name {
      font-weight: 600; font-size: 0.8rem; color: var(--forge-text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .emp-dept-path {
      font-size: 0.67rem; color: var(--forge-text-muted); font-family: monospace;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .emp-unassigned { color: var(--forge-text-muted); font-style: italic; }

    /* Job cell */
    .emp-job-cell { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .emp-job-title {
      font-size: 0.79rem; color: var(--forge-text-main);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .emp-code-pill {
      display: inline-block; font-family: monospace; font-size: 0.64rem;
      color: var(--forge-primary); background: var(--forge-primary-bg);
      border: 1px solid var(--forge-border-medium);
      border-radius: 4px; padding: 0.05rem 0.35rem; width: fit-content;
      font-weight: 700; letter-spacing: 0.02em;
    }

    /* Manager cell */
    .emp-mgr-pill {
      display: inline-flex; align-items: center; gap: 0.35rem;
      background: var(--forge-bg-elevated); border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-full);
      padding: 0.18rem 0.55rem; font-size: 0.72rem;
      color: var(--forge-text-main); cursor: pointer; transition: var(--forge-transition);
      max-width: 100%; overflow: hidden;
    }
    .emp-mgr-pill:hover { border-color: var(--forge-primary); color: var(--forge-primary); background: var(--forge-primary-bg); }
    .emp-mgr-pill > span:last-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .emp-mgr-icon { display: flex; align-items: center; color: var(--forge-primary); flex-shrink: 0; }
    .emp-no-mgr { font-size: 0.71rem; color: var(--forge-text-muted); font-style: italic; }

    /* IAM Roles cell */
    .emp-roles-cell { display: flex; flex-wrap: wrap; gap: 0.22rem; }
    .emp-role-badge { font-size: 0.66rem !important; padding: 0.08rem 0.38rem !important; }
    .emp-role-badge.role-super {
      background: var(--forge-bg-card-hover) !important;
      color: var(--forge-accent) !important;
      border-color: var(--forge-border-medium) !important;
    }

    /* ============================================================
       Status Badges — pill-style, high-contrast
    ============================================================ */
    .emp-status-badge {
      display: inline-flex; align-items: center; gap: 0.32rem;
      font-size: 0.63rem; font-weight: 800; padding: 0.18rem 0.55rem;
      border-radius: var(--forge-radius-full); border: 1px solid;
      text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap;
    }
    .emp-status-badge.active {
      background: var(--forge-success-bg); color: var(--forge-success);
      border-color: var(--forge-border-medium);
    }
    .emp-status-badge.invited {
      background: var(--forge-bg-elevated); color: var(--forge-accent);
      border-color: var(--forge-border);
    }
    .emp-status-badge.suspended {
      background: var(--forge-bg-elevated); color: var(--forge-text-muted);
      border-color: var(--forge-border);
    }

    /* ============================================================
       Row Actions — visible on hover only
    ============================================================ */
    .emp-cell-actions { text-align: right; padding-right: 0.65rem !important; }
    .emp-actions-group {
      display: inline-flex; align-items: center; gap: 0.25rem;
      justify-content: flex-end; opacity: 0; transition: opacity 0.15s ease;
    }
    .emp-row:hover .emp-actions-group { opacity: 1; }
    .emp-action-btn {
      width: 28px; height: 28px; border-radius: var(--forge-radius-sm);
      background: var(--forge-bg-elevated); border: 1px solid var(--forge-border);
      color: var(--forge-text-muted); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      transition: var(--forge-transition); padding: 0;
    }
    .emp-action-btn:hover {
      border-color: var(--forge-primary); color: var(--forge-primary);
      background: var(--forge-primary-bg);
      transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.12);
    }
    .emp-action-btn.emp-action-revoke:hover {
      border-color: var(--forge-accent); color: var(--forge-accent);
    }

    /* ============================================================
       Table Footer — pagination + row limit
    ============================================================ */
    .emp-table-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.55rem 1rem; flex-wrap: wrap; gap: 0.5rem;
      border-top: 1px solid var(--forge-border);
      background: var(--forge-bg-surface); flex-shrink: 0;
    }
    .emp-footer-left { display: flex; align-items: center; gap: 0.65rem; }
    .emp-footer-metrics { font-size: 0.72rem; color: var(--forge-text-muted); }
    .emp-footer-selection {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.72rem; font-weight: 600; color: var(--forge-primary);
      background: var(--forge-primary-bg); border: 1px solid var(--forge-border-medium);
      padding: 0.1rem 0.45rem; border-radius: var(--forge-radius-full);
    }
    .emp-selection-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--forge-primary); }
    .emp-footer-center { flex: 1; display: flex; justify-content: center; }
    .emp-multipage-nav { display: flex; align-items: center; gap: 0.2rem; }
    .emp-nav-page-btn {
      width: 30px; height: 30px; border-radius: var(--forge-radius-sm);
      background: var(--forge-bg-elevated); border: 1px solid var(--forge-border);
      color: var(--forge-text-main); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: var(--forge-transition); padding: 0;
    }
    .emp-nav-page-btn:hover:not(:disabled) {
      border-color: var(--forge-primary); color: var(--forge-primary);
      background: var(--forge-primary-bg);
    }
    .emp-nav-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .emp-page-pills { display: flex; align-items: center; gap: 0.15rem; }
    .emp-page-pill {
      min-width: 30px; height: 30px; padding: 0 0.3rem;
      border-radius: var(--forge-radius-sm); background: transparent;
      border: 1px solid transparent; color: var(--forge-text-muted);
      font-size: 0.74rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: var(--forge-transition);
    }
    .emp-page-pill:hover { color: var(--forge-text-main); background: var(--forge-bg-card-hover); border-color: var(--forge-border); }
    .emp-page-pill.active {
      background: var(--forge-primary); color: var(--forge-primary-btn-text);
      border-color: var(--forge-primary); font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .emp-page-ellipsis { padding: 0 0.15rem; color: var(--forge-text-subtle); font-size: 0.8rem; }
    .emp-footer-right { display: flex; align-items: center; gap: 0.45rem; }
    .emp-page-limit-label { font-size: 0.72rem; color: var(--forge-text-muted); white-space: nowrap; }
    .emp-page-limit-select {
      height: 30px; padding: 0 1.8rem 0 0.5rem;
      background: var(--forge-bg-elevated) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 0.45rem center;
      border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main); font-size: 0.74rem;
      cursor: pointer; appearance: none; -webkit-appearance: none;
      transition: border-color 0.15s ease;
    }
    .emp-page-limit-select:focus {
      outline: none; border-color: var(--forge-primary);
      box-shadow: 0 0 0 2px var(--forge-primary-bg);
    }

    /* ============================================================
       Empty & Loading States
    ============================================================ */
    .emp-table-empty-cell, .emp-table-loading-cell {
      text-align: center; padding: 3.5rem 1.5rem !important; color: var(--forge-text-muted);
    }
    .emp-empty-icon {
      font-size: 1.8rem; margin-bottom: 0.65rem;
      color: var(--forge-text-subtle); display: flex; justify-content: center; opacity: 0.6;
    }
    .emp-empty-title { font-size: 1rem; font-weight: 700; color: var(--forge-text-main); margin-bottom: 0.3rem; }
    .emp-empty-desc { font-size: 0.78rem; color: var(--forge-text-muted); }
    .emp-table-loading-spinner {
      width: 24px; height: 24px; border: 2px solid var(--forge-border-medium);
      border-top-color: var(--forge-primary); border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 0 auto 0.75rem;
    }
    .emp-table-loading-text { font-size: 0.8rem; color: var(--forge-text-muted); }
    .spinning svg { animation: spin 0.6s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ============================================================
       Keyboard Hints Bar
    ============================================================ */
    .emp-table-keyboard-hints {
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
      font-size: 0.68rem; color: var(--forge-text-muted); padding: 0.3rem 0.1rem;
    }
    .emp-table-keyboard-hints kbd {
      background: var(--forge-bg-elevated); border: 1px solid var(--forge-border);
      padding: 0.05rem 0.3rem; border-radius: 3px;
      font-family: monospace; font-size: 0.66rem; color: var(--forge-text-main);
    }

    /* ============================================================
       Responsive — Fluid down to 320px, zero horizontal overflow
    ============================================================ */
    @media (max-width: 900px) {
      .emp-table-toolbar { flex-direction: column; align-items: stretch; gap: 0.5rem; }
      .emp-toolbar-left { width: 100%; flex-wrap: wrap; }
      .emp-toolbar-right { width: 100%; justify-content: flex-end; }
      .emp-search-box { max-width: 100%; flex: 1; min-width: 0; }
      .emp-dept-select { max-width: none; flex: 1; }
      /* Hide IAM Roles col */
      .emp-modern-table thead th:nth-child(6),
      .emp-modern-table tbody td:nth-child(6) { display: none; }
    }

    @media (max-width: 700px) {
      .emp-dept-path { display: none; }
      /* Hide Line Manager col */
      .emp-modern-table thead th:nth-child(5),
      .emp-modern-table tbody td:nth-child(5) { display: none; }
      /* Stack footer */
      .emp-table-footer { flex-direction: column; align-items: center; gap: 0.5rem; }
      .emp-footer-center { order: -1; }
      .emp-table-container.emp-table-fullscreen { left: 0; width: 100vw; padding: 0.65rem 0.65rem 0.5rem; }
    }

    @media (max-width: 480px) {
      /* Hide Dept and Job cols — only Name+Status+Actions visible */
      .emp-modern-table thead th:nth-child(3),
      .emp-modern-table tbody td:nth-child(3),
      .emp-modern-table thead th:nth-child(4),
      .emp-modern-table tbody td:nth-child(4) { display: none; }
      .emp-name-text { font-size: 0.8rem; }
      .emp-email-text { font-size: 0.66rem; }
      .emp-status-chips { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
      .emp-status-chips::-webkit-scrollbar { display: none; }
      .emp-table-keyboard-hints { display: none; }
    }
  `;
}
