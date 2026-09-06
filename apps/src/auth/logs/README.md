# 📊 Auth Microservice Isolated Logs (`apps/src/auth/logs/`)

Dedicated log directory implementing the **4 Pillars of Observability** (2026 LTS Standard).

---

## 🏛️ The 4 Observability Pillars

| Pillar | File / Channel | Description |
| :--- | :--- | :--- |
| **Pillar 1: Dual-Probe Health** | `GET /health` (`livez`, `readyz`) | Confirms process event loop responsiveness and Turso database latency. |
| **Pillar 2: Browser Console Logs** | `browser.log` (`POST /api/logs/browser`) | Client-side error bridge forwarding unhandled browser exceptions & network failures. |
| **Pillar 3: Docker Lifecycle Logs** | `docker.log` | Container startup, lifecycle telemetry, and `[SYSTEM_BOOT]` markers. |
| **Pillar 4: Backend & DB Logs** | `app.log`, `db.log` | HTTP request telemetry via `createSafeHandler`, rate-limiting events, and SQLite query telemetry. |

---

## ⚡ Governance & Retention Limits
* **Max file size**: 5 MB per log file.
* **Rolling backups**: Up to 3 files (`*.log`, `*.log.1`, `*.log.2`).
* **In-memory ring buffer**: Capped at 1,000 entries.
* **Storage Cap**: $\le 25\text{ MB}$ total footprint per app.
