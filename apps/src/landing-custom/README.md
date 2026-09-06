# 🌐 Custom Landing Page Starter Base (`apps/src/landing-custom/`)

A production-ready starter template designed for building custom organizational landing pages with **zero Git conflicts** and **zero main repository drift**.

---

## 🎯 Architecture: Workspace Integration & Custom Landing Option

This directory provides an alternative, customizable organizational landing page for SG Forge.

---

## 🚀 Quickstart & Local Development

### 1. Run Standalone
```bash
cd apps/src/landing-custom
bun run dev
# Server running at http://localhost:3000
```

### 2. Connect to SG Forge Gateway (`.env`)
To have the Caddy reverse proxy route root traffic (`/`) to this custom landing page, update `.env`:

```env
APP_LANDING="Custom Landing|3000|/|Platform Services|Public Ingress|landing-custom"
```

Then regenerate the proxy or start the platform:
```bash
./run.sh sync-proxy
./run.sh dev
```

---

## 🐳 Docker Deployment

Build and run via SG Forge portable docker tooling:
```bash
./run.sh docker build landing-custom
```

Or build manually:
```bash
docker build -t custom-landing:latest -f apps/src/landing-custom/docker/Dockerfile .
```

---

## 📁 Directory Structure
```
apps/src/landing-custom/
├── docker/
│   ├── Dockerfile          # Production container build
│   └── README.md
├── README.md               # Developer guide
├── package.json            # Workspace package definition (@forge/landing-custom)
├── logs/                   # Isolated runtime logs directory
│   ├── .gitignore
│   └── README.md
├── src/
│   ├── README.md
│   ├── server.ts           # Standalone Bun HTTP server
│   └── template.html.ts    # Astryx responsive HTML template
└── test/
    ├── README.md           # 5-Tier test suite governance
    ├── unit/
    │   ├── README.md
    │   └── landing-custom.test.ts
    ├── integration/
    │   ├── README.md
    │   └── landing-custom-routing.test.ts
    ├── security/
    │   ├── README.md
    │   └── landing-custom-security.test.ts
    ├── contracts/
    │   ├── README.md
    │   └── landing-custom-health.test.ts
    └── e2e/
        ├── README.md
        └── landing-custom-e2e.test.ts
```
