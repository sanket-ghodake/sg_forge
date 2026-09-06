# SG Forge - Centralized Security Audit Ledger (`logs/security/`)

Welcome to the **Security Audit Ledger** for SG Forge 2.0.

This directory serves as the single canonical repository location where all **Strix** penetration testing, code auditing, and endpoint probing reports are persisted and tracked by Git.

---

## 📁 Directory Structure

```
logs/security/
├── README.md               # Directory specification & governance rules
├── audit.jsonl             # Immutable, append-only structured audit trail
├── LATEST_AUDIT.md         # Pointer to the most recently generated audit report
└── YYYY-MM/                # Monthly archives of detailed Markdown reports
    ├── AUDIT_YYYYMMDD_HHmm_code-check.md
    └── AUDIT_YYYYMMDD_HHmm_live-test.md
```

---

## 📊 Structured Ledger Schema (`audit.jsonl`)

Each line in `audit.jsonl` is an independent JSON object:

```json
{
  "timestamp": "2026-09-05T11:55:00.000Z",
  "mode": "code-check | live-test | pre-commit",
  "target": "apps/src/portal/src/app/api | http://localhost:80",
  "status": "PASSED | WARNING | FAILED",
  "findingsCount": 0,
  "summary": "Baseline security audit of portal routes",
  "reportFile": "logs/security/2026-09/AUDIT_20260905_1155_code-check.md"
}
```

---

## 🛡️ Git & Toolchain Governance Policy

1. **Git Tracked**: This directory is **intentionally committed to Git**. Every pentest finding and verification pass remains historically auditable across commits and releases (SOC 2, ISO 27001 compliance).
2. **Excluded from Non-Git Tools**:
   - `.dockerignore`: Excluded so Docker production images remain lean and do not bundle audit logs.
   - `.graphifyignore`: Excluded so the code knowledge graph parser ignores markdown logs.
   - `.repomixignore`: Excluded so token-sensitive LLM prompt packagers avoid log bloat.
   - `.antigravityignore` / `.cursorignore` / `.copilotignore`: Excluded so IDE code completions remain fast and uncluttered.

---

## 🚀 Running Audits & Logging

To record an audit programmatically or via CLI:
```bash
rtk bun scripts/log-security-audit.ts \
  --mode code-check \
  --target "apps/src/portal/src/app/api" \
  --status PASSED \
  --summary "Zero injection or secret leaks detected"
```

---

## 📜 Attribution
The audit methodologies and reporting structures are derived from [usestrix/strix](https://github.com/usestrix/strix) (Apache-2.0 License).
