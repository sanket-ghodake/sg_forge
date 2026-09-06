/**
 * @forge/dev-dashboard - Host Infrastructure & Cloud Diagnostics Astryx Styles (2026 LTS)
 * High-density enterprise host and resource telemetry styling.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getHostStyles(): string {
  return `
    /* ========================================================================= */
    /* 1. Host Command Header & Vitals Console                                   */
    /* ========================================================================= */
    .host-header-card {
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
    .host-header-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 4px;
      background: var(--forge-primary);
      box-shadow: 0 0 10px var(--forge-primary);
      border-top-left-radius: var(--forge-radius);
      border-bottom-left-radius: var(--forge-radius);
    }
    /* ========================================================================= */
    /* 1b. 24/7 High-Availability Console & 6-Stage Matrix Styling               */
    /* ========================================================================= */
    .ha-console-wrapper {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 1rem 1.25rem;
      margin-bottom: 1.25rem;
      box-shadow: var(--forge-shadow-card);
      position: relative;
    }
    .ha-console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.75rem;
      border-bottom: 1px solid var(--forge-border);
      padding-bottom: 0.85rem;
    }
    .ha-console-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: var(--forge-radius-sm);
      background: rgba(var(--forge-primary-rgb, 59, 130, 246), 0.12);
      border: 1px solid rgba(var(--forge-primary-rgb, 59, 130, 246), 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ha-pill-hero {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.18));
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: var(--forge-success);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
    }
    .ha-badge-repo, .ha-badge-host, .ha-status-badge {
      transition: box-shadow 0.15s ease, filter 0.15s ease;
      cursor: default;
    }
    .ha-badge-repo:hover, .ha-badge-host:hover, .ha-status-badge:hover {
      filter: brightness(1.15);
    }
    .ha-stages-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
    }
    .ha-stage-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.95rem 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--forge-transition);
      position: relative;
      overflow: hidden;
      box-shadow: var(--forge-shadow-card);
    }
    .ha-stage-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .ha-stage-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
    }
    .ha-stage-card-repo::before {
      background: linear-gradient(90deg, var(--forge-primary), var(--forge-success));
    }
    .ha-stage-card-host::before {
      background: linear-gradient(90deg, var(--forge-warning), var(--forge-accent));
    }
    .ha-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.55rem;
    }
    .ha-stage-tag-group {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .ha-stage-num {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--forge-text-muted);
    }
    .ha-badge-repo {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: var(--forge-primary);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .ha-badge-host {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--forge-warning);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .ha-status-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.18rem 0.5rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .ha-badge-success {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--forge-success);
    }
    .ha-badge-warning {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--forge-warning);
    }
    .ha-status-glow {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
    }
    .ha-card-heading {
      font-size: 0.88rem;
      font-weight: 700;
      margin: 0 0 0.3rem 0;
      color: var(--forge-text-main);
    }
    .ha-card-desc {
      font-size: 0.74rem;
      color: var(--forge-text-muted);
      margin: 0 0 0.6rem 0;
      line-height: 1.4;
    }
    .ha-telemetry-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.7rem;
    }
    .ha-chip {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      font-size: 0.68rem;
      color: var(--forge-text-subtle);
      padding: 0.2rem 0.45rem;
      font-weight: 600;
    }
    .ha-card-footer {
      border-top: 1px solid var(--forge-border);
      padding-top: 0.5rem;
      margin-top: auto;
    }
    .ha-guide-toggle-btn {
      width: 100%;
      background: none;
      border: none;
      color: var(--forge-primary);
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 0;
      transition: var(--forge-transition);
    }
    .ha-guide-toggle-btn:hover {
      color: var(--forge-text-main);
    }
    .ha-inline-guide {
      margin-top: 0.6rem;
      padding-top: 0.6rem;
      border-top: 1px dashed var(--forge-border);
    }
    .ha-guide-subhead {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--forge-text-muted);
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }
    .ha-guide-note {
      font-size: 0.68rem;
      color: var(--forge-text-muted);
      margin-top: 0.4rem;
      line-height: 1.35;
    }
    .host-vitals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .host-vital-gauge-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
      transition: var(--forge-transition);
      box-shadow: var(--forge-shadow-card);
      position: relative;
    }
    .host-vital-gauge-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
    }
    .gauge-circle-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0.4rem 0;
    }
    .gauge-svg-wrap {
      width: 48px;
      height: 48px;
      position: relative;
    }
    .gauge-svg {
      transform: rotate(-90deg);
    }
    .gauge-bg-ring {
      fill: none;
      stroke: var(--forge-border-medium);
      stroke-width: 3.5;
    }
    .gauge-fill-ring {
      fill: none;
      stroke: var(--forge-primary);
      stroke-width: 3.5;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease-in-out;
    }

    /* ========================================================================= */
    /* 2. CPU Multi-Core Breakdown & Progress Bars                               */
    /* ========================================================================= */
    .host-section-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius);
      padding: 0.9rem 1.15rem;
      margin-bottom: 1rem;
      box-shadow: var(--forge-shadow-card);
    }
    .cores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.6rem;
      margin-top: 0.65rem;
    }
    .core-item-box {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.5rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .core-bar-track {
      width: 100%;
      height: 5px;
      background: var(--forge-border);
      border-radius: 3px;
      overflow: hidden;
    }
    .core-bar-fill {
      height: 100%;
      background: var(--forge-primary);
      border-radius: 3px;
      transition: width 0.4s ease;
    }

    /* ========================================================================= */
    /* 3. Disk Storage Volume Cards                                              */
    /* ========================================================================= */
    .storage-volumes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.85rem;
      margin-top: 0.65rem;
    }
    .storage-volume-card {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.75rem 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    /* ========================================================================= */
    /* 4. 24/7 Setup Guide Modal & Tabbed OS Selector                            */
    /* ========================================================================= */
    .guide-tabs-nav {
      display: flex;
      gap: 0.4rem;
      border-bottom: 1px solid var(--forge-border);
      padding: 0.5rem 1rem 0;
      background: var(--forge-bg-surface);
      overflow-x: auto;
    }
    .guide-tab-btn {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.5rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--forge-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
      transition: var(--forge-transition);
    }
    .guide-tab-btn:hover {
      color: var(--forge-text-main);
    }
    .guide-tab-btn.active {
      color: var(--forge-primary);
      border-bottom-color: var(--forge-primary);
    }
    .guide-tab-pane {
      padding: 1rem;
      display: none;
    }
    .guide-step-card {
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 0.85rem;
    }
    .guide-step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .guide-step-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .guide-step-desc {
      font-size: 0.75rem;
      color: var(--forge-text-muted);
      margin-bottom: 0.5rem;
    }
    .guide-code-box {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border-medium);
      border-radius: var(--forge-radius-sm);
      padding: 0.6rem 0.8rem;
      font-family: monospace;
      font-size: 0.74rem;
      color: var(--forge-text-main);
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow-x: auto;
    }
    .guide-copy-btn {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-muted);
      border-radius: var(--forge-radius-sm);
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      cursor: pointer;
      flex-shrink: 0;
      transition: var(--forge-transition);
    }
    .guide-copy-btn:hover {
      color: var(--forge-text-main);
      border-color: var(--forge-primary);
    }

    @media (max-width: 1200px) {
      .host-vitals-grid { grid-template-columns: repeat(2, 1fr); }
      .ha-invariants-grid { grid-template-columns: repeat(2, 1fr); }
      .storage-volumes-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .host-vitals-grid { grid-template-columns: 1fr; }
      .ha-invariants-grid { grid-template-columns: 1fr; }
      .host-header-card { flex-direction: column; align-items: flex-start; }
    }
  `;
}
