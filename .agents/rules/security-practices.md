# Cybersecurity & Zero-Trust Architecture Specification (OWASP ASVS 5.0)

This standard applies universally across all source code, API routes, microservices, backend daemons, frontend conductors, and scripts. All implementations must adhere to the **OWASP Application Security Verification Standard (ASVS) 5.0**.

---

## 1. Multi-Tenant Isolation & Access Control (ASVS V3)
1. **Tenant-Scoping Invariant**: Every database query, mutation, and cache lookup MUST be explicitly scoped by `orgId` / `tenantId`.
2. **Cross-Tenant Breach Prevention**: Admin of Organization A MUST NEVER be able to view, query, or mutate resources belonging to Organization B, regardless of raw ID manipulation.
3. **Mandatory Authorization Checks**: Every route handler and service method must authenticate identity ($Identity$), resolve organization membership ($Membership$), check role ($Role$), and assert resource-level permission ($Permission$) before execution.

---

## 2. First-Class Auditability & `AuditEvent` Domain (ASVS V7)
1. **Mandatory Audit Logging**: All security-sensitive state changes MUST emit an `AuditEvent` entity with:
   - `actorId`: User or service agent executing the action.
   - `action`: Canonical action verb (e.g. `USER_ROLE_UPDATED`, `ORG_CREATED`, `PERMISSION_REVOKED`, `INVITE_SENT`).
   - `targetType` & `targetId`: Entity being modified.
   - `orgId`: Tenant scope.
   - `requestId`: Distributed tracing / correlation ID.
   - `timestamp`: ISO UTC timestamp.
   - `metadata`: JSON payload of change diff (excluding raw credentials).
2. **Immutable Log Stream**: Audit records must be append-only and never deleted or mutated in normal operational flows.

---

## 3. Database Access & Parameterized Queries (Anti-SQLi - ASVS V5)
1. **Zero Raw SQL String Concatenation**: Never construct SQL queries via template string interpolation (e.g. `` db.execute(`SELECT * FROM ${table}`) ``).
2. **Mandatory Drizzle ORM Expressions**: Use type-safe Drizzle builders (`eq()`, `inArray()`, `and()`, `or()`) or parameterized tagged template literals (`sql\`SELECT * FROM users WHERE id = ${id}\``).
3. **Role Segregation & Least Privilege**: Raw administrative SQL execution is strictly isolated. Read-only execution must use the dedicated `roDb` read-only connection pool.
4. **Mandatory Negative Path Security Tests**: Every protected endpoint must have integration tests (`test/integration/security.test.ts`) proving that 403 Forbidden is returned for unauthorized or unprivileged users.

---

## 4. Command Injection & Subprocess Spawning (ASVS V5)
1. **Prohibit Shell Interpolation**: Never pass unsanitized or interpolated strings to `child_process.exec()` or `os.system()`.
2. **Use Safe Executable Argument Arrays**: Always use `child_process.execFile()` or `spawn()` with an explicit array of arguments (e.g. `execFile(binaryPath, [arg1, arg2])`) so shell metacharacters (`|`, `&`, `;`, `$`, `` ` ``) are not interpreted.
3. **Strict Binary Allowlist**: Any dynamic execution must validate the requested executable against an immutable repository allowlist.

---

## 5. Path Traversal & File System Boundaries (ASVS V5)
1. **Root Whitelist Validation**: All file-serving or disk-reading operations must resolve paths against a safe root and assert containment:
   ```typescript
   const resolved = path.resolve(ALLOWED_BASE_DIR, userInput);
   if (!resolved.startsWith(ALLOWED_BASE_DIR + path.sep)) {
     throw new Error("Path traversal violation");
   }
   ```
2. **No Direct Unvalidated File Access**: Never pass user-supplied file names directly into `fs.readFile()` or `res.sendFile()`.

---

## 6. Cross-Site Scripting (XSS) & Content Security (ASVS V5)
1. **Prohibit Unsanitized HTML**: React `dangerouslySetInnerHTML` is strictly prohibited unless markup is sanitized with `DOMPurify.sanitize()` beforehand and accompanied by an explicit security comment.
2. **Context-Aware Escaping**: Ensure dynamic user labels and SVG elements are safely escaped to prevent execution.

---

## 7. Server-Side Request Forgery (SSRF) & Proxy Boundaries (ASVS V5)
1. **Allowed Domain Whitelist**: Proxies, fetchers, and webhook dispatchers must validate target URLs against an allowed list of domains (`https:` only for public egress).
2. **RFC 1918 Private IP Filtering**: Block outbound requests targeting local/internal IP ranges (`127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254` cloud metadata).

---

## 8. Secret Hygiene & Zero-Hardcoded Credential Policy (ASVS V6)
1. **No In-Code Secrets**: API keys, private keys, JWT secrets, passwords, and tokens must NEVER be hardcoded in code, tests, or seed fixtures.
2. **Environment Variable Governance**: Access secrets exclusively via validated `process.env` loaded through secure configuration modules.
3. **No Secret Suppression Bypasses**: Never bypass a Gitleaks or secret scanner warning using `gitleaks:allow` comments for actual secrets.

---

## 9. Cryptographic Randomness & Token Generation (ASVS V6)
1. **No Insecure Randomness for Security Tokens**: `Math.random()` is strictly prohibited for session IDs, CSRF tokens, passwords, encryption salts, or cryptographic keys.
2. **Use Cryptographically Secure PRNGs**: Always use `crypto.randomBytes()`, `crypto.randomUUID()`, or `crypto.getRandomValues()`.

---

## 10. SAST & Static Security Gate Enforcement
- **Fast Pre-Commit Pattern Check**: `scripts/lint-security.sh` verifies zero high-risk patterns in staged files.
- **Polyglot SAST Scanner**: Semgrep and Ruff Bandit rules run on modified source files.
- **Agent Self-Audit**: Agents must execute `rtk run "./scripts/lint-security.sh"` after modifying backend routes, authentication logic, or proxy controllers.

---

## 11. Supply Chain & Vibecoding Security Guardrails (2026 Standards)
1. **OSV-Scanner Automated Lockfile Audit**: Continuous scanning of `bun.lock` against Google's Open Source Vulnerability database via `./run.sh vuln`. Zero critical vulnerabilities permitted.
2. **Anti-Slopsquatting Pre-Install Verification**: AI agents must never introduce external npm dependencies without first verifying registry metadata via `./run.sh check-pkg <pkg>`. Requires $\ge 14$ days publication age, legitimate maintainer provenance, and non-hallucinated packages.
3. **Trivy Container & Configuration Auditing**: Audits all Dockerfiles and compose manifests for misconfigurations and vulnerable base layers via `./run.sh trivy`.
4. **Permissive License Allowlist**: All dependencies must conform strictly to permissive OSI licenses (MIT, Apache-2.0, BSD, ISC, MPL-2.0). Viral copyleft (AGPL/GPL) is strictly prohibited in platform services.
5. **Syft CycloneDX 1.5 SBOM**: Continuous SBOM generation and cryptographic verification via `./run.sh sbom`.

