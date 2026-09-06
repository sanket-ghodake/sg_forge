# 🔒 Central Identity & Auth Service (`@forge/auth`)

Central authentication, generic organizational hierarchy, GCP-style IAM policy engine, session management, and public JWKS token issuer serving on Port `:3004` (proxied at `/auth`).

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/auth` | Platform Service (Central Auth & IAM) |
| **Ingress Port / Route** | `:3004` &rarr; `/auth` | Caddy / Nginx reverse proxy gateway upstream |
| **Total Files** | `47` files | Cryptographic modules, IAM engine, UI, DB migrations, tests |
| **Lines of Code (SLOC)**| `3,333` SLOC | 4,261 total lines (337 comments, 591 blanks) |
| **Complexity Score** | `559` | High-security cryptographic & IAM policy conductors |
| **Language Breakdown** | TypeScript (3,182 SLOC), Markdown (124), Docker (14), JSON (13) | 100% type-safe |
| **Database Instance** | `auth.db` | Dedicated Turso libSQL/SQLite database |
| **5-Tier Test Suite** | `37` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | 100% Branch Coverage on Auth & RBAC Boundaries |

---

## 🚀 Key Features

* **Generic Polymorphic Org Structure**: Dynamic node types (`Division`, `Department`, `Faculty`, `Ward`, `Squad`) with materialized path trees and multi-dimensional reporting chains.
* **GCP-Style Granular IAM**: Permissions, predefined & custom roles, and resource-scoped policy bindings (`org/*`, `nodes/tech/*`, `apps/billing`).
* **ASVS 5.0 Zero-Trust Cryptography**: Ed25519 asymmetric token signing with public JWKS (`/.well-known/jwks.json`) for zero-latency offline verification across distributed microservices.
* **Refresh Token Rotation (RTR)**: Single-use refresh token families with automated replay detection and instant family revocation.
* **First-Login Password Lifecycle**: Enforces mandatory permanent password setup on first access with live complexity and entropy validation.
* **Dynamic White-Label Rebranding**: Dynamically adapts brand name, logo, and tagline from `.env`.
* **Anti-Brute-Force Rate Limiter**: 15-minute sliding-window rate limiting tracking both IP and email attempt buckets. Operates as an in-memory singleton for ultra-low latency (<0.1ms). In clustered or multi-replica environments, front with reverse proxy rate limiting (Caddy/Nginx limit_req) or an external distributed store (Redis/libSQL).

---

## 👥 Seeded Test Personas (Default Password: `password123`)

| Persona | Email | Role | Department / Node |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | `superadmin@forge.internal` | `roles/super_admin` (All `*`) | HQ (Root Org) |
| **Sarah Vance** | `security@forge.internal` | `roles/security.admin` | Security & Cloud Ops |
| **Marcus Sterling** | `billing.admin@forge.internal` | `roles/billing.admin` | Accounting & Billing |
| **Devon Hayes** | `developer@forge.internal` | `roles/dev.operator` | Core Platform Eng |
| **Bob Miller** | `bob.lead@forge.internal` | `roles/employee` (Lead) | Core Platform Eng |
| **Alice Chen** | `alice.eng@forge.internal` | `roles/employee` (Senior Eng) | Backend & Infra Squad |
| **Carol Wright** | `carol.fin@forge.internal` | `roles/employee` (Analyst) | Accounting & Billing |

---

## 📡 API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/auth/login` | Astryx Login page with Quick Test Personas |
| `GET` | `/auth/set-password` | First-time password setup wizard |
| `POST` | `/api/v1/auth/login` | Authenticate email & password (returns `MUST_CHANGE_PASSWORD` or session) |
| `POST` | `/api/v1/auth/set-password` | Update permanent password & issue session |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/api/v1/auth/logout` | Revoke active session |
| `GET` | `/api/v1/auth/directory` | Fetch org tree nodes & user directory |
| `GET` | `/.well-known/jwks.json` | Public JWKS keys for offline verification |
| `GET` | `/health` | Service health status |

---

## 📁 Internal Architecture

```text
apps/src/auth/
├── README.md                      # Service documentation & code metrics
├── package.json                   # Dependencies & package manifest
├── src/
│   ├── index.ts                   # Main barrel export
│   ├── server.ts                  # Bun HTTP server & dual-probe health endpoints
│   ├── crypto/                    # Ed25519 signing, Argon2id hashing & JWKS exporter
│   ├── iam/                       # Permissions evaluator & role policy matcher
│   ├── session/                   # Cookie jar & refresh token rotation manager
│   ├── org/                       # Polymorphic tree & scoped hierarchy resolver
│   ├── ui/                        # Astryx login & password setup views
│   └── db/                        # Turso SQLite schema, migrations & seed engine
├── docker/                        # Multi-stage Dockerfile
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts, e2e)
```

---

## 🏃 Local Execution & Verification

```bash
# Run server standalone
rtk bun apps/src/auth/src/server.ts

# Run test suite
rtk bun test apps/src/auth/test/
```
