# 🐳 Custom Landing Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/landing-custom`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `3000` (Mapped via Caddy reverse proxy to `/` when configured in `.env`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
