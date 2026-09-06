# 🧭 Main Workspace & Admin Portal (`@forge/portal`)

Primary enterprise employee workspace, admin governance center, visual 2D interactive organizational canvas, and sandboxed micro-app host serving on Port `:3001` (proxied at `/portal`).

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/portal` | Platform Service (SPA) |
| **Ingress Port / Route** | `:3001` &rarr; `/portal` | Caddy / Nginx reverse proxy gateway upstream |
| **Total Files** | `49` files | Modular SPA views, controllers, styles, tests, docs |
| **Lines of Code (SLOC)**| `5,324` SLOC | 6,338 total lines (372 comments, 642 blanks) |
| **Complexity Score** | `952` | Strict client-side SPA routing & state conductors |
| **Language Breakdown** | TypeScript, Markdown, Docker, JSON | 100% type-safe |
| **Database Instance** | `portal.db` | Dedicated Turso libSQL/SQLite database (Multi-User Isolated) |
| **5-Tier Test Suite** | `44` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | Strict SPA invariant, zero hardcoded data, and Astryx compliance |

---

## 🏛️ Core Architecture Directives & Invariants

1. **Strict Single Page Application (SPA)**:
   - The portal operates strictly as an SPA with zero full-page hard refreshes when switching between views.
   - All navigation links consume client-side routing (`data-view` / `data-nav` attributes and `switchView()`), with seamless URL query parameter synchronization (`history.replaceState`) and reload state preservation.
2. **Fluid Multi-Device Responsiveness (320px Guarantee)**:
   - Enforces responsive design across mobile (320px - 768px), tablet (768px - 1024px), and desktop (>1024px).
   - Zero horizontal overflow scrolling down to 320px viewport width.
   - Fluid auto-collapsing sidebar, responsive search trigger, and responsive user profile popover.
3. **100% Astryx Design Tokens (`@forge/ui`)**:
   - Zero ad-hoc CSS or browser defaults.
   - Seamless dark/light theme switching with cross-tab `BroadcastChannel` synchronization.

---

## 🚀 Key Views & Features

* **Top Header Bar**: Multi-tenant organization selector, command finder trigger (`⌘K`), theme switcher, and modern top-right user profile popover.
* **Auto-Collapsible Left Sidebar**: Compact 56px icon rail and 224px expanded navigation drawer with hover-peek and role-guarded Admin Console.
* **9 Purpose-Built Views**: 
  - **Employee Hub**: *Company Map*, *Apps & Tools Hub*, *My Profile*, *Announcements*.
  - **Admin Console**: *Member Management*, *App Permissions*, *Org Chart Editor*, *Security & Audit*, *Workspace Settings*.
* **Sandboxed Micro-App Host**: Sandboxed iframe embedding with bidirectional `@forge/sdk` postMessage handshake bridge.

---

## 📁 Internal Architecture

```text
apps/src/portal/
├── README.md                      # Service documentation & code metrics
├── package.json                   # Package manifest
├── src/
│   ├── index.ts                   # Main service barrel export
│   ├── server.ts                  # Bun HTTP server & dual-probe health endpoints
│   ├── backend/                   # API routes & database operations
│   ├── frontend/
│   │   ├── app-html.ts            # High-performance SPA document assembler
│   │   ├── nav-sidebar.ts         # Collapsible navigation drawer
│   │   ├── header-bar.ts          # Org selector & profile popover
│   │   ├── views/                 # 9 modular view renderers (Map, Directory, Admin, Settings)
│   │   └── scripts/               # Client-side SPA router, iframe bridge & search palette
│   └── db/                        # Turso SQLite client & schema
├── docker/                        # Containerization setup
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🏃 Local Execution & Verification

```bash
# Run standalone server
rtk bun apps/src/portal/src/server.ts

# Run test suite
rtk bun test apps/src/portal/test/
```
