# 🧰 SG Forge 2.0 - Portable Open-Source Toolchain Manual

> **Zero Host Install Architecture (2026 LTS Baseline)**: All tools run directly from portable repo binaries (`portables/bin/*`) or portable Bun scripts. ZERO installation required on host OS (`apt`, `brew`, `pip install`, `npm -g`).

---

## 🧭 Master Toolchain & Version Catalog (2026 LTS)

| Tool | Version | License | Category | Purpose | CLI Command | Speed |
| :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| [**Bun**](https://github.com/oven-sh/bun) | `v1.3.14` | MIT | Runtime | Ultra-fast TypeScript/JavaScript runtime | `./portables/bun/bin/bun` | `< 10ms` |
| [**RTK**](https://github.com/rtk-ai/rtk) | `v0.42.3` | MIT | AI Optimizer | Terminal output token compression engine | `rtk <command>` | `< 2ms` |
| [**Astryx**](../../ui) | `v2.0.0` | Apache-2.0 | Design System | Enterprise UI design tokens & theme engine | `astryx status` | `< 5ms` |
| [**Gitleaks**](https://github.com/gitleaks/gitleaks) | `v8.30.1` | MIT | Security | 160+ API key & secret scanner | `./run.sh secrets` | `< 10ms` |
| [**Biome**](https://github.com/biomejs/biome) | `v2.2.0` | MIT / Apache-2.0 | Code Quality | Ultra-fast Rust AST linter & code formatter | `./run.sh lint` | `< 15ms` |
| [**Knip**](https://github.com/webpro-nl/knip) | `v6.32.2` | MIT | Architecture | Monorepo dead code & unexported symbol auditor | `./run.sh deadcode` | `< 40ms` |
| [**OSV-Scanner**](https://github.com/google/osv-scanner) | `v2.5.1` | Apache-2.0 | Supply Chain | Google Open Source Vulnerability database scanner | `./run.sh vuln` | `< 60ms` |
| [**Trivy**](https://github.com/aquasecurity/trivy) | `v0.74.0` | Apache-2.0 | Security | Container, config & workspace vulnerability auditor | `./run.sh trivy` | `< 100ms` |
| [**Spectral**](https://github.com/stoplightio/spectral) | `v6.16.3` | Apache-2.0 | API Contracts | OpenAPI 3.1 & AsyncAPI specification linter | `./run.sh contracts` | `< 20ms` |
| [**Schemathesis**](https://github.com/schemathesis/schemathesis)| `v3.39.0` | MIT | API Contracts | Property-based API contract fuzzer | `portables/bin/schemathesis`| `< 200ms` |
| [**Syft**](https://github.com/anchore/syft) | `v1.51.1` | Apache-2.0 | SBOM | CycloneDX 1.5 Software Bill of Materials engine | `./run.sh sbom` | `< 50ms` |
| [**Lizard**](https://github.com/terryyin/lizard) | `v1.17.10`| MIT | Metrics | Cyclomatic complexity (CCN <= 10) & function cap | `./run.sh complexity` | `< 30ms` |
| [**Dependency-Cruiser**](https://github.com/sverweij/dependency-cruiser) | `v16.10.0` | MIT | Architecture | Monorepo layer & domain isolation boundaries | `./run.sh arch` | `< 40ms` |
| [**Madge**](https://github.com/pahen/madge) | `v8.0.0` | MIT | Architecture | Module dependency graph & circular loop detector | `portables/bin/madge` | `< 30ms` |
| [**Type-Coverage**](https://github.com/plantain-00/type-coverage) | `v2.29.7` | MIT | Type Safety | TypeScript strictness gate (>= 90% type coverage) | `portables/bin/type-coverage` | `< 80ms` |
| [**ShellCheck**](https://github.com/koalaman/shellcheck) | `v0.10.0` | GPL-3.0 | Shell Safety | POSIX compliance & bash error bubbling linter | `./run.sh shellcheck` | `< 15ms` |
| [**Hadolint**](https://github.com/hadolint/hadolint) | `v2.12.0` | GPL-3.0 | Containers | Dockerfile & OCI container standards validator | `portables/bin/hadolint` | `< 10ms` |
| [**Axe-core**](https://github.com/dequelabs/axe-core) | `v4.10.1` | MPL-2.0 | Accessibility | WCAG 2.1 AA automated accessibility engine | `./run.sh a11y` | `< 40ms` |
| [**Autocannon**](https://github.com/mcollina/autocannon) | `v7.15.0` | MIT | Performance | HTTP reverse proxy latency benchmark (< 10ms) | `./run.sh benchmark [url]` | `< 500ms` |
| [**Repomix**](https://github.com/yamadashy/repomix) | `v1.10.2` | MIT | AI Tooling | Token-compressed AI context packager | `./run.sh pack` | `< 50ms` |
| [**SCC**](https://github.com/boyter/scc) | `v3.4.0` | MIT | Metrics | Lines of code & 500-line soft cap counter | `portables/bin/scc apps/` | `< 5ms` |
| [**Hyperfine**](https://github.com/sharkdp/hyperfine) | `v1.18.0` | MIT / Apache-2.0 | Benchmarking | Statistical execution time benchmark engine | `hyperfine --warmup 3` | `< 100ms` |
| [**ctop**](https://github.com/bcicen/ctop) | `v0.7.7` | MIT | Monitoring | Real-time container top resource telemetry | `./run.sh top` | `< 10ms` |
| [**Caveman**](../../../../portables/caveman) | `v1.0.0` | MIT | AI Communication | Agent token compression CLI (Ultra mode) | `caveman status` | `< 2ms` |
| [**Graphify**](https://github.com/safishamsi/graphify) | `v0.5.0` | MIT / Apache-2.0 | Knowledge Graph | AST knowledge graph & dependency visualizer | `graphify update .` | `< 30ms` |
| [**Graft**](https://github.com/trailhq/Graft) | `v0.1.0` | MIT | Code Context Graph | AST symbol call trees, skeletons & blast radius | `./run.sh graft map` | `< 5ms` |
| [**CodeBurn**](https://github.com/getagentseal/codeburn) | `v0.9.24` | Apache-2.0 | AI Spend & Tokens | Lifetime AI token & cost tracker across 41 agents | `./run.sh tokens` | `< 10ms` |
| [**Headroom**](https://github.com/headroomlabs-ai/headroom) | `v0.2.1` | Apache-2.0 | Context Compression | AST & JSON context compressor (21%-57% reduction) | `./run.sh headroom status` | `< 5ms` |
| [**Council of AI**](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584) | `v1.0.0` | Apache-2.0 | Decision Framework | Multi-agent RFC & idea stress-testing (Marius Silo) | `./run.sh council "<topic>"` | `< 5ms` |
| [**Caddy Server**](https://github.com/caddyserver/caddy)| `v2.11.4` | Apache-2.0 | Ingress | Zero-downtime reverse proxy on Ports 80 & 443 | Docker Container | `< 1ms` |
| [**Strix Agent**](https://github.com/usestrix/strix)| `v1.0.0` | Apache-2.0 | AI Pentest | In-chat whitebox code review & live endpoint pentesting | In-Chat / `.agents/skills/strix-*` | `Native` |

---

## 🛡️ The 27-Check Tier 1 Deterministic Verification Gate

Run the complete deterministic verification suite before staging any code:
```bash
./run.sh verify
```

### Gate Checklist (27 Automated Checks):
1. **Ignore, Attrib & Cross-Platform Integrity**: Validates all 7 ignore files, LF line endings, and forbids OS symlinks.
2. **500-Line Soft File Cap**: Enforces modular file cap ($\le 500$ lines, $\le 300$ standard).
3. **Zero Hardcoded Secrets & Keys**: Scans diffs and files with Gitleaks (160+ token patterns).
4. **TypeScript Compilation & Code Quality**: Validates `tsc --noEmit` and Biome AST style rules.
5. **Dead Code & Unused Exports**: Scans all monorepo workspaces using Knip.
6. **Container & Dockerfile Standards**: Lints Dockerfiles with Hadolint and enforces healthchecks.
7. **WCAG 2.1 & HTML5 Structure**: Validates `<!DOCTYPE html>`, `lang="en"`, and responsive viewports.
8. **Package Aliases & Zero Traversal**: Ensures `@forge/sdk`, `@forge/ui`, `@forge/types` (zero `../../..`).
9. **Structured Logging, PII Redaction & RFC 7807**: Enforces SRE structured logging and problem JSON responses.
10. **Multi-Agent Directives Sync**: SHA-256 byte-for-byte hash check across all 7 agent directive files.
11. **Microservice Observability & Isolated Logs**: Enforces isolated `logs/` directory per microservice.
12. **5-Tier Automated Test Suites**: Executes unit, integration, security, and contract test suites.
13. **Worklog & Ledger Integrity**: Validates `logs/WORKLOGS.md` format and JSONL commit log schema.
14. **Astryx UI & Token Compliance**: Validates CSS variable consumption (`--forge-*`) and Astryx tokens.
15. **Dynamic 5-Tier Test Architecture Scanner**: Verifies `test/` folder hierarchy across all services.
16. **Monorepo Architecture Boundaries**: Enforces strict domain isolation using `dependency-cruiser`.
17. **Zero Circular Dependencies**: Detects and rejects circular loops using `madge`.
18. **TypeScript Strictness (>=90% Coverage)**: Enforces $\ge 90\%$ explicit type coverage.
19. **Shell Script Safety & POSIX Integrity**: Validates shell scripts using `shellcheck`.
20. **WCAG 2.1 AA Accessibility Standards**: Audits UI components using Axe.
21. **SAST Security & Multi-Tenant Scoping**: Enforces multi-tenant `org_id` scoping using Semgrep.
22. **Supply Chain Vulnerability Audit**: Scans `bun.lock` dependencies against Google OSV database.
23. **Workspace & Manifest Security**: Audits container and compose configurations using Trivy.
24. **OpenAPI 3.1 Contract Compliance**: Lints API contracts against `.spectral.yaml` using Spectral.
25. **Complexity Cap (CCN <= 10)**: Audits cyclomatic branching complexity and function caps using Lizard.
26. **Permissive License Governance**: Audits dependencies for permissive OSI licenses (rejects copyleft).
27. **CycloneDX 1.5 SBOM Integrity**: Validates automated Software Bill of Materials using Syft.

### 🧠 Tier 2: AI Agent Semantic Review (8 Pre-Commit Audits)
1. **Anti-Vibecoding & Aesthetic Review**: UI feels premium, accessible, and strictly consumes Astryx tokens.
2. **Correctness & "No Guessing" Verification**: Zero hallucinated database columns, APIs, or phantom imports.
3. **Multi-Tenant Data Isolation & DB Boundaries**: Dedicated Turso DB per app; strict `org_id` scoping.
4. **Commentary & Architectural Rationale**: TSDoc and standardized header comment blocks explaining *why*.
5. **Isolated Observability & 4-Pillar Standard**: Colocated `logs/` folders, dual-probe healthcheck, zero cross-app coupling.
6. **Ignore, Attrib & File Hygiene Governance**: Zero unignored transients, strict LF line-endings, binary safety.
7. **AI Semantic Scenario & Negative Test Audit**: Explicit negative assertion tests on auth, RBAC, and rate limits.
8. **In-Chat AI Security & Pentest Audit (Strix)**: White-box code check on modified routes/queries and non-destructive live endpoint verification before code staging.

---

## 🛡️ Strix AI Penetration Testing & In-Chat Security Agent

The Strix Security Agent is an embedded, zero-API-key AI penetration testing and security auditing agent operating directly within coding agent chat sessions.

### Execution Modes:
- **Mode 1: Code Check (`strix-code-audit`)**: White-box static & semantic source review of Next.js routes, middleware, Turso DB multi-tenant `org_id` scoping, JWT cookies, and RFC 7807 problem boundaries. Trigger with `"audit code"`, `"/audit-code"`, or `"check code security"`.
- **Mode 2: Live Setup Test (`strix-live-pentest`)**: Dynamic non-destructive probing (`rtk curl -sI`) against active local development (`http://localhost:80/443`) or remote staging/production domains. Validates HSTS, CSP, X-Frame-Options, cookie hygiene, CORS, and error response leakage. Trigger with `"test live dev"`, `"test live prod <url>"`, or `"/audit-live"`.

### Open-Source Attribution & Credit:
- **Upstream Project**: [usestrix/strix](https://github.com/usestrix/strix)
- **Author**: Strix Security Team ([https://strix.ai](https://strix.ai))
- **License**: Apache License 2.0

---

## 🎯 Vibecoding Guardrail Commands

| Hazard Guarded | Tool Used | Developer CLI Command | Description |
| :--- | :--- | :--- | :--- |
| **Package Hallucination** | Package Health Engine | `./run.sh check-pkg <pkg>` | Verifies package exists on npm, age $\ge 14$ days, and maintainer provenance. |
| **Supply Chain CVEs** | Google OSV-Scanner | `./run.sh vuln` | Audits lockfile dependencies against known vulnerabilities. |
| **API Schema Drift** | Spectral & Schemathesis | `./run.sh contracts` | Lints OpenAPI 3.1 schemas and runs property contract testing. |
| **Branching Spaghetti** | Lizard AST Engine | `./run.sh complexity` | Rejects functions with CCN $> 10$ or length $> 60$ lines. |
| **License Contamination**| License Auditor | `./run.sh licenses` | Rejects non-permissive or copyleft (AGPL/GPL) dependencies. |
| **Supply Chain SBOM** | Syft / CycloneDX | `./run.sh sbom` | Automatically generates CycloneDX 1.5 SBOM with SHA hashes. |
| **Token Exploration Waste** | Graft Context Engine | `./run.sh graft skeleton <file>` | Eliminates blind file reads with instant type skeletons & call hierarchies. |
