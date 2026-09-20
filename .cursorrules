# AI AGENT DIRECTIVES - SG FORGE (2026 CLEAN ARCHITECTURE & ENGINEERING STANDARDS)

> ⚠️ **CRITICAL ENFORCEMENT NOTICE FOR ALL AI SESSIONS & LLMs**
> These directives are STRICT, NON-NEGOTIABLE, and IMMUTABLE across all sessions, agent personas, and IDE integrations (Antigravity, Claude, Cursor, Copilot, Windsurf). Every session agent MUST adhere to these rules without exception. Deviations constitute an immediate task failure.

---

## ⚡ 1. PRE-FLIGHT & PRE-COMMIT VERIFICATION GATE (24 CHECKS)
Before writing code, running commands, or staging/committing changes, verify:
1. [ ] **RTK Command Prefix & Portable PATH**: Every bash command MUST be prefixed with `rtk` (e.g. `rtk git status`, `rtk bun test`, `rtk git add .`). If `rtk` is not in the subshell's `$PATH`, invoke via `./portables/bin/rtk` (e.g. `./portables/bin/rtk git status`) or ensure `export PATH="$PWD/portables/bin:$PWD/portables/bun/bin:$PATH"` is active. ZERO commands may fail due to missing host binaries.
2. [ ] **Zero Host Modification & Cross-Platform Toolchain**: All runtimes/tools strictly use portable repo binaries (`portables/bun/bin/bun`, `portables/bin/*`) or Docker. ZERO host modifications (`apt`, `brew`, `npm -g`, `pip install`). All tool entries MUST use self-resolving POSIX wrappers (zero OS symlinks), with `eol=lf` enforced via `.gitattributes` to prevent cross-platform Git drift on Windows/WSL/macOS.
3. [ ] **500-Line Soft File Cap**: Source files must remain cohesive and **$\le 500$ lines** ($\le 300$ lines ideal). Block files exceeding 500 lines without explicit domain aggregation exemption.
4. [ ] **Strict Astryx & Modern Portable UI Engine (shadcn + Magic UI + Aceternity + Luxe)**: Central platform UI code and diagrams MUST strictly use modern Astryx design tokens and components (`@forge/ui`). Autonomous Forge submodules (`forge-apps/*`) strictly use the unified portable 4-library engine (**shadcn UI** + **Magic UI** + **Aceternity UI** + **Luxe**) via `src/lib/ui.ts` with zero runtime dependencies. Universal 100% dark/light theme parity (zero hardcoded dark-only colors or white-on-white text regressions). ZERO raw OS emojis anywhere in UI views, badges, or headers (100% Lucide 1.75px vector SVGs via `icons.ts`). ZERO bespoke unapproved CSS or random component libraries. All scrollbars, popups/drawers, modals, notifications/toasts, dropdowns, and tooltips MUST strictly use custom styling — ZERO OS/browser defaults (including browser default `title` tooltips). All dropdown menus, popovers, tooltips, and dialogs MUST implement smart collision detection (auto-flip/shift/clamp) to guarantee 100% visibility inside the active viewport window without clipping or overflowing.
5. [ ] **Centralized Logging, PII Redaction & Error Handling**: Services MUST use `createLogger` and `createSafeHandler` from `@forge/sdk` (Enterprise SRE standard structured JSON logs, RFC 7807 problem responses with trace IDs, and automated recursive PII/secret redaction). Frontend console must never leak credentials, tokens, or raw internal stack traces.
6. [ ] **Dedicated Turso DB Isolation**: Dedicated Turso (libSQL) database per Forge App. Micro-apps MUST NEVER query another app's database.
7. [ ] **Clean Package Aliases**: Imports must use `@forge/sdk`, `@forge/ui`, `@forge/types`. ZERO relative traversal sprawl (`../../..`).
8. [ ] **Folder Documentation (README per folder)**: Every single folder across the codebase MUST maintain its own descriptive `README.md`.
9. [ ] **Isolated Per-App Logs & 4-Pillar Observability**: Every microservice MUST maintain its own colocated `logs/` directory with `README.md` and `.gitignore`. Must implement 4 pillars (Dual-Probe Health, Browser Console, Docker Logs, Backend/DB Logs).
10. [ ] **ABSOLUTE ZERO AUTO-COMMITS (HARD BLOCKED)**: AI agents are STRICTLY FORBIDDEN from running `git commit` unless the user explicitly types `"commit changes"` or `"git commit"` in the CURRENT message. Past permissions do NOT carry over. Cleaning, refactoring, fixing, or auditing NEVER justifies committing.
11. [ ] **Per-Conversation Worklog Auto-Update**: Every conversation task completion MUST append strictly ONE single line to `logs/WORKLOGS.md` (`YYYY-MM-DD HH:mm | <brief summary>`) via `rtk bun scripts/append-worklog.ts "<summary>"`. When a git commit occurs, post-commit hook records ground truth to `logs/commits.jsonl`.
12. [ ] **AI-Driven Ignore & Attrib Governance**: Before staging, AI Agent MUST contextually audit all newly created files in session diff. If any cache, transient, build output, SQLite DB, or secret was introduced, ensure it is added to the canonical ignore/attrib definitions via `rtk bun scripts/sync-ignores.ts`.
13. [ ] **5-Tier Microservice Test Governance & Testing for Truth**: Every microservice across `apps/src/*` and `forge-apps/*` MUST maintain an isolated `test/` folder with required subtiers (`unit/`, `integration/`, `security/`, `contracts/`, `e2e/`). Zero shallow mocks that bypass real network/cookie boundaries; 100% Branch Coverage on Auth & RBAC; $\ge 90\%$ on business logic.
14. [ ] **AI Semantic Scenario Audit**: All critical security invariants (anti-brute force, token replay defense, tamper detection, cross-tenant isolation) MUST have explicit negative assertion tests.
15. [ ] **Strict Portal SPA & Fluid Responsiveness Governance**: The Portal application (`@forge/portal`) MUST strictly operate as a Single Page Application (SPA) with zero full-page hard refreshes across internal navigation (using client-side view routing, instantaneous DOM hydration, and history management). Fully fluid and responsive across desktop, tablet, and mobile down to 320px viewport with zero horizontal overflow.
16. [ ] **Supply Chain & Anti-Slopsquatting Guard**: Zero unverified npm dependencies. Any proposed external package MUST be verified against registry provenance, age (>=14 days), and permissible license via `rtk ./run.sh check-pkg <pkg>` before addition.
17. [ ] **API Contract & Schema Parity**: All endpoint alterations must conform to OpenAPI 3.1 specifications and pass `rtk ./run.sh contracts` (Spectral ruleset).
18. [ ] **Complexity & Function Line Cap**: Source functions must satisfy Cyclomatic Complexity $\text{CCN} \le 10$ and modular line limits, audited via `rtk ./run.sh complexity` (Lizard AST engine).
19. [ ] **Permissive License Governance & Open-Source Compliance**: Zero viral copyleft (AGPL/GPL) or non-OSI licenses. Every submodule must maintain its own standalone `LICENSE`, and all package manifests MUST declare `"license": "Apache-2.0"`. Zero trademarked corporate brands introduced without nominative fair use disclaimers (`rtk ./run.sh licenses`).
20. [ ] **Automated CycloneDX 1.5 SBOM**: Continuous SBOM generation and validation via `rtk ./run.sh sbom` (Syft engine).
21. [ ] **In-Chat AI Security & Code Audit (Strix Standard)**: Before staging code, the AI agent performs an in-chat code check (`strix-code-audit` / `audit code`) on modified routes, auth flows, and queries to ensure zero injection, secret leaks, or RFC 7807 problem violations; if the local or dev server is up, also run the live test (`strix-live-pentest` / `test live dev`) to confirm security headers and cookie flags.
22. [ ] **Forge App Submodule Isolation & Core Air-Gap Network Gate**: Core platform containers operate on `core-airgap-net` (`internal: true`) with ZERO outbound egress. Forge Apps operate as autonomous Git submodules on `forge-apps-net` with independent Dockerfiles, `.dockerignore`, standalone agent directives, and ZERO imports from central apps (`apps/src/*`).
23. [ ] **System Traceability & Living Documentation Gate (SG Forge Standard)**: Every created or modified exported symbol MUST carry an `@requirements [LLR-...]` TSDoc tag matching an active document in `docs/llr/`. Diagram generation MUST use the `diagram-design` skill (`.agents/skills/diagram-design/`) with Astryx tokens. Automated doc-to-code parity must pass `rtk ./run.sh docs:coverage` before code staging.
24. [ ] **Mandatory Code-Doc-Impact Synchronization Gate**: Whenever any source code, API route, auth boundary, database schema, or configuration is altered or added, the AI agent MUST atomically inspect and update:
    - **Living Documentation**: Corresponding LLRs in `apps/src/docs/src/content/docs/llr/` (or create new LLRs if a new capability is introduced).
    - **Folder Documentation (READMEs)**: Colocated service and directory `README.md` files describing current architecture, routes, or behavior.
    - **API Specifications & Contracts**: OpenAPI schemas, interface contracts, and Spectral rulesets.
    - **Impacted Dependent Files**: Reverse callers, environment configurations (`.env.example`), proxy definitions (`proxy/`, `scripts/generate-proxy.ts`), test fixtures, and client libraries.
    All documentation and dependent file updates MUST be performed in the SAME session before completing the task. Modifying code without updating living documentation and impacted files is strictly prohibited and constitutes an immediate task failure.


---

## 🛑 2. THE 14 NON-NEGOTIABLE ENGINEERING INVARIANTS (ENTERPRISE STANDARD)

### 1. Correctness, Grounding & "No Guessing"
- **NEVER** hallucinate, assume, or invent APIs, database columns, schemas, external packages, or behaviors.
- **ALWAYS** inspect callers, schemas, types, and existing tests using Graft (`.agents/rules/graft.md`), Graphify (`.agents/rules/graphify.md`), and ripgrep before editing. Validate any new dependency via `./run.sh check-pkg <pkg>`.

### 2. Strict File Size Governance & 500-Line Soft Cap
- **$\le 300$ lines**: Healthy modular standard.
- **$301 - 500$ lines**: Cohesion boundary. Allowed for state conductors and route dispatchers.
- **$> 500$ lines**: **HARD GATE BLOCKED** by pre-commit checks. Refactor into feature-colocated sub-modules unless exempt (e.g. multi-table Drizzle schema or test fixtures).

### 3. Strict UI Standard: Astryx Design System (`@forge/ui`) & Autonomous Submodule 4-Library Stack (`shadcn + Magic UI + Aceternity + Luxe`)
- **MANDATORY Architecture**: Core platform views (`apps/src/*`) strictly use Astryx design system tokens and component wrappers (`@forge/ui`). Autonomous Forge micro-apps (`forge-apps/*`) strictly use the self-contained portable 4-library engine (**shadcn UI** foundations/forms/tables, **Magic UI** micro-interactions/border beams/live pulse beacons, **Aceternity UI** cinematic hero sections/ambient depth, and **Luxe** high-craft developer typography/HUD cards) via `src/lib/ui.ts` with zero runtime dependencies.
- **Universal Zero-Emojis Standard**: UI components, buttons, navigation items, toasts, and status badges MUST NEVER use raw OS emojis (`📦`, `📡`, `🚀`, `⚠️`, `✅`, `🚪`, `🚫`). All icons must be rendered as 100% crisp vector SVGs (Lucide 1.75px stroke standard via `src/lib/icons.ts` or `@forge/ui`).
- **Universal Dual-Theme Parity**: All UI components, embedded SVGs, and standalone diagrams MUST natively support dark and light themes without hardcoded dark-only colors, unreadable text, or contrast regressions. State must seamlessly synchronize across `forge:v1:platform:theme`, `starlight-theme`, and broadcast buses.
- **ZERO Browser Defaults**: OS-default scrollbars, native `alert()`/`confirm()`/`prompt()` dialogs, unstyled `<select>` dropdowns, default popups, and raw OS `title` tooltips are **STRICTLY FORBIDDEN**. Scrollbars must be slim, themed tracks. Notifications must use Toast overlays. Dropdowns must use styled custom selectors. Popups/modals must use glassmorphic backdrop dialogs. Tooltips and informational hover popovers must strictly use custom floating tooltips with smart collision detection.
- **Smart Viewport Containment**: All dropdowns, flyouts, tooltips, and popovers MUST dynamically calculate viewport bounds (auto-flip up when close to bottom edge, shift horizontally when close to right/left edge, clamp max-height) so that overlays are 100% visible inside the active viewport window without clipping or parent overflow.
- Strictly adhere to `--forge-*` CSS variables (`--forge-bg-root`, `--forge-bg-surface`, `--forge-bg-card`, `--forge-border`, `--forge-primary`, `--forge-accent`, `--forge-text-main`, `--forge-text-muted`).
- Zero horizontal scrolling down to 320px viewport. Modals, dropdowns, and overlays render with proper top-layer z-index and accessibility.

### 4. Centralized Structured Logging, PII Redaction & RFC 7807 Error Boundaries
- **Enterprise Production Observability**: All platform services and micro-apps MUST use `@forge/sdk` (`createLogger`, `createSafeHandler`, `initBrowserLogBridge`, and `redactSensitiveData`).
- Standardized JSON telemetry output with timestamp, severity, service tag, and immutable `traceId` correlation across requests. Never leak raw stack traces, database errors, passwords, or tokens to end users or browser console.

### 5. Multi-Tenant Data Isolation & Dedicated Turso DB per App
- Dedicated Turso (libSQL) database instance per Forge App. Apps MUST NEVER access or query another app's database.
- Non-negotiable `org_id` / `user_id` scoping across all portal queries and mutations.

### 6. Directional Architectural Boundaries, Autonomous Submodules & Core Air-Gap
- **Air-Gapped Core Platform**: `apps/src/*` core services reside on `core-airgap-net` (`internal: true`) with ZERO outbound egress. Only reverse proxy routes inbound traffic.
- **Autonomous Forge Submodules**: `forge-apps/*` operate as decoupled Git submodules with their own standalone Dockerfile, `.dockerignore`, local agent rules, and local runtime contracts. AI agents MUST NEVER cross-import central core platform code (`apps/src/*`) into `forge-apps/*`.
- **Independent Egress Security**: Forge apps manage their own outbound traffic on `forge-apps-net`, maintaining local credentials and timeouts with zero coupling to core platform internal services.
- **UI Layer**: Built with Astryx components, never directly touches raw filesystem or database.

### 7. Clean Package Aliases (Zero Traversal Sprawl)
- All imports across the monorepo MUST use configured path aliases (`@forge/sdk`, `@forge/ui`, `@forge/types`).

### 8. Risk-Tiered 5-Tier Testing Rigor & Testing for Truth (Enterprise Standard)
- **Folder Structure**: Every service (`apps/src/*`, `forge-apps/*`) must house tests in `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/`.
- **Testing for Truth (Zero Shallow Mocking)**: Tier 5 E2E tests must verify real network sockets, cookie jar persistence, and destination page rendering (200 OK) without hardcoded static ports or mock shortcuts that bypass real browser flows.
- **100% Branch Coverage** required on Auth, RBAC, and Iframe Sandbox boundaries; $\ge 90\%$ on business logic.
- Mandatory **3A Pattern** (Arrange, Act, Assert) across all unit and integration tests.

### 9. Single-Location Dynamic Ingress & Absolute Zero Auto-Commits
- Ingress paths and ports are driven exclusively from `.env` via `@forge/sdk/registry` and `scripts/generate-proxy.ts`.
- **ABSOLUTE ZERO AUTO-COMMITS**: AI agents MUST NEVER run `git commit` under any circumstances (including cleanup, audit, refactoring, or testing tasks) unless the user explicitly requests `"commit changes"` in the active prompt. Treat unprompted `git commit` as a critical protocol violation.

### 10. Code Preservation, Observability & Per-Conversation Worklog Auto-Update
- **Comprehensive Header Comments & TSDoc**: Every file begins with standard header comment block; all exports have TSDoc descriptions.
- **Per-Conversation Worklog Auto-Update**: At the end of every conversation task, the AI agent MUST append strictly ONE single line to `logs/WORKLOGS.md` (`YYYY-MM-DD HH:mm | <brief summary>`) using `rtk bun scripts/append-worklog.ts "<summary>"`. When a git commit occurs, post-commit hook automatically logs commit metadata to `logs/commits.jsonl`.

### 11. In-Chat AI Security Auditor (Strix Standard)
- **Zero-API Key & In-Chat Operation**: All agents must support immediate in-chat security assessments in two streamlined modes:
  - **Mode 1 (Code Check)**: White-box static & semantic source review (`strix-code-audit` / `audit code` / `/audit-code`). Audits routes, middleware, Turso DB multi-tenant `org_id` scoping, JWT cookies, zero secret leaks, and RFC 7807 error boundaries.
  - **Mode 2 (Live Setup Test)**: Dynamic non-destructive probing (`strix-live-pentest` / `test live dev` / `test live prod <url>` / `/audit-live`) using `rtk curl -sI` against running dev/prod servers (HSTS, CSP, CORS, cookie flags, auth redirects, error leakage).
- Governed by [`.agents/rules/security-audit.md`](file:///.agents/rules/security-audit.md) and interactive workflow [`.agents/workflows/audit.md`](file:///.agents/workflows/audit.md).

### 12. System Traceability, Living Engineering Standards & Editorial Diagramming (Enterprise Standard)
- **Bidirectional Traceability**: Every feature, microservice, and function strictly traces to `SR -> HLR -> LLR -> Code -> Test`.
- **Mandatory Code-Doc-Impact Synchronization**: Code changes and documentation updates are strictly inseparable. Whenever an agent modifies, refactors, or adds features, routes, middleware, or config logic, the agent MUST atomically identify all impacted documentation (LLRs in `apps/src/docs/src/content/docs/llr/`, service `README.md` files, architecture guides, and user manuals) and update them in the same session. Leaving code modified without updating its corresponding living documentation constitutes non-compliance.
- **Impacted Dependent Files Parity**: When code changes affect downstream components (proxy rules, reverse callers, environment configs, client SDK wrappers, schema migrations, or test fixtures), the agent MUST update all impacted files in the same session. Never leave downstream files broken or out of sync.
- **Editorial Diagramming**: Schematics must strictly use `diagram-design` (`.agents/skills/diagram-design/`) with Astryx tokens (`--forge-*`); zero generic Mermaid slop or OS-default styling.
- **100% Code-to-Doc Parity**: Monorepo and Forge apps must pass `rtk ./run.sh docs:coverage` before code staging.


### 13. Legal Compliance, Apache-2.0 Licensing & Trademark Neutrality (Enterprise Open-Source Standard)
- **Strict Apache-2.0 Governance**: All platform source code, libraries, and microservices MUST strictly be licensed under the Apache License, Version 2.0. Every package manifest (`package.json`) MUST declare `"license": "Apache-2.0"`.
- **Autonomous Submodule Licenses**: Every submodule in `forge-apps/*` MUST maintain its own standalone `LICENSE` file.
- **Trademark & Brand Neutrality**: AI agents are strictly forbidden from introducing third-party trademarked names (e.g. "Supabase", "Meta", "Google", "Vercel", "Apple", "Microsoft") into source code, variable names, component names, CSS classes, comments, or documentation as brand associations or "inspired by" without an explicit trademark disclaimer in `NOTICE`.
- **Developer Certificate of Origin (DCO 1.1)**: All pull requests and external contributions MUST certify DCO 1.1 via `Signed-off-by:` trailers.
- **Zero Corporate Work-for-Hire Bleed**: Agents must NEVER introduce corporate employee usernames, internal corporate domains (e.g. corporate VPN/intranet URLs), or machine-specific personal paths (`/home/...`) into the codebase.

### 14. Submodule Toolchain Parity & Autonomous Independence Directive (Enterprise Standard)
- **100% Autonomous Independence**: Every Forge app (`forge-apps/*`) and template (`forge-apps/app-template`) is an independent microservice capable of operating, building, testing, auditing, and being deployed standalone outside the SG Forge monorepo with zero required host installations.
- **Toolchain & CLI Parity**: Submodules maintain full CLI parity with the core platform via dedicated, self-resolving POSIX & Windows wrappers in their own `portables/bin/` (`trivy`, `syft`, `osv-scanner`, `gitleaks`, `semgrep`, `shellcheck`, `biome`, `knip`, `lizard`, `type-coverage`, `tokscale`, `headroom`, `graft`, `council`, `rtk`).
- **Automated Synchronization**: Whenever toolchains, runners (`run.sh`/`run.bat`), scripts, or security scanners are upgraded in the main repo or `app-template`, `rtk bun scripts/sync-submodules.ts` MUST be run to propagate updates across all active submodules.
- **UI Engine Exception**: Core platform views strictly use Astryx (`@forge/ui`); autonomous Forge micro-apps strictly use the portable 4-library engine (**shadcn UI + Magic UI + Aceternity UI + Luxe**) via `src/lib/ui.ts` with zero central `@forge/*` dependencies.

---

## 🛠️ TECH STACK BASELINE (2026 LTS)
- **Runtime**: Bun v1.3.14 (Standalone portable inside `portables/bun/`) / Node 24 LTS.
- **Frontend / Framework**: Next.js 16 (App Router), React 19, TypeScript 5.
- **UI System**: Astryx Design System (`@forge/ui`), CSS Variables (`--forge-*`).
- **Database & ORM**: Dedicated Turso (libSQL) per app, Drizzle ORM (`drizzle-orm/libsql`).
- **Reverse Proxy**: Caddy / Nginx gateway on Ports `80` & `443`.
- **Testing**: Vitest, Bun Test, Playwright E2E.

---

## 🧭 DOMAIN RULE ROUTER
- **Core System & Tooling**: [`.agents/rules/core.md`](file:///.agents/rules/core.md)
- **Architecture, Monorepo & DB**: [`.agents/rules/architecture.md`](file:///.agents/rules/architecture.md)
- **Frontend UI & Astryx Tokens**: [`.agents/rules/frontend-ui.md`](file:///.agents/rules/frontend-ui.md)
- **Client State & Storage (Enterprise Standard)**: [`.agents/rules/frontend-state.md`](file:///.agents/rules/frontend-state.md)
- **Security & Zero-Trust**: [`.agents/rules/security-practices.md`](file:///.agents/rules/security-practices.md)
- **In-Chat AI Security & Pentest Auditor**: [`.agents/rules/security-audit.md`](file:///.agents/rules/security-audit.md)
- **Testing Standards (5-Tier)**: [`.agents/rules/testing.md`](file:///.agents/rules/testing.md)
- **Graphify Knowledge Graph**: [`.agents/rules/graphify.md`](file:///.agents/rules/graphify.md)
- **Graft Code Context Graph**: [`.agents/rules/graft.md`](file:///.agents/rules/graft.md)
- **RTK Token Optimization**: [`.agents/rules/rtk.md`](file:///.agents/rules/rtk.md)
- **Tokscale Lifetime Token Ledger**: [`.agents/rules/tokscale.md`](file:///.agents/rules/tokscale.md)
- **Headroom Context Compression**: [`.agents/rules/headroom.md`](file:///.agents/rules/headroom.md)
- **Council of AI Decision Framework**: [`.agents/rules/council.md`](file:///.agents/rules/council.md)
- **Microservice Observability & Logs**: [`.agents/rules/observability.md`](file:///.agents/rules/observability.md)
- **Living Engineering Standards & Traceability**: [`.agents/rules/documentation.md`](file:///.agents/rules/documentation.md)

