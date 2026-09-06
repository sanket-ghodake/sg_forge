# 📦 @forge/ui/state - Enterprise-Grade Client State Architecture

> **Astryx Design System Client State Engine (2026 LTS Baseline)**  
> Centralized, high-resilience browser state persistence layer adhering to Enterprise 4-Tier State Hierarchy.

---

## 🏛️ The 4-Tier State Hierarchy

| Tier | Engine | Storage Target | Primary Use Cases |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `url-state.ts` | URL Search Params (`window.history`) | Active page, active tab (`?tab=logs`), filters (`?q=auth`), entity IDs (`?id=123`), modal state |
| **Tier 2** | `store.ts` | `localStorage` (Versioned Envelope) | Theme (`dark`/`light`), sidebar collapse, density mode, table column preferences |
| **Tier 3** | `store.ts` | `sessionStorage` (Tab Isolation) | In-flight multi-step form data, transient draft state, modal staging buffers |
| **Tier 4** | IndexedDB / Graphify | IndexedDB | Heavy graph data, offline telemetry queues, large query datasets |

---

## 🛠️ API Reference

### 1. `createStateStore<T>(options)`
Creates a type-safe, versioned, error-resilient client storage store with automatic migration and cross-tab synchronization.

```ts
import { createStateStore } from '@forge/ui/state';

interface UserSettings {
  theme: 'dark' | 'light';
  density: 'compact' | 'comfortable';
}

export const userSettingsStore = createStateStore<UserSettings>({
  appName: 'portal',
  key: 'settings',
  version: 1,
  defaultValue: { theme: 'dark', density: 'comfortable' },
});

// Usage:
const current = userSettingsStore.get();
userSettingsStore.set({ theme: 'light', density: 'compact' });
const unsubscribe = userSettingsStore.subscribe((next, prev) => {
  console.log('Settings changed:', next);
});
```

### 2. `createUrlState<T>(options)` / `getUrlParam` / `setUrlParam`
Synchronizes reactive state with the browser's URL query string without reloading the page.

```ts
import { createUrlState } from '@forge/ui/state';

export const activeTabState = createUrlState({
  paramName: 'tab',
  defaultValue: 'overview',
  replaceHistory: true,
});

activeTabState.set('logs'); // URL becomes ?tab=logs
```

### 3. `getHeadStateScript(options)`
Generates an inline, synchronous `<head>` script to apply `data-theme` and `data-sidebar-collapsed` before the browser executes its first layout paint (Zero FOUC).

```html
<head>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>${getAstryxStyles()}</style>
</head>
```

---

## 🔒 Governance & Reliability Guarantees
1. **Zero Layout Shift**: Critical styling attributes are injected before body render.
2. **Crash Resilience**: Malformed storage JSON falls back gracefully to default values without throwing uncaught exceptions.
3. **Cross-Tab Realtime Sync**: Modifications in one tab broadcast across all tabs via `BroadcastChannel`.
4. **Key Namespacing**: Enforces `forge:v<version>:<appName>:<key>` taxonomy to prevent cross-app collision.
