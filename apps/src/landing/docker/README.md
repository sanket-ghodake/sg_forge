# 🐳 Landing Hub Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/landing`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `3000` (Mapped via Caddy reverse proxy to `/`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
