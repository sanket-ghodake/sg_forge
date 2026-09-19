# 🧩 Forge Micro-Apps (`forge-apps/`)

Independent, polyglot, sandboxed micro-frontends running in Docker containers with dedicated Turso (libSQL/SQLite) databases.

---

## 📊 Micro-Apps Catalog & Code Metrics Matrix

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Micro-App | Service Port | Public Route | Dedicated Database | Tech Stack & Pattern | Files | Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| **[`telemetry/`](forge-apps/telemetry/)** | `:8087` | `/apps/telemetry` | `telemetry.db` (Dedicated Turso) | TS / Hono (Public Live Metrics & SSE Streaming) | Standalone Submodule | **Passing** ✅ |
| **[`code/`](forge-apps/code/)** | `:8088` | `/apps/code` | Local Workspace / Dedicated Turso | TS / Cloud IDE Proxy | Standalone Submodule | **Passing** ✅ |
| **[`app-template/`](forge-apps/app-template/)** | `:8099` | Dynamic | `template.db` (Dedicated Turso) | 1-Command Scaffolding Submodule Blueprint | Standalone Submodule | **Passing** ✅ |

---

## 🏛️ Micro-App Architectural Directives & Rules

1. **Dedicated Database Isolation**:
   - Every Forge App operates with its own isolated Turso (libSQL/SQLite) database instance in `apps/data/<app-name>.db`.
   - Micro-apps MUST NEVER directly connect to or query another app's database.
2. **Zero-Trust Auth & RBAC**:
   - All protected endpoints consume `@forge/sdk` `authGuard(req, options)` to validate JWT session tokens and enforce specific role permissions.
3. **Astryx UI Compliance**:
   - All micro-app user interfaces consume `@forge/ui` (`getAstryxHeaderHtml()`, `getAstryxStyles()`) with `--forge-*` design tokens and zero browser defaults.
4. **4-Pillar Observability**:
   - Every micro-app maintains its own isolated `logs/` directory with structured JSON logging (`createLogger`) and automatic PII redaction.
5. **1-Command Scaffolding**:
   - Scaffold a new microservice instantly using `rtk bun scripts/create-app.ts <app-name>`.
6. **Zero-Friction Developer Integration**:
   - For a complete step-by-step tutorial without looking into source code, see the **[Forge Apps Developer Integration Guide](../apps/src/docs/src/content/docs/submodules/developer-guide.mdx)**.

---

## 🛠️ Developer Deployment & Troubleshooting Guide

### 1. Docker Gateway Network Missing (`ag_forge_apps_net`)
* **Symptom**: `network ... declared as external, but could not be found` when running standalone `docker compose up`.
* **Fix**: Run via submodule toolchain `./run.sh up`, or auto-bootstrap the network in one command:
  ```bash
  docker network create ${FORGE_APPS_NETWORK:-ag_forge_apps_net} || true
  ```
* **Runtime Mesh Control**: Set `FORGE_APPS_NETWORK="my_mesh"` in `.env` to customize the network name across all composes.

### 2. Reverse Proxy Subpath Asset Routing (404 on Images/Scripts)
* **Symptom**: Images broken, CSS/JS 404, or client `fetch('/health')` hits the root landing page.
* **Root Cause**: Caddy's `handle_path /apps/<app>*` strips the path. A leading slash (`/images/pic.png`) resolves to the domain root!
* **Fix**:
  - Add `<base href="/apps/<app-id>/">` in the HTML `<head>`.
  - Use relative paths: `<img src="./images/pic.png">` or `fetch('health')`.
  - In Next.js, set `basePath: '/apps/<app-id>'`. In Vite, set `base: './'`.

### 3. Content Security Policy (CSP) Image Blocking
* **Symptom**: Browser blocks canvas exports, blob previews, or external avatars.
* **Fix**: SG Forge permits `img-src 'self' data: blob:`. If your micro-app requires an external CDN (e.g. GitHub avatars), define a scoped CSP rule in `scripts/generate-proxy.ts`.

### 4. Diverse Ingress Topologies Beyond Local Containers
Forge micro-apps support 8 network deployment scenarios via `.env`:
* **In-Repo Docker Submodule**: `APP_TELEMETRY="Live Telemetry|8087|/apps/telemetry|Micro-Apps|Public|app-telemetry"`
* **Decoupled Standalone App (Docker)**: `APP_EXTERNAL="External Service|8089|/apps/external|Dev Tools|Employee / Admin|app-external"`
* **Host Process (Bare Metal Bun/Node/Python)**: `APP_TOOL="Native Tool|5000|/apps/tool|Developer|Developer|host.docker.internal"`
* **Remote Cloud HTTPS SaaS**: `APP_CRM="CRM|443|/apps/crm|Sales|Employee / Admin|https://crm.corp.internal"`
* **Multi-Machine Cluster Node**: `APP_TEL="Telemetry|8087|/apps/tel|Ops|Public|http://192.168.1.50:8087"`
* **Custom Root Website Ingress**: `APP_LANDING="Corporate Site|443|/|Corporate|Public Ingress|https://marketing.acme.corp"`
* **Direct Portal (No Landing)**: Omit `APP_LANDING` or set `DISABLE_LANDING="true"`.

*Comprehensive Guide: [`apps/src/docs/src/content/docs/submodules/env-app-registry.mdx`](../apps/src/docs/src/content/docs/submodules/env-app-registry.mdx) (or `/docs/submodules/env-app-registry/` in the Engineering Portal).*


