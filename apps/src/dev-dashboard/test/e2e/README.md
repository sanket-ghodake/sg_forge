# 🌐 Tier 5: E2E Tests (`@forge/dev-dashboard/test/e2e`)

Testing for Truth (real network sockets, HTTP servers, live responses) verifying full end-to-end user journeys without shallow mock shortcuts.

---

## 🎯 Test Files

- `dashboard-server.test.ts`: Live Bun HTTP server lifecycle, dual-probe health endpoints (`/livez`, `/readyz`), and HTML SPA document response.
- `dev-dashboard-journey.test.ts`: End-to-end HTTP tests validating Command Palette endpoints, database schema retrieval, and CSV streaming.
