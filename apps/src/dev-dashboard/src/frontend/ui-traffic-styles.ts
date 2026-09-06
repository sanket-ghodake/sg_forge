/**
 * @forge/dev-dashboard - Traffic Analytics & Latency Benchmark Astryx Styles (2026 LTS)
 * High-density responsive CSS strictly consuming Astryx design tokens.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getTrafficStyles(): string {
  return `
    /* ========================================================================= */
    /* 1. Traffic Command Header & Golden Signals Grid                           */
    /* ========================================================================= */
    .traffic-header-card {
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
    .traffic-header-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--forge-primary);
      box-shadow: 0 0 10px var(--forge-primary);
      border-top-left-radius: var(--forge-radius);
      border-bottom-left-radius: var(--forge-radius);
    }
    .traffic-signals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .traffic-signal-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.8rem 0.95rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 98px;
      transition: var(--forge-transition);
      box-shadow: var(--forge-shadow-card);
    }
    .traffic-signal-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .signal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.3rem;
    }
    .signal-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--forge-text-muted);
    }
    .signal-main-val {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--forge-text-main);
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      line-height: 1.15;
    }
    .signal-subtext {
      font-size: 0.72rem;
      color: var(--forge-text-subtle);
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ========================================================================= */
    /* 2. Live Time-Series Traffic & Latency SVG Timeline                        */
    /* ========================================================================= */
    .traffic-timeline-section {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1.15rem;
      margin-bottom: 1rem;
      box-shadow: var(--forge-shadow-card);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .timeline-legend {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.72rem;
      color: var(--forge-text-muted);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .timeline-chart-container {
      width: 100%;
      height: 120px;
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      overflow: hidden;
      position: relative;
    }
    .timeline-svg {
      width: 100%;
      height: 100%;
    }

    /* ========================================================================= */
    /* 3. Multi-Target Active Benchmark & Stress-Test Console                     */
    /* ========================================================================= */
    .traffic-benchmark-section {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1.15rem;
      margin-bottom: 1rem;
      box-shadow: var(--forge-shadow-card);
    }
    .benchmark-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.85rem;
    }
    .benchmark-controls-group {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-wrap: wrap;
    }
    .benchmark-select-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--forge-text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .benchmark-scorecard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.6rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.85rem;
      margin-top: 0.75rem;
    }
    .scorecard-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .scorecard-item-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--forge-text-subtle);
    }
    .scorecard-item-val {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--forge-text-main);
      font-family: var(--forge-font-mono, monospace);
    }

    /* ========================================================================= */
    /* 4. Top Routes Performance & Live Events Matrix                            */
    /* ========================================================================= */
    .traffic-tables-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .traffic-table-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1.15rem;
      box-shadow: var(--forge-shadow-card);
    }
    .traffic-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .method-pill {
      font-size: 0.68rem;
      font-weight: 700;
      font-family: var(--forge-font-mono, monospace);
      padding: 0.12rem 0.42rem;
      border-radius: 3px;
    }
    .method-get { background: rgba(62, 207, 142, 0.15); color: var(--forge-primary); border: 1px solid rgba(62, 207, 142, 0.3); }
    .method-post { background: rgba(59, 130, 246, 0.15); color: var(--forge-primary); border: 1px solid rgba(59, 130, 246, 0.3); }
    .method-put { background: rgba(245, 158, 11, 0.15); color: var(--forge-accent); border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: var(--forge-accent); border: 1px solid rgba(239, 68, 68, 0.3); }
    .method-benchmark { background: rgba(168, 85, 247, 0.15); color: var(--forge-primary); border: 1px solid rgba(168, 85, 247, 0.3); }

    .status-2xx { color: var(--forge-success); font-weight: 600; }
    .status-3xx { color: var(--forge-primary); font-weight: 600; }
    .status-4xx { color: var(--forge-accent); font-weight: 600; }
    .status-5xx { color: var(--forge-accent); font-weight: 700; }

    @media (max-width: 1200px) {
      .traffic-signals-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .traffic-signals-grid { grid-template-columns: 1fr; }
      .traffic-header-card { flex-direction: column; align-items: flex-start; }
      .benchmark-toolbar { flex-direction: column; align-items: flex-start; }
    }
  `;
}
