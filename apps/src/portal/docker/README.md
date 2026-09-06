# 🐳 Portal Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/portal`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `3001` (Mapped via Caddy reverse proxy to `/portal`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
