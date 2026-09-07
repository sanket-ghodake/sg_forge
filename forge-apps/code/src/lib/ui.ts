/**
 * SG Forge Micro-App Submodule - Standalone Astryx UI (2026 LTS)
 * 100% Isolated: Zero imports from central platform monorepo.
 * Renders Astryx design tokens, buttons, cards, headers, and tooltips.
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */

export function getHeadStateScript(options: { defaultTheme?: 'dark' | 'light' } = {}): string {
  const theme = options.defaultTheme || 'dark';
  return `
    <script>
      (function() {
        const theme = localStorage.getItem('forge_theme') || '${theme}';
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
  `;
}

/**
 * getAstryxStyles
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getAstryxStyles(): string {
  return `
    :root {
      --forge-bg-root: #0b0f17;
      --forge-bg-surface: #111827;
      --forge-bg-card: rgba(17, 24, 39, 0.85);
      --forge-border: #1f2937;
      --forge-primary: #3b82f6;
      --forge-primary-hover: #2563eb;
      --forge-accent: #8b5cf6;
      --forge-text-main: #f3f4f6;
      --forge-text-muted: #9ca3af;
      --forge-success: #10b981;
      --forge-success-bg: rgba(16, 185, 129, 0.15);
      --forge-error: #ef4444;
      --forge-radius: 8px;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    [data-theme="light"] {
      --forge-bg-root: #f8fafc;
      --forge-bg-surface: #ffffff;
      --forge-bg-card: rgba(255, 255, 255, 0.9);
      --forge-border: #e2e8f0;
      --forge-primary: #2563eb;
      --forge-primary-hover: #1d4ed8;
      --forge-accent: #7c3aed;
      --forge-text-main: #0f172a;
      --forge-text-muted: #64748b;
      --forge-success: #059669;
      --forge-success-bg: rgba(5, 150, 105, 0.12);
      --forge-error: #dc2626;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font-family);
      background-color: var(--forge-bg-root);
      color: var(--forge-text-main);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .astryx-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .astryx-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.5rem;
      background: var(--forge-bg-surface);
      border-bottom: 1px solid var(--forge-border);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .astryx-card {
      background: var(--forge-bg-card);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 1.5rem;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .astryx-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: var(--forge-radius);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      border: 1px solid transparent;
    }

    .btn-primary {
      background-color: var(--forge-primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: var(--forge-primary-hover);
    }

    .btn-outline {
      background-color: transparent;
      border-color: var(--forge-border);
      color: var(--forge-text-main);
    }
    .btn-outline:hover {
      background-color: var(--forge-border);
    }

    .astryx-floating-tooltip {
      position: fixed;
      display: none;
      z-index: 99999;
      background: var(--forge-bg-surface);
      color: var(--forge-text-main);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 6px 12px;
      font-size: 0.75rem;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.15s ease;
      max-width: 320px;
    }
    .astryx-floating-tooltip.visible {
      opacity: 1;
    }
    .astryx-tooltip-title {
      font-weight: 600;
      margin-bottom: 2px;
      color: var(--forge-primary);
    }
  `;
}

/**
 * getAstryxHeaderHtml
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getAstryxHeaderHtml(appName: string, badgeText: string = 'FORGE SUBMODULE'): string {
  return `
    <header class="astryx-header">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-weight: 700; font-size: 1.1rem; letter-spacing: -0.02em;">${appName}</span>
        <span style="font-size: 0.65rem; text-transform: uppercase; background: var(--forge-primary); color: #fff; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700;">${badgeText}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <a href="/portal" class="astryx-btn btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">Portal</a>
      </div>
    </header>
  `;
}

/**
 * getAstryxToastScript
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getAstryxToastScript(): string {
  return `
    (function() {
      if (typeof window === 'undefined') return;
      window.astryxToast = {
        show: function(msg, type) {
          const el = document.createElement('div');
          el.className = 'astryx-toast astryx-toast-' + (type || 'info');
          el.textContent = msg;
          Object.assign(el.style, {
            position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
            background: 'var(--forge-bg-surface, #111827)', color: 'var(--forge-text-main, #fff)',
            padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--forge-border, #374151)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)', transition: 'all 0.2s ease'
          });
          document.body.appendChild(el);
          setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); }, 3000);
        },
        success: function(msg) { this.show(msg, 'success'); },
        error: function(msg) { this.show(msg, 'error'); },
        info: function(msg) { this.show(msg, 'info'); }
      };
    })();
  `;
}

/**
 * getAstryxTooltipScript
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getAstryxTooltipScript(): string {
  return `
    (function initAstryxUniversalTooltips() {
      if (typeof window === 'undefined') return;

      let tooltipEl = null;
      let hideTimer = null;

      function getTooltipContainer() {
        if (!tooltipEl) {
          tooltipEl = document.getElementById('astryx-global-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'astryx-global-tooltip';
            tooltipEl.className = 'astryx-floating-tooltip';
            document.body.appendChild(tooltipEl);
          }
        }
        return tooltipEl;
      }

      function showTooltip(el, text, title) {
        if (!text && !title) return;
        clearTimeout(hideTimer);
        const tip = getTooltipContainer();
        const titleHtml = title ? '<div class="astryx-tooltip-title">' + title + '</div>' : '';
        tip.innerHTML = titleHtml + '<div style="color:var(--forge-text-main); word-break:break-word;">' + text + '</div>';
        tip.style.display = 'block';

        const rect = el.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();

        let top = rect.bottom + 8;
        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

        // Auto-flip UP if overflowing bottom viewport edge
        if (top + tipRect.height > window.innerHeight - 10) {
          top = Math.max(10, rect.top - tipRect.height - 8);
        }

        // Clamp horizontal bounds inside viewport
        left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));

        tip.style.top = top + 'px';
        tip.style.left = left + 'px';

        requestAnimationFrame(() => {
          tip.classList.add('visible');
        });
      }

      function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.classList.remove('visible');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (!tooltipEl.classList.contains('visible')) {
            tooltipEl.style.display = 'none';
          }
        }, 150);
      }

      // Intercept mouseover and auto-convert legacy title tooltips to Astryx
      document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-astryx-tooltip], [data-tooltip], [title]');
        if (target) {
          if (target.hasAttribute('title') && target.getAttribute('title')) {
            const rawTitle = target.getAttribute('title');
            target.setAttribute('data-astryx-tooltip', rawTitle);
            target.removeAttribute('title');
          }
          const text = target.getAttribute('data-astryx-tooltip') || target.getAttribute('data-tooltip') || '';
          const title = target.getAttribute('data-tooltip-title') || '';
          if (text || title) {
            showTooltip(target, text, title);
          }
        }
      }, true);

      document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-astryx-tooltip], [data-tooltip], [title]');
        if (target) hideTooltip();
      }, true);

      window.addEventListener('scroll', hideTooltip, true);
      window.addEventListener('resize', hideTooltip, true);
    })();
  `;
}

