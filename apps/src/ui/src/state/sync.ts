/**
 * @forge/ui/state - Cross-Tab State Synchronization Engine
 * Provides instant multi-window and multi-tab state synchronization
 * utilizing the standard BroadcastChannel API and storage event listeners.
 *
 * @module @forge/ui/state/sync
 * @license SG-Forge-Enterprise-LTS-2026
 */

/**
 * Event message envelope for BroadcastChannel cross-tab synchronization.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export interface SyncMessage<T = unknown> {
  key: string;
  data: T;
  sourceTabId: string;
  timestamp: number;
}

/**
 * Callback for handling cross-tab sync events.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export type SyncCallback<T = unknown> = (data: T) => void;

/**
 * Unique Tab/Window ID generated once per browser execution context.
 */
const TAB_ID = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `tab_${Math.random().toString(36).slice(2, 9)}`;

const CHANNEL_NAME = 'sg_forge_state_sync_bus';

let globalBroadcastChannel: BroadcastChannel | null = null;
const listenersByKey = new Map<string, Set<SyncCallback>>();

/**
 * Returns or initializes the shared BroadcastChannel instance if supported.
 */
function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!globalBroadcastChannel) {
    try {
      globalBroadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      globalBroadcastChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (!msg || msg.sourceTabId === TAB_ID) return; // Ignore self-messages
        const callbacks = listenersByKey.get(msg.key);
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(msg.data);
            } catch (err) {
              console.error(`[ForgeStateSync] Error in cross-tab listener for ${msg.key}:`, err);
            }
          });
        }
      };
    } catch {
      globalBroadcastChannel = null;
    }
  }
  return globalBroadcastChannel;
}

/**
 * Broadcasts state update across all open tabs.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 * @param key - The namespaced storage key that changed.
 * @param data - The new data payload.
 */
export function broadcastStateChange<T>(key: string, data: T): void {
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({
        key,
        data,
        sourceTabId: TAB_ID,
        timestamp: Date.now(),
      } satisfies SyncMessage<T>);
    } catch {
      // Ignore broadcast errors in restricted environments
    }
  }
}

/**
 * Registers a cross-tab synchronization listener for a specific storage key.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 * @param key - The namespaced storage key to observe.
 * @param callback - Function invoked when another tab updates this key.
 * @returns Unsubscribe cleanup function.
 */
export function subscribeCrossTab<T>(key: string, callback: SyncCallback<T>): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!listenersByKey.has(key)) {
    listenersByKey.set(key, new Set());
  }
  listenersByKey.get(key)!.add(callback as SyncCallback);
  getBroadcastChannel();

  // Storage event fallback for older browsers or restricted iframe contexts
  const storageHandler = (e: StorageEvent) => {
    if (e.key === key && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const data = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
        callback(data as T);
      } catch {
        // Safe fallback
      }
    }
  };

  window.addEventListener('storage', storageHandler);

  return () => {
    const set = listenersByKey.get(key);
    if (set) {
      set.delete(callback as SyncCallback);
      if (set.size === 0) listenersByKey.delete(key);
    }
    window.removeEventListener('storage', storageHandler);
  };
}
