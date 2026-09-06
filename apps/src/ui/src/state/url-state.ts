/**
 * @forge/ui/state - URL Search Parameter & History State Manager
 * Implements Tier 1 URL-First Navigational State (Enterprise Standard).
 * Ensures active views, tabs, filters, queries, and modal states are
 * 100% bookmarkable, shareable, and integrated with browser navigation history.
 *
 * @module @forge/ui/state/url-state
 * @license SG-Forge-Enterprise-LTS-2026
 */

import { UrlStateOptions } from './types';

/**
 * Extracts and deserializes a URL query parameter safely.
 * @requirements [HLR-UI-403] [LLR-UI-007]
 * @param paramName - Query parameter key (e.g. 'tab', 'view', 'q').
 * @param defaultValue - Fallback value if parameter is omitted from URL.
 * @param deserialize - Optional custom parser function.
 * @returns Parsed parameter value.
 */
export function getUrlParam<T = string>(
  paramName: string,
  defaultValue: T,
  deserialize?: (raw: string) => T
): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(paramName);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    if (deserialize) {
      return deserialize(raw);
    }
    return raw as unknown as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Updates a URL query parameter without triggering a full page reload.
 * @requirements [HLR-UI-403] [LLR-UI-007]
 * @param paramName - Query parameter key to update.
 * @param value - New value (null or undefined deletes the parameter).
 * @param replaceHistory - True to use replaceState (default), false to use pushState.
 */
export function setUrlParam<T>(
  paramName: string,
  value: T | null | undefined,
  replaceHistory: boolean = true
): void {
  if (typeof window === 'undefined' || !window.history) return;
  try {
    const url = new URL(window.location.href);
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(paramName);
    } else {
      url.searchParams.set(paramName, String(value));
    }

    const stateObj = { ...window.history.state, [paramName]: value };
    if (replaceHistory) {
      window.history.replaceState(stateObj, '', url.toString());
    } else {
      window.history.pushState(stateObj, '', url.toString());
    }
  } catch (err) {
    console.warn(`[ForgeUrlState] Failed to update URL param "${paramName}":`, err);
  }
}

/**
 * Creates a two-way synchronized URL state controller with listener support.
 * @requirements [HLR-UI-403] [LLR-UI-007]
 * @param options - Configuration options for URL parameter syncing.
 */
export function createUrlState<T = string>(options: UrlStateOptions<T>) {
  const { paramName, defaultValue, serialize = String, deserialize, replaceHistory = true } = options;

  let cachedValue: T = getUrlParam(paramName, defaultValue, deserialize);
  const listeners = new Set<(val: T) => void>();

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      const next = getUrlParam(paramName, defaultValue, deserialize);
      if (next !== cachedValue) {
        cachedValue = next;
        listeners.forEach((cb) => cb(next));
      }
    });
  }

  return {
    get(): T {
      return getUrlParam(paramName, defaultValue, deserialize);
    },
    set(val: T): void {
      cachedValue = val;
      setUrlParam(paramName, serialize(val), replaceHistory);
      listeners.forEach((cb) => cb(val));
    },
    subscribe(listener: (val: T) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
