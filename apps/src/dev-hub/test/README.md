# Developer Hub & SDK Playground Test Suite (`@forge/dev-hub`)

This directory houses the comprehensive **5-Tier Test Architecture** for the Developer Hub microservice.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | SDK contract metadata and supported polyglot languages. |
| **Tier 2** | **Integration** | `integration/` | Navigation links and interactive hub routes. |
| **Tier 3** | **Security** | `security/` | Template injection prevention and safe rendering. |
| **Tier 4** | **Contracts** | `contracts/` | Operational dual-probe `/health` schema contract validation. |
| **Tier 5** | **E2E** | `e2e/` | Full server lifecycle and documentation grid rendering. |

---

## 🚀 Running Tests

```bash
# Run all Dev Hub tests
rtk bun test apps/src/dev-hub/test
```
