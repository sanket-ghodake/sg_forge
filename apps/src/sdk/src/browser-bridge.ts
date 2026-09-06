/**
 * @forge/sdk - Enterprise Foundation SDK: Browser Log Bridge (v2.0.0 LTS)
 * Hardened Enterprise Standard:
 * - Intercepts uncaught runtime errors, unhandled rejections, and console errors
 * - Sanitizes payloads recursively of sensitive credentials
 * - Sends structured beacons to the app's dedicated /api/logs/browser endpoint
 */

import { redactSensitiveData } from './logger';

/**
 * Initializes browser telemetry bridge with PII sanitization and extension noise shield.
 * @requirements [HLR-SDK-303] [LLR-SDK-006]
 */
export function initBrowserLogBridge(
  serviceName: string,
  ingestEndpoint = '/api/logs/browser'
): void {
  if (typeof window === 'undefined' || !window.console) return;

  const originalConsoleError = window.console.error ? window.console.error.bind(window.console) : () => {};
  const originalConsoleWarn = window.console.warn ? window.console.warn.bind(window.console) : () => {};

  const sendBrowserLog = (severity: 'WARN' | 'ERROR', message: string, stack?: string) => {
    try {
      const sanitizedMsg =
        typeof message === 'string' ? (redactSensitiveData(message) as string) : message;
      const sanitizedStack = stack ? (redactSensitiveData(stack) as string) : undefined;

      const payload = JSON.stringify({
        service: serviceName,
        severity,
        message: sanitizedMsg,
        timestamp: new Date().toISOString(),
        source: 'browser',
        error: sanitizedStack
          ? { name: 'BrowserError', message: sanitizedMsg, stack: sanitizedStack }
          : undefined,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(ingestEndpoint, new Blob([payload], { type: 'application/json' }));
      } else {
        window
          .fetch(ingestEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          })
          .catch(() => {});
      }
    } catch {}
  };

  const isNoise = (message?: string, filename?: string, stack?: string): boolean => {
    const combined = `${message || ''} ${filename || ''} ${stack || ''}`.toLowerCase();
    return (
      combined.includes("reading 'starttime'") ||
      combined.includes('reportallchanges') ||
      combined.includes('chrome-extension:') ||
      combined.includes('moz-extension:') ||
      combined.includes('safari-extension:') ||
      combined.includes('edge-extension:') ||
      combined.includes('extensions::') ||
      (combined.includes('starttime') && (combined.includes('vm') || combined.includes('<anonymous>')))
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      // Suppress browser extension, Chrome DevTools, and third-party script errors
      if (isNoise(event.message, event.filename, event.error?.stack)) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        return;
      }
      sendBrowserLog('ERROR', event.message || 'Uncaught Script Error', event.error?.stack);
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
    const stack = event.reason instanceof Error ? event.reason.stack : undefined;
    if (isNoise(msg, undefined, stack)) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      return;
    }
    sendBrowserLog('ERROR', `Unhandled Promise Rejection: ${msg}`, stack);
  });

  window.console.error = (...args: any[]) => {
    originalConsoleError.apply(window.console, args);
    const message = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ');
    if (isNoise(message)) {
      return;
    }
    sendBrowserLog('ERROR', message);
  };

  window.console.warn = (...args: any[]) => {
    originalConsoleWarn.apply(window.console, args);
    const message = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ');
    if (isNoise(message)) {
      return;
    }
    sendBrowserLog('WARN', message);
  };
}
