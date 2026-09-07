# 🚀 Micro-App Template (`forge-apps/app-template`)

Reference boilerplate and scaffolding engine for building and generating new independent polyglot micro-apps in SG Forge.

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Micro-App Directory**| `forge-apps/app-template` | Reference Microservice Template |
| **Ingress Port / Route**| `:8099` (Base) &rarr; Dynamic | Dynamically assigned via `create-app.ts` |
| **Total Files** | `20` files | Scaffolding server, DB setup, Dockerfile, 5-tier test suites |
| **Lines of Code (SLOC)**| `339` SLOC | 471 total lines (53 comments, 79 blanks) |
| **Complexity Score** | `26` | Clean, modular reference implementation |
| **Language Breakdown** | TypeScript (256 SLOC), Markdown (55), Docker (13), JSON (15) | 100% type-safe |
| **Database Instance** | `template.db` | Dedicated Turso libSQL/SQLite database |
| **Auth & RBAC Scope** | `roles/employee`, `roles/super_admin` | Configurable zero-trust session guard |
| **5-Tier Test Suite** | `10` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | 100% Automated Scaffolding & Test Integrity |

---

## 🛠️ 1-Command App Generation

To scaffold a new production-ready micro-app from this template, run:
```bash
rtk bun scripts/create-app.ts <app-name> [display-name] [category] [role]
```

*Example:*
```bash
rtk bun scripts/create-app.ts inventory "Inventory Tracker" "Operations" "Employee / Admin"
```

---

## 📁 Internal Architecture

```text
forge-apps/app-template/
├── README.md                      # Template documentation & code metrics
├── package.json                   # Dependencies & package manifest
├── src/
│   ├── server.ts                  # Reference HTTP server with @forge/sdk & @forge/ui
│   └── README.md                  # Source documentation
├── db/                            # Dedicated SQLite database migrations
├── docker/
│   └── Dockerfile                 # Multi-stage production container
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```
