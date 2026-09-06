# @forge/docs - Living Documentation Core Service

## 1. Overview
The `@forge/docs` core microservice hosts the SG Forge Living Documentation Portal, serving interactive architecture guides, system requirements, traceability matrices, and Astryx vector diagrams across the platform.

- **Port Allocation**: `3005` (Environment: `DOCS_PORT=3005`)
- **Ingress Gateway Route**: `/docs` (Reverse-proxied via Caddy on Ports 80 & 443)
- **Role**: Developer Tools & Living Engineering Standards
- **Runtime**: Portable Bun HTTP Server (<50MB memory footprint)

## 2. Core Capabilities
1. **High-Performance Static Asset Streaming**: Delivers pre-rendered Astro Starlight HTML, Pagefind WebAssembly search indexes, and Astryx vector diagrams with HTTP caching headers (`ETag`, `Cache-Control`).
2. **Path Normalization**: Seamlessly handles both direct port access (`http://localhost:3005/docs/...`) and stripped reverse proxy requests (`/architecture/...`).
3. **Dual-Probe SRE Health Engine**: Exposes `/health` (liveness) and `/ready` (readiness) probes monitored by the Dev Hub Health Mesh (`:3003`).
4. **Isolated 4-Pillar Observability**: Emits structured JSON telemetry with trace correlation and automated PII redaction via `@forge/sdk`.

## 3. Directory Layout
- `src/`: Server bootstrap, configuration, and static routing handlers.
- `docker/`: Air-gapped container specification with healthcheck probes.
- `logs/`: Isolated rolling operational logs.
- `test/`: Monorepo 5-tier test suites (`unit/`, `integration/`, `security/`, `contracts/`, `e2e/`).
