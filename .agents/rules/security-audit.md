# In-Chat AI Security & Pentest Auditor (Strix Standard)

> 🛡️ **Zero-API Key / Pair-Programming Security Protocol**
> Derived and adapted from [usestrix/strix](https://github.com/usestrix/strix) (Apache-2.0 License).
> Enforces proactive security verification directly within coding agent chat sessions.

---

## ⚡ 1. The Two Streamlined In-Chat Modes

Every AI agent interacting with this repository MUST recognize and support these two execution modes:

### Mode 1: Code Check (White-Box Review)
- **Chat Triggers**: `"audit code"`, `"/audit-code"`, `"check code security"`, `"strix code check"`, or pre-commit verification.
- **Scope**: Source files, Next.js route handlers (`apps/src/portal/src/app/api/*`), middleware, database queries, and server actions.
- **Mandatory Invariants**:
  1. **Multi-Tenant Isolation**: Every database query must scope by `org_id` / `user_id`. Cross-tenant leaks are critical failures.
  2. **Anti-SQLi**: Type-safe Drizzle expressions only. String-interpolated SQL is strictly prohibited.
  3. **Cookie Hygiene**: `HttpOnly: true`, `Secure: true`, `SameSite: 'strict'` on all auth cookies.
  4. **RFC 7807 Error Boundaries**: Use `createSafeHandler` from `@forge/sdk`. Zero stack trace leaks to client responses.
  5. **Zero Secret Leaks**: No tokens, private keys, or passwords committed to source code.

### Mode 2: Live Setup Test (Dynamic Probing)
- **Chat Triggers**: `"test live dev"`, `"test live prod <url>"`, `"/audit-live"`, or `"check running endpoints"`.
- **Scope**: Running local servers (`http://localhost:80/443`) or remote staging/production domains.
- **Mandatory Invariants (Non-Destructive)**:
  1. **Security Headers**: Query `rtk curl -sI <URL>`. Verify HSTS (`Strict-Transport-Security`), `X-Frame-Options: DENY|SAMEORIGIN`, `X-Content-Type-Options: nosniff`.
  2. **CORS Security**: Verify untrusted origin requests are not reflected with `Access-Control-Allow-Credentials: true`.
  3. **Auth Redirections**: Protected endpoints must return `401 Unauthorized`, `403 Forbidden`, or `302/307 Redirect` to `/login`.
  4. **Error Schemas**: Triggering a 404/500 must return clean JSON problem schemas without leaking stack traces or internal environment details.

---

## 🛡️ 2. Pre-Commit Verification Gate Integration

Before staging or committing any code changes:
1. The AI Agent must contextually review modified routes, authentication mechanisms, and database queries against the **Mode 1: Code Check** checklist.
2. Ensure Tier 2 Check 8 (`In-Chat AI Security & Pentest Audit (Strix)`) in `scripts/verify-gate.ts` remains verified.
3. If findings are discovered, present the structured report and provide clean, defensive remediations adhering to SG Forge architectural standards before staging.
