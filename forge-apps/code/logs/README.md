# 📜 Cloud VS Code Micro-App Logs (`forge-apps/code/logs/`)

Isolated runtime, browser, and database logs for Cloud VS Code Microservice (Port 8088).

## Files & Retention
- **`app.log`**: Session claim, takeover dispatch, and API route executions.
- **`network.log`**: Detailed ingress & outbound browser network audits (JSONL Enterprise SRE format).
- **`browser.log`**: Client UI interaction, heartbeat telemetry, and workbench errors.
- **`db.log`**: Dedicated Turso database (`code.db`) query execution and session table logs.
- **`docker.log`**: Container lifecycle logs (`ag-app-code-dev`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
