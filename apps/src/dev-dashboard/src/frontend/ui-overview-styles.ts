/**
 * @forge/dev-dashboard - Overview Page Astryx Styles (2026 LTS)
 * High-density responsive CSS strictly consuming Astryx design tokens.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getOverviewStyles(): string {
  return `
    /* ========================================================================= */
    /* 1. Hero Health Banner & Quick Action Tools                                */
    /* ========================================================================= */
    .overview-hero-card {
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
      overflow: hidden;
    }
    .overview-hero-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--forge-primary);
      box-shadow: 0 0 10px var(--forge-primary);
      border-top-left-radius: var(--forge-radius);
      border-bottom-left-radius: var(--forge-radius);
    }
    .overview-hero-left {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .overview-status-icon-box {
      width: 38px;
      height: 38px;
      border-radius: var(--forge-radius-sm);
      background: rgba(62, 207, 142, 0.12);
      border: 1px solid rgba(62, 207, 142, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--forge-primary);
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .overview-hero-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.2rem 0;
      letter-spacing: -0.015em;
    }
    .overview-hero-subtitle {
      font-size: 0.78rem;
      color: var(--forge-text-muted);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .overview-hero-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    /* ========================================================================= */
    /* 2. 4 Golden Vitals Summary Cards                                          */
    /* ========================================================================= */
    .overview-vitals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .overview-vital-card {
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
      position: relative;
    }
    .overview-vital-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .vital-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.3rem;
    }
    .vital-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--forge-text-muted);
    }
    .vital-badge {
      font-size: 0.68rem;
      font-family: var(--forge-font-mono, monospace);
      padding: 0.08rem 0.35rem;
      border-radius: 3px;
      background: var(--forge-bg-elevated);
      color: var(--forge-text-subtle);
      border: 1px solid var(--forge-border);
    }
    .vital-main-val {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--forge-text-main);
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      line-height: 1.15;
    }
    .vital-subtext {
      font-size: 0.72rem;
      color: var(--forge-text-subtle);
      margin-top: 0.3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ========================================================================= */
    /* 3. Interactive Topology Architecture Pipeline                             */
    /* ========================================================================= */
    .overview-topology-section {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1rem;
      margin-bottom: 1rem;
      box-shadow: var(--forge-shadow-card);
    }
    .topology-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .topology-pipeline-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.65rem;
      position: relative;
    }
    .topology-tier {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      min-height: 130px;
      position: relative;
    }
    .topology-tier-header {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--forge-text-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--forge-border);
      padding-bottom: 0.3rem;
    }
    .topology-node-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.45rem 0.55rem;
      cursor: pointer;
      transition: var(--forge-transition);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .topology-node-card:hover {
      border-color: var(--forge-primary);
      background: var(--forge-bg-card-hover);
      box-shadow: 0 0 10px rgba(62, 207, 142, 0.1);
    }
    .node-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .node-name {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--forge-text-main);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .node-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--forge-text-muted);
      font-family: var(--forge-font-mono, monospace);
    }

    /* ========================================================================= */
    /* 4. High-Density Active Services Matrix                                    */
    /* ========================================================================= */
    .overview-fleet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .fleet-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.8rem 0.9rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 125px;
      transition: var(--forge-transition);
      box-shadow: var(--forge-shadow-card);
    }
    .fleet-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .fleet-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.35rem;
    }
    .fleet-card-title {
      font-size: 0.88rem;
      font-weight: 650;
      color: var(--forge-text-main);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .fleet-card-ingress {
      font-size: 0.7rem;
      font-family: var(--forge-font-mono, monospace);
      color: var(--forge-text-subtle);
      margin-bottom: 0.45rem;
    }
    .fleet-card-badges {
      display: flex;
      gap: 0.3rem;
      flex-wrap: wrap;
      margin-bottom: 0.55rem;
    }
    .fleet-card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--forge-border);
      padding-top: 0.45rem;
      margin-top: 0.3rem;
    }
    .fleet-actions {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .fleet-btn-xs {
      padding: 0.16rem 0.45rem;
      font-size: 0.68rem;
      border-radius: var(--forge-radius-sm);
      border: 1px solid var(--forge-border);
      background: var(--forge-bg-elevated);
      color: var(--forge-text-muted);
      cursor: pointer;
      transition: var(--forge-transition);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }
    .fleet-btn-xs:hover {
      color: var(--forge-text-main);
      border-color: var(--forge-primary);
      background: rgba(62, 207, 142, 0.12);
    }

    /* ========================================================================= */
    /* 5. Split-Screen Operations Console                                        */
    /* ========================================================================= */
    .overview-console-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .console-terminal-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.8rem 0.95rem;
      box-shadow: var(--forge-shadow-card);
      display: flex;
      flex-direction: column;
    }
    .console-radar-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.8rem 0.95rem;
      box-shadow: var(--forge-shadow-card);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.55rem;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .console-controls {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .console-filter-pill {
      padding: 0.12rem 0.45rem;
      border-radius: var(--forge-radius-full);
      font-size: 0.68rem;
      font-weight: 600;
      border: 1px solid var(--forge-border);
      background: var(--forge-bg-card);
      color: var(--forge-text-muted);
      cursor: pointer;
      transition: var(--forge-transition);
    }
    .console-filter-pill.active {
      background: var(--forge-bg-card-hover);
      color: var(--forge-primary);
      border-color: var(--forge-primary);
    }
    .console-terminal-window {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      font-family: var(--forge-font-mono, ui-monospace, SFMono-Regular, monospace);
      font-size: 0.74rem;
      color: var(--forge-text-muted);
      padding: 0.6rem;
      height: 230px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.45;
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }

    /* Quick Diagnostic Widgets in Right Console */
    .radar-subcard {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.6rem 0.7rem;
    }
    .radar-subcard-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }
    .radar-stats-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      color: var(--forge-text-muted);
      margin-bottom: 0.2rem;
    }

    /* ========================================================================= */
    /* 6. Runtime & Environment Cheatsheet Strip                                 */
    /* ========================================================================= */
    .overview-env-strip {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.45rem 0.8rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--forge-text-subtle);
      font-family: var(--forge-font-mono, monospace);
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .env-strip-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* ========================================================================= */
    /* Responsive Breakpoints                                                    */
    /* ========================================================================= */
    @media (max-width: 1200px) {
      .overview-vitals-grid { grid-template-columns: repeat(2, 1fr); }
      .topology-pipeline-container { grid-template-columns: repeat(3, 1fr); }
      .overview-console-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .overview-vitals-grid { grid-template-columns: 1fr; }
      .topology-pipeline-container { grid-template-columns: 1fr; }
      .overview-hero-card { flex-direction: column; align-items: flex-start; }
      .overview-hero-actions { width: 100%; justify-content: flex-start; }
    }
  `;
}
