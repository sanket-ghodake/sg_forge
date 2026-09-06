/**
 * @forge/dev-dashboard - Sentry-Style Issues Studio Astryx Styles (2026 LTS)
 * High-density responsive styles strictly consuming Astryx design tokens.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getIssuesStyles(): string {
  return `
    /* ========================================================================= */
    /* 1. Issues Header & Vitals Grid                                            */
    /* ========================================================================= */
    .issues-header-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1.15rem;
      margin-bottom: 1rem;
      box-shadow: var(--forge-shadow-card);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.85rem;
      position: relative;
    }
    .issues-header-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--forge-accent);
      box-shadow: 0 0 10px var(--forge-accent);
      border-top-left-radius: var(--forge-radius);
      border-bottom-left-radius: var(--forge-radius);
    }
    .issues-vitals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .issues-vital-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.8rem 0.95rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 94px;
      transition: var(--forge-transition);
      box-shadow: var(--forge-shadow-card);
    }
    .issues-vital-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }

    /* ========================================================================= */
    /* 2. Issues Filter & Action Bar                                             */
    /* ========================================================================= */
    .issues-filter-bar {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      box-shadow: var(--forge-shadow-card);
    }
    .issues-chips-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .issue-chip {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-muted);
      border-radius: var(--forge-radius-sm);
      padding: 0.25rem 0.6rem;
      font-size: 0.73rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: var(--forge-transition);
    }
    .issue-chip:hover {
      border-color: var(--forge-primary);
      color: var(--forge-text-main);
    }
    .issue-chip.active {
      background: rgba(62, 207, 142, 0.12);
      border-color: var(--forge-primary);
      color: var(--forge-primary);
    }
    .issue-chip.chip-open.active {
      background: rgba(239, 68, 68, 0.12);
      border-color: var(--forge-accent);
      color: var(--forge-accent);
    }
    .issue-chip.chip-investigating.active {
      background: rgba(245, 158, 11, 0.12);
      border-color: var(--forge-accent);
      color: var(--forge-accent);
    }
    .issue-chip.chip-resolved.active {
      background: rgba(62, 207, 142, 0.12);
      border-color: var(--forge-success);
      color: var(--forge-success);
    }

    /* ========================================================================= */
    /* 3. Issue List & Incident Card Items                                       */
    /* ========================================================================= */
    .issues-list-container {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 1rem;
    }
    .issue-item-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.85rem 1.15rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      transition: var(--forge-transition);
      cursor: pointer;
      box-shadow: var(--forge-shadow-card);
    }
    .issue-item-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .issue-item-main {
      flex: 1;
      min-width: 0;
    }
    .issue-type-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }
    .issue-message-text {
      font-size: 0.82rem;
      color: var(--forge-text-main);
      font-weight: 550;
      line-height: 1.35;
      margin-bottom: 0.45rem;
      word-break: break-word;
    }
    .issue-meta-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.72rem;
      color: var(--forge-text-subtle);
      flex-wrap: wrap;
    }
    .issue-freq-badge {
      font-family: var(--forge-font-mono, monospace);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: var(--forge-radius-sm);
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: var(--forge-accent);
    }

    /* ========================================================================= */
    /* 4. Issue Detail Modal / Drawer Styles                                     */
    /* ========================================================================= */
    .stack-trace-box {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.85rem;
      font-family: var(--forge-font-mono, monospace);
      font-size: 0.75rem;
      color: var(--forge-text-main);
      overflow-x: auto;
      max-height: 280px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-all;
    }

    @media (max-width: 1200px) {
      .issues-vitals-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .issues-vitals-grid { grid-template-columns: 1fr; }
      .issues-header-card { flex-direction: column; align-items: flex-start; }
      .issue-item-card { flex-direction: column; }
    }
  `;
}
