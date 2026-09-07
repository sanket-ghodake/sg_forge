# 🐳 Telemetry Micro-App Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `forge-apps/telemetry`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `8087` (Mapped via Caddy reverse proxy to `/apps/telemetry`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
