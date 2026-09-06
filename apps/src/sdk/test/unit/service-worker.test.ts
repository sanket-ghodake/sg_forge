/**
 * @forge/sdk - Tier 1 Unit: Service Worker Offline Resilience Engine (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert)
 * Enterprise SRE Zero-Downtime & Enterprise AppSec Zero-Leak Standards
 */

import { describe, expect, it } from 'bun:test';
import {
  DEFAULT_CACHE_NAME,
  DEFAULT_OFFLINE_URL,
  getServiceWorkerRegistrationScript,
  getServiceWorkerScript,
  handleServiceWorkerRequest,
} from '../../src/service-worker';
import { renderAstryxSystemDownPage } from '@forge/ui';

describe('Tier 1 Unit: Service Worker Offline Resilience Engine', () => {
  it('Arrange, Act, Assert: generates valid air-gapped Service Worker script with cache listeners', () => {
    // Arrange
    const version = 'v2-test';
    const offlineUrl = '/custom-offline.html';

    // Act
    const script = getServiceWorkerScript({ version, offlineUrl });

    // Assert
    expect(script).toContain(`const CACHE_NAME = 'sg-forge-offline-v2-test';`);
    expect(script).toContain(`const OFFLINE_URL = '/custom-offline.html';`);
    expect(script).toContain("addEventListener('install'");
    expect(script).toContain("addEventListener('activate'");
    expect(script).toContain("addEventListener('fetch'");
    expect(script).toContain("event.request.mode === 'navigate'");
    expect(script).toContain('caches.open(CACHE_NAME)');
    expect(script).toContain('cache.match(OFFLINE_URL)');
  });

  it('Arrange, Act, Assert: uses default parameters when no options are provided', () => {
    // Arrange & Act
    const script = getServiceWorkerScript();

    // Assert
    expect(script).toContain(`const CACHE_NAME = '${DEFAULT_CACHE_NAME}';`);
    expect(script).toContain(`const OFFLINE_URL = '${DEFAULT_OFFLINE_URL}';`);
  });

  it('Arrange, Act, Assert: generates client-side registration snippet with HTTPS/localhost guard', () => {
    // Arrange
    const customSw = '/portal/sw.js';

    // Act
    const html = getServiceWorkerRegistrationScript(customSw);

    // Assert
    expect(html).toContain('<script>');
    expect(html).toContain('serviceWorker');
    expect(html).toContain(`navigator.serviceWorker.register('${customSw}'`);
    expect(html).toContain("window.location.protocol === 'https:'");
    expect(html).toContain("window.location.hostname === 'localhost'");
    expect(html).toContain("window.location.hostname === '127.0.0.1'");
  });

  it('Arrange, Act, Assert: renderAstryxSystemDownPage renders branded Astryx maintenance screen', () => {
    // Arrange
    const brandName = 'Enterprise Nexus Test';

    // Act
    const html = renderAstryxSystemDownPage({ brandName });

    // Assert
    expect(html).toContain('503');
    expect(html).toContain('System Under Maintenance');
    expect(html).toContain(brandName);
    expect(html).toContain('astryx');
    expect(html).toContain('--forge-bg');
    expect(html).toContain('Check Again');
  });

  it('Arrange, Act, Assert: handleServiceWorkerRequest serves /sw.js with correct headers', () => {
    // Arrange
    const req = new Request('http://localhost/sw.js');

    // Act
    const res = handleServiceWorkerRequest(req);

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(200);
    expect(res!.headers.get('Content-Type')).toContain('application/javascript');
    expect(res!.headers.get('Service-Worker-Allowed')).toBe('/');
    expect(res!.headers.get('Cache-Control')).toContain('no-cache');
  });

  it('Arrange, Act, Assert: handleServiceWorkerRequest serves /__offline_error.html with Astryx markup', async () => {
    // Arrange
    const req = new Request('http://localhost/__offline_error.html');

    // Act
    const res = handleServiceWorkerRequest(req, { brandName: 'Test Brand Dynamic' });

    // Assert
    expect(res).not.toBeNull();
    expect(res!.status).toBe(200);
    expect(res!.headers.get('Content-Type')).toContain('text/html');
    expect(res!.headers.get('X-Forge-Offline-Asset')).toBe('cached-screen');

    const body = await res!.text();
    expect(body).toContain('503');
    expect(body).toContain('Test Brand Dynamic');
    expect(body).toContain('System Under Maintenance');
  });

  it('Arrange, Act, Assert: handleServiceWorkerRequest returns null for non-matching paths', () => {
    // Arrange
    const req = new Request('http://localhost/api/employees');

    // Act
    const res = handleServiceWorkerRequest(req);

    // Assert
    expect(res).toBeNull();
  });
});
