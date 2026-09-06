# 🧪 Central Auth Microservice Test Suites (`apps/src/auth/test/`)

Complete 5-Tier Testing Pyramid implementing Enterprise engineering standards (2026 LTS Baseline).

---

## 🏛️ Directory Architecture

```
apps/src/auth/test/
├── README.md                      # Test documentation & execution cheatsheet
├── unit/                          # Tier 1: Hermetic Unit Tests (<5ms)
│   ├── crypto.test.ts             # Scrypt hashing, constant-time comparison, Ed25519 signing
│   ├── totp.test.ts               # RFC 6238 TOTP math, base32 encoding, time-drift tolerance
│   └── iam-engine.test.ts         # GCP-style IAM permission evaluation & wildcard matching
├── integration/                   # Tier 2: Database & Handlers (<50ms)
│   ├── db-schema.test.ts          # Polymorphic org tree, dynamic node types, seed verification
│   ├── auth-flow.test.ts          # Mandatory first-login password setup & session creation
│   └── session-rotation.test.ts   # Refresh Token Rotation (RTR) & multi-device revocation
├── security/                      # Tier 3: Attack Vectors & Invariants (<100ms)
│   ├── rate-limiter.test.ts       # Anti-brute-force 5-attempt limit & HTTP 429 backoff
│   ├── replay-defense.test.ts     # Token theft detection & session family destruction
│   └── security-headers.test.ts   # HSTS, CSP, X-Frame-Options: DENY, nosniff
├── contracts/                     # Tier 4: RFC & Schema Validation (<20ms)
│   ├── jwks-contract.test.ts      # RFC 7517 JSON Web Key Set schema compliance
│   └── problem-json.test.ts       # RFC 7807 application/problem+json error format
└── e2e/                           # Tier 5: End-to-End User Journeys (<300ms)
    ├── portal-auth-gate.test.ts   # Fast HTTP cross-service journey
    └── playwright/                # Real Browser Automation
        └── auth-journey.spec.ts   # Real browser login, entropy validation & portal return
```

---

## ⚡ Execution Cheatsheet

```bash
# Run all Auth test suites:
rtk bun test apps/src/auth/test/

# Run specific tiers:
rtk bun test apps/src/auth/test/unit/
rtk bun test apps/src/auth/test/integration/
rtk bun test apps/src/auth/test/security/
rtk bun test apps/src/auth/test/contracts/
rtk bun test apps/src/auth/test/e2e/
```
