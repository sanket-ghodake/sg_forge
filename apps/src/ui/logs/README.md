# 📊 UI Package Isolated Logs (`apps/src/ui/logs/`)

Dedicated log directory implementing the **4 Pillars of Observability** (2026 LTS Standard).

---

## 🏛️ The 4 Observability Pillars

| Pillar | File / Channel | Description |
| :--- | :--- | :--- |
| **Pillar 1: Dual-Probe Health** | Component hydration health | Confirms component rendering responsiveness and Astryx token parity. |
| **Pillar 2: Browser Console Logs** | `browser.log` | Browser console forwarding for UI component render failures & hydration mismatches. |
| **Pillar 3: Docker Lifecycle Logs** | `docker.log` | UI build and asset bundling telemetry. |
| **Pillar 4: Backend & DB Logs** | `ui-render.log` | SSR rendering metrics, hydration telemetry, and theme transition logs. |

---

## ⚡ Governance & Retention Limits
* **Max file size**: 5 MB per log file.
* **Rolling backups**: Up to 3 files (`*.log`, `*.log.1`, `*.log.2`).
* **In-memory ring buffer**: Capped at 1,000 entries.
* **Storage Cap**: $\le 25\text{ MB}$ total footprint per package.
