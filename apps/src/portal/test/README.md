# Main Portal Workspace Test Suite (`@forge/portal`)

This directory houses the comprehensive **5-Tier Test Architecture** for the Main Portal Workspace service.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | UserContext and role formatting validation. |
| **Tier 2** | **Integration** | `integration/` | ASVS 5.0 Authentication Gate & JWT verification integration. |
| **Tier 3** | **Security** | `security/` | Unauthenticated request redirection and tampered token rejection. |
| **Tier 4** | **Contracts** | `contracts/` | Operational dual-probe `/health` schema contract validation. |
| **Tier 5** | **E2E** | `e2e/` | Full portal server lifecycle and Astryx UI rendering. |

---

## 🚀 Running Tests

```bash
# Run all Portal tests
rtk bun test apps/src/portal/test
```
