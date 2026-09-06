# 📊 Developer Monitoring Dashboard (`@forge/dev-dashboard`)

Real-time platform telemetry, organization directory management, database diagnostics, and live log streaming dashboard serving on Port `:3002` (proxied at `/devcenter`). Built to Enterprise SRE & Astryx Enterprise Standards.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/dev-dashboard` | Platform Service (Developer Studio) |
| **Ingress Port / Route** | `:3002` &rarr; `/devcenter` | Caddy / Nginx reverse proxy gateway upstream |
| **Total Files** | `98` files | High-density controllers, renderers, studio tools, tests |
| **Lines of Code (SLOC)**| `13,576` SLOC | 16,571 total lines (1,258 comments, 1,737 blanks) |
| **Complexity Score** | `2,821` | Comprehensive administrative studio & query engine |
| **Language Breakdown** | TypeScript (13,396 SLOC), Markdown (152), Docker (14), JSON (14) | 100% type-safe |
| **Database Instance** | `dev_dashboard.db` | Dedicated Turso libSQL/SQLite database |
| **5-Tier Test Suite** | `113` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | 100% Soft 500-Line Cap & Zero-Leak Redaction |

---

## 🚀 Key Capabilities & Modules

1. **System Topology & Vitals Overview**: Real-time micro-service node diagram with live latencies, RAM usage, and cluster health indicators.
2. **Employee & Directory Studio**: Comprehensive management studio with full CRUD, tree restructuring, reporting lines editor, and instant avatar generation.
3. **Unified Database Studio & Remote Gateway**: Enterprise database studio merging schema inspector, fast paginated table data browser, monospace SQL editor with `READ_ONLY` safety sandbox, and dynamic remote microservice DB connections (`/api/db/connect`).
4. **Live SSE Log Streamer**: Zero-disk-churn in-memory ring buffer streaming structured logs via Server-Sent Events (`/api/logs/stream`).
5. **Traffic & SRE Golden Signals**: Real-time request telemetry, response durations, and status code distributions.
6. **RFC 7807 Issue Center**: Deduplicated exception logs grouped by fingerprint with sanitized stack traces.
7. **System Terminal Monitor**: Live output streamer inspecting server processes and container vitals.

---

## 📁 Internal Architecture

```text
apps/src/dev-dashboard/
├── README.md                      # Service documentation & code metrics
├── package.json                   # Dependencies & package manifest
├── src/
│   ├── index.ts                   # Main barrel export
│   ├── server.ts                  # Bun HTTP server & dual-probe health endpoints
│   ├── backend/
│   │   ├── api-handlers.ts        # REST & SSE API route dispatchers
│   │   ├── services-controller.ts # Process lifecycle & health prober
│   │   ├── employee-controller.ts # Employee CRUD & org tree management
│   │   ├── telemetry.ts           # In-memory circular ring buffer & SSE streamer
│   │   └── index.ts               # Backend exports
│   ├── frontend/
│   │   ├── ui-renderer.ts         # High-density SPA HTML document assembler
│   │   ├── ui-modals.ts           # Astryx modal dialogs & Connect Remote DB modal
│   │   ├── ui-styles.ts           # Astryx CSS layout & token styles
│   │   ├── ui-scripts.ts          # Client-side SPA navigation & SSE listeners
│   │   ├── ui-tools-scripts.ts    # Command palette & Database Studio scripts
│   │   └── index.ts               # Frontend exports
│   └── db/
│       ├── db.ts                  # Turso/libSQL manager with WAL & query sandbox
│       ├── remote-connectors.ts   # Dynamic remote DB connectors & validation
│       └── index.ts               # Database exports
├── docker/                        # Multi-stage Docker containerization
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🏃 Local Execution & Verification

```bash
# Run server standalone
rtk bun apps/src/dev-dashboard/src/server.ts

# Run test suite
rtk bun test apps/src/dev-dashboard/test/
```
