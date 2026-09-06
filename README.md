# 🚀 SG Forge - Modular Corporate Portal & Micro-App Sandbox Engine (v2.0.0)

SG Forge is a modern, installable, and extensible organizational workspace portal. It allows organizations to host a visual semantic Org Canvas, centralize identity and hierarchical RBAC, and run isolated polyglot micro-frontends (Forge Apps in TS, Python, Go) with dedicated Turso (libSQL) database instances.

---

## 📊 Monorepo Architecture & Code Metrics Matrix

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Package / Service | Type / Category | Ingress Port | Ingress Route | Files | Total Lines | Code (SLOC) | Comments | Complexity | 5-Tier Tests | Database Instance | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **[`@forge/landing`](apps/src/landing)** | Platform Service | `:3000` | `/` | 14 | 456 | 332 | 57 | 32 | 7 | Stateless | **Passing** ✅ |
| **[`@forge/portal`](apps/src/portal)** | Platform Service (SPA) | `:3001` | `/portal` | 49 | 6,338 | 5,324 | 372 | 952 | 25 | `portal.db` | **Passing** ✅ |
| **[`@forge/dev-dashboard`](apps/src/dev-dashboard)** | Platform Service (Studio) | `:3002` | `/devcenter` | 98 | 16,571 | 13,576 | 1,258 | 2,821 | 113 | `dev_dashboard.db` | **Passing** ✅ |
| **[`@forge/dev-hub`](apps/src/dev-hub)** | Platform Service (Docs) | `:3003` | `/gateway` | 30 | 2,397 | 1,908 | 242 | 181 | 17 | Stateless (SDK Mesh) | **Passing** ✅ |
| **[`@forge/auth`](apps/src/auth)** | Platform Service (Identity) | `:3004` | `/auth` | 47 | 4,261 | 3,333 | 337 | 559 | 37 | `auth.db` | **Passing** ✅ |
| **[`@forge/docs`](apps/src/docs)** | Platform Service (Docs) | `:3005` | `/docs` | 32 | 4,120 | 3,250 | 410 | 185 | 27 | Stateless (Astro SSG) | **Passing** ✅ |
| **[`@forge/sdk`](apps/src/sdk)** | Core Library | N/A | Library | 22 | 1,911 | 1,478 | 194 | 395 | 26 | Turso SQLite Manager | **Passing** ✅ |
| **[`@forge/ui`](apps/src/ui)** | UI Design System | N/A | Library | 24 | 2,782 | 2,114 | 310 | 258 | 19 | Stateless (Astryx UI) | **Passing** ✅ |
| **[`@forge/types`](apps/src/types)** | Domain Contracts | N/A | Library | 3 | 139 | 117 | 4 | 30 | N/A | Stateless (TS Types) | **Passing** ✅ |
| **[`telemetry`](forge-apps/telemetry)** | Micro-App (Real-Time) | `:8087` | `/apps/telemetry` | 13 | 429 | 313 | 50 | 19 | 5 | `telemetry.db` | **Passing** ✅ |
| **[`code`](forge-apps/code)** | Micro-App (Cloud IDE) | `:8088` | `/apps/code` | 12 | 350 | 250 | 40 | 15 | 5 | Dedicated Turso | **Passing** ✅ |
| **[`app-template`](forge-apps/app-template)** | Reference Submodule | `:8099` | Dynamic | 20 | 471 | 339 | 53 | 26 | 10 | `template.db` | **Passing** ✅ |
| **SG Forge Monorepo Total** | **Entire Workspace** | **`:80 / :443`** | **`/`** | **580** | **112,863** | **101,514** | **4,005** | **6,197** | **327 Pass (0 Fail)** | **Dedicated Turso DBs** | **100% Verified** ✅ |

---

## ⚡ 1-Command Developer Onboarding (Zero Host Install)

Any developer or AI agent can clone the repository and run **one single command** to bootstrap the entire environment (no `apt`, `brew`, `pip install`, or `npm -g` required):

### Linux, macOS & WSL2
```bash
./run.sh setup
./run.sh dev
```

### Windows Native (CMD & PowerShell)
```cmd
run.bat setup
run.bat dev
```

---

## 🧭 Master Documentation & Architecture

* **[Living Documentation Portal (`@forge/docs`)](apps/src/docs/README.md)**: Unified living documentation portal powered by Astro Starlight and Pagefind.
* **[Visual Architecture Atlas (Non-Technical)](apps/src/docs/src/content/docs/executive/visual-atlas.mdx)**: Intuitive visual architecture guide designed for executives, product managers, and non-technical stakeholders.
* **[Organization Deployment & Quickstart Guide](apps/src/docs/src/content/docs/operations/deployment-quickstart.mdx)**: Production deployment instructions, `.env` configuration, port mapping, and operational commands.
* **[Portable Open-Source Toolchain Manual](apps/src/docs/tools/PORTABLE_TOOLCHAIN.md)**: Complete guide to Gitleaks, Biome, Knip, Autocannon, Repomix, SCC, RTK, and Astryx CLI.
* **[Developer Workflow & Testing Guide](apps/src/docs/setup/WORKFLOW_SETUP.md)**: Daily developer workflows, 5-tier testing pyramid, and engineering standards.
* **[Security & Zero-Trust Architecture](apps/src/docs/security/README.md)**: Zero-trust iframe sandboxing, scoped JWT tokens, supply chain defense, and ASVS 5.0 invariants.
* **[API Contracts & SDK Specifications](apps/src/docs/api/README.md)**: OpenAPI 3.1 specifications, SDK bridge, and multi-app integration contracts.
* **[Zero-Host Portable Setup Guide](apps/src/docs/setup/PORTABLE_SETUP.md)**: Cross-platform portable runtimes (`bun`, `rtk`, `astryx`, `caveman`).

---

## 📁 Repository Layout

```text
.
├── apps/                          # 🏢 Core Platform Codebase
│   ├── src/                       # 📦 Platform Services & Shared Libraries
│   │   ├── landing/               # 1. Public Landing Page (Port 80/443 root)
│   │   ├── auth/                  # 2. Central Auth & JWT Token Issuer
│   │   ├── portal/                # 3. Main Workspace & Org Canvas (Port 3001)
│   │   ├── dev-dashboard/         # 4. Developer Monitoring Dashboard (Port 3002)
│   │   ├── dev-hub/               # 5. Developer Hub & Playground (Port 3003)
│   │   ├── docs/                  # 6. Documentation & Living Architecture Portal (Port 3005)
│   │   ├── sdk/                   # 7. Forge SDK bridge library (@forge/sdk)
│   │   ├── ui/                    # 8. Astryx UI tokens & components (@forge/ui)
│   │   └── types/                 # 9. Shared TypeScript domain models (@forge/types)
│   └── test/                      # 🧪 5-Tier Test Suites (unit, integration, e2e, contract, security)
│
├── forge-apps/                    # 🧩 Autonomous Git Submodules (Dockerized)
│   ├── telemetry/                 # Live Telemetry Dashboard (Port 8087)
│   ├── code/                      # Cloud VS Code IDE (Port 8088)
│   └── app-template/              # 1-Command Scaffolding Submodule Blueprint (Port 8099)
│
├── docker/                        # 🐳 Docker Environments
│   ├── dev/                       # docker-compose.yml (Development - Hot Reloading)
│   └── prod/                      # docker-compose.yml (Production)
│
├── proxy/                         # 🔀 Unified Reverse Proxy (Caddy / Nginx)
│   └── Caddyfile
│
├── portables/                     # 🧰 Standalone FOSS Runtimes (Zero Host Modification)
│   ├── bin/                       # gitleaks, biome, knip, hadolint, autocannon, repomix, scc, rtk, astryx
│   └── bun/                       # Portable Bun v1.3.14 (LTS 2026)
│
├── run.sh                         # ⚡ Linux / macOS / WSL2 Orchestration CLI
└── run.bat                        # ⚡ Windows Native Orchestration Script
```

---

## 🛡️ Pre-Commit Quality Gate & Diagnostics

```bash
# Run 2-Tier Quality Gate (29 Deterministic Checks + 8 AI Agent Semantic Audits):
./run.sh verify

# Run System Diagnostics & Health Checks:
./run.sh doctor

# Run HTTP Latency Benchmark:
./run.sh benchmark
```

---

## 📜 Licensing & Open-Source Governance

SG Forge is free and open-source software licensed under the **Apache License, Version 2.0**.

* **[LICENSE](LICENSE)**: Complete Apache License 2.0 text, including Section 7 (Disclaimer of Warranty) and Section 8 (Limitation of Liability).
* **[NOTICE](NOTICE)**: Copyright attribution, trademark non-endorsement disclaimers, and U.S. EAR § 734.3(b)(3) public encryption export compliance.
* **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines and Developer Certificate of Origin (DCO 1.1) certification requirements (`git commit -s`).
* **[SECURITY.md](SECURITY.md)**: Vulnerability disclosure policies, contact details, and no-commercial-SLA warranty disclaimers.

