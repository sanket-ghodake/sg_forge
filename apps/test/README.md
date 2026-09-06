# 🧪 5-Tier Platform Test Suite (`apps/test/`)

Comprehensive 5-Tier test suites conforming to Enterprise QA engineering standards.

---

## 📁 Test Tier Structure

* **`unit/`**: Fast unit tests for SDK, UI tokens, and business logic (`bun test`).
* **`integration/`**: Reverse proxy routing, container health probes, and Turso DB queries.
* **`contract/`**: OpenAPI and postMessage interface contract tests.
* **`security/`**: OWASP ASVS 5.0 injection, secret leakage, and sandbox boundary tests.
* **`e2e/`**: Playwright headless browser workflows.
