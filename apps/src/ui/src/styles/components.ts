/**
 * @forge/ui - UI Component Primitives & Navigation Header (2026 LTS)
 */

/**
 * Returns Astryx component primitive styles and header layout.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getComponentStyles(): string {
  return `
    /* Enterprise Navigation Header Bar */
    .astryx-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.75rem;
      height: 48px;
      min-height: 48px;
      max-height: 48px;
      background: var(--forge-bg-surface);
      border-bottom: 1px solid var(--forge-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      transition: background-color 0.2s ease, border-color 0.2s ease;
      box-sizing: border-box;
    }

    .astryx-logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      user-select: none;
      height: 100%;
    }

    .astryx-brand-logo-img {
      height: 32px;
      max-height: 80%;
      width: auto;
      max-width: 180px;
      object-fit: contain;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
      transition: transform 0.2s ease, filter 0.2s ease;
    }

    .astryx-brand-logo-img:hover {
      transform: scale(1.02);
    }

    [data-theme="light"] .astryx-brand-logo-img {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08));
    }

    [data-theme="dark"] .astryx-brand-logo-img {
      filter: drop-shadow(0 2px 10px rgba(235, 87, 87, 0.35));
    }

    .astryx-app-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.76rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      color: var(--forge-text-main);
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      padding: 0.18rem 0.55rem;
      border-radius: 5px;
      transition: var(--forge-transition);
    }

    .astryx-logo-badge {
      background: var(--forge-primary-gradient);
      color: #ffffff;
      padding: 0.2rem 0.55rem;
      border-radius: 5px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      display: inline-block;
    }

    /* Theme Toggle Button */
    .astryx-theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--forge-radius-sm);
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-main);
      cursor: pointer;
      transition: var(--forge-transition);
      outline: none;
    }

    .astryx-theme-toggle:hover {
      border-color: var(--forge-primary);
      background: var(--forge-bg-card-hover);
    }

    .astryx-theme-toggle svg {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Astryx Cards & Hero Layout */
    .astryx-hero {
      text-align: center;
      padding: 3.5rem 1rem 2.5rem;
    }

    .astryx-hero h1 {
      font-size: clamp(2rem, 4vw, 3.25rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
      color: var(--forge-text-main);
    }

    .astryx-hero p {
      font-size: 1.15rem;
      color: var(--forge-text-muted);
      max-width: 680px;
      margin: 0 auto;
      font-weight: 400;
    }

    .astryx-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 1.25rem;
      box-shadow: var(--forge-shadow-card);
      transition: var(--forge-transition);
      position: relative;
      overflow: hidden;
    }

    .astryx-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
      box-shadow: var(--forge-shadow-hover);
    }

    /* Astryx 3-Tier Card Anatomy */
    .sb-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--forge-transition);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      box-shadow: var(--forge-shadow-card);
    }

    .sb-card:hover {
      border-color: var(--forge-border-medium);
      background: var(--forge-bg-card-hover);
      box-shadow: var(--forge-shadow-hover);
    }

    .sb-card-header {
      padding: 1rem 1.15rem 0.5rem 1.15rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .sb-card-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--forge-text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.015em;
    }

    .sb-card-kebab {
      color: var(--forge-text-muted);
      cursor: pointer;
      padding: 0.2rem;
      border-radius: var(--forge-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .sb-card-kebab:hover {
      color: var(--forge-text-main);
      background: var(--forge-bg-card-hover);
    }

    .sb-card-body {
      padding: 0.25rem 1.15rem 0.85rem 1.15rem;
      font-size: 0.8rem;
      color: var(--forge-text-muted);
      line-height: 1.45;
    }

    .sb-card-footer {
      padding: 0.6rem 1.15rem;
      border-top: 1px solid var(--forge-border);
      background: var(--forge-bg-elevated);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.74rem;
      color: var(--forge-text-muted);
    }

    .astryx-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.18rem 0.5rem;
      border-radius: var(--forge-radius-sm);
      letter-spacing: 0.02em;
      background: var(--forge-bg-elevated);
      color: var(--forge-text-main);
      border: 1px solid var(--forge-border);
    }

    .badge-online {
      background: var(--forge-success-bg);
      color: var(--forge-success);
      border: 1px solid var(--forge-border-medium);
    }

    .badge-pill {
      background: var(--forge-bg-elevated);
      color: var(--forge-text-muted);
      border: 1px solid var(--forge-border);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .astryx-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      height: 36px;
      padding: 0 1rem;
      border-radius: var(--forge-radius-sm, 6px);
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      cursor: pointer;
      text-decoration: none !important;
      transition: var(--forge-transition);
      border: 1px solid transparent;
      outline: none;
      user-select: none;
      box-sizing: border-box;
    }

    .astryx-btn:focus-visible {
      box-shadow: 0 0 0 2px var(--forge-primary);
    }

    .btn-primary,
    .btn-primary:link,
    .btn-primary:visited {
      background: var(--forge-primary);
      color: var(--forge-primary-btn-text, #121212) !important;
      font-weight: 600;
      border-color: transparent;
      text-decoration: none !important;
    }

    .btn-primary:hover,
    .btn-primary:active {
      background: var(--forge-primary-hover, #34b27b);
      color: var(--forge-primary-btn-text, #121212) !important;
      filter: brightness(1.05);
      box-shadow: 0 2px 12px rgba(62, 207, 142, 0.35);
      transform: translateY(-1px);
    }

    .btn-secondary,
    .btn-secondary:link,
    .btn-secondary:visited {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-main) !important;
      font-weight: 600;
      text-decoration: none !important;
    }

    .btn-secondary:hover,
    .btn-secondary:active {
      border-color: var(--forge-border-hover, #383838);
      background: var(--forge-bg-card-hover);
      color: var(--forge-primary) !important;
      transform: translateY(-1px);
    }

    .btn-outline,
    .btn-outline:link,
    .btn-outline:visited {
      background: transparent;
      border: 1px dashed var(--forge-border);
      color: var(--forge-text-muted) !important;
      font-weight: 500;
      text-decoration: none !important;
    }

    .btn-outline:hover,
    .btn-outline:active {
      border-color: var(--forge-primary);
      background: var(--forge-bg-card-hover);
      color: var(--forge-text-main) !important;
      transform: translateY(-1px);
    }

    .astryx-input, .astryx-select {
      height: 32px;
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius-sm);
      color: var(--forge-text-main);
      padding: 0 0.75rem;
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      transition: var(--forge-transition);
      box-sizing: border-box;
    }

    .astryx-input:focus, .astryx-select:focus {
      border-color: var(--forge-primary);
      box-shadow: 0 0 0 1px var(--forge-primary);
    }

    .astryx-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .astryx-micro-pill {
      font-family: 'Geist Mono', 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 500;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-muted);
      letter-spacing: 0.02em;
    }

    .astryx-code-badge {
      font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.76rem;
      background: var(--forge-bg-elevated);
      color: var(--forge-primary);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid var(--forge-border);
    }

    .astryx-footer {
      margin-top: auto;
      padding: 2.5rem 1.5rem;
      text-align: center;
      border-top: 1px solid var(--forge-border);
      font-size: 0.82rem;
      color: var(--forge-text-subtle);
    }

    @media (max-width: 768px) {
      .astryx-header { padding: 0.65rem 1rem; }
      .astryx-grid { grid-template-columns: 1fr; }
      .astryx-container { padding: 1.5rem 1rem; }
      .astryx-hero { padding: 2.5rem 0.5rem 1.5rem; }
    }
  `;
}
