# Custom Landing Page Test Suite (`@forge/landing-custom`)

This directory houses the **5-Tier Test Architecture** for the customizable starter landing microservice.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | Template generator and HTML structure validation. |
| **Tier 2** | **Integration** | `integration/` | Server request handling and 404 fallback routing. |
| **Tier 3** | **Security** | `security/` | XSS prevention and safe template variable interpolation. |
| **Tier 4** | **Contracts** | `contracts/` | Operational `/health` RFC problem details and schema compliance. |
| **Tier 5** | **E2E** | `e2e/` | Standalone server spin-up and live HTTP request cycle. |

---

## 🚀 Running Tests

```bash
# Run all landing-custom tests
rtk bun test apps/src/landing-custom/test
```
