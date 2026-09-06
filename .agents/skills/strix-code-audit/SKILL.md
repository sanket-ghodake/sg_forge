---
name: strix-code-audit
description: In-chat white-box source code security review agent (Mode 1). Audits Next.js API routes, middleware, Turso DB multi-tenant org_id scoping, JWT authentication cookies, secret leaks, and RFC 7807 error boundaries. Powered by usestrix/strix under Apache-2.0. Use when user asks to "audit code", "check code security", "run strix code check", or "/audit-code".
license: Apache-2.0
metadata:
  author: Strix Security Team & SG Forge
  upstream: https://github.com/usestrix/strix
---

# Strix Code Audit Agent (Mode 1: White-Box Source Code Review)

> 🛡️ **Zero-API Key / In-Chat Security Assessment**
> Derived and adapted from [usestrix/strix](https://github.com/usestrix/strix) (Apache-2.0 License).
> Operates directly inside AI chat sessions using native AST search, ripgrep, and code reasoning.

---

## 🎯 When to Activate
Activate this skill when:
- The user asks: `"audit code"`, `"/audit-code"`, `"check code security"`, `"run strix code check"`, or `"find vulnerabilities in code"`.
- The user is preparing to stage or commit code (Pre-Commit Check 21).
- Modifying authentication handlers, middleware, database schemas, or API endpoints.

---

## 🔍 The 6-Point White-Box Security Checklist

When auditing source files across `apps/src/*` or `forge-apps/*`, methodically evaluate:

### 1. Multi-Tenant Isolation & SQL Parameterization (ASVS V3, V5)
- **Invariant**: Every single database query or mutation MUST explicitly filter by `org_id` / `tenant_id`.
- **Drizzle Check**: Verify queries use type-safe expressions (`eq(table.orgId, session.orgId)`).
- **Anti-SQLi**: Flag any string interpolation in SQL (e.g. `` db.execute(`...${input}...`) ``). Raw unparameterized queries are strictly prohibited.

### 2. Authentication, Session & Cookie Hygiene (ASVS V2, V3)
- **Cookie Flags**: Any cookie storing session identifiers or JWTs must enforce:
  - `HttpOnly: true` (prevents XSS cookie theft)
  - `Secure: true` (HTTPS only)
  - `SameSite: 'strict'` or `'lax'` (CSRF prevention)
  - `Path: '/'` with appropriate maxAge
- **JWT Verification**: Ensure tokens are verified with asymmetric algorithms or secure secrets from environment; flag any unverified decoding (`jwt.decode()` without verify).

### 3. Centralized Logging & RFC 7807 Boundaries (Enterprise SRE Standard)
- **Stack Trace Redaction**: Confirm API route handlers use `createSafeHandler` and `createLogger` from `@forge/sdk`.
- **Secret Redaction**: Ensure passwords, tokens, API keys, and authorization headers are never passed to raw console or unredacted log fields.
- **Problem JSON**: Errors returned to clients must conform to RFC 7807 (`type`, `title`, `status`, `detail`, `traceId`) without internal exception dumps.

### 4. Zero Hardcoded Secrets & Credentials (Gitleaks Standard)
- Inspect the file and git diff for accidental hardcoded API tokens, private keys, database passwords, or JWT secrets.
- All secrets must resolve via `process.env.*` with fallback validation in `@forge/sdk`.

### 5. Cross-Site Scripting (XSS) & Input Sanitization (ASVS V5)
- **React Escaping**: Prohibit `dangerouslySetInnerHTML` unless wrapped with `DOMPurify.sanitize()` and accompanied by a rationale comment.
- **SVG & Dynamic Injection**: Verify dynamic SVG attributes and user-supplied strings are safely handled.

### 6. Command & File Path Traversal Protection (ASVS V5)
- Prohibit unsanitized inputs into `child_process.exec()`. Require `execFile` or `spawn` with array arguments.
- File operations must validate resolved paths against approved base directory roots (`path.resolve(BASE_DIR, input).startsWith(BASE_DIR)`).

---

## 📋 Standardized Audit Finding Report Format

Always present code audit findings in this structured format:

```markdown
### 🛡️ Strix Code Audit Report

**Target Scope**: `<file or service audited>`
**Audit Mode**: White-Box Source Code Review (Mode 1)
**Overall Status**: `PASSED ✅` | `WARNING ⚠️` | `FAILED ❌`

| ID | Severity | File / Location | Issue Description | OWASP ASVS Ref |
|:---|:---|:---|:---|:---|
| VULN-01 | HIGH / MED / LOW | `path/to/file.ts:L45` | Missing org_id tenant filter in query | ASVS V3 (Multi-Tenant) |

#### Finding Details:
- **VULN-01: <Title>**
  - **Location**: [`file.ts`](file:///absolute/path/file.ts#L45)
  - **Risk**: <Why this is a risk>
  - **Remediation**:
    ```typescript
    // Recommended fix
    ```
```

---

## 💾 Audit Persistence & Git Ledger

After outputting the audit findings in chat, the AI Agent MUST automatically log the audit to the centralized `logs/security/` ledger:
```bash
rtk bun scripts/log-security-audit.ts \
  --mode code-check \
  --target "<TARGET_PATH>" \
  --status "<PASSED|WARNING|FAILED>" \
  --findings-count <COUNT> \
  --summary "<BRIEF_SUMMARY>"
```
This automatically appends to `logs/security/audit.jsonl` and writes the monthly markdown report to `logs/security/YYYY-MM/`.
