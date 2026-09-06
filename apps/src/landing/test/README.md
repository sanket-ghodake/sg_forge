# Landing Discovery Hub Test Suite (`@forge/landing`)

This directory houses the comprehensive **5-Tier Test Architecture** for the Platform Landing Hub microservice.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | Dynamic category grouping logic from `@forge/sdk`. |
| **Tier 2** | **Integration** | `integration/` | Real-time synchronization of catalog cards from `.env`. |
| **Tier 3** | **Security** | `security/` | HTML sanitization and secure meta/header injection. |
| **Tier 4** | **Contracts** | `contracts/` | Operational dual-probe `/health` schema contract validation. |
| **Tier 5** | **E2E** | `e2e/` | Full server lifecycle and Astryx responsive grid rendering. |

---

## 🚀 Running Tests

```bash
# Run all Landing tests
rtk bun test apps/src/landing/test
```
