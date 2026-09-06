# 📊 Developer Monitoring Dashboard Source (`src/`)

Source codebase for the `@forge/dev-dashboard` micro-service.

---

## 📂 Subdirectories & Modules
- **`backend/`**: Controllers, in-memory telemetry streamer, and REST/SSE route handlers.
- **`frontend/`**: Astryx SPA HTML renderer, responsive styling, and interactive scripts.
- **`db/`**: Platform Core SQLite / Turso database manager with WAL and query sandbox.
- **`server.ts`**: Bun HTTP server with dual-probe health endpoints (`/livez`, `/readyz`).
- **`index.ts`**: Main barrel exports.
