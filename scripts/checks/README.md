# 🛡️ Quality Gate Check Modules (`scripts/checks/`)

Modular domain-specific check implementations for the automated 2-tier quality gate (`verify-gate.ts`), decomposed in compliance with the $\le 500$-line modularity cap.

## 📁 Modules

* **[`microservice-resolver.ts`](microservice-resolver.ts)**: Dynamic discovery of microservices across core platform apps (`apps/src/`), monorepo submodules (`forge-apps/`), and autonomous sibling development workspaces (`../forge-app/<id>`).
* **[`architecture-checks.ts`](architecture-checks.ts)**: Validates 5-tier test architecture, domain isolation boundaries (`dependency-cruiser`), and zero circular dependencies (`madge`).
* **[`security-checks.ts`](security-checks.ts)**: Executes SAST multi-tenant security (`semgrep`), supply chain vulnerability scans (`osv-scanner`), container config hardening (`trivy`), OSI license compliance, and CycloneDX 1.5 SBOM integrity (`syft`).
* **[`code-quality-checks.ts`](code-quality-checks.ts)**: Audits TypeScript strictness (`type-coverage`), POSIX shell script safety (`shellcheck`), accessibility (`axe`), OpenAPI 3.1 contracts (`spectral`), cyclomatic complexity (`lizard`), Forge App submodule autonomy, and Living Standards doc-to-code traceability.
