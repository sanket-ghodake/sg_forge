# 🧪 Tier 1: Unit Tests (`@forge/dev-dashboard/test/unit`)

Isolated in-memory unit tests validating pure domain algorithms, schema introspection, log filters, and system vitals computation adhering to the 3A pattern (Arrange, Act, Assert).

---

## 🎯 Test Files

- `vitals-engine.test.ts`: Vitals calculation, host metrics, and ring buffer management.
- `db-sandbox.test.ts`: Read-only SQL queries and query duration tracking.
- `table-browser.test.ts`: Table schema extraction (`PRAGMA table_info`), DDL generation, and row pagination.
