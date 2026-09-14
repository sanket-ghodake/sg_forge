# HLR-CODE-003: Automated Database Backup & SRE Health Probes

> **High-Level Requirement (HLR)** | Status: `VERIFIED` | Traceability ID: `[HLR-CODE-003]`

---

## 1. Overview & Capability
The Code app maintains its own high-availability SRE lifecycle, executing periodic online backups of its dedicated `code.db` libSQL database and serving dual-probe health checks.

## 2. Invariants
1. **Zero Downtime Backup**: Uses SQLite online VACUUM INTO to create compressed snapshot backups into `backups/db/`.
2. **Deterministic Health Responses**: `/health` probe returns memory footprint, database readiness, and uptime in milliseconds.

## 3. Downstream Traceability
- **Low-Level Requirements**:
  - `[LLR-CODE-001.1]`: Lock Coordinator Concurrency Algorithm
- **Verification Suites**:
  - `forge-apps/code/test/contracts/health-schema.test.ts`
