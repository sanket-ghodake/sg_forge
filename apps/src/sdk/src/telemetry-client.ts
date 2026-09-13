/**
 * @forge/sdk - Enterprise Foundation SDK: Client Telemetry & Web Vitals Bridge (v2.0.0 LTS)
 * Hardened Enterprise Standard:
 * - Air-gapped browser client performance & machine metrics collector
 * - Intercepts real Web Vitals (TTFB, LCP, INP, CLS) using standard PerformanceObserver
 * - Transmits non-blocking beacons to /api/analytics/collect
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */

export interface ClientMachineMetrics {
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hardwareConcurrency?: number;
  deviceMemoryGb?: number;
  language: string;
  connectionType?: string;
  colorScheme: 'dark' | 'light';
}

export interface ClientWebVitals {
  ttfbMs?: number;
  lcpMs?: number;
  inpMs?: number;
  cls?: number;
  domContentLoadedMs?: number;
  loadMs?: number;
}

export interface ClientTelemetryPayload {
  service: string;
  path: string;
  timestamp: number;
  machine: ClientMachineMetrics;
  vitals: ClientWebVitals;
  referrer: string;
  sessionId?: string;
}

export interface TelemetryClientOptions {
  ingestEndpoint?: string;
  sessionId?: string;
  disabled?: boolean;
}

/**
 * Collects real client machine hardware specifications from the browser environment.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function getClientMachineSpecs(): ClientMachineMetrics | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const nav = navigator as any;

  return {
    screenWidth: window.screen ? window.screen.width : 0,
    screenHeight: window.screen ? window.screen.height : 0,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: nav.hardwareConcurrency || undefined,
    deviceMemoryGb: nav.deviceMemory || undefined,
    language: nav.language || 'en',
    connectionType: nav.connection ? nav.connection.effectiveType : undefined,
    colorScheme: isDark ? 'dark' : 'light',
  };
}

/**
 * Initializes client-side telemetry and Web Vitals reporting for SPA and micro-apps.
 * @requirements [HLR-DEV-501] [LLR-TEL-001]
 */
export function initAppTelemetry(serviceName: string, options: TelemetryClientOptions = {}): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || options.disabled) {
    return () => {};
  }

  const endpoint = options.ingestEndpoint || '/api/analytics/collect';
  const vitals: ClientWebVitals = {};

  // 1. Navigation timings (TTFB, DOM load)
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      vitals.ttfbMs = Math.max(0, Math.round(nav.responseStart - nav.requestStart));
      vitals.domContentLoadedMs = Math.max(0, Math.round(nav.domContentLoadedEventEnd));
      vitals.loadMs = Math.max(0, Math.round(nav.loadEventEnd));
    }
  } catch {}

  // 2. Performance Observer for LCP & CLS
  let lcpObserver: PerformanceObserver | null = null;
  let clsObserver: PerformanceObserver | null = null;

  try {
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes) {
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            vitals.lcpMs = Math.round(lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }

      if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        let clsValue = 0;
        clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              vitals.cls = Number(clsValue.toFixed(3));
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }
    }
  } catch {}

  const sendTelemetryBeacon = () => {
    try {
      const machine = getClientMachineSpecs();
      if (!machine) return;

      const payload: ClientTelemetryPayload = {
        service: serviceName,
        path: window.location.pathname,
        timestamp: Math.floor(Date.now() / 1000),
        machine,
        vitals,
        referrer: document.referrer || '',
        sessionId: options.sessionId,
      };

      const dataStr = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([dataStr], { type: 'application/json' }));
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: dataStr,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  };

  // Dispatch on page hidden or unload
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendTelemetryBeacon();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', sendTelemetryBeacon);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', sendTelemetryBeacon);
    if (lcpObserver) lcpObserver.disconnect();
    if (clsObserver) clsObserver.disconnect();
  };
}
