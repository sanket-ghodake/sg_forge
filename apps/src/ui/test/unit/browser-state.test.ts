/**
 * @forge/ui/state - Comprehensive Unit Test Suite (Standard 3A Pattern)
 * Validates versioned client state store, URL parameter synchronization,
 * corrupted JSON fallback resilience, and head hydration scripts.
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import {
  buildStorageKey,
  createStateStore,
  createUrlState,
  getHeadStateScript,
  getUrlParam,
  setUrlParam,
} from '../../src/state';

// Mock browser Storage & Window environment for server-side testing
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('Forge Client State Engine [LLR-UI-006] [HLR-UI-403]', () => {
  beforeEach(() => {
    // Setup clean mock window and storage
    const mockStorage = new MockStorage();
    (globalThis as any).localStorage = mockStorage;
    (globalThis as any).sessionStorage = new MockStorage();
    (globalThis as any).window = {
      localStorage: mockStorage,
      sessionStorage: mockStorage,
      location: new URL('http://localhost:3000/portal?view=canvas&page=1'),
      history: {
        state: {},
        replaceState: (state: unknown, _title: string, url: string) => {
          (globalThis as any).window.location = new URL(url, 'http://localhost:3000');
          (globalThis as any).window.history.state = state;
        },
        pushState: (state: unknown, _title: string, url: string) => {
          (globalThis as any).window.location = new URL(url, 'http://localhost:3000');
          (globalThis as any).window.history.state = state;
        },
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  describe('Storage Key Generation', () => {
    it('generates standardized namespaced storage keys', () => {
      // Arrange & Act
      const key1 = buildStorageKey('portal', 'theme', 1);
      const key2 = buildStorageKey('dev-dashboard', 'activeTab', 2);
      const keySanitized = buildStorageKey('My App!', 'Filter Query@', 1);

      // Assert
      expect(key1).toBe('forge:v1:portal:theme');
      expect(key2).toBe('forge:v2:dev-dashboard:activetab');
      expect(keySanitized).toBe('forge:v1:my-app-:filter-query-');
    });
  });

  describe('createStateStore', () => {
    it('returns default value when storage is empty', () => {
      // Arrange
      const store = createStateStore({
        appName: 'portal',
        key: 'canvas-zoom',
        defaultValue: 100,
      });

      // Act
      const value = store.get();

      // Assert
      expect(value).toBe(100);
      expect(store.storageKey).toBe('forge:v1:portal:canvas-zoom');
    });

    it('persists and retrieves versioned object state', () => {
      // Arrange
      interface LayoutPrefs {
        sidebarCollapsed: boolean;
        density: 'compact' | 'comfortable';
      }

      const store = createStateStore<LayoutPrefs>({
        appName: 'portal',
        key: 'layout',
        defaultValue: { sidebarCollapsed: false, density: 'comfortable' },
      });

      // Act
      store.set({ sidebarCollapsed: true, density: 'compact' });
      const current = store.get();

      // Assert
      expect(current.sidebarCollapsed).toBe(true);
      expect(current.density).toBe('compact');
    });

    it('gracefully recovers from corrupted JSON without throwing errors', () => {
      // Arrange
      const store = createStateStore({
        appName: 'portal',
        key: 'corrupt-test',
        defaultValue: { status: 'healthy' },
      });

      // Act: Inject invalid JSON into storage directly
      globalThis.localStorage.setItem(store.storageKey, '{ invalid JSON! @#$ }');
      const safeVal = store.get();

      // Assert: Should safely return default value
      expect(safeVal).toEqual({ status: 'healthy' });
    });

    it('supports updater function and subscriber notifications', () => {
      // Arrange
      const store = createStateStore({
        appName: 'portal',
        key: 'counter',
        defaultValue: 0,
      });

      let notifiedValue = -1;
      const unsubscribe = store.subscribe((next) => {
        notifiedValue = next;
      });

      // Act
      store.set((prev) => prev + 5);

      // Assert
      expect(store.get()).toBe(5);
      expect(notifiedValue).toBe(5);

      // Clean up subscription
      unsubscribe();
      store.set(10);
      expect(notifiedValue).toBe(5); // Unsubscribed, should not update
    });

    it('migrates legacy state version when migration function is provided', () => {
      // Arrange: Seed v1 state
      const v1Key = buildStorageKey('portal', 'user-theme', 1);
      globalThis.localStorage.setItem(
        v1Key,
        JSON.stringify({ version: 1, data: { colorMode: 'dark_mode' } })
      );

      // Act: Create v2 store with migration mapping
      const storeV2 = createStateStore<{ theme: 'dark' | 'light' }>({
        appName: 'portal',
        key: 'user-theme',
        version: 2,
        defaultValue: { theme: 'light' },
        migrations: {
          1: (oldData: unknown) => {
            const legacy = oldData as { colorMode?: string };
            return { theme: legacy?.colorMode === 'dark_mode' ? 'dark' : 'light' };
          },
        },
      });

      // Assert
      expect(storeV2.get()).toEqual({ theme: 'dark' });
      expect(globalThis.localStorage.getItem(v1Key)).toBeNull(); // Legacy removed
    });
  });

  describe('URL State Synchronization', () => {
    it('reads URL query parameter and fallback default', () => {
      // Arrange & Act
      const view = getUrlParam('view', 'default-view');
      const missing = getUrlParam('nonexistent', 'fallback');

      // Assert
      expect(view).toBe('canvas');
      expect(missing).toBe('fallback');
    });

    it('updates URL query parameter without full reload', () => {
      // Arrange & Act
      setUrlParam('tab', 'services', true);

      // Assert
      expect(getUrlParam('tab', '')).toBe('services');
    });

    it('creates reactive url state controller', () => {
      // Arrange
      const tabState = createUrlState({
        paramName: 'section',
        defaultValue: 'general',
      });

      // Act
      tabState.set('security');

      // Assert
      expect(tabState.get()).toBe('security');
      expect(getUrlParam('section', '')).toBe('security');
    });
  });

  describe('Zero-FOUC Head State Script', () => {
    it('generates valid synchronous head script containing theme, sidebar restoration, and universal error shield', () => {
      // Arrange & Act
      const script = getHeadStateScript({ defaultTheme: 'dark' });

      // Assert
      expect(script).toContain('<script>');
      expect(script).toContain("document.documentElement.setAttribute('data-theme'");
      expect(script).toContain('data-sidebar-collapsed');
      expect(script).toContain('forge:v1:platform:theme');
      expect(script).toContain("reading 'starttime'");
      expect(script).toContain('reportallchanges');
      expect(script).toContain('PerformanceObserver');
    });
  });
});
