# 🧩 Forge Micro-Apps as Autonomous Git Submodules

> 📖 **Canonical Documentation Location:**
> This guide is actively published and maintained in the Living Documentation Portal:
> 👉 [`submodules/architecture.mdx`](./src/content/docs/submodules/architecture.mdx) (Live Portal: `/docs/submodules/architecture`)

---

## 🏛️ Architectural Directives

1. **Zero Shared Code with Central Apps**:
   - Micro-apps maintain their own local code, types, and runtime libraries (`src/lib/`).
   - Zero imports from `apps/src/*` or `@forge/*` monorepo workspaces.
2. **Dedicated Standalone Docker Environment**:
   - Each app has its own `docker/Dockerfile` and `.dockerignore`.
   - Build context is restricted strictly to `./forge-apps/<app-name>/`.
   - Can be built and run standalone using `docker compose up` inside the app folder.
3. **Dedicated Database Isolation**:
   - Each app provisions its own dedicated Turso (libSQL/SQLite) database in `data/<app-name>.db`.
   - Micro-apps never query another microservice's database.
4. **Air-Gap Security & Egress Boundary**:
   - **Central Core Platform**: Strictly **AIR-GAPPED** on `core-airgap-net` (`internal: true`). Zero outbound internet egress.
   - **Forge Apps**: Reside on `forge-apps-net`. Each app is responsible for its own egress security, outbound API keys, timeouts, and rate limits.
5. **Autonomous AI Agent Rules**:
   - Each submodule maintains its own `.agents/` and `AGENTS.md` specifying local guidelines and testing standards.
   - Main repo agents treat `forge-apps/*` as external submodule boundaries.

---

## 🔐 Submodule Environment & Auth Architecture

### Why `JWT_SECRET` is Not Used in Forge Micro-Apps
- **Asymmetric Token Delegation**: In SG Forge, the central Auth microservice (`apps/src/auth`) issues tokens signed asymmetrically. 
- **Trust-at-Ingress Boundary**: The Caddy API gateway terminates TLS, routes authenticated traffic, and protects internal networks (`forge-apps-net`). Submodules parse and decode claims from the session cookie (`forge_session`) without needing symmetric signing secrets (`JWT_SECRET`).
- **Zero Secret Sprawl**: Eliminating `JWT_SECRET` from submodules prevents secret leaks and ensures credential compromise cannot forge central auth tokens.

### Standalone vs Gateway Auth Redirection (`AUTH_SERVICE_URL`)
- **Production / Behind Gateway**: In production behind Caddy, micro-apps leave `AUTH_SERVICE_URL` empty (defaulting to relative `/auth/login`), providing seamless single-origin cookie routing.
- **Standalone Development**: When developing a Forge App independently without Caddy running, set `AUTH_SERVICE_URL=http://localhost:3000` to redirect unauthorized requests to the local central auth service.

### Canonical Submodule Environment Variables
| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `3010` | Standalone HTTP listen port |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development` \| `production`) |
| `CONTAINER_PREFIX` | Yes | `forge-app-template` | Docker container and volume name prefix |
| `APP_NAME` | Yes | `app-template` | Unique micro-app identifier |
| `AUTH_SERVICE_URL` | No | `""` | Auth service redirection base URL (empty behind Caddy) |
| `DATA_DIR` | No | `./data` | Local Turso SQLite data directory |
| `LOG_DIR` | No | `./logs` | Structured JSON log directory |
| `SESSION_COOKIE_NAME` | No | `forge_session` | Session authentication cookie name |
| `BRAND_NAME` | No | `SG Forge` | Display brand name in UI templates |
| `BRAND_DOMAIN` | No | `sgforge.local` | Platform host domain |

---

## 🛠️ Developer Workflow

### 1. Cloning Repository with Submodules
```bash
rtk git clone --recurse-submodules <repo-url>
# Or inside an existing clone:
rtk git submodule update --init --recursive
```

### 2. Developing Inside a Forge App Submodule
```bash
cd forge-apps/app-template
./run.sh dev       # Runs bun in watch mode
./run.sh test      # Runs 5-tier local tests
./run.sh build     # Builds standalone Docker container
```

### 3. Scaffolding a New Submodule App
```bash
rtk bun scripts/create-app.ts <app-name> "<Display Name>" "<Category>" "<Role>"
```
