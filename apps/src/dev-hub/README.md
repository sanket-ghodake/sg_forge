# 🛠️ Developer Hub & SDK Playground (`@forge/dev-hub`)

Developer onboarding, SDK documentation, token inspection, interactive API simulation, and micro-app scaffolding interface serving on Port `:3003` (proxied at `/gateway`).

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/dev-hub` | Platform Service (Developer Hub) |
| **Ingress Port / Route** | `:3003` &rarr; `/gateway` | Caddy / Nginx reverse proxy gateway upstream |
| **Total Files** | `30` files | Interactive documentation renderers, sandboxes, tests |
| **Lines of Code (SLOC)**| `1,908` SLOC | 2,397 total lines (242 comments, 247 blanks) |
| **Complexity Score** | `181` | Modular documentation & API simulation engine |
| **Language Breakdown** | TypeScript (1,817 SLOC), Markdown (62), Docker (14), JSON (15) | 100% type-safe |
| **Database Instance** | Stateless | Mesh client consuming `@forge/sdk` and central auth |
| **5-Tier Test Suite** | `17` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | Strict Astryx token & problem+json compliance |

---

## 🚀 Key Sections & Capabilities

1. **System Topology & Architecture Invariants**: Interactive documentation of Enterprise clean architecture rules.
2. **Health Mesh Prober**: 1-click ping and latency verification across all registered platform microservices.
3. **Token Minting Sandbox**: Interactive JWT claims inspector and 1-click test persona token generator.
4. **Declarative Ingress Matrix**: Dynamic route mapping and container upstream inspector.
5. **Polyglot Scaffolding Generator**: Multi-language starter code generator (TypeScript, Python FastAPI, Go Fiber).
6. **Interactive SDK Sandbox**: In-browser mock postMessage bridge and request simulator.
7. **Security & RFC 7807 Matrix**: Standardized problem details reference and error code directory.

---

## 📁 Internal Architecture

```text
apps/src/dev-hub/
├── README.md                      # Service documentation & code metrics
├── package.json                   # Dependencies & package manifest
├── src/
│   ├── index.ts                   # Main barrel export
│   ├── server.ts                  # Bun HTTP server & dual-probe health endpoints
│   ├── backend/
│   │   ├── api-handlers.ts        # Health check proxy & token minting API
│   │   └── index.ts               # Backend exports
│   └── frontend/
│       ├── layout.ts              # Astryx page frame & navigation tabs
│       ├── sections/              # 11 Modular interactive section renderers
│       └── scripts/               # Client-side simulator & token generator scripts
├── docker/                        # Multi-stage Dockerfile
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🏃 Local Execution & Verification

```bash
# Run server standalone
rtk bun apps/src/dev-hub/src/server.ts

# Run test suite
rtk bun test apps/src/dev-hub/test/
```
