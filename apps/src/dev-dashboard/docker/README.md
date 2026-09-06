# 🐳 Dev Dashboard Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/dev-dashboard`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB total image footprint).
- **Listening Port**: `3002` (Mapped via Caddy reverse proxy to `/devcenter`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
