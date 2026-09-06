# 📦 Platform Services & Shared Libraries (`apps/src/`)

This directory contains all runnable platform micro-services and monorepo shared packages powering the SG Forge ecosystem.

---

## 🗂️ Core Services & Packages Matrix

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Directory | Package Name | Port | Ingress Route | Type | Files | Lines (SLOC) | Complexity | 5-Tier Tests | Database | Purpose & Role |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **[`landing/`](apps/src/landing/)** | `@forge/landing` | `:3000` | `/` | Service | 14 | 332 | 32 | 7 | Stateless | Public Ingress Discovery Hub & Route Directory |
| **[`landing-custom/`](apps/src/landing-custom/)** | `@forge/landing-custom` | `:3000` | `/` | Service | 14 | 480 | 38 | 8 | Stateless | Customizable Marketing Landing Starter Base |
| **[`portal/`](apps/src/portal/)** | `@forge/portal` | `:3001` | `/portal` | Service (SPA) | 49 | 5,324 | 952 | 25 | `portal.db` | Main Workspace, 2D Org Canvas & Micro-App Host |
| **[`dev-dashboard/`](apps/src/dev-dashboard/)** | `@forge/dev-dashboard`| `:3002` | `/devcenter` | Service | 98 | 13,576 | 2,821 | 113 | `dev_dashboard.db` | Live Streaming Telemetry, Org Studio & DB Inspector |
| **[`dev-hub/`](apps/src/dev-hub/)** | `@forge/dev-hub` | `:3003` | `/gateway` | Service | 30 | 1,908 | 181 | 17 | Stateless (SDK Mesh) | Developer SDK Playground & Scaffolding Guides |
| **[`auth/`](apps/src/auth/)** | `@forge/auth` | `:3004` | `/auth` | Service | 47 | 3,333 | 559 | 37 | `auth.db` | Central Identity Provider & Scoped JWT Token Issuer |
| **[`sdk/`](apps/src/sdk/)** | `@forge/sdk` | N/A | Library | Library | 22 | 1,478 | 395 | 26 | Turso SQLite Mgr | Enterprise SRE Logger, RFC 7807 Handlers & Ingress Registry |
| **[`ui/`](apps/src/ui/)** | `@forge/ui` | N/A | Library | Library | 24 | 2,114 | 258 | 19 | Stateless (Astryx UI) | Astryx Design System Tokens & Unified Header |
| **[`types/`](apps/src/types/)** | `@forge/types` | N/A | Library | Library | 3 | 117 | 30 | N/A | Stateless (TS Types) | Domain Interfaces, RBAC Models & PostMessage Contracts |
| **Core Platform Total** | **`apps/src/*`** | — | — | — | **287** | **28,182** | **5,228** | **244 Pass** | **Dedicated Turso DBs** | **100% Verified** ✅ |

---

## 🏛️ Monorepo Architectural Boundary Directives

1. **Directional Dependency Graph**:
   - `apps/src/types` $\rightarrow$ No internal dependencies (pure domain models).
   - `apps/src/ui` $\rightarrow$ Consumes `@forge/types`.
   - `apps/src/sdk` $\rightarrow$ Consumes `@forge/types` and `@forge/ui`.
   - Microservices (`landing`, `portal`, `dev-dashboard`, `dev-hub`, `auth`) $\rightarrow$ Consume `@forge/sdk`, `@forge/ui`, `@forge/types`.
2. **Clean Package Aliases**:
   - Imports must use `@forge/sdk`, `@forge/ui`, and `@forge/types`.
   - ZERO relative path traversal sprawl (`../../..`).
3. **Database Isolation**:
   - Every stateful service maintains its own dedicated Turso SQLite database in `apps/data/` (e.g., `auth.db`, `portal.db`, `dev_dashboard.db`).
   - Cross-database SQL queries are strictly prohibited; communication occurs via authenticated HTTP APIs or the `@forge/sdk` directory client.
