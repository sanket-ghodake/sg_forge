# Testing Enforcement & Quality Assurance Standards (Enterprise Standard)

## 1. The 5-Tier Testing Pyramid & Folder Layout
Every microservice across `apps/src/*` and `forge-apps/*` (and any new app generated via `scripts/create-app.ts`) MUST maintain an isolated `test/` directory organized into the 5 standard testing tiers:

```
<microservice>/test/
├── README.md                      # Test documentation & execution cheatsheet
├── unit/                          # Tier 1: Hermetic Unit Tests (<5ms)
│   └── *.test.ts                  # Pure algorithms, token parsing, math, reducers
├── integration/                   # Tier 2: Component & Database Tests (<50ms)
│   └── *.test.ts                  # SQLite transactions, route handlers, session managers
├── security/                      # Tier 3: Attack Vectors & Security Invariants (<100ms)
│   └── *.test.ts                  # Rate limiting, replay attacks, JWT tampering, headers
├── contracts/                     # Tier 4: RFC & OpenAPI Schema Validation (<20ms)
│   └── *.test.ts                  # RFC 7517 JWKS, RFC 7807 Problem JSON, schema drift
└── e2e/                           # Tier 5: End-to-End User Journeys (<300ms)
    ├── api-flow.test.ts           # Fast HTTP-level cross-service journey
    └── playwright/                # Browser automation (Real DOM, forms, cookies, A11y)
        └── *.pw.ts                # Playwright browser specs
```

---

## 2. Test Case Structure: Mandatory 3A Pattern (Arrange, Act, Assert)
Every test case must follow the explicit **Arrange-Act-Assert** layout:
```typescript
test("should reject cross-tenant resource access with 403 Forbidden", async () => {
  // 1. Arrange: Setup tenant fixtures and mock context
  const userOrgA = createMockUser({ orgId: "org-alpha", role: "ADMIN" });
  const resourceOrgB = createMockResource({ orgId: "org-beta", id: "res-99" });
  const service = new ResourceService(mockRepo);

  // 2. Act: Attempt unauthorized cross-tenant read
  const result = await service.getResource(userOrgA, "res-99");

  // 3. Assert: Strict rejection and audit emission
  expect(result.success).toBe(false);
  expect(result.status).toBe(403);
  expect(mockAuditLogger.getEmittedEvents()).toContainEqual(
    expect.objectContaining({ action: "CROSS_TENANT_ACCESS_DENIED" })
  );
});
```

---

## 3. Risk-Tiered Coverage Criteria (2026 LTS)

| Domain Tier | Subsystems | Mandatory Coverage Target |
| :--- | :--- | :--- |
| **Tier 1: Security Critical** | Auth, RBAC, Token Signing, Rate Limiting, Iframe Sandboxing | **100% Branch & Line Coverage** |
| **Tier 2: Business Logic** | Financial Calculations, Billing, Workflow State Reducers | **≥90% Line & Branch Coverage** |
| **Tier 3: API & Route Handlers** | REST Controllers, Request Parsers, RFC 7807 Error Handlers | **≥85% Statement Coverage** |
| **Tier 4: UI & Presentational** | HTML views, Astryx components, layouts | **Smoke & Playwright E2E** |

---

## 4. AI Semantic Scenario Audit & Mutation Testing

Every AI session must verify that tests include the following scenario invariants:
1. **Negative & Malformed Payloads**: Empty passwords, invalid emails, null bytes, SQL payloads.
2. **Security Invariants**:
   - Anti-brute force: 5 failed attempts $\to$ HTTP 429 Too Many Requests with `Retry-After`.
   - Token Replay Detection: Reusing a consumed refresh token immediately wipes the session family.
   - Tamper Detection: Modified JWT signatures or payload claims trigger verification failures.
3. **Multi-Tenant Data Isolation**: Cross-tenant queries return 403 Forbidden or 404 Not Found.
4. **Mutation Testing**: Inverting conditional operators (`!==`, `|| false`) must cause tests to fail immediately.

---

## 5. Testing for Truth (Anti-Shallow Mocking & Enterprise Standard)

> ⚠️ **CRITICAL DIRECTIVE**: NEVER write shallow tests that "mock the real problem away".
1. **Real Network & Socket Verification**: Tier 5 E2E tests must verify real HTTP loopbacks or Playwright browser sessions. Never mock out HTTP redirect status codes or cookie jars in memory if the bug lives in network transmission.
2. **Destination Server Verification**: After a redirect (`Location: /portal`), the test MUST follow through and assert that the destination server accepts the session cookie and renders the authenticated state (200 OK), proving that no redirect loop back to `/auth/login` occurs.
3. **Zero Hardcoded Fixtures**: Endpoints, ports, and personas must be loaded dynamically via `@forge/sdk/registry` (`loadServiceRegistry()`), `.env`, or dynamic database query helpers. Never hardcode static ports or credentials.
4. **Shared Cryptographic Invariants**: Cross-service tokens (JWT/JWKS) must verify against the shared persisted keypair in `apps/data/keys/`, proving multi-process signature verification works without in-memory coupling.

---

## 6. Execution Commands
```bash
# Execute all tests across the monorepo:
rtk bun test

# Execute a specific microservice test tier:
rtk bun test apps/src/auth/test/unit/
rtk bun test apps/src/auth/test/security/

# Run Playwright browser tests:
rtk bun x playwright test

# Lint OpenAPI 3.1 contract specifications (Spectral):
rtk ./run.sh contracts

# Run property contract schema verification (Schemathesis):
rtk ./portables/bin/schemathesis run docs/api/openapi.yaml
```
