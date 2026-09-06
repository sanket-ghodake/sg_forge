# 🛡️ Tier 3: Security Tests (`@forge/dev-dashboard/test/security`)

Zero-trust automated security assertions covering SQL injection defense, read-only query sandbox enforcement, and automated environment variable secret masking.

---

## 🎯 Test Files

- `sql-sandbox-defense.test.ts`: Negative assertions against DML/DDL mutation attempts in read-only sandbox mode.
- `env-secret-defense.test.ts`: Verifies automated masking of sensitive keys (`token`, `secret`, `password`, `key`) and SQL identifier sanitization.
