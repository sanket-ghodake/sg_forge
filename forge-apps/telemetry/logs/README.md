# 📜 Telemetry Micro-App Logs (`forge-apps/telemetry/logs/`)

Isolated live vitals and observability logs for Telemetry Micro-App (Port 8087).

## Files & Retention
- **`app.log`**: Telemetry probe dispatches and data ingestion metrics.
- **`browser.log`**: Telemetry UI charts, WebSocket reconnects, and console errors.
- **`db.log`**: Dedicated Turso database (`telemetry_turso.db`) query execution and transaction logs.
- **`docker.log`**: Container lifecycle logs (`forge-app-telemetry`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
