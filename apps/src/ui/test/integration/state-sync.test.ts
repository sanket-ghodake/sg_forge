/**
 * @forge/ui - Tier 2 Integration: Cross-Tab State Storage Synchronization
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { broadcastStateChange, subscribeCrossTab } from '../../src/state/sync';

describe('Tier 2 Integration: Cross-Tab State Synchronization [LLR-UI-007]', () => {
  beforeEach(() => {
    (globalThis as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  it('Arrange, Act, Assert: registers and unregisters subscriber without throwing', () => {
    // Arrange
    let receivedData: any = null;
    const testKey = 'test_theme_key';

    // Act
    const unsubscribe = subscribeCrossTab(testKey, (data) => {
      receivedData = data;
    });

    // Broadcast state change safely
    broadcastStateChange(testKey, { theme: 'light' });

    // Assert
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('Arrange, Act, Assert: safely handles SSR when window is undefined', () => {
    // Arrange
    const originalWindow = (globalThis as any).window;
    delete (globalThis as any).window;

    // Act
    const unsubscribe = subscribeCrossTab('key', () => {});
    broadcastStateChange('key', { val: 1 });

    // Assert
    expect(typeof unsubscribe).toBe('function');

    // Restore
    (globalThis as any).window = originalWindow;
  });
});
