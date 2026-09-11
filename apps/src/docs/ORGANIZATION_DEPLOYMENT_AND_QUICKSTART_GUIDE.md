# SG Forge - Organization Deployment & Quickstart Guide (2026 LTS)

> 📖 **Canonical Documentation Location:**
> This guide is actively published and maintained in the Living Documentation Portal:
> 👉 [`deployment-quickstart.mdx`](./src/content/docs/operations/deployment-quickstart.mdx) (Live Portal: `/docs/operations/deployment-quickstart`)

---

## 📋 System Prerequisites

| Component | Requirement | Purpose |
| :--- | :--- | :--- |
| **Operating System** | Linux (Ubuntu/Debian/RHEL/Alpine), macOS, or Windows WSL2 | Host platform |
| **Container Engine** | Docker Engine 24.0+ & Docker Compose v2.20+ | Production microservice isolation |
| **Host Toolchain** | **Zero host dependencies required** | Runtimes (`bun`, `rtk`, etc.) are bundled portably |
| **Network Ports** | Port `80` (HTTP) and Port `443` (HTTPS) | Public reverse proxy gateway ingress |

---

## ⚡ 3-Step Production Quickstart

### Step 1: Clone the Repository
```bash
git clone <your-organization-repo-url> sg-forge
cd sg-forge
```

### Step 2: Configure Organization Environment (`.env`)
Create your active configuration from the template:
```bash
cp .env.example .env
```

Open `.env` and configure your organization's identity and security keys:

```bash
# 🏢 Organization Identity & White-Labeling (SVG/PNG/WebP, Zero Git Drift)
NEXT_PUBLIC_BRAND_NAME="Acme Corporation"
NEXT_PUBLIC_ORG_NAME="Acme Corp"
NEXT_PUBLIC_BRAND_SHORT="ACME"
NEXT_PUBLIC_BRAND_TAGLINE="Internal Enterprise Workspace & App Hub"
NEXT_PUBLIC_BRAND_LOGO_URL="/brand/logo.png"
NEXT_PUBLIC_BRAND_FAVICON_URL="/favicon.ico"
AUTH_ORG_DOMAIN="acme.internal"
PUBLIC_DOMAIN="portal.acme.com"
SUPPORT_EMAIL="it-support@acme.com"

# 🔒 Cryptographic Secrets (Generate with: openssl rand -hex 32)
JWT_SECRET="replace-with-a-random-32-character-secret-key-for-jwt"
DEV_DASHBOARD_PASSWORD="replace-with-a-strong-12-plus-char-operator-password"
DATA_ENCRYPTION_KEY="replace-with-a-random-32-char-aes256-encryption-key"
BLIND_INDEX_SALT="replace-with-a-random-32-char-salt-key-for-hashes"

# 🔀 Ports & Runtime Mode
NODE_ENV="production"
APP_ENV="production"
PROD_HTTP_PORT="80"
PROD_HTTPS_PORT="443"
```

### Step 3: Bootstrap & Launch Production Stack
```bash
# Bootstrap portable runtimes & sync configuration
./run.sh setup

# Launch production microservices & proxy gateway
./run.sh prod
```

*Alternatively, run directly with Docker Compose:*
```bash
docker compose -p ag_dashboard-prod --env-file .env -f docker/prod/docker-compose.yml --profile all up -d --build
```

---

## 🌐 Ingress Routing & Service Endpoints

All services are accessible through a single port via the Caddy reverse proxy:

| Endpoint Route | Service | Description | Access Tier |
| :--- | :--- | :--- | :--- |
| `http://localhost/` | Landing Hub | Platform discovery, status, and navigation hub | Public |
| `http://localhost/portal` | Portal SPA | Unified organizational workspace & interactive Org Canvas | Authenticated |
| `http://localhost/auth/login` | Central IAM | Branded single sign-on, session manager & password reset | Public / Auth |
| `http://localhost/devcenter` | Dev Dashboard | Container observability, telemetry, and live error triage | Admin / Dev |
| `http://localhost/gateway` | Dev Hub | SDK documentation, API specs & integration sandbox | Developer |
| `http://localhost/apps/billing` | Billing App | Invoicing, client ledger, and subscription tracking | Finance / Admin |
| `http://localhost/apps/expenses` | Expenses App | Employee expense submission & multi-level approvals | Employee / Mgr |
| `http://localhost/apps/telemetry` | Telemetry App | Real-time platform resource & load telemetry | Public / Ops |

---

## 🔐 First-Time Login & Default Personas

On first boot, the Central Identity service (`auth`) automatically seeds the organization structure and provides standard test personas (default password: `password123` with forced password update on first login):

* **Super Admin**: `superadmin@<AUTH_ORG_DOMAIN>` (Full administrative access)
* **Finance Lead**: `finlead@<AUTH_ORG_DOMAIN>` (Billing & invoice management)
* **Engineering Manager**: `engmanager@<AUTH_ORG_DOMAIN>` (App deployment & approvals)
* **Standard Employee**: `employee@<AUTH_ORG_DOMAIN>` (Standard portal user)

---

## 🛡️ Production Reliability & Automated Safeguards

### 1. Dedicated Turso Database Isolation
Every microservice maintains an isolated Turso/SQLite database instance (`auth.db`, `portal.db`, `billing.db`, `expenses.db`, `telemetry.db`, `platform_core.db`) stored in dedicated Docker volumes (`ag_prod_db_*`). Microservices never share or access each other's databases.

### 2. Automated Hourly Database Snapshots (`db-backup`)
The continuous backup daemon automatically:
* Creates atomic, live-safe snapshots using SQLite `VACUUM INTO` (zero locks, zero table locking).
* Executes `PRAGMA integrity_check` on all snapshots.
* Rotates backups based on retention policy (default: 7 days / 168 hours in `backups/db/`).
* Manually trigger on-demand snapshot: `./run.sh backup`

### 3. Container Watchdog (`autoheal`)
Monitors health probe contracts across all microservices. If any container becomes unresponsive or fails 3 consecutive health checks, it is gracefully restarted with zero human intervention.

### 4. Client-Side Offline Outage Resilience
The universal Service Worker pre-caches an air-gapped branded system error page on the user's first visit. If network connectivity drops or the host gateway restarts, users see a branded offline page instead of browser connection error screens.

---

## 🛠️ Management & Diagnostic Operations

```bash
# Check status and health of all microservice containers
./run.sh status --prod

# Tail centralized logs from all production containers
./run.sh logs --prod

# Tail logs for a specific service (e.g. auth, portal, proxy)
./run.sh logs --prod auth

# Run 27-point architectural verification gate
./run.sh verify

# Restart a specific service
./run.sh restart auth --prod

# Gracefully shut down the entire production stack
./run.sh down
```
