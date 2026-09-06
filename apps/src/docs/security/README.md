# 🔒 SG Forge 2.0 - Security & Zero-Trust Architecture Manual

> **Enterprise Standards Baseline (2026 LTS)**: Conforms strictly to **OWASP ASVS 5.0**, Enterprise SRE security practices, and Enterprise AppSec invariants.

---

## 🛡️ The 4 Layers of SG Forge Supply Chain & AppSec

```
                                              SG FORGE ZERO-TRUST DEFENSE
                               
        LAYER 1                    LAYER 2                    LAYER 3                    LAYER 4
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   SUPPLY CHAIN &      │  │    SAST, CODE &       │  │  MULTI-TENANT & DB    │  │  AI PENTESTING &      │
│   ANTI-HALLUCINATION  │  │    SECRET AUDITING    │  │  ISOLATION BOUNDARIES │  │  IN-CHAT AUDITING     │
├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤
│ • OSV-Scanner (Vulns) │  │ • Gitleaks (160+ keys)│  │ • Dedicated Turso DB  │  │ • Strix Code Audit    │
│ • Slopsquatting Guard │  │ • Semgrep SAST        │  │ • Strict org_id scope │  │ • Strix Live Pentest  │
│ • Syft CycloneDX SBOM │  │ • Biome Rust AST Lint │  │ • RFC 7807 Boundaries │  │ • Pre-Commit Check 21 │
│ • Permissive Licenses │  │ • ShellCheck & Hadolint│ │ • PII Secret Redaction│  │ • Upstream usestrix   │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

---

## 1. Supply Chain Defense & Anti-Slopsquatting
In agentic "vibecoding" workflows, LLMs frequently introduce hallucinated dependencies. SG Forge enforces a dual-stage supply chain verification:
1. **Registry Provenance Verification (`scripts/check-package-health.ts`)**:
   - Queries public npm registry API for package existence.
   - Enforces minimum 14-day publication threshold to prevent zero-day typosquatting or slopsquatting attacks.
   - Run manually via `./run.sh check-pkg <package_name>`.
2. **OSV-Scanner Vulnerability Database (`./run.sh vuln`)**:
   - Scans `bun.lock` for known CVEs cataloged in the Open Source Vulnerability database.
   - Zero critical CVEs permitted in build or staging gates.
3. **Automated CycloneDX 1.5 SBOM (`./run.sh sbom`)**:
   - Continuous SBOM generation using Syft, documenting all direct and transitive dependencies with cryptographic hashes in [`apps/src/docs/security/sbom/cyclonedx-sbom.json`](./sbom/cyclonedx-sbom.json).
4. **Permissive License Governance (`./run.sh licenses`)**:
   - Mandates permissive OSI licenses (`MIT`, `Apache-2.0`, `BSD`, `ISC`, `MPL-2.0`). Rejects viral copyleft (`GPL-3.0`, `AGPL-3.0`) in platform code.

---

## 2. Static Application Security Testing (SAST) & Secrets
1. **Gitleaks (`./run.sh secrets`)**:
   - Detects 160+ secret formats (Cloud access tokens, payment provider keys, AI API keys, RSA private keys) in staged diffs and source code.
2. **Semgrep (`./run.sh semgrep`)**:
   - Enforces type-safe parameterized SQL (anti-SQLi), SSRF prevention, and strict multi-tenant authorization guards.
3. **Automated RFC 7807 Error Redaction**:
   - Backend services utilize `@forge/sdk` `createSafeHandler` to recursively strip internal stack traces, DB credentials, and sensitive headers from client responses.

---

## 3. Multi-Tenant Data Isolation
1. **Dedicated Turso DB per Forge App**:
   - Micro-apps operate isolated SQLite / libSQL database instances. Cross-app database queries are architecturally blocked.
2. **Mandatory `org_id` Scoping**:
   - Every read and mutation query strictly filters by `eq(table.orgId, session.orgId)`.

---

## 4. Container & Infrastructure Security
1. **Hadolint Standards**: Dockerfiles must enforce `HEALTHCHECK`, non-root execution where applicable, and memory caps.
2. **Trivy Vulnerability Audit (`./run.sh trivy`)**: Scans container manifests and workspace configurations for CVEs.

---

## 5. AI-Driven In-Chat Penetration Testing (Strix Standard)
SG Forge embeds an in-chat AI security auditor powered by the open-source methodologies of **Strix**:

1. **Mode 1: Code Check (`strix-code-audit`)**:
   - Statically and semantically audits Next.js routes, middleware, Turso DB multi-tenant `org_id` scoping, JWT cookies, secret leaks, and RFC 7807 error boundaries.
   - Run in chat via: `"audit code"`, `"/audit-code"`, or `"check code security"`.
2. **Mode 2: Live Setup Test (`strix-live-pentest`)**:
   - Performs non-destructive dynamic probing (`rtk curl -sI`) against active local development (`http://localhost:80/443`) or remote staging/production domains.
   - Run in chat via: `"test live dev"`, `"test live prod <url>"`, or `"/audit-live"`.
3. **Pre-Commit Verification Gate Integration**:
   - Formally enforced under **Pre-Commit Check 21** in `AGENTS.md` and evaluated by **Tier 2 Semantic Audit 8** in `scripts/verify-gate.ts`.
4. **Open-Source Attribution**:
   - Derived and adapted from the open-source [usestrix/strix](https://github.com/usestrix/strix) project under the **Apache-2.0 License** by the Strix Security Team.

---

## 6. Security CLI & In-Chat Quick Reference

```bash
# Run full 27-check verification gate (including Tier 2 AI Semantic Audits):
./run.sh verify

# Scan for hardcoded credentials:
./run.sh secrets

# Audit dependencies for known vulnerabilities:
./run.sh vuln

# Verify an external package before installation:
./run.sh check-pkg <pkg>

# Generate fresh CycloneDX 1.5 SBOM:
./run.sh sbom

# Run Semgrep SAST security rules:
./run.sh semgrep

# In-Chat Triggers (for Antigravity, Claude, Cursor):
# - "/audit-code" -> Mode 1: White-box source review
# - "/audit-live" -> Mode 2: Dynamic live endpoint probing
```
