# 📦 Forge Foundation SDK (`@forge/sdk`)

Enterprise Foundation SDK suite for **SG Forge** microservices (`apps/src/*`) and independent Forge micro-apps (`forge-apps/*`).

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/sdk` | Core Shared Library |
| **Type** | Monorepo Package Alias | Clean import via `@forge/sdk` (Zero relative sprawl) |
| **Total Files** | `22` files | Structured logging, auth guards, DB client, registry, tests |
| **Lines of Code (SLOC)**| `1,478` SLOC | 1,911 total lines (194 comments, 239 blanks) |
| **Complexity Score** | `395` | Enterprise SRE logging, redaction engine, DB lifecycle manager |
| **Language Breakdown** | TypeScript (1,401 SLOC), Markdown (67), JSON (10) | 100% type-safe |
| **Database Instance** | Turso SQLite Client Factory | Central SQLite/libSQL manager with automatic test isolation |
| **5-Tier Test Suite** | `26` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/` |
| **Verification Gate** | **100% Passing** ✅ | Strict RFC 7807 problem details & PII redaction compliance |

---

## 🛠️ Core SDK Modules & Exports

### 1. Structured Logging & Telemetry Engine (`logger.ts`)
* `createLogger(serviceName, customLogDir?)`: Creates a `ForgeLogger` instance.
* `redactSensitiveData(data)`: Enterprise recursive PII and credential sanitizer (passwords, tokens, Bearer headers, API keys).
* `explainLog(logEntry)`: Deterministic plain-English heuristic generator for operational logs.
* `ForgeLogger.logDbQuery(sql, durationMs, err?, traceId?)`: Microsecond database query timing with slow-query warnings.
* `ForgeLogger.logBrowserEvent(severity, message, meta?, err?, traceId?)`: Browser telemetry log sink.

### 2. Error Boundaries & RFC 7807 Wrapper (`error-handler.ts`)
* `createSafeHandler(serviceName, handler, customLogDir?)`: Wraps Bun/Node HTTP request handlers in standard RFC 7807 problem details (`application/problem+json`) with immutable `x-trace-id` propagation and execution timing.

### 3. Zero-Trust SSO Auth & RBAC Gate (`auth-guard.ts`)
* `verifySessionToken(token)`: High-performance asymmetric Ed25519 signature validation (<0.1ms without central DB hit).
* `authGuard(req, options)`: Zero-Trust gateway middleware with direct-jump `return_url` preservation, public path bypasses, and role/permission gates with Astryx 403 fallback.

### 4. Directory & Scoped Employee Hierarchy Client (`directory-client.ts`)
* `fetchOrgDirectory(baseUrl?)`: Fetches complete organization directory and department tree.
* `getScopedHierarchy(userIdOrEmail, baseUrl?)`: Fetches targeted linear management chain upward to executive level and direct reports downward for a specific employee.
* `getMyHierarchy(req, baseUrl?)`: Resolves the calling user's personal hierarchy directly from request session.
* `isManagerOf(candidateManagerId, employeeId, baseUrl?)`: Validates whether managerId exists in the employee's upward chain of command.

### 5. Dynamic Ingress & Service Registry (`registry.ts`)
* `loadServiceRegistry(envPath?)`: Parses declarative `.env` app registrations (`APP_<NAME>`) to derive service topology, ports, health endpoints, and container naming.

### 6. Micro-App Client & Browser Bridge (`client-bridge.ts` & `browser-bridge.ts`)
* `ForgeClient.init(options)`: `postMessage` handshake bridge between micro-app iframes and parent Portal for user context, auth tokens, theme synchronization, and authenticated `fetch()`.
* `initBrowserLogBridge(serviceName, ingestEndpoint?)`: Client-side uncaught error & console interception with sanitized beacon forwarding to `/api/logs/browser`.

### 7. Universal Air-Gapped Security & CSP Headers (`security-headers.ts`)
* `AIR_GAPPED_CSP`: Strict offline Content-Security-Policy blocking all external script, font, and telemetry origins.
* `AIR_GAPPED_SECURITY_HEADERS`: Comprehensive OWASP/ASVS 5.0 security headers (`HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
* `applySecurityHeaders(res, customHeaders?)`: Automatically wraps HTTP responses with air-gapped security boundaries.

### 8. Canonical Database Client & Lifecycle Manager (`database.ts`)
* `resolveCanonicalDataDir()`: Robust multi-context path resolver across host, containers, and subdirectories.
* `getDatabaseClient(dbFileName, options)`: Standardized SQLite connection factory with WAL mode, foreign keys, and automatic test isolation (`NODE_ENV === 'test'`).
* `closeDatabaseClient(dbInstance)`: Flushes uncheckpointed WAL pages (`PRAGMA wal_checkpoint(TRUNCATE)`) and closes handle cleanly.

---

## 📁 Internal Architecture

```text
apps/src/sdk/
├── README.md                      # Package documentation & code metrics
├── package.json                   # Package manifest & export map
├── src/
│   ├── index.ts                   # Main barrel export
│   ├── logger.ts                  # Structured logging & PII redaction engine
│   ├── error-handler.ts           # RFC 7807 Problem Details boundary
│   ├── auth-guard.ts              # Zero-Trust JWT verification & RBAC guard
│   ├── directory-client.ts        # Scoped management chain & hierarchy client
│   ├── registry.ts                # Declarative ingress & service discovery
│   ├── branding.ts                # Dynamic white-labeling & logo resolver
│   ├── external-ingress.ts        # Proxy upstream resolution engine
│   ├── database.ts                # Canonical SQLite client & WAL manager
│   ├── client-bridge.ts           # Micro-app iframe postMessage client
│   └── browser-bridge.ts          # Client-side log forwarding bridge
├── logs/                          # Isolated structured JSON log sink
└── test/                          # 5-Tier test suite (unit, integration, security, contracts)
```

---

## 🏃 Local Execution & Verification

```bash
# Run test suite
rtk bun test apps/src/sdk/test/
```
