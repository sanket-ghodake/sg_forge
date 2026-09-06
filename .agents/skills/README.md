# SG Forge - Agent Skills Directory (`.agents/skills/`)

Welcome to the **Agent Skills** directory for SG Forge 2.0.

This directory houses modular, open-standard (`agentskills.io` / `SKILL.md`) skill packages that empower AI coding agents (Antigravity, Claude Code, Cursor, Codex) to execute specialized engineering, architectural, and security workflows within the repository.

---

## 🧭 Master Skills Catalog

| Skill Folder | Name | Category | Description | Upstream Origin / Credit |
| :--- | :--- | :--- | :--- | :--- |
| [`cavecrew/`](./cavecrew) | `cavecrew` | AI Optimization | Decision guide for delegating tasks to caveman-style subagents. | Internal / Caveman Core |
| [`caveman/`](./caveman) | `caveman` | AI Optimization | Ultra-compressed communication mode (65% token savings). | Internal / Caveman Core |
| [`diagram-design/`](./diagram-design) | `diagram-design` | Architecture / UI | 39 editorial diagram archetypes, self-contained SVG, Astryx tokens. | Adapted from [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) (MIT) |
| [`strix-code-audit/`](./strix-code-audit) | `strix-code-audit` | Security / SAST | In-chat white-box source code security review (Mode 1). | Adapted from [usestrix/strix](https://github.com/usestrix/strix) (Apache-2.0) |
| [`strix-live-pentest/`](./strix-live-pentest) | `strix-live-pentest` | Security / DAST | In-chat dynamic live endpoint testing (Mode 2) for Dev & Prod. | Adapted from [usestrix/strix](https://github.com/usestrix/strix) (Apache-2.0) |


---

## 🛡️ Strix Security Skills Overview

The security skills in this folder bring the autonomous testing methodologies of **Strix** directly into pair-programming chat sessions without requiring external paid LLM API keys, external cloud accounts, or CI/CD pipelines:

1. **Mode 1: Code Check (`strix-code-audit`)**:
   - Statically and semantically audits Next.js routes, middleware, Turso DB multi-tenant `org_id` scoping, JWT cookies, secret leaks, and RFC 7807 error boundaries.
   - **Trigger phrases**: `"audit code"`, `"/audit-code"`, `"check security"`, `"strix code check"`.
2. **Mode 2: Live Setup Test (`strix-live-pentest`)**:
   - Performs non-destructive dynamic probing (`rtk curl -sI`) against active local development (`http://localhost:80/443`) or live production deployments.
   - Checks HSTS, CSP, X-Frame-Options, cookie security flags, CORS pre-flights, authentication redirects, and error response leakage.
   - **Trigger phrases**: `"test live dev"`, `"test live prod <url>"`, `"/audit-live"`.

---

## 📜 Licensing & Attribution

The `strix-*` skills are derived and adapted from the open-source [usestrix/strix](https://github.com/usestrix/strix) project under the **Apache-2.0 License**:
- **Upstream Author**: Strix Security Team ([https://strix.ai](https://strix.ai))
- **Source Repository**: [https://github.com/usestrix/strix](https://github.com/usestrix/strix)
- **License**: Apache License 2.0
