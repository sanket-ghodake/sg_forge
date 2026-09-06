# 📊 Types Package Isolated Logs (`apps/src/types/logs/`)

Dedicated log directory implementing the **4 Pillars of Observability** (2026 LTS Standard).

---

## 🏛️ The 4 Observability Pillars

| Pillar | File / Channel | Description |
| :--- | :--- | :--- |
| **Pillar 1: Dual-Probe Health** | Type contracts & schema health | Confirms TypeScript interfaces, type-guard contracts, and schema sync. |
| **Pillar 2: Browser Console Logs** | `browser.log` | Contract mismatch telemetry from client bundles. |
| **Pillar 3: Docker Lifecycle Logs** | `docker.log` | Container build and typecheck lifecycle logs. |
| **Pillar 4: Backend & DB Logs** | `typecheck.log` | Validation telemetry and compiler diagnostic output. |

---

## ⚡ Governance & Retention Limits
* **Max file size**: 5 MB per log file.
* **Rolling backups**: Up to 3 files (`*.log`, `*.log.1`, `*.log.2`).
* **In-memory ring buffer**: Capped at 1,000 entries.
* **Storage Cap**: $\le 25\text{ MB}$ total footprint per package.
