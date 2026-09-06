/**
 * @forge/ui - Universal Astryx Tooltip & Popover Engine (2026 LTS)
 * High-performance, viewport-safe, collision-detected tooltips that replace browser defaults.
 */

/**
 * Generates viewport-safe, smart collision-detected floating tooltip script.
 * @requirements [HLR-UI-402] [LLR-UI-002]
 */
export function getAstryxTooltipScript(): string {
  return `
    (function initAstryxUniversalTooltips() {
      if (typeof window === 'undefined') return;

      let tooltipEl = null;
      let hideTimer = null;
      let activeTarget = null;

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
        activeTarget = el;
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

      // Intercept mouseover on tooltips AND convert legacy title attributes to prevent browser defaults
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
        if (target) {
          hideTooltip();
        }
      }, true);

      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-astryx-tooltip], [data-tooltip]');
        if (target) {
          const text = target.getAttribute('data-astryx-tooltip') || target.getAttribute('data-tooltip') || '';
          const title = target.getAttribute('data-tooltip-title') || '';
          if (text || title) {
            showTooltip(target, text, title);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(hideTooltip, 3500);
          }
        }
      }, true);

      window.addEventListener('scroll', hideTooltip, true);
      window.addEventListener('resize', hideTooltip, true);

      window.astryxTooltip = function(targetEl, content, title) {
        if (targetEl && content) {
          showTooltip(targetEl, content, title);
        } else {
          hideTooltip();
        }
      };
    })();
  `;
}
