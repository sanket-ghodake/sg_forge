# 🌐 Custom Landing Page Starter Base (`@forge/landing-custom`)

A production-ready starter baseline and zero-drift customization framework designed for building custom organizational landing pages with **zero Git conflicts**, a **Zero Git Dirty Policy**, and **frictionless upstream platform pulls (`git pull upstream main`)**.

---

## 🛑 The "Zero Git Dirty" Invariant

When downstream organizations fork or clone SG Forge, they frequently need a custom corporate marketing page at the root route (`/`).

### Why Direct Edits Cause Upstream Pull Friction
If you directly modify tracked files like `apps/src/landing-custom/src/template.html.ts`:
- Your Git tree becomes **dirty** (`git status` shows modified files).
- When SG Forge releases updates, running `git pull upstream main` (or `git pull origin main`) triggers **merge conflicts** or errors:
  ```text
  error: Your local changes to the following files would be overwritten by merge:
         apps/src/landing-custom/src/template.html.ts
  ```

### The SG Forge Zero-Drift Solution
SG Forge provides **four zero-friction workflows** where you never dirty Git-tracked files, allowing you to pull upstream platform updates at any time with 100% clean merges.

---

## 🎯 The 4 Zero-Drift Customization Workflows

```
                           Incoming Request (GET /)
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   SG Forge Caddy Gateway  │
                        │    (proxy/Caddyfile)      │
                        └─────────────┬─────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
     [Strategy B: .env]       [Strategy C: Submodule] [Strategy A: In-Repo]
     APP_LANDING points       External container on   apps/src/landing-custom
     to external site or      port 3000/8080 from     (auto-detects custom/)
     custom container URL     custom-landing/ (ignored)    │
                                                           ▼
                                              ┌─────────────────────────┐
                                              │  Resolution Cascade:    │
                                              │  1. custom/index.html   │
                                              │  2. custom/template.ts  │
                                              │  3. Default template.ts │
                                              └─────────────────────────┘
```

---

### Strategy 1: Drop-In Override Folder (`custom/`) — Recommended for In-Repo Customization

The fastest and cleanest in-repo customization method.

1. **Create the Git-Ignored Directory**:
   ```bash
   mkdir -p apps/src/landing-custom/custom
   ```
   *(Note: `apps/src/landing-custom/custom/` is globally ignored in `.gitignore`, so Git will never track it).*

2. **Option A: Static HTML/CSS/JS (Exported Site)**:
   Place your static website directly inside `custom/`:
   ```text
   apps/src/landing-custom/custom/
   ├── index.html        <-- Main landing page HTML
   ├── style.css         <-- Automatically served via /custom/style.css
   └── logo.png          <-- Automatically served via /custom/logo.png
   ```
   The server auto-detects `custom/index.html` and serves it instantly with secure path traversal protection.

3. **Option B: TypeScript Dynamic Template**:
   Create `apps/src/landing-custom/custom/template.ts`:
   ```typescript
   export function renderCustomLandingHtml(): string {
     return `<!DOCTYPE html>
     <html>
       <head><title>Acme Corporation</title></head>
       <body>
         <h1>Welcome to Acme Enterprise</h1>
         <a href="/portal">Launch Workspace &rarr;</a>
       </body>
     </html>`;
   }
   ```

4. **Verify Zero Git Dirty**:
   ```bash
   rtk git status
   # Output: working tree clean (nothing to commit)
   ```

---

### Strategy 2: Declarative Ingress via `.env` (Zero Monorepo Code)

Because `.env` is already in `.gitignore`, you can redirect root traffic without writing any files in the monorepo:

1. **Point to an External Marketing Website**:
   ```env
   # In .env: Proxies root '/' to your corporate CMS (Webflow, Framer, WordPress)
   APP_LANDING="Corporate Site|443|/|Marketing|Public Ingress|https://marketing.acme.corp"
   ```

2. **Point to a Separate Microservice or Container**:
   ```env
   # In .env: Routes root '/' to an independent container running on port 8080
   APP_LANDING="Custom Landing|8080|/|Marketing|Public Ingress|acme-landing-container"
   ```

3. **Bypass Landing Page Directly to `/portal`**:
   ```env
   # In .env: Root '/' permanently redirects to '/portal'
   DISABLE_LANDING="true"
   ```

4. **Regenerate Ingress Gateway**:
   ```bash
   rtk ./run.sh sync-proxy
   ```

---

### Strategy 3: Autonomous Git Submodule (`custom-landing/`)

If your marketing team maintains their landing page in a dedicated private Git repository:

1. **Clone into the Git-Ignored Root Directory**:
   ```bash
   git clone https://github.com/my-org/marketing-site.git custom-landing
   ```
   *(Note: `custom-landing/` is globally ignored in `.gitignore`).*

2. **Or Add as a Submodule with `ignore = all`**:
   ```bash
   git submodule add https://github.com/my-org/marketing-site.git custom-landing
   git config submodule.custom-landing.ignore all
   ```
   With `ignore = all`, Git will ignore all local commits and working-tree changes inside the submodule during main repo operations.

---

### Strategy 4: In-Place Editing with Git Skip-Worktree Tooling

If your workflow requires modifying `apps/src/landing-custom/src/template.html.ts` in-place:

1. **Lock tracking before editing**:
   ```bash
   rtk ./run.sh lock-landing
   # Output: 🔒 [Asset Lock] Successfully locked landing files (skip-worktree)
   ```
2. **Edit `template.html.ts`** with your company's content.
3. **Verify Git status**:
   ```bash
   rtk git status
   # Output: working tree clean (nothing to commit)
   ```
4. **Before pulling upstream updates**:
   ```bash
   # Temporarily unlock to merge upstream updates cleanly
   rtk ./run.sh unlock-landing
   rtk git pull upstream main
   rtk ./run.sh lock-landing
   ```

---

## 🚀 Quickstart & Local Development

### 1. Run Standalone
```bash
cd apps/src/landing-custom
bun run dev
# Server running at http://localhost:3000
```

### 2. Connect to SG Forge Gateway (`.env`)
To have Caddy reverse-proxy root traffic (`/`) to this custom landing service:
```env
APP_LANDING="Custom Landing|3000|/|Platform Services|Public Ingress|landing-custom"
```
Then regenerate proxy and start the stack:
```bash
rtk ./run.sh sync-proxy
rtk ./run.sh dev
```

---

## 📁 Directory Structure

```text
apps/src/landing-custom/
├── custom/                 # [GIT-IGNORED] Drop-in custom static site or template
│   ├── index.html          # (Priority 1) Static landing HTML
│   └── template.ts         # (Priority 2) Custom TS template generator
├── docker/
│   ├── Dockerfile          # Multi-stage production container build
│   └── README.md
├── README.md               # This developer and architecture guide
├── package.json            # Workspace package manifest (@forge/landing-custom)
├── logs/                   # Isolated runtime logs directory
│   ├── .gitignore
│   └── README.md
├── src/
│   ├── README.md
│   ├── server.ts           # Standalone Bun HTTP server with custom/ cascade
│   └── template.html.ts    # (Priority 3) Baseline Astryx starter template
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

---

## 🧪 5-Tier Test Verification

Run all test tiers to verify health, routing, security, and fallback cascade:
```bash
rtk bun test apps/src/landing-custom/test
```
