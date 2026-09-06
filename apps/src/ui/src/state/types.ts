/**
 * @forge/ui/state - Client State TypeScript Contracts (Enterprise Standard)
 * Defines type definitions for versioned browser storage, URL synchronization,
 * and cross-tab event communication.
 *
 * @module @forge/ui/state/types
 * @license SG-Forge-Enterprise-LTS-2026
 */

/**
 * Storage driver types supported by Forge State Engine.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Migration transform function contract for migrating legacy state versions to latest.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export type StateMigrationFn<TOld = unknown, TNew = unknown> = (oldState: TOld, oldVersion: number) => TNew;

/**
 * Configuration options for creating a versioned client state store.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export interface StateStoreOptions<T> {
  /**
   * Logical application namespace (e.g. 'portal', 'devhub', 'expenses').
   */
  appName: string;

  /**
   * Unique state category or feature key (e.g. 'theme', 'filters', 'canvas-view').
   */
  key: string;

  /**
   * Schema version number (e.g. 1, 2). Increment when state schema breaks.
   */
  version?: number;

  /**
   * Storage backend driver. Defaults to 'localStorage'.
   */
  storageType?: StorageType;

  /**
   * Default fallback state if key is empty or parsing fails.
   */
  defaultValue: T;

  /**
   * Optional schema validator or migration map from previous versions.
   */
  migrations?: Record<number, StateMigrationFn>;

  /**
   * Enable real-time cross-tab synchronization via BroadcastChannel.
   * Defaults to true for localStorage.
   */
  crossTabSync?: boolean;
}

/**
 * Versioned envelope stored inside browser storage.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export interface StateEnvelope<T> {
  /** Schema version */
  version: number;
  /** ISO timestamp of last write */
  updatedAt: string;
  /** Actual payload */
  data: T;
}

/**
 * Change listener callback contract.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export type StateChangeListener<T> = (newValue: T, oldValue: T | null) => void;

/**
 * Public State Store Interface.
 * @requirements [HLR-UI-403] [LLR-UI-006]
 */
export interface IStateStore<T> {
  /** Gets current value from storage or returns default */
  get(): T;
  /** Persists new value to storage and notifies subscribers */
  set(value: T | ((prev: T) => T)): void;
  /** Resets storage value back to default configuration */
  reset(): void;
  /** Subscribes to local and cross-tab state mutations */
  subscribe(listener: StateChangeListener<T>): () => void;
  /** Full computed storage key string */
  readonly storageKey: string;
}

/**
 * Options for URL parameter synchronization.
 * @requirements [HLR-UI-403] [LLR-UI-007]
 */
export interface UrlStateOptions<T> {
  /** Query parameter name in URL (e.g. 'tab', 'view', 'q') */
  paramName: string;
  /** Default fallback value if parameter is missing */
  defaultValue: T;
  /** Custom serializer function (defaults to String(val)) */
  serialize?: (val: T) => string;
  /** Custom deserializer function (defaults to identity/cast) */
  deserialize?: (raw: string) => T;
  /** Replace state instead of push to avoid cluttering browser back stack */
  replaceHistory?: boolean;
}
