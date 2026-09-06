# 🐳 Dev Hub Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/dev-hub`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `3003` (Mapped via Caddy reverse proxy to `/gateway`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
