# HLR-TEL-002: Dedicated Turso Telemetry Schema & Log Storage

> **High-Level Requirement (HLR)** | Status: `VERIFIED` | Traceability ID: `[HLR-TEL-002]`

---

## 1. Overview & Capability
The Telemetry microservice operates against its dedicated `data/turso_telemetry.db` SQLite database with zero queries to or from central databases or other micro-apps.

## 2. Invariants
1. **Isolated Connection**: Opens SQLite database in WAL journal mode with 5000ms busy timeout.
2. **Rolling Retention**: Automatic pruning of debug events older than 14 days to constrain disk usage.

## 3. Downstream Traceability
- **Low-Level Requirements**:
  - `[LLR-TEL-001.2]`: Telemetry Database Schema & WAL Indexing
- **Verification Suites**:
  - `forge-apps/telemetry/test/integration/db-isolation.test.ts`
