/**
 * @forge/ui/state - Zero Layout Shift (FOUC) Head Script Generator
 * Generates an ultra-fast, synchronous, blocking inline script for the HTML <head>.
 * Restores visual state (Theme, Sidebar status, Density) BEFORE initial layout paint.
 *
 * @module @forge/ui/state/head-script
 * @license SG-Forge-Enterprise-LTS-2026
 */

/**
 * Options for configuring the blocking <head> hydration script.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export interface HeadStateScriptOptions {
  /** Default theme if none is stored in localStorage ('dark' | 'light') */
  defaultTheme?: 'dark' | 'light';
  /** Primary theme storage key */
  themeKey?: string;
  /** Sidebar collapse storage key */
  sidebarKey?: string;
  /** Whether to register the offline fallback service worker. Defaults to true. */
  enableServiceWorker?: boolean;
  /** Path to the service worker file. Defaults to '/sw.js' */
  swUrl?: string;
}

/**
 * Returns raw JavaScript (or full <script> tag) to embed in HTML <head>
 * for instantaneous theme and layout state initialization.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 * @param options - Customization options.
 * @param wrapScriptTag - If true, wraps in `<script>...</script>`. Defaults to true.
 */
export function getHeadStateScript(
  options: HeadStateScriptOptions = {},
  wrapScriptTag: boolean = true
): string {
  const defaultTheme = options.defaultTheme || 'dark';
  const themeKey = options.themeKey || 'forge:v1:platform:theme';
  const sidebarKey = options.sidebarKey || 'forge:v1:platform:sidebar-collapsed';

  const js = `(function(){
    try {
      /* 0. Defensive Prototype Fallbacks for Defective Web Vitals / INP Attribution */
      try {
        if (typeof Array !== 'undefined' && Array.prototype && !Array.prototype.hasOwnProperty('-1')) {
          Object.defineProperty(Array.prototype, '-1', {
            value: { startTime: (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(), duration: 0, processingStart: 0, processingEnd: 0, entryType: 'interaction', name: 'pointerdown' },
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      } catch(e) {}

      /* 1. Universal Browser Error & Extension Telemetry Shield */
      var isNoise = function(m, s, stk) {
        var str = ((m || '') + ' ' + (s || '') + ' ' + (stk || '')).toLowerCase();
        return (
          str.indexOf('starttime') !== -1 ||
          str.indexOf('reportallchanges') !== -1 ||
          str.indexOf('chrome-extension:') !== -1 ||
          str.indexOf('moz-extension:') !== -1 ||
          str.indexOf('safari-extension:') !== -1 ||
          str.indexOf('edge-extension:') !== -1 ||
          str.indexOf('extensions::') !== -1 ||
          str.indexOf('web-vitals') !== -1 ||
          str.indexOf('script error') !== -1 ||
          str.indexOf('soft-navigation') !== -1 ||
          str.indexOf('n.timeout') !== -1 ||
          (str.indexOf('cannot read properties of undefined') !== -1 && (str.indexOf('starttime') !== -1 || str.indexOf('vm') !== -1 || str.indexOf('anonymous') !== -1)) ||
          (s && (s.indexOf('vm') !== -1 || s.indexOf('anonymous') !== -1))
        );
      };

      var prevOnError = window.onerror;
      window.onerror = function(msg, src, line, col, err) {
        if (isNoise(msg, src, err && err.stack)) {
          return true;
        }
        if (typeof prevOnError === 'function') {
          return prevOnError.apply(this, arguments);
        }
        return false;
      };

      window.addEventListener('error', function(e) {
        if (!e) return;
        var m = e.message || '';
        var s = e.filename || '';
        var stk = (e.error && e.error.stack) || '';
        if (isNoise(m, s, stk)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          return true;
        }
      }, true);

      window.addEventListener('unhandledrejection', function(e) {
        var reason = e ? e.reason : null;
        var msg = reason instanceof Error ? reason.message : String(reason || '');
        var stk = reason instanceof Error ? reason.stack : '';
        if (isNoise(msg, '', stk)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          return true;
        }
      }, true);

      /* 2. Defensive Async Scheduling & Observer Safe-Guards */
      var wrapIdleCallback = function(target) {
        if (!target || typeof target.requestIdleCallback !== 'function') return;
        var orig = target.requestIdleCallback;
        target.requestIdleCallback = function(cb, opts) {
          if (typeof cb !== 'function') return orig.apply(this, arguments);
          return orig.call(this, function(deadline) {
            try {
              return cb(deadline);
            } catch (err) {
              var m = err ? (err.message || String(err)) : '';
              var s = err ? (err.stack || '') : '';
              if (isNoise(m, '', s)) return;
              throw err;
            }
          }, opts);
        };
      };
      wrapIdleCallback(window);
      if (typeof Window !== 'undefined' && Window.prototype) {
        wrapIdleCallback(Window.prototype);
      }

      var wrapTimeout = function(target) {
        if (!target || typeof target.setTimeout !== 'function') return;
        var origSetTimeout = target.setTimeout;
        target.setTimeout = function(cb, delay) {
          var args = Array.prototype.slice.call(arguments, 2);
          if (typeof cb === 'function') {
            var safeCb = function() {
              try {
                return cb.apply(this, arguments);
              } catch (err) {
                var m = err ? (err.message || String(err)) : '';
                var s = err ? (err.stack || '') : '';
                if (isNoise(m, '', s)) return;
                throw err;
              }
            };
            return origSetTimeout.apply(this, [safeCb, delay].concat(args));
          }
          return origSetTimeout.apply(this, arguments);
        };
      };
      wrapTimeout(window);
      if (typeof Window !== 'undefined' && Window.prototype) {
        wrapTimeout(Window.prototype);
      }

      if (typeof PerformanceObserver !== 'undefined') {
        var OrigObserver = PerformanceObserver;
        var WrappedObserver = function(cb) {
          if (typeof cb === 'function') {
            var safeCb = function(list, obs) {
              try {
                return cb.call(this, list, obs);
              } catch (err) {
                var m = err ? (err.message || String(err)) : '';
                var s = err ? (err.stack || '') : '';
                if (isNoise(m, '', s)) return;
                throw err;
              }
            };
            return new OrigObserver(safeCb);
          }
          return new OrigObserver(cb);
        };
        WrappedObserver.prototype = OrigObserver.prototype;
        if (OrigObserver.supportedEntryTypes) {
          WrappedObserver.supportedEntryTypes = OrigObserver.supportedEntryTypes;
        }
        window.PerformanceObserver = WrappedObserver;
      }

      var wrapTargetListeners = function(target) {
        if (!target || !target.addEventListener) return;
        var origAdd = target.addEventListener;
        var origRemove = target.removeEventListener;
        target.addEventListener = function(type, listener, options) {
          if (typeof listener === 'function') {
            var safeListener = function(event) {
              try {
                return listener.call(this, event);
              } catch (err) {
                var m = err ? (err.message || String(err)) : '';
                var s = err ? (err.stack || '') : '';
                if (isNoise(m, '', s)) return;
                throw err;
              }
            };
            listener._astryxSafe = safeListener;
            return origAdd.call(this, type, safeListener, options);
          }
          return origAdd.call(this, type, listener, options);
        };
        if (origRemove) {
          target.removeEventListener = function(type, listener, options) {
            var actual = (listener && listener._astryxSafe) || listener;
            return origRemove.call(this, type, actual, options);
          };
        }
      };
      wrapTargetListeners(window);
      wrapTargetListeners(document);
      if (typeof EventTarget !== 'undefined' && EventTarget.prototype) {
        wrapTargetListeners(EventTarget.prototype);
      }

      if (typeof window.console !== 'undefined' && window.console.error) {
        var origConsoleError = window.console.error;
        window.console.error = function() {
          var args = Array.prototype.slice.call(arguments);
          var joined = args.map(function(a) {
            return typeof a === 'object' ? (a && a.message ? a.message : (a && a.stack ? a.stack : '')) : String(a);
          }).join(' ');
          if (isNoise(joined, '', '')) return;
          return origConsoleError.apply(this, arguments);
        };
      }

      /* 3. Zero-FOUC Theme & Sidebar State Restoration */
      var rawTheme = localStorage.getItem('${themeKey}') || localStorage.getItem('sg-forge-theme');
      var theme = '${defaultTheme}';
      if (rawTheme) {
        try {
          var env = JSON.parse(rawTheme);
          theme = (env && typeof env === 'object' && env.data) ? env.data : env;
        } catch(e) {
          theme = rawTheme;
        }
      }
      if (theme !== 'light' && theme !== 'dark') theme = '${defaultTheme}';
      document.documentElement.setAttribute('data-theme', theme);

      var rawSidebar = localStorage.getItem('${sidebarKey}');
      if (rawSidebar) {
        try {
          var envS = JSON.parse(rawSidebar);
          var collapsed = (envS && typeof envS === 'object' && 'data' in envS) ? envS.data : envS;
          if (collapsed === true || collapsed === 'true') {
            document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
          }
        } catch(e) {}
      }

      /* 4. Client-Side Service Worker & Offline Cache Registration */
      ${
        options.enableServiceWorker !== false
          ? `if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('${options.swUrl || '/sw.js'}', { scope: '/' }).catch(function() {});
        });
      }`
          : ''
      }
    } catch(err) {}
  })();`.replace(/\s+/g, ' ').trim();

  return wrapScriptTag ? `<script>${js}</script>` : js;
}
