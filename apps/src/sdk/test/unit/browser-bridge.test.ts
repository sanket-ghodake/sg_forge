/**
 * @forge/sdk - Tier 1 Unit: Browser Log Bridge & Telemetry Shield
 * Validates noise suppression for browser extensions, DevTools, and performance metrics.
 */

import { describe, expect, it } from 'bun:test';
import { initBrowserLogBridge } from '../../src/browser-bridge';

describe('Tier 1 Unit: Browser Log Bridge & Extension Noise Shield [LLR-SDK-006]', () => {
  it('Arrange, Act, Assert: ignores execution safely when window is undefined', () => {
    // Arrange & Act & Assert
    expect(() => initBrowserLogBridge('test-service')).not.toThrow();
  });

  it('Arrange, Act, Assert: attaches error handlers and suppresses startTime extension noise in DOM environments', () => {
    // Arrange
    const dispatchedLogs: any[] = [];
    const mockWindow: any = {
      addEventListener: (type: string, handler: Function) => {
        mockWindow._listeners[type] = handler;
      },
      _listeners: {},
      console: {
        error: () => {},
        warn: () => {},
      },
      fetch: async (url: string, opts: any) => {
        dispatchedLogs.push(JSON.parse(opts.body));
        return { ok: true };
      },
    };

    // Act
    (globalThis as any).window = mockWindow;
    (globalThis as any).navigator = { sendBeacon: null };

    initBrowserLogBridge('unit-test-service', '/api/logs/browser');

    // Assert listeners attached
    expect(typeof mockWindow._listeners['error']).toBe('function');
    expect(typeof mockWindow._listeners['unhandledrejection']).toBe('function');

    // Act: Fire noisy startTime error from extension
    mockWindow._listeners['error']({
      message: "Uncaught TypeError: Cannot read properties of undefined (reading 'startTime')",
      filename: 'chrome-extension://xyz/content.js',
    });

    // Fire noisy reportAllChanges from anonymous VM
    mockWindow._listeners['error']({
      message: 'reportAllChanges failed in VM4875',
      filename: '',
    });

    // Assert: No logs were dispatched to server
    expect(dispatchedLogs.length).toBe(0);

    // Act: Fire genuine application error
    mockWindow._listeners['error']({
      message: 'ReferenceError: invalidAppState is not defined',
      filename: '/src/main.ts',
    });

    // Assert: Genuine error was dispatched
    expect(dispatchedLogs.length).toBe(1);
    expect(dispatchedLogs[0].message).toBe('ReferenceError: invalidAppState is not defined');
    expect(dispatchedLogs[0].service).toBe('unit-test-service');

    // Cleanup
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;
  });
});
