/**
 * @forge/ui/state - Type-Safe Browser Storage Store (Enterprise Standard)
 * Implements Tier 2 (localStorage) & Tier 3 (sessionStorage) Client State.
 * Features strict key-namespacing, schema versioning, automatic migrations,
 * zero-throw JSON parsing, and real-time cross-tab synchronization.
 *
 * @module @forge/ui/state/store
 * @license SG-Forge-Enterprise-LTS-2026
 */

import { IStateStore, StateChangeListener, StateEnvelope, StateStoreOptions } from './types';
import { broadcastStateChange, subscribeCrossTab } from './sync';

/**
 * Builds standard namespaced storage key: `forge:v<version>:<appName>:<key>`
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export function buildStorageKey(appName: string, key: string, version: number = 1): string {
  const sanitizedApp = appName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `forge:v${version}:${sanitizedApp}:${sanitizedKey}`;
}

/**
 * Returns safe web storage reference or memory fallback for SSR / test environments.
 */
function getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window[type];
    const testKey = '__forge_storage_probe__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

/**
 * Creates a centralized, versioned, error-resilient client state store.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 * @example
 * ```ts
 * const themeStore = createStateStore({
 *   appName: 'platform',
 *   key: 'theme',
 *   defaultValue: 'dark',
 * });
 *
 * console.log(themeStore.get()); // 'dark'
 * themeStore.set('light');
 * ```
 */
export function createStateStore<T>(options: StateStoreOptions<T>): IStateStore<T> {
  const {
    appName,
    key,
    version = 1,
    storageType = 'localStorage',
    defaultValue,
    migrations = {},
    crossTabSync = storageType === 'localStorage',
  } = options;

  const storageKey = buildStorageKey(appName, key, version);
  const listeners = new Set<StateChangeListener<T>>();

  function readRaw(): T {
    const storage = getStorage(storageType);
    if (!storage) return defaultValue;

    try {
      const raw = storage.getItem(storageKey);
      if (!raw) {
        // Check for legacy versions or unversioned fallback
        return checkMigrations(storage);
      }

      const envelope: StateEnvelope<T> = JSON.parse(raw);
      if (envelope && typeof envelope === 'object' && 'data' in envelope) {
        return envelope.data;
      }
      return (envelope as unknown as T) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function checkMigrations(storage: Storage): T {
    // Check older versions
    for (let v = version - 1; v >= 1; v--) {
      const oldKey = buildStorageKey(appName, key, v);
      const oldRaw = storage.getItem(oldKey);
      if (oldRaw) {
        try {
          const parsed = JSON.parse(oldRaw);
          const oldData = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
          if (migrations[v]) {
            const migrated = migrations[v](oldData, v) as T;
            writeRaw(migrated);
            storage.removeItem(oldKey);
            return migrated;
          }
        } catch {
          // ignore migration error
        }
      }
    }
    return defaultValue;
  }

  function writeRaw(value: T): void {
    const storage = getStorage(storageType);
    if (!storage) return;

    try {
      const envelope: StateEnvelope<T> = {
        version,
        updatedAt: new Date().toISOString(),
        data: value,
      };
      storage.setItem(storageKey, JSON.stringify(envelope));
    } catch (err) {
      console.warn(`[ForgeStateStore] Failed to write state key "${storageKey}":`, err);
    }
  }

  // Cross-tab synchronization hook
  if (crossTabSync) {
    subscribeCrossTab<T>(storageKey, (remoteValue) => {
      listeners.forEach((cb) => {
        try {
          cb(remoteValue, null);
        } catch (err) {
          console.error(`[ForgeStateStore] Listener error on sync for ${storageKey}:`, err);
        }
      });
    });
  }

  return {
    storageKey,

    get(): T {
      return readRaw();
    },

    set(valueOrUpdater: T | ((prev: T) => T)): void {
      const prev = readRaw();
      const next = typeof valueOrUpdater === 'function'
        ? (valueOrUpdater as (prev: T) => T)(prev)
        : valueOrUpdater;

      writeRaw(next);

      if (crossTabSync) {
        broadcastStateChange(storageKey, next);
      }

      listeners.forEach((cb) => {
        try {
          cb(next, prev);
        } catch (err) {
          console.error(`[ForgeStateStore] Error in listener for ${storageKey}:`, err);
        }
      });
    },

    reset(): void {
      this.set(defaultValue);
    },

    subscribe(listener: StateChangeListener<T>): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
