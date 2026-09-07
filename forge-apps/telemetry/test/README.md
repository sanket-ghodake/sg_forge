# Live Telemetry Micro-App Test Suite (`@forge/app-telemetry`)

This directory houses the comprehensive **5-Tier Test Architecture** for the Live Telemetry Micro-App.

---

## 🏛️ Test Tiers & Governance

| Tier | Category | Location | Purpose & Scenarios |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Unit** | `unit/` | Percentile computation and metric aggregation algorithms. |
| **Tier 2** | **Integration** | `integration/` | Dedicated Turso DB & dual-probe memory metrics. |
| **Tier 3** | **Security** | `security/` | Multi-tenant organization isolation defense. |
| **Tier 4** | **Contracts** | `contracts/` | Operational dual-probe `/health` schema contract validation. |
| **Tier 5** | **E2E** | `e2e/` | Full micro-app server lifecycle and Astryx UI rendering. |

---

## 🚀 Running Tests

```bash
# Run all Telemetry tests
rtk bun test forge-apps/telemetry/test
```
