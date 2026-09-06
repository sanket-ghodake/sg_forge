# 🐳 Auth Server Container Specification (`docker/`)

OCI container configuration and Dockerfile recipes for `@forge/auth`.

---

## 🚀 Specifications
- **Base Image**: `oven/bun:1.3-alpine` (<90MB footprint).
- **Listening Port**: `3004` (Mapped via Caddy reverse proxy to `/auth`).
- **Healthcheck**: Periodic automated `/health` endpoint probe.
