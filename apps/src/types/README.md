# 📐 Forge Domain Types (`@forge/types`)

Shared TypeScript interfaces, RBAC models, organizational canvas entities, and bidirectional postMessage payload contracts.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/types` | Domain Contracts Library |
| **Type** | Monorepo Package Alias | Clean import via `@forge/types` (Zero relative sprawl) |
| **Total Files** | `3` files | Type declarations, models, package manifest |
| **Lines of Code (SLOC)**| `117` SLOC | 139 total lines (4 comments, 18 blanks) |
| **Complexity Score** | `30` | Pure TypeScript type definitions & interfaces |
| **Language Breakdown** | TypeScript (103 SLOC), Markdown (7), JSON (7) | 100% type-safe |
| **Database Instance** | Stateless | Pure domain contracts |
| **Verification Gate** | **100% Passing** ✅ | 100% type-safe compilation (`tsc --noEmit`) |

---

## 🛠️ Key Interfaces & Domain Contracts

1. **Authentication & Identity**:
   - `AuthUser`: User identity, email, principal type, organization ID, roles, and permissions.
   - `JWTPayload`: Scoped token claims, expiry, and token family versions.
2. **Organization & Scoped Hierarchy**:
   - `OrgNode`: Polymorphic organization tree node (HQ, Division, Department, Squad).
   - `ScopedHierarchyResponse`: Targeted linear management chain and direct reports list.
   - `Employee`: Employee profile, department materialized path, and title.
3. **Canvas & Workspace**:
   - `CanvasNode` & `CanvasEdge`: Visual 2D organizational map coordinates and edges.
4. **Micro-App Interop (PostMessage)**:
   - `PostMessageEvent`: Bidirectional iframe communication contract for context, theme sync, and event forwarding.

---

## 📁 Internal Architecture

```text
apps/src/types/
├── README.md                      # Package documentation & code metrics
├── package.json                   # Package manifest & export map
├── src/
│   └── index.ts                   # Main domain type definitions & interfaces
└── logs/                          # Isolated structured JSON log sink
```
