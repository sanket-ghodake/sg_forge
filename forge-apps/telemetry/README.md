# 📈 Live Telemetry Service (`forge-apps/telemetry`)

Real-time telemetry and metrics streaming micro-app for platform developers and operations teams.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Micro-App Directory**| `forge-apps/telemetry` | Isolated Polyglot Forge App |
| **Ingress Port / Route**| `:8087` &rarr; `/apps/telemetry` | Reverse proxy gateway upstream |
| **Total Files** | `13` files | Server, DB client, SSE streaming, UI, Docker, tests |
| **Lines of Code (SLOC)**| `313` SLOC | 429 total lines (50 comments, 66 blanks) |
| **Complexity Score** | `19` | Streamlined real-time vitals broadcaster |
| **Language Breakdown** | TypeScript (260 SLOC), Markdown (40), Docker (13) | 100% type-safe |
| **Database Instance** | `telemetry.db` | Dedicated Turso libSQL/SQLite database |
| **Auth & RBAC Scope** | Public Access | Zero-auth public monitoring mode |
| **5-Tier Test Suite** | `5` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | 100% Operational Probes & SSE Stream Health |

---

## 🚀 Key Features

* **Public Ingress Mode**: Unauthenticated public monitoring dashboard with zero barrier to entry.
* **Real-Time Vitals**: Auto-updating process memory RSS and platform uptime counters.
* **Metrics Streaming API**: `/api/stream/metrics` endpoint broadcasting live JSON vitals.
* **Astryx UI**: Clean dark dashboard layout with pulsating online indicators and return navigation.

---

## 📁 Internal Architecture

```text
forge-apps/telemetry/
├── README.md                      # Service documentation & code metrics
├── src/
│   ├── server.ts                  # Bun HTTP server & SSE stream endpoint
│   └── db/
│       ├── index.ts               # Dedicated Turso SQLite metrics client
│       └── README.md              # Database documentation
├── db/                            # Migration artifacts
├── docker/
│   └── Dockerfile                 # Multi-stage production container
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🏃 Local Execution & Verification

```bash
# Run server standalone
rtk bun forge-apps/telemetry/src/server.ts

# Run test suite
rtk bun test forge-apps/telemetry/test/
```
