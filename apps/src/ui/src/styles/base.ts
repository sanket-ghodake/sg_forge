/**
 * @forge/ui - Base Styles, CSS Custom Properties & Scrollbars (2026 LTS)
 */

import { themeTokens } from '../tokens';

/**
 * Returns foundational CSS custom property variables, typography, and scrollbar styles.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getBaseStyles(): string {
  const d = themeTokens.dark;
  const l = themeTokens.light;

  return `
    :root, [data-theme="dark"] {
      --forge-bg-root: ${d.bgRoot};
      --forge-bg-surface: ${d.bgSurface};
      --forge-bg-card: ${d.bgCard};
      --forge-bg-card-hover: ${d.bgCardHover};
      --forge-bg-elevated: ${d.bgElevated};
      --forge-border: ${d.borderSubtle};
      --forge-border-subtle: ${d.borderSubtle};
      --forge-border-medium: ${d.borderMedium};
      --forge-border-hover: ${d.borderMedium};
      --forge-primary: ${d.primary};
      --forge-primary-hover: #34b27b;
      --forge-primary-bg: rgba(62, 207, 142, 0.12);
      --forge-primary-btn-text: #121212;
      --forge-primary-gradient: ${d.primaryGradient};
      --forge-accent: ${d.accent};
      --forge-text-main: ${d.textMain};
      --forge-text-muted: ${d.textMuted};
      --forge-text-subtle: ${d.textSubtle};
      --forge-text-contrast: ${d.textContrast};
      --forge-success: ${d.success};
      --forge-success-bg: ${d.successBg};
      --forge-shadow-card: ${d.shadowCard};
      --forge-shadow-hover: ${d.shadowHover};
      --forge-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
      --forge-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
      --forge-warning: #f59e0b;
      --forge-warning-bg: rgba(245, 158, 11, 0.12);
      --forge-error: #ef4444;
      --forge-error-bg: rgba(239, 68, 68, 0.12);
      --forge-radius: 8px;
      --forge-radius-sm: 5px;
      --forge-radius-full: 9999px;
      --forge-transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }

    [data-theme="light"] {
      --forge-bg-root: ${l.bgRoot};
      --forge-bg-surface: ${l.bgSurface};
      --forge-bg-card: ${l.bgCard};
      --forge-bg-card-hover: ${l.bgCardHover};
      --forge-bg-elevated: ${l.bgElevated};
      --forge-border: ${l.borderSubtle};
      --forge-border-subtle: ${l.borderSubtle};
      --forge-border-medium: ${l.borderMedium};
      --forge-border-hover: ${l.borderMedium};
      --forge-primary: ${l.primary};
      --forge-primary-hover: #1ea672;
      --forge-primary-bg: rgba(36, 180, 126, 0.10);
      --forge-primary-btn-text: #ffffff;
      --forge-primary-gradient: ${l.primaryGradient};
      --forge-accent: ${l.accent};
      --forge-text-main: ${l.textMain};
      --forge-text-muted: ${l.textMuted};
      --forge-text-subtle: ${l.textSubtle};
      --forge-text-contrast: ${l.textContrast};
      --forge-success: ${l.success};
      --forge-success-bg: ${l.successBg};
      --forge-shadow-card: ${l.shadowCard};
      --forge-shadow-hover: ${l.shadowHover};
      --forge-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
      --forge-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
      --forge-warning: #d97706;
      --forge-warning-bg: rgba(217, 119, 6, 0.10);
      --forge-error: #dc2626;
      --forge-error-bg: rgba(220, 38, 38, 0.10);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Custom Slim Astryx Scrollbars (Anti-Browser Defaults) */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--forge-border-medium) transparent;
    }

    *::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    *::-webkit-scrollbar-track {
      background: transparent;
    }

    *::-webkit-scrollbar-thumb {
      background: var(--forge-border-medium);
      border-radius: var(--forge-radius-full);
      border: 1px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.15s ease;
    }

    *::-webkit-scrollbar-thumb:hover {
      background: var(--forge-primary);
    }

    *::-webkit-scrollbar-corner {
      background: transparent;
    }

    /* 100% Air-Gapped High Performance Typography (Zero External Network Imports) */
    body {
      font-family: var(--forge-font-sans);
      background-color: var(--forge-bg-root);
      color: var(--forge-text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.45;
      letter-spacing: -0.015em;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    code, kbd, pre, .astryx-mono, .astryx-badge, .astryx-stat-value {
      font-family: var(--forge-font-mono);
      font-variant-numeric: tabular-nums;
    }

    .astryx-container {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
  `;
}
