# Developer Dashboard Test Suite (`@forge/dev-dashboard`)

This directory houses the comprehensive **5-Tier Test Architecture** for the Developer Dashboard microservice, adhering to the 2026 LTS Enterprise enterprise standard.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | System vitals, Golden Cards SLO %, ring-buffer bounds, read-only SQL AST parser. |
| **Tier 2** | **Integration** | `integration/` | Real-time service state transitions, sparklines, log ingestion, and SSE broadcast streams. |
| **Tier 3** | **Security** | `security/` | Negative SQL mutation rejection (`DROP`, `DELETE`, `ATTACH`), malformed log payload defense. |
| **Tier 4** | **Contracts** | `contracts/` | RFC 7807 problem details specification compliance and JSON schema validation. |
| **Tier 5** | **E2E** | `e2e/` | Full server lifecycle, Astryx UI layout rendering, 1-Click Latency Benchmark. |

---

## 🚀 Running Tests

```bash
# Run all Dev Dashboard tests
rtk bun test apps/src/dev-dashboard/test

# Run specific tier
rtk bun test apps/src/dev-dashboard/test/unit
rtk bun test apps/src/dev-dashboard/test/security
```
