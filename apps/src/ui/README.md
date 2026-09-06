# 🎨 Astryx UI System (`@forge/ui`)

Astryx Design System v2.0.0 LTS tokens, CSS variables (`--forge-*`), dual-palette theme engine, custom glassmorphic components, and animated Sun/Moon header components.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/ui` | Core Shared UI Design System |
| **Type** | Monorepo Package Alias | Clean import via `@forge/ui` (Zero relative sprawl) |
| **Total Files** | `24` files | Tokens, styles, header generators, modals, toast/dropdown engines |
| **Lines of Code (SLOC)**| `2,114` SLOC | 2,782 total lines (310 comments, 358 blanks) |
| **Complexity Score** | `258` | Modular design token system & accessible UI generators |
| **Language Breakdown** | TypeScript (2,035 SLOC), Markdown (72), JSON (7) | 100% type-safe |
| **Database Instance** | Stateless | Pure UI tokens, styles, and web components |
| **5-Tier Test Suite** | `19` passing tests | `test/unit/`, `test/contracts/` |
| **Verification Gate** | **100% Passing** ✅ | 100% Astryx Token Compliance (Zero OS Defaults) |

---

## 🛠️ Core Exports & UI Tokens

### 1. Theme Tokens & CSS Variables (`tokens.ts`)
* `themeTokens`: Dual palette definition for `dark` and `light` modes.
* Standard CSS variables: `--forge-bg-root`, `--forge-bg-surface`, `--forge-bg-card`, `--forge-border`, `--forge-primary`, `--forge-accent`, `--forge-text-main`, `--forge-text-muted`.

### 2. Universal Stylesheet & 100% Air-Gapped Typography (`styles.ts` & `base.ts`)
* `getAstryxStyles()`: High-contrast, responsive CSS string with glassmorphic cards, buttons, badges, tables, and custom slim scrollbars.
* **100% Air-Gapped Typography**: Zero external font network calls (`@import`), powered by a modern native system font stack for ultra-fast rendering with zero external telemetry.

### 3. Unified Navigation Header (`header.ts`)
* `getAstryxHeaderHtml(appName, subtitle)`: Standard enterprise navigation header with animated Sun/Moon SVG theme toggle, dynamic white-labeled logo, and cross-tab `localStorage` theme synchronization.

### 4. Interactive Toast & Smart Dropdown Engines (`toast-dropdown.ts`)
* `getAstryxToastScript()`: Custom glassmorphic toast notification manager (`astryxToast.show()`).
* `getAstryxDropdownScript()`: Accessible custom dropdown selector engine with smart viewport collision detection (auto-flip/shift/clamp).

### 5. Universal RFC 7807 Error Pages (`error-page.ts`)
* `renderAstryxErrorPage(options)`: Standardized enterprise error screens for 400, 401, 403, 404, 429, 500, 502, and 503 with incident trace ID correlation.

---

## 📁 Internal Architecture

```text
apps/src/ui/
├── README.md                      # Package documentation & code metrics
├── package.json                   # Package manifest & export map
├── src/
│   ├── index.ts                   # Main barrel export
│   ├── tokens.ts                  # Astryx CSS variable tokens & palette
│   ├── styles.ts                  # Global stylesheet & component classes
│   ├── header.ts                  # Unified header with animated theme toggle
│   ├── toast-dropdown.ts          # Toast notification & smart dropdown scripts
│   ├── error-page.ts              # Universal error pages (403, 404, 500, etc.)
│   └── head-state.ts              # Head state script & theme initializer
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, contracts)
```

---

## 🏃 Local Execution & Verification

```bash
# Run test suite
rtk bun test apps/src/ui/test/
```
