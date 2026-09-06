# 🔗 Tier 2: Integration Tests (`@forge/dev-dashboard/test/integration`)

Tests boundary integration across the REST API router, real SQLite database files, Server-Sent Events ring buffer, and service registry discovery.

---

## 🎯 Test Files

- `services-lifecycle.test.ts`: Service toggling, restarts, and health polling.
- `telemetry-pipeline.test.ts`: Log ingestion, circular buffer clipping, and SSE broadcasting.
- `db-explorer-endpoints.test.ts`: Endpoints for table schemas, paginated rows, database integrity, and CSV exports.
