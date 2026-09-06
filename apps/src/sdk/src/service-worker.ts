/**
 * @forge/sdk - Universal Client-Side Service Worker & Offline Outage Resilience (2026 LTS)
 * Enterprise SRE Zero-Downtime & Enterprise AppSec Client-Side Offline Standards:
 * - Pre-caches air-gapped Astryx system-down error page on first client visit
 * - Intercepts browser navigation failures, TCP connection timeouts, and server crashes
 * - Instantly serves cached branded error page directly from local machine cache storage
 * - Zero external CDN dependencies, 100% domain/IP-agnostic (HTTPS & Localhost compliant)
 */

import { renderAstryxSystemDownPage } from '@forge/ui';
import { loadBrandConfig } from './branding';

/**
 * Options for generating air-gapped service worker script.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export interface ServiceWorkerOptions {
  version?: string;
  offlineUrl?: string;
  cacheName?: string;
}

/**
 * Default offline fallback HTML route for cached service worker.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export const DEFAULT_OFFLINE_URL = '/__offline_error.html';

/**
 * Default cache version identifier for offline assets.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export const DEFAULT_SW_VERSION = 'v1';

/**
 * Default cache storage namespace.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export const DEFAULT_CACHE_NAME = `sg-forge-offline-${DEFAULT_SW_VERSION}`;

/**
 * Generates the raw, air-gapped Service Worker JavaScript code to be served at /sw.js
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export function getServiceWorkerScript(options: ServiceWorkerOptions = {}): string {
  const version = options.version || DEFAULT_SW_VERSION;
  const offlineUrl = options.offlineUrl || DEFAULT_OFFLINE_URL;
  const cacheName = options.cacheName || `sg-forge-offline-${version}`;

  return `/* SG Forge - Air-Gapped Client-Side Resilience Service Worker (${version}) */
const CACHE_NAME = '${cacheName}';
const OFFLINE_URL = '${offlineUrl}';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
      } catch (err) {
        // Fallback or air-gapped installation continues
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith('sg-forge-offline-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if ([502, 503, 504].includes(networkResponse.status)) {
            const contentType = networkResponse.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
              const cache = await caches.open(CACHE_NAME);
              const cached = await cache.match(OFFLINE_URL);
              if (cached) return cached;
            }
          }
          return networkResponse;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(OFFLINE_URL);
          if (cached) {
            return cached;
          }
          return Response.error();
        }
      })()
    );
  }
});
`;
}

/**
 * Returns the client-side JavaScript snippet to register the service worker
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export function getServiceWorkerRegistrationScript(swUrl = '/sw.js'): string {
  return `<script>
(function() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    var isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    if (isSecure) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('${swUrl}', { scope: '/' })
          .catch(function() {});
      });
    }
  }
})();
</script>`;
}

/**
 * Handles incoming HTTP requests for /sw.js and /__offline_error.html.
 * Returns a Response if handled, or null if the request does not match.
 * @requirements [HLR-UI-403] [LLR-UI-005]
 */
export function handleServiceWorkerRequest(
  req: Request,
  options: {
    offlineHtml?: string;
    version?: string;
    brandName?: string;
  } = {}
): Response | null {
  const url = new URL(req.url);

  // 1. Service Worker Script Endpoint (/sw.js)
  if (url.pathname === '/sw.js' || url.pathname === '/portal/sw.js') {
    const script = getServiceWorkerScript({ version: options.version });
    return new Response(script, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // 2. Offline Fallback Error Page Endpoint (/__offline_error.html)
  if (
    url.pathname === DEFAULT_OFFLINE_URL ||
    url.pathname === `/portal${DEFAULT_OFFLINE_URL}` ||
    url.pathname === '/offline.html' ||
    url.pathname === '/portal/offline.html'
  ) {
    const brand = loadBrandConfig();
    const brandName = options.brandName || brand.name;
    const html =
      options.offlineHtml ||
      renderAstryxSystemDownPage({
        brandName,
        message: `${brandName} is temporarily undergoing scheduled maintenance or system updates. Services will resume shortly.`,
      });

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, must-revalidate',
        'X-Forge-Offline-Asset': 'cached-screen',
      },
    });
  }

  return null;
}
