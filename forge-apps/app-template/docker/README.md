# 🐳 App Template Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `forge-apps/app-template`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `8088` (Mapped via Caddy reverse proxy).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
