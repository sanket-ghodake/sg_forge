# 🚀 Micro-App Template (`forge-apps/app-template`)

Reference boilerplate and scaffolding engine for building and generating new independent polyglot micro-apps in SG Forge.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Micro-App Directory**| `forge-apps/app-template` | Reference Microservice Template |
| **Ingress Port / Route**| `:8099` (Base) &rarr; Dynamic | Dynamically assigned via `create-app.ts` |
| **Total Files** | `24` files | Scaffolding server, DB setup, Dockerfile, 5-tier test suites, toolchain |
| **Complexity Score** | Clean | Modular, autonomous reference implementation |
| **Database Instance** | `template.db` | Dedicated Turso libSQL/SQLite database |
| **Auth & RBAC Scope** | `roles/employee`, `roles/super_admin` | Configurable zero-trust session guard |
| **5-Tier Test Suite** | 100% Passing | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **18/18 Passing** ✅ | Standalone Submodule Quality & Compliance Gate |

---

## 🛠️ Autonomous CLI & Toolchain

This template operates with 100% autonomy through `./run.sh` (or `run.bat` on Windows):

```bash
# Development & Testing
./run.sh dev                 # Start local server in hot-reload watch mode
./run.sh test                # Run 5-tier test suites (unit, integration, security, contracts, e2e)
./run.sh verify              # Run 18-check pre-commit quality gate

# Code Context & AST Intelligence (Graft)
./run.sh graft skeleton <file>   # Inspect type interfaces and export signatures
./run.sh graft callers <symbol>  # Trace call hierarchies within submodule
./run.sh graft blast             # Audit working tree blast radius

# Lifetime AI Spend & Token Tracking (CodeBurn)
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
forge-apps/app-template/
├── README.md                      # Template documentation & code metrics
├── package.json                   # Dependencies & package manifest
├── portables/bin/                 # Self-resolving CLI wrappers (rtk, graft, codeburn, headroom)
├── scripts/
│   ├── verify-gate.ts             # 18-check quality gate
│   ├── sync-ignores.ts            # Ignore synchronization
│   ├── sync-tokens.ts             # Token ledger synchronizer
│   ├── display-tokens.ts          # Token dashboard renderer
│   ├── headroom-runner.ts         # Context compression engine
│   └── append-worklog.ts          # Atomic worklog appender
├── src/
│   ├── server.ts                  # Reference HTTP server with micro-SDK & Astryx UI
│   └── README.md                  # Source documentation
├── db/                            # Dedicated SQLite database migrations
├── docker/
│   └── Dockerfile                 # Multi-stage production container
├── logs/                          # Isolated structured JSON log sink & token ledger
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```
