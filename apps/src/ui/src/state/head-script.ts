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
      /* 1. Universal Browser Error & Extension Telemetry Shield */
      var isNoise = function(m, s, stk) {
        var str = ((m || '') + ' ' + (s || '') + ' ' + (stk || '')).toLowerCase();
        return (
          str.indexOf("reading 'starttime'") !== -1 ||
          str.indexOf("reportallchanges") !== -1 ||
          str.indexOf("chrome-extension:") !== -1 ||
          str.indexOf("moz-extension:") !== -1 ||
          str.indexOf("safari-extension:") !== -1 ||
          str.indexOf("edge-extension:") !== -1 ||
          str.indexOf("extensions::") !== -1 ||
          (str.indexOf("starttime") !== -1 && (str.indexOf("vm") !== -1 || str.indexOf("<anonymous>") !== -1))
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
        if (isNoise(e.message, e.filename, e.error && e.error.stack)) {
          e.preventDefault && e.preventDefault();
          e.stopPropagation && e.stopPropagation();
          e.stopImmediatePropagation && e.stopImmediatePropagation();
        }
      }, true);

      window.addEventListener('unhandledrejection', function(e) {
        var reason = e.reason;
        var msg = reason instanceof Error ? reason.message : String(reason || '');
        var stk = reason instanceof Error ? reason.stack : '';
        if (isNoise(msg, '', stk)) {
          e.preventDefault && e.preventDefault();
          e.stopPropagation && e.stopPropagation();
          e.stopImmediatePropagation && e.stopImmediatePropagation();
        }
      }, true);

      /* 2. Defensive PerformanceObserver Safe-Guard */
      if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.prototype && PerformanceObserver.prototype.observe) {
        var origObserve = PerformanceObserver.prototype.observe;
        PerformanceObserver.prototype.observe = function(opts) {
          try {
            return origObserve.call(this, opts);
          } catch(err) {
            /* Ignore unsupported metrics or observe collisions from injected scripts */
          }
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
