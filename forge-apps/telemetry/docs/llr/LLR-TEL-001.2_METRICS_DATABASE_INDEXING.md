# LLR-TEL-001.2: Telemetry Database Schema & WAL Indexing

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-TEL-001.2]`

---

## 1. Specification
Defines the schema and indexes for storing telemetry events in `data/turso_telemetry.db`:
- `telemetry_events`: `id TEXT PRIMARY KEY`, `service TEXT NOT NULL`, `severity TEXT NOT NULL`, `message TEXT NOT NULL`, `payload TEXT`, `created_at INTEGER NOT NULL`
- Indexes: `idx_telemetry_created_at` ON `telemetry_events(created_at)`, `idx_telemetry_severity` ON `telemetry_events(severity)`

## 2. Invariants
- Indexed queries by `severity` and timestamp range return within <10ms.
- Enforces strict parameter binding to prevent SQL injection.

## 3. Traceability Links
- **Parent HLR**: `[HLR-TEL-002]`
- **Implementation**: `src/db/index.ts`
- **Verification**: `test/integration/db-isolation.test.ts`
