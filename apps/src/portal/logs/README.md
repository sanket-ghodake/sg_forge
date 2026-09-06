# 📜 Portal Application Frame Logs (`apps/src/portal/logs/`)

Isolated runtime and iframe communication bridge logs for the SG Forge App Portal (Port 3000 / Port 8080).

## Files & Retention
- **`app.log`**: Portal frame routing, micro-app launcher proxy events.
- **`browser.log`**: PostMessage event bus, theme sync, and iframe sandbox errors.
- **`docker.log`**: Container lifecycle logs (`forge-portal-dev`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
