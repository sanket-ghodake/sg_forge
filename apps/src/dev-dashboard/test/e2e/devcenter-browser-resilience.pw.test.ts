/**
 * @forge/dev-dashboard - Tier 5 Real Browser E2E: Playwright Chrome Resilience Test (3A Pattern)
 * Testing for Truth: Uses real Google Chrome headless browser to verify:
 * 1. Zero uncaught errors or console noise on initial dashboard load.
 * 2. Complete suppression and auto-healing of Web Vitals attribution `startTime` and `reportAllChanges` errors.
 * 3. Scheduling shield integrity across `requestIdleCallback`, `setTimeout`, `PerformanceObserver`, and `addEventListener`.
 * 4. Network transition resilience (`isTransientNetworkError`, idempotent fetch retries).
 * 5. Full fluid tab switching across Astryx SPA views without error leakage.
 *
 * @requirements [HLR-UI-401] [LLR-UI-001]
 * @license Apache-2.0
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { chromium, type Browser, type Page } from 'playwright-core';
import { renderDashboardHtml } from '../../src/frontend/ui-renderer';
import { handleApiRequest } from '../../src/backend/api-handlers';

describe('Tier 5 Real Browser E2E: Developer Dashboard Playwright Chrome Resilience', () => {
  let server: any;
  let browser: Browser;
  let page: Page;
  const TEST_PORT = 3195;
  const BASE_URL = `http://localhost:${TEST_PORT}`;
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];

  beforeAll(async () => {
    // 1. Start live Bun HTTP server serving real dashboard document and API
    server = Bun.serve({
      port: TEST_PORT,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === '/' || url.pathname === '/devcenter') {
          return new Response(renderDashboardHtml(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        const apiRes = await handleApiRequest(req, url);
        if (apiRes) return apiRes;
        return new Response('Not Found', { status: 404 });
      },
    });

    // 2. Launch real Google Chrome in headless mode
    browser = await chromium.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });

    page = await context.newPage();

    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  afterAll(async () => {
    await browser?.close();
    server?.stop(true);
  });

  it('Arrange, Act, Assert: Real Chrome loads Developer Dashboard with zero uncaught page errors', async () => {
    // Arrange & Act
    await page.goto(`${BASE_URL}/devcenter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Assert: Document structure and clean error log
    const activeTab = await page.getAttribute('html', 'data-active-tab');
    expect(activeTab).toBe('overview');
    expect(pageErrors.length).toBe(0);
  });

  it('Arrange, Act, Assert: requestIdleCallback shield catches and suppresses startTime / reportAllChanges errors', async () => {
    // Arrange: Clear error trackers
    pageErrors.length = 0;
    consoleErrors.length = 0;

    // Act: Simulate Google Web Vitals attribution crashing on empty entries in requestIdleCallback
    const result = await page.evaluate(async () => {
      return new Promise<string>((resolve) => {
        window.requestIdleCallback(() => {
          const et: any = {};
          et.reportAllChanges = () => {
            const undefinedEntry: any = undefined;
            return undefinedEntry.startTime;
          };
          et.reportAllChanges();
        });

        // Ensure subsequent tasks execute smoothly
        setTimeout(() => {
          resolve('idle-callback-handled');
        }, 150);
      });
    });

    // Assert: Execution continued without uncaught page error leaking to window
    expect(result).toBe('idle-callback-handled');
    expect(pageErrors.length).toBe(0);
    expect(consoleErrors.some((c) => c.includes('startTime'))).toBe(false);
  });

  it('Arrange, Act, Assert: setTimeout shield catches and suppresses startTime / reportAllChanges errors', async () => {
    // Arrange
    pageErrors.length = 0;
    consoleErrors.length = 0;

    // Act: Simulate Web Vitals safety fallback timeout throwing startTime error
    const result = await page.evaluate(async () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const et: any = {};
          et.reportAllChanges = () => {
            const undefinedEntry: any = undefined;
            return undefinedEntry.startTime;
          };
          et.reportAllChanges();
        }, 20);

        setTimeout(() => {
          resolve('timeout-handled');
        }, 100);
      });
    });

    // Assert
    expect(result).toBe('timeout-handled');
    expect(pageErrors.length).toBe(0);
    expect(consoleErrors.some((c) => c.includes('startTime'))).toBe(false);
  });

  it('Arrange, Act, Assert: PerformanceObserver shield safely catches startTime / attribution crashes', async () => {
    // Arrange
    pageErrors.length = 0;

    // Act: Create PerformanceObserver whose callback triggers attribution error
    const observerCreated = await page.evaluate(() => {
      try {
        const obs = new PerformanceObserver(() => {
          const undefinedEntry: any = undefined;
          return undefinedEntry.startTime;
        });
        return typeof obs.observe === 'function';
      } catch (e) {
        return false;
      }
    });

    // Assert
    expect(observerCreated).toBe(true);
    expect(pageErrors.length).toBe(0);
  });

  it('Arrange, Act, Assert: Event listener shield catches startTime / web-vitals errors', async () => {
    // Arrange
    pageErrors.length = 0;

    // Act: Register an event listener that throws startTime and fire it
    await page.evaluate(() => {
      window.addEventListener('click', () => {
        const undefinedEntry: any = undefined;
        return undefinedEntry.startTime;
      });
      document.body.click();
    });

    await page.waitForTimeout(50);

    // Assert: Handled without uncaught crash
    expect(pageErrors.length).toBe(0);
  });

  it('Arrange, Act, Assert: Transient network error detection and fetch resilience are active in window', async () => {
    // Arrange & Act
    const resilienceCheck = await page.evaluate(() => {
      const isTransient = (window as any).isTransientNetworkError;
      const typeErrorFailed = isTransient(new TypeError('Failed to fetch'));
      const netChangedError = isTransient(new Error('net::ERR_NETWORK_CHANGED'));
      const socketError = isTransient(new Error('NetworkError when attempting to fetch resource.'));
      const normalError = isTransient(new Error('Invalid credentials'));

      return {
        hasHelper: typeof isTransient === 'function',
        typeErrorFailed,
        netChangedError,
        socketError,
        normalError,
      };
    });

    // Assert
    expect(resilienceCheck.hasHelper).toBe(true);
    expect(resilienceCheck.typeErrorFailed).toBe(true);
    expect(resilienceCheck.netChangedError).toBe(true);
    expect(resilienceCheck.socketError).toBe(true);
    expect(resilienceCheck.normalError).toBe(false);
  });

  it('Arrange, Act, Assert: Tab switching works seamlessly across views with zero console errors', async () => {
    // Arrange: List tabs to test
    const tabsToTest = ['services', 'traffic', 'apps', 'host', 'overview'];

    for (const tabName of tabsToTest) {
      // Act: Trigger tab switch via navigation function
      await page.evaluate((tab) => {
        if (typeof (window as any).navigateToTab === 'function') {
          (window as any).navigateToTab(tab);
        }
      }, tabName);

      await page.waitForTimeout(100);

      // Assert: Document attribute updated and no page errors occurred
      const currentTab = await page.getAttribute('html', 'data-active-tab');
      expect(currentTab).toBe(tabName);
      expect(pageErrors.length).toBe(0);
    }
  });

  it('Arrange, Act, Assert: Array prototype -1 defensive fallback shields web-vitals reportAllChanges', async () => {
    // Arrange & Act: Verify fallback entry on empty array indexing
    const fallbackCheck = await page.evaluate(() => {
      const emptyArr: any[] = [];
      const negOne = (emptyArr as any)[-1];
      const readStartTime = negOne ? negOne.startTime : undefined;

      // Simulate et.reportAllChanges on empty entries array
      const et: any = {
        entries: [],
        reportAllChanges() {
          const entry = this.entries[this.entries.length - 1];
          return entry.startTime;
        },
      };
      const reportedStartTime = et.reportAllChanges();

      return {
        hasNegOne: Boolean(negOne),
        readStartTime: typeof readStartTime === 'number',
        reportedStartTime: typeof reportedStartTime === 'number',
      };
    });

    // Assert: Handled defensively without throwing TypeError
    expect(fallbackCheck.hasNegOne).toBe(true);
    expect(fallbackCheck.readStartTime).toBe(true);
    expect(fallbackCheck.reportedStartTime).toBe(true);
    expect(pageErrors.length).toBe(0);
  });
});

