# Developer Hub Modular UI Sections (`apps/src/dev-hub/src/frontend/sections/`)

Cohesive UI section renderers for the SG Forge Developer Gateway and SDK Hub.

---

## Section Modules & Consolidation Architecture

The Developer Gateway consolidates repetitive information into 8 cohesive navigation tabs:

- **`overview-section.ts`**: Platform topology, reverse proxy routing matrix, and 10 engineering invariants.
- **`registry-matrix-section.ts` (`routes`)**: **Unified Route Matrix & Fleet**: Dynamic route matrix loaded from `.env` via `@forge/sdk/registry`, live cluster heartbeat pinging with RTT metrics, and injected Zero-Trust gateway headers (`X-Forwarded-*`). Subsumes standalone gateway & health tabs.
- **`api-catalog-section.ts` (`api-catalog`)**: **Live API Explorer & Contracts**: Live interactive OpenAPI 3.1 contract explorer with parameters, schemas, 1-click sandbox dispatch, rate limiting quotas, and RFC 7807 problem details error catalog (401/403/429/502). Subsumes standalone security tab.
- **`sandbox-section.ts` (`sandbox`)**: Live API sandbox runner, header simulator, and polyglot request generator (cURL, TS, Python, Go).
- **`token-mint-section.ts` (`tokens`)**: 1-click test persona session token minter and Ed25519 JWT claim inspector.
- **`sdk-section.ts` (`sdk`)**: Complete `@forge/sdk` reference, code examples across TS, Python, Go, and cURL.
- **`ui-section.ts` (`ui`)**: Astryx design system tokens (`--forge-*`), Astryx Toast overlays, custom styled controls.
- **`scaffolding-section.ts` (`scaffolding`)**: **Scaffolding & Testing**: 1-command microservice generator (`./run.sh create-app`), Docker boilerplates, dedicated Turso DB isolation, 5-tier testing standard, and 3A pattern rules. Subsumes standalone testing tab.

### Compatibility Preserved
- **`gateway-section.ts`**, **`health-mesh-section.ts`**, **`security-matrix-section.ts`**, **`testing-section.ts`**: Maintained for granular backward-compatible exports and unit test contracts. All client routes seamlessly map to the unified canonical tabs.
