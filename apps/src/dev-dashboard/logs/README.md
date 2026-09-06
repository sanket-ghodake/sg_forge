# 📜 Developer Dashboard & Monitoring Logs (`apps/src/dev-dashboard/logs/`)

Isolated telemetry engine, SSE streaming, and prober logs for DevCenter (Port 3002).

## Files & Retention
- **`app.log`**: Server route logs, SSE subscriber registrations, process control actions.
- **`browser.log`**: Client SPA navigation, tab switching, and chart render errors.
- **`db.log`**: Platform DB exploration, SQL playground sandboxed executions.
- **`docker.log`**: Container lifecycle logs (`forge-dev-dashboard`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
