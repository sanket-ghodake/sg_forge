# ⚡ Dev Dashboard Backend Engine (`src/backend/`)

Backend business logic, real-time streaming, and REST/SSE endpoints for `@forge/dev-dashboard`.

---

## 📂 Modules
- **`telemetry.ts`**: In-memory circular ring buffer (Google Monarch pattern) & host vitals collector (`node:os`).
- **`services-controller.ts`**: Dual-probe health monitor (`/livez`, `/readyz`), multi-network reverse-proxy gateway probing, and process lifecycle controller.
- **`api-handlers.ts`**: REST & SSE endpoint dispatchers for metrics, services, synthetic probing (`/api/services/probe`), databases, traffic, and issues.
