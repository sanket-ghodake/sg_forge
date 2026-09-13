/**
 * @forge/dev-dashboard - Vercel-Style True Telemetry Astryx Styles (2026 LTS)
 * High-density responsive CSS strictly consuming Astryx design tokens.
 * @requirements [HLR-DEV-501] [LLR-TEL-001] [HLR-UI-401] [LLR-UI-001]
 */

export function getTrafficStyles(): string {
  return `
    /* ========================================================================= */
    /* 1. Header Command Card & Time Range Picker                                */
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
    .telemetry-range-picker, .telemetry-category-picker {
      display: inline-flex;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: 20px;
      padding: 2px;
      gap: 2px;
    }
    .range-pill, .category-pill {
      background: transparent;
      border: none;
      color: var(--forge-text-muted);
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.2rem 0.6rem;
      border-radius: 16px;
      cursor: pointer;
      transition: var(--forge-transition);
    }
    .range-pill:hover, .category-pill:hover {
      color: var(--forge-text-main);
      background: rgba(255, 255, 255, 0.05);
    }
    .range-pill.active, .category-pill.active {
      background: var(--forge-primary);
      color: var(--forge-text-main);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }
    .badge-cat-user { background: rgba(16, 185, 129, 0.15); color: var(--forge-success); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.68rem; padding: 0.1rem 0.38rem; border-radius: 4px; font-weight: 600; }
    .badge-cat-mesh { background: rgba(59, 130, 246, 0.15); color: var(--forge-primary); border: 1px solid rgba(59, 130, 246, 0.3); font-size: 0.68rem; padding: 0.1rem 0.38rem; border-radius: 4px; font-weight: 600; }
    .badge-cat-probe { background: rgba(245, 158, 11, 0.15); color: var(--forge-warning); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.68rem; padding: 0.1rem 0.38rem; border-radius: 4px; font-weight: 600; }

    /* ========================================================================= */
    /* 2. Golden Signals Scorecards                                              */
    /* ========================================================================= */
    .traffic-signals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      min-height: 96px;
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
    /* 3. Interactive SVG Time-Series Chart                                      */
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
      margin-bottom: 0.8rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .chart-metric-toggles {
      display: inline-flex;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm, 6px);
      padding: 2px;
      gap: 2px;
    }
    .metric-btn {
      background: transparent;
      border: none;
      color: var(--forge-text-muted);
      font-size: 0.7rem;
      font-weight: 500;
      padding: 0.18rem 0.55rem;
      border-radius: 4px;
      cursor: pointer;
      transition: var(--forge-transition);
    }
    .metric-btn:hover {
      color: var(--forge-text-main);
    }
    .metric-btn.active {
      background: var(--forge-bg-surface);
      color: var(--forge-primary);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .timeline-legend {
      display: flex;
      gap: 0.8rem;
      align-items: center;
      font-size: 0.72rem;
      color: var(--forge-text-muted);
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .timeline-chart-container {
      width: 100%;
      height: 140px;
      position: relative;
    }
    .timeline-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* ========================================================================= */
    /* 4. Vercel-Style 6-Card Dimensional Insight Grid                            */
    /* ========================================================================= */
    .telemetry-insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 0.85rem;
      margin-bottom: 1rem;
    }
    .insight-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.85rem 1rem;
      box-shadow: var(--forge-shadow-card);
      display: flex;
      flex-direction: column;
    }
    .insight-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.65rem;
      padding-bottom: 0.45rem;
      border-bottom: 1px solid var(--forge-border-subtle, var(--forge-border));
    }
    .insight-card-header h4 {
      font-size: 0.85rem;
      font-weight: 650;
      margin: 0;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .insight-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }
    .insight-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--forge-text-muted);
      font-size: 0.74rem;
    }
    .insight-row {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.32rem 0.55rem;
      border-radius: 4px;
      font-size: 0.76rem;
      overflow: hidden;
    }
    .insight-bar-fill {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      background: rgba(var(--forge-primary-rgb, 59, 130, 246), 0.12);
      border-radius: 4px;
      pointer-events: none;
      z-index: 1;
      transition: width 0.35s ease;
    }
    .insight-label-wrap {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      max-width: 70%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--forge-text-main);
      font-weight: 500;
    }
    .insight-val-wrap {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--forge-font-mono, monospace);
      font-size: 0.74rem;
      color: var(--forge-text-muted);
    }
    .insight-val-wrap strong {
      color: var(--forge-text-main);
    }

    /* ========================================================================= */
    /* 5. Live Inspector Table & Flag Badges                                     */
    /* ========================================================================= */
    .country-flag-badge {
      font-size: 0.95rem;
      line-height: 1;
      display: inline-block;
    }
    .inspector-ip-pill {
      font-family: var(--forge-font-mono, monospace);
      font-size: 0.72rem;
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      color: var(--forge-text-main);
    }

    /* Status Pills */
    .status-2xx { color: var(--forge-success); font-weight: 600; font-size: 0.75rem; }
    .status-3xx { color: var(--forge-primary); font-weight: 600; font-size: 0.75rem; }
    .status-4xx { color: var(--forge-accent); font-weight: 600; font-size: 0.75rem; }
    .status-5xx { color: var(--forge-accent); font-weight: 700; font-size: 0.75rem; }

    /* HTTP Method Badges */
    .method-get { color: var(--forge-primary); font-weight: 600; }
    .method-post { color: var(--forge-success); font-weight: 600; }
    .method-put { color: var(--forge-warning); font-weight: 600; }
    .method-delete { color: var(--forge-accent); font-weight: 600; }

    /* Latency Badges */
    .latency-fast { color: var(--forge-success); font-weight: 600; }
    .latency-medium { color: var(--forge-warning); font-weight: 600; }
    .latency-slow { color: var(--forge-accent); font-weight: 700; }

    /* Benchmark Toolbar */
    .benchmark-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.65rem 0.85rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .benchmark-controls-group {
      display: flex;
      gap: 0.8rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .benchmark-select-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.74rem;
      color: var(--forge-text-muted);
    }

    @media (max-width: 768px) {
      .traffic-header-card { flex-direction: column; align-items: flex-start; }
      .traffic-signals-grid { grid-template-columns: 1fr; }
      .telemetry-insights-grid { grid-template-columns: 1fr; }
    }
  `;
}
