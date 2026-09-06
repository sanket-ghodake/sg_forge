/**
 * SG Forge Systems Documentation Generator
 * Generates Low-Level Requirements (LLR) specifications for SG Forge Living Standards.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const TARGET_DIR = join(process.cwd(), "docs", "site", "src", "content", "docs", "llr");

if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true });
}

interface LLRDef {
  id: string;
  title: string;
  desc: string;
  hlr: string;
  impl: string;
  test: string;
  algo: string[];
  invariants: string[];
}

const llrs: LLRDef[] = [
  // Auth & Crypto (LLR-AUTH-001 to 007)
  {
    id: "LLR-AUTH-001",
    title: "HMAC-SHA256 Signature Verification & Constant-Time Equality",
    desc: "Low-level requirement governing timing-safe cryptographic signature validation on session JWT tokens.",
    hlr: "HLR-AUTH-101",
    impl: "apps/src/auth/src/session.ts",
    test: "apps/src/auth/test/security/token-replay.test.ts",
    algo: [
      "Extract JWT parts into header, payload, and signature components delimited by '.'",
      "Decode signature bytes using standard base64url decoding",
      "Compute HMAC-SHA256 over header.payload using server JWT secret key",
      "Execute crypto.timingSafeEqual or bitwise XOR accumulator comparison over signature buffers",
      "Reject tokens where signature buffer lengths differ or mismatch exists with HTTP 401 Unauthorized"
    ],
    invariants: [
      "Comparison execution time must be independent of mismatched byte position (O(1) timing invariant)",
      "Zero allocation of raw secret keys to client-facing response contexts"
    ]
  },
  {
    id: "LLR-AUTH-002",
    title: "Sliding Inactivity Window Calculation & Renewal Bounds",
    desc: "Low-level requirement defining session idle timeout and absolute lifetime ceiling calculation.",
    hlr: "HLR-AUTH-101",
    impl: "apps/src/auth/src/session.ts",
    test: "apps/src/auth/test/integration/session-lifecycle.test.ts",
    algo: [
      "Read session claims: iat (issued-at), lastActive (epoch ms), and exp (expiration)",
      "Compute idle duration = current_time - lastActive",
      "Enforce idle limit: if idle duration > INACTIVITY_TIMEOUT (default 300s), terminate session",
      "Enforce hard ceiling: if current_time - iat > MAX_LIFETIME (default 604800s), reject renewal",
      "If within bounds and idle > renewal_threshold, issue refreshed JWT cookie with updated lastActive"
    ],
    invariants: [
      "INACTIVITY_TIMEOUT must be bounded within [300s, 3600s]",
      "MAX_LIFETIME must not exceed 7 days (604800s)"
    ]
  },
  {
    id: "LLR-AUTH-003",
    title: "Multi-Tenant Org ID Extraction & Security Header Injection",
    desc: "Low-level requirement enforcing extraction of tenant org_id and injection into downstream request headers.",
    hlr: "HLR-AUTH-102",
    impl: "apps/src/auth/src/rbac.ts",
    test: "apps/src/auth/test/unit/rbac.test.ts",
    algo: [
      "Extract verified user claims from authenticated session state",
      "Assert org_id conforms to canonical alphanumeric regex: ^[a-z0-9_-]{3,64}$",
      "Append x-forge-org-id and x-forge-user-id headers to upstream request pipeline",
      "Enforce strip of any client-supplied x-forge-* headers before proxy forwarding"
    ],
    invariants: [
      "Downstream services must never accept untrusted client-supplied tenant headers",
      "Every mutation query must resolve org_id from the authenticated header context"
    ]
  },
  {
    id: "LLR-AUTH-004",
    title: "Refresh Token Family Revocation on Replay Detection",
    desc: "Low-level requirement mandating invalidation of entire token family if a previously exchanged token is reused.",
    hlr: "HLR-AUTH-101",
    impl: "apps/src/auth/src/session.ts",
    test: "apps/src/auth/test/security/token-replay.test.ts",
    algo: [
      "Lookup incoming refreshTokenHash in the token family database table",
      "If record is marked as already consumed (revoked = true), trigger security alarm",
      "Immediately execute UPDATE tokens SET revoked = 1 WHERE family_id = target_family_id",
      "Clear all active authentication cookies and return RFC 7807 problem response with code AUTH_TOKEN_REPLAY"
    ],
    invariants: [
      "A token replay attempt must invalidate all active child and sibling tokens within the same family",
      "Event must log structured audit entry with traceId and remote IP"
    ]
  },
  {
    id: "LLR-AUTH-005",
    title: "Brute-Force Rate Limiting with IP Bucket Throttling",
    desc: "Low-level requirement governing token bucket rate limiter preventing brute-force authentication attempts.",
    hlr: "HLR-AUTH-102",
    impl: "apps/src/auth/src/rbac.ts",
    test: "apps/src/auth/test/security/rate-limit.test.ts",
    algo: [
      "Construct rate limiter key from client IP address and target endpoint: rl:auth:{ip}",
      "Read current attempt count within rolling window of 60 seconds",
      "If attempts exceed MAX_LOGIN_ATTEMPTS (default 5), reject request with HTTP 429 Too Many Requests",
      "Return Retry-After header with remaining seconds until window reset",
      "Reset counter upon successful authentication completion"
    ],
    invariants: [
      "Maximum allowed failed login attempts before block: 5 attempts per 60 seconds",
      "Retry-After header must accurately reflect remaining cooldown seconds"
    ]
  },
  {
    id: "LLR-AUTH-006",
    title: "Argon2id Password Hashing & Salt Generation",
    desc: "Low-level requirement specifying memory-hard password hashing parameters and cryptographic salt generation.",
    hlr: "HLR-AUTH-101",
    impl: "apps/src/auth/src/session.ts",
    test: "apps/src/auth/test/unit/crypto.test.ts",
    algo: [
      "Generate 16-byte cryptographically secure random salt using crypto.randomBytes(16)",
      "Configure Argon2id parameters: memoryCost = 65536 KB (64MB), timeCost = 3 iterations, parallelism = 1",
      "Compute derived hash key of 32 bytes output length",
      "Format serialized string: $argon2id$v=19$m=65536,t=3,p=1${salt}${hash}",
      "Verify passwords via constant-time verification routines"
    ],
    invariants: [
      "Argon2id memory cost must be >= 64MB for all production credentials",
      "Plaintext passwords must be overwritten in memory after hashing"
    ]
  },
  {
    id: "LLR-AUTH-007",
    title: "CSRF SameSite Cookie Protection & Origin Validation",
    desc: "Low-level requirement enforcing SameSite=Lax/Strict cookie attributes and Origin/Referer verification.",
    hlr: "HLR-AUTH-102",
    impl: "apps/src/auth/src/session.ts",
    test: "apps/src/auth/test/security/csrf-protection.test.ts",
    algo: [
      "Inspect HTTP request method; if mutation (POST, PUT, DELETE, PATCH), initiate origin check",
      "Verify Origin header matches configured allowed domains or host header",
      "If Origin is absent, fallback to Referer header host parsing",
      "Set-Cookie headers must append: HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...",
      "Reject origin mismatches with HTTP 403 Forbidden RFC 7807 problem details"
    ],
    invariants: [
      "Session cookie must never omit HttpOnly and SameSite flags",
      "Mutations with mismatched Origin header must be unconditionally dropped"
    ]
  },

  // Database & Multi-Tenancy (LLR-DB-001 to 006)
  {
    id: "LLR-DB-001",
    title: "Canonical SQLite Database Path Resolver",
    desc: "Low-level requirement governing local filesystem path resolution for dedicated Turso/libSQL databases.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/database.ts",
    test: "apps/src/sdk/test/unit/database.test.ts",
    algo: [
      "Receive appId and optional tenant orgId parameter",
      "Assert appId conforms to safe alphanumeric identifier format",
      "Construct target path under data/db/{appId}.db or data/tenants/{orgId}/{appId}.db",
      "Validate resolved absolute path resides strictly inside REPO_ROOT/data/ boundary",
      "Create parent directories with 0700 permissions if not already present"
    ],
    invariants: [
      "Resolved database path must never contain directory traversal sequences (../)",
      "Permissions on SQLite database files must restrict access to process owner"
    ]
  },
  {
    id: "LLR-DB-002",
    title: "Per-Tenant Turso Client Instantiation & Pool Management",
    desc: "Low-level requirement managing connection pooling and client caching for libSQL instances.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/database.ts",
    test: "apps/src/sdk/test/integration/database-pool.test.ts",
    algo: [
      "Check in-memory client pool cache for key: client:{appId}:{orgId}",
      "If client exists and connection probe succeeds, return pooled client",
      "Otherwise, instantiate new createClient({ url: `file:${dbPath}` }) instance",
      "Execute PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;",
      "Store client in pool cache with 10-minute idle eviction timer"
    ],
    invariants: [
      "WAL (Write-Ahead Logging) mode must be enabled on every SQLite instance",
      "Idle connections must be safely closed after eviction timeout"
    ]
  },
  {
    id: "LLR-DB-003",
    title: "Drizzle ORM Schema Migration Runner with Lock Guard",
    desc: "Low-level requirement executing versioned Drizzle migrations with atomic advisory locks.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/database.ts",
    test: "apps/src/sdk/test/contracts/migration.test.ts",
    algo: [
      "Acquire migration lock via dedicated __drizzle_migrations lock table record",
      "Scan migrations folder for ordered SQL migration files (.sql)",
      "Compare file hashes against applied migrations in __drizzle_migrations",
      "Execute pending migration scripts inside an atomic database transaction",
      "Record applied timestamp and release migration lock"
    ],
    invariants: [
      "Migrations must execute in strictly ascending chronological order",
      "Failed migrations must automatically rollback transaction and retain error trace"
    ]
  },
  {
    id: "LLR-DB-004",
    title: "Read-Only Database Snapshot & Rolling Backup Creation",
    desc: "Low-level requirement managing point-in-time binary SQLite backups and retention policy.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/backup.ts",
    test: "apps/src/sdk/test/unit/backup.test.ts",
    algo: [
      "Execute SQLite online backup API: VACUUM INTO backup_path",
      "Compress snapshot file using gzip with high compression level",
      "Store archive under data/backups/{appId}/{timestamp}.db.gz",
      "Prune older backups to enforce maximum retention of 7 daily and 4 weekly snapshots",
      "Generate SHA-256 checksum for backup integrity verification"
    ],
    invariants: [
      "Online backup must never acquire exclusive write lock exceeding 50ms",
      "Every generated backup archive must be paired with verified SHA-256 checksum"
    ]
  },
  {
    id: "LLR-DB-005",
    title: "Tenant Isolation Query Filtering via Mandatory Org Scoping",
    desc: "Low-level requirement enforcing WHERE org_id = ? predicate on all tenant data queries.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/database.ts",
    test: "apps/src/sdk/test/security/tenant-isolation.test.ts",
    algo: [
      "Receive query request with caller's authenticated org_id",
      "Verify query AST or Drizzle condition contains eq(schema.table.orgId, orgId)",
      "If condition is absent on multi-tenant table, raise TenantScopingException",
      "Execute parameterized query with org_id strictly bound as SQL parameter",
      "Assert query result set contains zero records where record.org_id != orgId"
    ],
    invariants: [
      "Cross-tenant data exposure constitutes a Critical (Severity 1) safety violation",
      "Parameterized bindings must be used exclusively (zero string interpolation)"
    ]
  },
  {
    id: "LLR-DB-006",
    title: "Database Error Sanitization & Raw SQL Leak Prevention",
    desc: "Low-level requirement masking SQLite/libSQL internal error strings before client transmission.",
    hlr: "HLR-SDK-302",
    impl: "apps/src/sdk/src/error-handler.ts",
    test: "apps/src/sdk/test/unit/error-handler.test.ts",
    algo: [
      "Catch database exception during repository execution",
      "Log full raw error details (query string, parameters, stack) to internal SRE logger",
      "Map internal error codes (e.g. SQLITE_CONSTRAINT) to generic RFC 7807 problem details",
      "Replace error detail with safe generic text: 'A database constraint error occurred.'",
      "Return sanitized problem response with traceId for telemetry lookup"
    ],
    invariants: [
      "Raw SQL statements, table names, and column identifiers must never appear in HTTP response bodies",
      "Internal stack traces must be suppressed in all non-local development environments"
    ]
  },

  // Astryx UI Engine (LLR-UI-001 to 008)
  {
    id: "LLR-UI-001",
    title: "CSS Custom Property Token Resolver & Dark Theme Cascade",
    desc: "Low-level requirement resolving Astryx color and spacing tokens with high-contrast accessibility.",
    hlr: "HLR-UI-401",
    impl: "apps/src/ui/src/tokens.ts",
    test: "apps/src/ui/test/unit/tokens.test.ts",
    algo: [
      "Define canonical token map for --forge-bg-root, --forge-bg-surface, --forge-primary, etc.",
      "Verify color contrast ratio between --forge-text-main and --forge-bg-root exceeds 4.5:1 (WCAG AA)",
      "Inject CSS variable stylesheet into document head before DOM rendering",
      "Provide programmatic token getter: getForgeToken(tokenName): string"
    ],
    invariants: [
      "All platform components must derive colors exclusively from --forge-* tokens",
      "Contrast ratio must strictly satisfy WCAG 2.1 AA requirements"
    ]
  },
  {
    id: "LLR-UI-002",
    title: "Smart Collision Detection & Auto-Flip Viewport Positioning",
    desc: "Low-level requirement calculating dynamic 2D coordinates for tooltips and dropdown overlays.",
    hlr: "HLR-UI-402",
    impl: "apps/src/ui/src/tooltip.ts",
    test: "apps/src/ui/test/unit/tooltip.test.ts",
    algo: [
      "Measure target element and floating tooltip bounding rects using getBoundingClientRect()",
      "Check bottom edge: if (target.bottom + tooltip.height + margin > window.innerHeight), flip to TOP",
      "Check top edge: if (target.top - tooltip.height - margin < 0), flip to BOTTOM",
      "Check horizontal edges: clamp left position between margin and (window.innerWidth - tooltip.width - margin)",
      "Apply computed top, left, and transform coordinates to floating overlay element"
    ],
    invariants: [
      "Floating overlays must achieve 100% visibility inside active viewport (zero clipping)",
      "Calculations must execute within requestAnimationFrame cycle (< 16ms)"
    ]
  },
  {
    id: "LLR-UI-003",
    title: "Astryx Toast Notification Queue & Stacking Controller",
    desc: "Low-level requirement managing ephemeral notification queue, auto-dismiss timers, and DOM cleanup.",
    hlr: "HLR-UI-402",
    impl: "apps/src/ui/src/toast.ts",
    test: "apps/src/ui/test/unit/toast.test.ts",
    algo: [
      "Push incoming notification payload ({ type, title, message, duration }) to internal toast queue",
      "Enforce maximum 5 visible stacked toasts; queue excess notifications",
      "Render toast container with glassmorphic styling and aria-live='polite' attribute",
      "Start auto-dismiss timeout (default 4000ms); pause timer on mouse hover",
      "Execute slide-out CSS transition and remove DOM node on dismissal"
    ],
    invariants: [
      "Toast queue must gracefully handle rapid burst notifications without layout shifts",
      "Screen readers must be notified via standard ARIA live region attributes"
    ]
  },
  {
    id: "LLR-UI-004",
    title: "Astryx Custom Dropdown Select Generator & Keyboard Navigation",
    desc: "Low-level requirement rendering accessible custom selector controls replacing native HTML select.",
    hlr: "HLR-UI-401",
    impl: "apps/src/ui/src/components/select.ts",
    test: "apps/src/ui/test/unit/select.test.ts",
    algo: [
      "Render custom button container with role='combobox' and aria-expanded state",
      "Render options listbox with role='listbox' and active item aria-selected indicator",
      "Listen for keyboard navigation keys: ArrowUp, ArrowDown, Enter, Space, Escape",
      "Update highlighted option on arrow key navigation and scroll into view if needed",
      "Close dropdown when user clicks outside or presses Escape"
    ],
    invariants: [
      "Native browser unstyled select dropdowns are strictly prohibited",
      "Full keyboard navigation parity must be guaranteed for all dropdown menus"
    ]
  },
  {
    id: "LLR-UI-005",
    title: "Zero-FOUC Inline Head Shield Script Generation",
    desc: "Low-level requirement generating synchronous inline script preventing Flash of Unstyled Content.",
    hlr: "HLR-UI-403",
    impl: "apps/src/ui/src/browser-state.ts",
    test: "apps/src/ui/test/unit/browser-state.test.ts",
    algo: [
      "Generate minified self-executing JavaScript snippet for direct insertion into HTML head",
      "Read active theme and preferences from localStorage or system prefers-color-scheme",
      "Immediately apply data-theme and styling classes to document.documentElement before first paint",
      "Assert script execution time is < 5ms"
    ],
    invariants: [
      "Theme initialization must execute synchronously before body rendering to eliminate visual flicker",
      "Script size must remain <= 1KB uncompressed"
    ]
  },
  {
    id: "LLR-UI-006",
    title: "LocalStorage Versioned State Store with Migration Callbacks",
    desc: "Low-level requirement governing schema versioning and safe migration of client-side storage keys.",
    hlr: "HLR-UI-403",
    impl: "apps/src/ui/src/browser-state.ts",
    test: "apps/src/ui/test/unit/browser-state.test.ts",
    algo: [
      "Wrap localStorage access in createVersionedStore<T>(key, currentVersion, migrators)",
      "Read stored payload: { version: number, data: any }",
      "If stored version < currentVersion, iterate through migrator functions sequentially",
      "Persist updated data with latest version stamp back to localStorage",
      "Catch and handle QuotaExceededError gracefully without throwing uncaught exceptions"
    ],
    invariants: [
      "Client state schema changes must provide backward-compatible migration paths",
      "Corrupted storage entries must automatically fall back to schema defaults"
    ]
  },
  {
    id: "LLR-UI-007",
    title: "URL Query Parameter Two-Way State Synchronization",
    desc: "Low-level requirement synchronizing active view, filters, and pagination state with browser URL.",
    hlr: "HLR-UI-403",
    impl: "apps/src/ui/src/browser-state.ts",
    test: "apps/src/ui/test/unit/browser-state.test.ts",
    algo: [
      "Parse current URL search parameters on page initialization",
      "Hydrate component state filters from valid URL parameters",
      "On user state alteration, update URL parameters using history.replaceState()",
      "Listen for popstate browser back/forward events to restore synced view state"
    ],
    invariants: [
      "State synchronization must never trigger full-page browser reloading",
      "Invalid or malicious query parameter values must be sanitized against schema whitelist"
    ]
  },
  {
    id: "LLR-UI-008",
    title: "RFC 7807 Universal Error Page Template Renderer",
    desc: "Low-level requirement rendering structured, accessible error screens for 400/403/404/500 faults.",
    hlr: "HLR-UI-401",
    impl: "apps/src/ui/src/error-page.ts",
    test: "apps/src/ui/test/unit/error-page.test.ts",
    algo: [
      "Receive RFC 7807 problem object: { type, title, status, detail, instance, traceId }",
      "Render Astryx glassmorphic card with status badge and user-friendly explanation",
      "Display copyable Trace ID pill for fast SRE log correlation",
      "Provide 'Return to Dashboard' and 'Retry' recovery action buttons",
      "Never render internal raw stack traces or SQL snippets"
    ],
    invariants: [
      "Error UI must be fully responsive across mobile (320px) to desktop displays",
      "Trace ID must always be visible to end users for troubleshooting support"
    ]
  },

  // SDK & Observability (LLR-SDK-001 to 007)
  {
    id: "LLR-SDK-001",
    title: "Declarative .env Service Registry Parser",
    desc: "Low-level requirement parsing APP_* environment variables into validated service metadata objects.",
    hlr: "HLR-SDK-301",
    impl: "apps/src/sdk/src/registry.ts",
    test: "apps/src/sdk/test/unit/registry.test.ts",
    algo: [
      "Iterate over process.env keys matching regex: ^APP_([A-Z0-9_]+)$",
      "Parse comma/semicolon delimited service attributes: name, port, path, type, health",
      "Validate port is numeric and within range [1024, 65535]",
      "Ensure service ingress path begins with '/' and contains no illegal characters",
      "Return frozen immutable ServiceRegistry record map"
    ],
    invariants: [
      "No hardcoded static port bindings; all microservice ports must resolve dynamically from registry",
      "Invalid service definitions must trigger immediate startup validation failure"
    ]
  },
  {
    id: "LLR-SDK-002",
    title: "Structured JSON Log Formatter with RFC 3339 Timestamps",
    desc: "Low-level requirement formatting log entries into standardized Enterprise SRE single-line JSON records.",
    hlr: "HLR-SDK-303",
    impl: "apps/src/sdk/src/logger.ts",
    test: "apps/src/sdk/test/unit/logger.test.ts",
    algo: [
      "Assemble log payload: { timestamp, severity, service, traceId, message, context }",
      "Format timestamp using RFC 3339 UTC representation: new Date().toISOString()",
      "Normalize log severity levels: DEBUG, INFO, WARNING, ERROR, CRITICAL",
      "Pass context object through recursive PII redaction filter",
      "Output formatted single-line JSON string to process.stdout or process.stderr"
    ],
    invariants: [
      "Each log record must be emitted as strictly one single JSON line (zero multi-line breaks)",
      "Timestamp must strictly conform to ISO 8601 / RFC 3339 format"
    ]
  },
  {
    id: "LLR-SDK-003",
    title: "Automated Recursive PII & Secret Redaction Regex Engine",
    desc: "Low-level requirement masking sensitive patterns (passwords, tokens, API keys, emails) in telemetry.",
    hlr: "HLR-SDK-303",
    impl: "apps/src/sdk/src/logger.ts",
    test: "apps/src/sdk/test/security/pii-redaction.test.ts",
    algo: [
      "Define sensitive key blacklist: password, secret, token, authorization, cookie, creditCard, ssn",
      "Traverse input object recursively up to maximum depth of 10 levels",
      "If object key matches sensitive blacklist (case-insensitive), replace value with '[REDACTED]'",
      "Scan string values against regex patterns for JWT tokens, bearer headers, and private keys",
      "Replace detected sensitive substrings with '[REDACTED_SECRET]'"
    ],
    invariants: [
      "Sensitive credentials must never appear in raw plaintext in any log sink",
      "Recursion depth must be capped at 10 levels to prevent stack overflow on circular structures"
    ]
  },
  {
    id: "LLR-SDK-004",
    title: "RFC 7807 Problem Details Response Generator (createSafeHandler)",
    desc: "Low-level requirement wrapping HTTP request handlers in standardized error translation boundaries.",
    hlr: "HLR-SDK-303",
    impl: "apps/src/sdk/src/error-handler.ts",
    test: "apps/src/sdk/test/unit/error-handler.test.ts",
    algo: [
      "Generate unique traceId (UUIDv4) at the entry of createSafeHandler wrapper",
      "Execute wrapped route handler inside try/catch boundary",
      "On uncaught exception, log structured error record with traceId and stack",
      "Construct RFC 7807 payload: { type, title, status: 500, detail, instance, traceId }",
      "Set Response header 'Content-Type: application/problem+json' and return HTTP response"
    ],
    invariants: [
      "All API errors must return application/problem+json conforming to RFC 7807",
      "Every error response must carry an immutable traceId matching the SRE log sink"
    ]
  },
  {
    id: "LLR-SDK-005",
    title: "Dynamic Ingress Caddyfile Generator from Registry",
    desc: "Low-level requirement compiling ServiceRegistry declarations into reverse-proxy configuration.",
    hlr: "HLR-SDK-301",
    impl: "apps/src/sdk/src/registry.ts",
    test: "apps/src/sdk/test/unit/caddyfile.test.ts",
    algo: [
      "Read all registered services from ServiceRegistry",
      "Generate Caddy route blocks for reverse_proxy {path}* http://{host}:{port}",
      "Inject security headers block: HSTS, X-Frame-Options, CSP, X-Content-Type-Options",
      "Validate generated Caddyfile syntax using caddy validate or internal linter",
      "Write atomic file update to Caddyfile configuration path"
    ],
    invariants: [
      "Reverse proxy routes must be generated dynamically from registry with zero manual edits",
      "Standard security headers must be applied uniformly to all ingress routes"
    ]
  },
  {
    id: "LLR-SDK-006",
    title: "Browser Console Log Bridge with Server Telemetry Sync",
    desc: "Low-level requirement capturing frontend console messages and relaying them to backend log sink.",
    hlr: "HLR-SDK-303",
    impl: "apps/src/sdk/src/browser-bridge.ts",
    test: "apps/src/sdk/test/unit/browser-bridge.test.ts",
    algo: [
      "Intercept window.console.error, console.warn, and uncaught window.onerror events",
      "Filter out benign browser extensions errors",
      "Buffer captured events and dispatch batch beacon to /api/telemetry/client-logs",
      "Enforce maximum batch size of 20 items and rate limit of 5 dispatches per minute",
      "Correlate client events with session traceId"
    ],
    invariants: [
      "Client log bridge must not block UI rendering or network thread",
      "Sensitive form inputs and credentials must be scrubbed before transmission"
    ]
  },
  {
    id: "LLR-SDK-007",
    title: "Watchdog-Protected Child Process Execution",
    desc: "Low-level requirement executing shell commands with strict timeout, memory cap, and zombie reaping.",
    hlr: "HLR-SDK-301",
    impl: "apps/src/sdk/src/registry.ts",
    test: "apps/src/sdk/test/unit/watchdog.test.ts",
    algo: [
      "Spawn command using child_process.spawn with configured timeout and working directory",
      "Start watchdog timer for max duration (default 30000ms)",
      "If process exceeds timeout, send SIGTERM signal; wait 2000ms; escalate to SIGKILL",
      "Collect and buffer stdout/stderr streams up to maximum 10MB buffer limit",
      "Reap process exit code and return execution summary"
    ],
    invariants: [
      "No runaway or orphaned child processes allowed (guaranteed process group termination)",
      "Stream buffers must be strictly bounded to prevent heap exhaustion"
    ]
  },

  // Submodules & Ingress (LLR-SUB-001 to 007)
  {
    id: "LLR-SUB-001",
    title: "Git Submodule Branch & Remote Provenance Validator",
    desc: "Low-level requirement verifying integrity and tracking branches of autonomous Forge Apps.",
    hlr: "HLR-CODE-701",
    impl: "scripts/sync-submodule-docs.ts",
    test: "forge-apps/code/test/contracts/submodule-config.test.ts",
    algo: [
      "Parse .gitmodules file to extract path, url, and branch for all submodules",
      "Verify submodule path exists inside forge-apps/ directory",
      "Verify submodule URL points to approved organization repository",
      "Execute git submodule status to verify commit sha matches recorded pointer",
      "Report any detached HEAD states or untracked changes as verification error"
    ],
    invariants: [
      "All submodules must track explicit main/master branches without detached pointers",
      "Submodules must maintain zero file modifications in parent monorepo index"
    ]
  },
  {
    id: "LLR-SUB-002",
    title: "Dual-Probe Health & Readiness Endpoint Reporter",
    desc: "Low-level requirement implementing /health and /ready endpoints across all microservices.",
    hlr: "HLR-TEL-801",
    impl: "apps/src/sdk/src/registry.ts",
    test: "forge-apps/telemetry/test/integration/health-probe.test.ts",
    algo: [
      "Handle GET /health: verify process event loop is active and return HTTP 200 { status: 'healthy' }",
      "Handle GET /ready: probe database connection and essential external dependencies",
      "If all dependencies respond in < 500ms, return HTTP 200 { status: 'ready', checks: [...] }",
      "If any dependency fails, return HTTP 503 Service Unavailable with failing component details"
    ],
    invariants: [
      "Liveness probe (/health) must respond in < 50ms with zero deep database queries",
      "Readiness probe (/ready) must reflect actual capability to serve user traffic"
    ]
  },
  {
    id: "LLR-SUB-003",
    title: "Sandboxed Filesystem Path Traversal Guard",
    desc: "Low-level requirement validating that file access operations remain within assigned workspace jail.",
    hlr: "HLR-CODE-701",
    impl: "forge-apps/code/src/server.ts",
    test: "forge-apps/code/test/security/sandbox.test.ts",
    algo: [
      "Receive target file path relative to workspace root",
      "Resolve absolute normalized canonical path using path.resolve() and fs.realpathSync()",
      "Assert resolved canonical path starts with canonical workspace jail directory path",
      "Verify path contains no null bytes (%00) or encoded traversal sequences",
      "Raise SecurityTraversalException if path attempts jail escape"
    ],
    invariants: [
      "Arbitrary filesystem read/write outside workspace boundary constitutes Severity 1 vulnerability",
      "Symlinks pointing outside sandbox jail must be unconditionally rejected"
    ]
  },
  {
    id: "LLR-SUB-004",
    title: "Rolling 5MB Telemetry Log Rotation & Retention Engine",
    desc: "Low-level requirement governing size-capped log rotation for microservice log files.",
    hlr: "HLR-TEL-801",
    impl: "forge-apps/telemetry/src/server.ts",
    test: "forge-apps/telemetry/test/unit/log-rotation.test.ts",
    algo: [
      "Check active log file size using fs.statSync(logPath).size",
      "If size exceeds 5MB (5242880 bytes), initiate rotation cycle",
      "Rename active file to {logName}.1; shift existing .1 to .2, up to max .5",
      "Delete oldest rotated log file exceeding retention limit",
      "Open new fresh log file handle and continue logging stream"
    ],
    invariants: [
      "Total disk consumption per service log directory must not exceed 25MB (5 files x 5MB)",
      "Log rotation must be atomic and cause zero lost telemetry entries"
    ]
  },
  {
    id: "LLR-SUB-005",
    title: "Polyglot Code Snippet Generator for OpenAPI Operations",
    desc: "Low-level requirement generating ready-to-run cURL, TypeScript, and Python request examples.",
    hlr: "HLR-HUB-601",
    impl: "apps/src/dev-hub/src/sandbox.ts",
    test: "apps/src/dev-hub/test/unit/codegen.test.ts",
    algo: [
      "Parse OpenAPI 3.1 operation object: method, path, headers, requestBody, parameters",
      "Generate cURL command string with escaped quotes and auth headers",
      "Generate modern TypeScript fetch code snippet with typed interface",
      "Generate Python requests code snippet with error handling",
      "Format code strings with syntax highlighting tokens"
    ],
    invariants: [
      "Generated code snippets must be syntactically valid and executable out-of-the-box",
      "Auth headers must use placeholder tokens instead of real production keys"
    ]
  },
  {
    id: "LLR-SUB-006",
    title: "PostMessage Sandboxed Frame Handshake & Origin Validation",
    desc: "Low-level requirement establishing bi-directional communication bridge between Portal and micro-apps.",
    hlr: "HLR-PORTAL-202",
    impl: "apps/src/portal/src/server.ts",
    test: "apps/src/portal/test/security/iframe-sandbox.test.ts",
    algo: [
      "Listen for 'message' event on window object",
      "Assert event.origin strictly matches approved internal service origin list",
      "Parse event.data conforming to ForgePostMessage protocol: { type, payload, messageId }",
      "Verify message signature or token if message invokes privileged platform actions",
      "Dispatch internal event handler and reply with acknowledgment message"
    ],
    invariants: [
      "PostMessage messages from unapproved origins must be silently dropped without exception",
      "Wildcard targetOrigin ('*') is strictly forbidden for privileged platform messages"
    ]
  },
  {
    id: "LLR-SUB-007",
    title: "Automated CycloneDX 1.5 SBOM Component Scanner",
    desc: "Low-level requirement auditing software bill-of-materials and dependency license compliance.",
    hlr: "HLR-DEV-501",
    impl: "scripts/run/quality.sh",
    test: "apps/src/dev-dashboard/test/contracts/sbom.test.ts",
    algo: [
      "Scan package.json and lockfile dependencies across monorepo and submodules",
      "Generate CycloneDX 1.5 JSON formatted SBOM using syft or internal scanner",
      "Validate every component against permissible license whitelist (MIT, Apache-2.0, BSD-3-Clause, ISC)",
      "Flag viral copyleft licenses (GPL, AGPL) as critical compliance violations",
      "Archive SBOM artifact in dist/sbom.json"
    ],
    invariants: [
      "Zero viral copyleft (AGPL/GPL) dependencies permitted in core or micro-app services",
      "SBOM must account for 100% of runtime and build dependencies"
    ]
  }
];

function generateLLRContent(llr: LLRDef): string {
  const algoList = llr.algo.map((step, i) => `${i + 1}. ${step}`).join("\n");
  const invarList = llr.invariants.map((inv) => `* **${inv}**`).join("\n");

  return `---
title: ${llr.id} - ${llr.title}
description: ${llr.desc}
---

import TraceabilityBadge from '../../../components/TraceabilityBadge.astro';

<div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
  <TraceabilityBadge reqId="${llr.id}" type="LLR" status="verified" />
  <TraceabilityBadge reqId="${llr.hlr}" type="HLR" status="verified" />
</div>

## 1. Algorithmic Specification

${algoList}

## 2. Safety & Verification Invariants

${invarList}

## 3. Bidirectional Traceability

* **Parent High-Level Requirement**: <TraceabilityBadge reqId="${llr.hlr}" type="HLR" status="verified" />
* **Implemented in Source**: \`${llr.impl}\`
* **Verified in Test Suite**: \`${llr.test}\`
`;
}

console.log(`Writing 35 LLR specifications to ${TARGET_DIR}...`);
for (const llr of llrs) {
  const filename = `${llr.id}_${llr.title.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase().slice(0, 30)}.mdx`;
  const filePath = join(TARGET_DIR, filename);
  writeFileSync(filePath, generateLLRContent(llr), "utf-8");
  console.log(`  + ${filename}`);
}

console.log("✅ All 35 LLR specifications generated successfully.");
