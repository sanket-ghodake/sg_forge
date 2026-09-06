---
description: In-Chat AI Security & Penetration Testing Audit (Strix Standard)
---

# In-Chat AI Security & Penetration Testing Audit

Use this workflow to conduct rapid, zero-API-key security assessments directly within your chat session.

---

## 🎯 Choose Your Audit Mode

### Mode 1: Code Check (White-Box Review)
Audits source code for multi-tenant isolation, SQL injection prevention, cookie security, secret hygiene, and RFC 7807 error boundaries.

**How to Run**:
Simply ask the AI agent in chat:
```text
/audit-code
```
or
```text
audit code apps/src/portal/src/app/api/
```
or
```text
strix code check
```

**What the Agent Audits**:
1. Multi-tenant `org_id` / `user_id` scoping in every database query.
2. Safe Drizzle ORM queries (zero raw SQL interpolation).
3. Cookie attributes: `HttpOnly: true`, `Secure: true`, `SameSite: 'strict'`.
4. Zero credentials, tokens, or private keys committed to source code.
5. Structured RFC 7807 problem responses without leaking raw stack traces.

---

### Mode 2: Live Setup Test (Dynamic Probing)
Probes active local development or production servers using non-destructive, read-only `rtk curl -sI` checks.

**How to Run**:
Make sure your server is running (e.g. `rtk ./run.sh start` on Port 80/443), then ask the AI agent:
```text
/audit-live
```
or
```text
test live dev
```
or for production:
```text
test live prod https://your-domain.com
```

**What the Agent Checks**:
1. Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options).
2. Cookie security flags on authentication responses.
3. CORS configuration (rejecting unauthorized origins).
4. Protected route gates (401/403 or redirects to `/login`).
5. RFC 7807 problem responses on 404/500 without leaking stack traces.
