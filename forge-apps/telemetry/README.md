# 📈 Live Telemetry Service (`forge-apps/telemetry`)

Real-time telemetry and metrics streaming micro-app for platform developers and operations teams.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Micro-App Directory**| `forge-apps/telemetry` | Isolated Polyglot Forge App |
| **Ingress Port / Route**| `:8087` &rarr; `/apps/telemetry` | Reverse proxy gateway upstream |
| **Total Files** | `17` files | Server, DB client, SSE streaming, UI, Docker, tests, toolchain |
| **Complexity Score** | Clean | Streamlined real-time vitals broadcaster |
| **Language Breakdown** | TypeScript, Markdown, Docker | 100% type-safe |
| **Database Instance** | `telemetry.db` | Dedicated Turso libSQL/SQLite database |
| **Auth & RBAC Scope** | Public Access | Zero-auth public monitoring mode |
| **5-Tier Test Suite** | 100% Passing | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **18/18 Passing** ✅ | Standalone Submodule Quality & Compliance Gate |

---

## 🚀 Key Features

* **Public Ingress Mode**: Unauthenticated public monitoring dashboard with zero barrier to entry.
* **Real-Time Vitals**: Auto-updating process memory RSS and platform uptime counters.
* **Metrics Streaming API**: `/api/stream/metrics` endpoint broadcasting live JSON vitals.
* **Multi-Tenant Blast Radius Accounting**: `/api/telemetry/blast-radius` calculating 5-minute sliding window tenant failure rates and incident severity (NORMAL, ELEVATED, P0_CRITICAL).
* **Canonical Request Telemetry Ingest**: `/api/telemetry/events` (and `/api/analytics/collect`) ingesting high-cardinality request events into dedicated Turso database.
* **Astryx UI**: Clean dark dashboard layout with pulsating online indicators, real-time Blast Radius HUD cards, and return navigation.

---

## 🛠️ Autonomous CLI & Toolchain

Operates with 100% autonomy through `./run.sh` (or `run.bat` on Windows):

```bash
# Development & Testing
./run.sh dev                 # Start local server in hot-reload watch mode
./run.sh test                # Run 5-tier test suites (unit, integration, security, contracts, e2e)
./run.sh verify              # Run 18-check pre-commit quality gate

# Code Context & AST Intelligence (Graft)
./run.sh graft skeleton <file>   # Inspect type interfaces and export signatures
./run.sh graft callers <symbol>  # Trace call hierarchies within submodule
./run.sh graft blast             # Audit working tree blast radius

# Lifetime AI Spend & Token Tracking (Tokscale)
./run.sh tokens              # Display submodule lifetime token and spend dashboard
./run.sh tokens sync         # Ingest current session tokens into logs/token-ledger.jsonl
./run.sh tokens tui          # Launch interactive terminal TUI dashboard

# Context & Payload Compression (Headroom)
./run.sh headroom status     # Check compression engine health
./run.sh headroom compress <path> # Benchmark token reduction on logs/payloads
./run.sh headroom stats      # Historical compression savings report

# Submodule Worklog
./run.sh worklog "<summary>" # Atomically append task to logs/WORKLOGS.md
```

---

## 📁 Internal Architecture

```text
forge-apps/telemetry/
├── README.md                      # Service documentation & code metrics
├── portables/bin/                 # Self-resolving CLI wrappers (rtk, graft, tokscale, headroom)
├── scripts/
│   ├── verify-gate.ts             # 18-check quality gate
│   ├── sync-ignores.ts            # Ignore synchronization
│   ├── sync-tokens.ts             # Token ledger synchronizer
│   ├── display-tokens.ts          # Token dashboard renderer
│   ├── headroom-runner.ts         # Context compression engine
│   └── append-worklog.ts          # Atomic worklog appender
├── src/
│   ├── server.ts                  # Bun HTTP server & SSE stream endpoint
│   └── db/
│       ├── index.ts               # Dedicated Turso SQLite metrics client
│       └── README.md              # Database documentation
├── db/                            # Migration artifacts
├── docker/
│   └── Dockerfile                 # Multi-stage production container
├── logs/                          # Isolated structured JSON log sink & token ledger
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🌐 Ingress & Standalone Execution Notes

* **Gateway Routing**: Exposed under `/apps/telemetry/` via Caddy with canonical 308 trailing slash redirection.
* **Asset & API Paths**: Uses HTML `<base href="/apps/telemetry/">` and dynamic `apiBase` so that `health` and `api/logs/browser` resolve correctly under the subpath namespace without hitting domain root.
* **Standalone Docker**: Run `./run.sh up` to auto-bootstrap the `${FORGE_APPS_NETWORK:-forge_apps_net}` network.
* **Standalone Bare Metal**: Run `./run.sh dev` to start locally on port 8087 without Docker.

