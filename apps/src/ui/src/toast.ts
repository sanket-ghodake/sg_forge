/**
 * @forge/ui - Astryx Toast Notification Client Engine (2026 LTS)
 * Lightweight zero-dependency client script injecting accessible, animated Astryx toasts.
 * Replaces native browser alert() and confirm() dialogs across the platform.
 */

/**
 * Generates client-side animated Astryx toast notification controller script.
 * @requirements [HLR-UI-402] [LLR-UI-003]
 */
export function getAstryxToastScript(): string {
  return `
    (function() {
      if (typeof window === 'undefined') return;

      function ensureToastContainer() {
        var container = document.getElementById('astryx-toast-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'astryx-toast-container';
          container.className = 'astryx-toast-container';
          container.setAttribute('aria-live', 'polite');
          container.setAttribute('aria-atomic', 'true');
          document.body.appendChild(container);
        }
        return container;
      }

      var ICON_SVGS = {
        success: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--forge-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--forge-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--forge-warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--forge-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      /**
       * Dispatches an Astryx toast notification to the viewport.
       * @param {string} message Toast message text or HTML
       * @param {'success'|'error'|'warning'|'info'} [type='info'] Notification status
       * @param {number} [duration=4000] Auto-dismiss duration in ms (0 for persistent)
       */
      window.astryxToast = function(message, type, duration) {
        if (!type) type = 'info';
        if (duration === undefined) duration = 4000;

        try {
          var container = ensureToastContainer();
          var toast = document.createElement('div');
          toast.className = 'astryx-toast astryx-toast-' + type;
          toast.setAttribute('role', 'status');

          var icon = document.createElement('span');
          icon.className = 'astryx-toast-icon';
          icon.innerHTML = ICON_SVGS[type] || ICON_SVGS.info;

          var content = document.createElement('div');
          content.className = 'astryx-toast-content';
          content.innerHTML = message;

          var closeBtn = document.createElement('button');
          closeBtn.className = 'astryx-toast-close';
          closeBtn.innerHTML = '&times;';
          closeBtn.title = 'Dismiss notification';
          closeBtn.setAttribute('aria-label', 'Close');

          function removeToast() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px) scale(0.95)';
            setTimeout(function() {
              if (toast.parentElement) toast.remove();
            }, 200);
          }

          closeBtn.onclick = removeToast;

          toast.appendChild(icon);
          toast.appendChild(content);
          toast.appendChild(closeBtn);

          var dismissTimer = null;
          var remainingTime = duration;
          var startTime = Date.now();

          if (duration > 0) {
            var progress = document.createElement('div');
            progress.className = 'astryx-toast-progress';
            progress.style.animationDuration = duration + 'ms';
            toast.appendChild(progress);

            function startTimer(ms) {
              startTime = Date.now();
              dismissTimer = setTimeout(removeToast, ms);
            }

            toast.addEventListener('mouseenter', function() {
              if (dismissTimer) {
                clearTimeout(dismissTimer);
                dismissTimer = null;
                remainingTime -= (Date.now() - startTime);
                if (progress) progress.style.animationPlayState = 'paused';
              }
            });

            toast.addEventListener('mouseleave', function() {
              if (remainingTime > 0 && !dismissTimer) {
                if (progress) progress.style.animationPlayState = 'running';
                startTimer(remainingTime);
              }
            });

            startTimer(duration);
          }

          container.appendChild(toast);
        } catch (e) {
          console.error('[Astryx Toast Error]', e);
        }
      };

      window.astryxToast.show = function(message, type, duration) {
        return window.astryxToast(message, type, duration);
      };
      window.astryxToast.success = function(message, duration) {
        return window.astryxToast(message, 'success', duration);
      };
      window.astryxToast.error = function(message, duration) {
        return window.astryxToast(message, 'error', duration);
      };
      window.astryxToast.warning = function(message, duration) {
        return window.astryxToast(message, 'warning', duration);
      };
      window.astryxToast.info = function(message, duration) {
        return window.astryxToast(message, 'info', duration);
      };
    })();
  `;
}

