# 📜 Landing Page Microservice Logs (`apps/src/landing/logs/`)

Isolated runtime logs for the public Landing Page & Marketing Service (Port 3000).

## Files & Retention
- **`app.log`**: SSR render timings and HTTP response latencies.
- **`browser.log`**: Client-side hydration, navigation, and console errors.
- **`docker.log`**: Container lifecycle logs (`forge-landing-dev`).
- **Policy**: 5MB rolling rotation, max 3 backup files.
