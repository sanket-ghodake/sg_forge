# 📜 Developer Hub API Gateway Logs (`apps/src/dev-hub/logs/`)

Isolated API proxy, service discovery, and gateway dispatch logs for Dev-Hub (Port 3000 / Port 3005).

## Files & Retention
- **`app.log`**: Gateway route dispatches and dynamic proxy resolution.
- **`browser.log`**: API documentation and playground client events.
- **`docker.log`**: Container lifecycle logs (`forge-dev-hub`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
