# Forge Telemetry App Documentation (`docs/`)

> **Autonomous Micro-App: Real-Time Event Telemetry & Ingestion Engine**

---

## 🧭 Overview & Architecture

The **Forge Telemetry App** (`forge-apps/telemetry`) handles high-throughput event ingestion, system metrics, and audit log pipelines.

- **Isolation**: Operates as a decoupled microservice on `forge-apps-net`.
- **Database**: Dedicated Turso libSQL database (`data/telemetry.db`) with zero cross-app database queries.
- **Traceability**: All functions and routes trace to `docs/hlr/` and `docs/llr/`.
