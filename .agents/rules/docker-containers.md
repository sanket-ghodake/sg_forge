# 🐳 Docker & Container Governance Standards (2026 LTS)

> **Enterprise SRE & Production Infrastructure Standard for SG Forge Monorepo**

---

## 🛑 The 8 Immutable Container Invariants

1. **Mandatory HTTP Health Contract (`/health` & `/livez`)**:
   - Every platform service and micro-app MUST expose a lightweight `/health` (and `/livez`) endpoint returning HTTP 200 `{ status: 'ok', uptime: number, timestamp: number }`.
2. **Colocated Dockerfile Pattern (Option A)**:
   - Every micro-app maintains its own container definition inside `<app-folder>/docker/Dockerfile` and `<app-folder>/docker/README.md`.
3. **Explicit Container Healthchecks**:
   - Every service in Docker Compose (`docker/dev/` and `docker/prod/`) MUST define an explicit `healthcheck` block (`wget` or `curl` probe, interval $\le 15\text{s}$, timeout $3\text{s}$, 3 retries, start period $5\text{s}$).
4. **Named Volumes Only (Zero Anonymous Mounts)**:
   - All shared caches and DB persistence MUST use explicit named volumes (e.g. `sg_forge_bun_cache`, `sg_forge_db_data`, `sg_forge_caddy_data`) to prevent dangling disk storage exhaustion.
5. **Memory and CPU Resource Caps**:
   - Every compose service MUST enforce `deploy.resources.limits.memory` (e.g. `128M` dev, `256M` prod) and `cpus` limits to prevent runaway resource contention.
6. **Log Rotation Safeguards**:
   - All services MUST configure Docker logging drivers (`driver: json-file`, `options: { max-size: "10m", max-file: "3" }`) to prevent container log disk bloat.
7. **Non-Root Production Security**:
   - Production Dockerfile stages must execute under non-root system users (`USER nextjs`/`appuser`) with Alpine minimal footprints (<90MB).
8. **Dev vs Prod Multi-Stack Separation**:
   - **Dev Stack (`docker/dev/docker-compose.yml`)**: Uses volume-mounted source code with `bun --watch` for sub-millisecond hot reloading.
   - **Prod Stack (`docker/prod/docker-compose.yml`)**: Builds immutable, multi-stage production images referencing each app's colocated `Dockerfile`.

---

## 🛠️ Docker CLI Commands via `run.sh`
- `./run.sh docker dev` / `./run.sh docker up` $\to$ Start Dev stack with hot-reload.
- `./run.sh docker prod` $\to$ Start Prod stack with full image builds.
- `./run.sh docker build [app]` $\to$ Build a specific app's colocated Dockerfile.
- `./run.sh docker monitor` $\to$ Live terminal stats (CPU, RAM, Net I/O).
