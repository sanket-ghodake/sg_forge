# 💻 Cloud VS Code Workspaces (`@forge-apps/code`)

High-performance, single-seat cloud workstation microservice running on port `:8088` backed by an isolated Turso libSQL database (`apps/data/code.db`).

---

## 🏛️ Architectural Highlights & Features

1. **Native Server VS Code Integration**:
   - Directly attaches to the server's existing VS Code configuration and extensions (`~/.vscode/extensions`, `~/.config/Code/User`).
   - Automatically loads existing themes, custom keybindings, and pre-authenticated extensions (including **GitHub Copilot**).
2. **Single-Seat Remote Desktop Lock**:
   - Each cloned repository permits only **1 active session** at a time.
   - If a second user requests access, the active session is notified with a **60-second takeover countdown**.
   - If the active user does not respond within 60 seconds (or approves), the session is automatically transferred.
3. **Pristine Disk State & Discard-on-Exit**:
   - Any session disconnect, tab close, or takeover automatically triggers the Git Sanitizer worker (`git checkout -f && git reset --hard HEAD && git clean -fdx`).
   - Guarantees zero disk pollution on the host server.
4. **Platform SSO & Hierarchical RBAC**:
   - Authenticated via `@forge/sdk` `authGuard` using Ed25519 asymmetric session tokens.
   - Platform Superadmins hold global access across all repositories.
   - Project Admins can register server repos and grant developer access to employees.

---

## 🛠️ Routes & Endpoints

| Method | Endpoint | Description | Clearance |
| :--- | :--- | :--- | :--- |
| `GET` | `/apps/code` | Main Projects Catalog & Status Dashboard | Employee / Admin |
| `GET` | `/apps/code/ide/:id` | Fullscreen VS Code Workbench Session | Project Member / Admin |
| `GET` | `/apps/code/health` | Dual-probe health check (`livez`, `readyz`) | Public |
| `POST` | `/apps/code/api/projects` | Register cloned local repository | Superadmin |
| `GET` | `/apps/code/api/projects/:id/members` | List project members | Project Admin / Superadmin |
| `POST` | `/apps/code/api/projects/:id/members` | Grant employee project access | Project Admin / Superadmin |
| `DELETE` | `/apps/code/api/projects/:id/members/:userId` | Revoke employee access | Project Admin / Superadmin |
| `POST` | `/apps/code/api/session/takeover` | Initiate 60s takeover against active user | Authorized User |
| `POST` | `/apps/code/api/session/respond-takeover` | Active user allow/deny takeover | Active Session Owner |
| `POST` | `/apps/code/api/session/leave` | Exit session and trigger discard cleanup | Active Session Owner |
| `GET` | `/apps/code/api/session/heartbeat` | 5-second client heartbeat & takeover signal | Active Session Owner |

---

## 🛠️ Autonomous CLI & Toolchain

Operates with 100% autonomy through `./run.sh` (or `run.bat` on Windows):

```bash
# Development & Testing
./run.sh dev                 # Start local server in hot-reload watch mode
./run.sh test                # Run 5-tier test suites (unit, integration, security, contracts, e2e)
./run.sh verify              # Run 18-check pre-commit quality gate

# Code Context & AST Intelligence (Graft)
./run.sh graft skeleton <file>   # Inspect type interfaces and export signatures
./run.sh graft callers <symbol>  # Trace call hierarchies within submodule
./run.sh graft blast             # Audit working tree blast radius

# Lifetime AI Spend & Token Tracking (CodeBurn)
./run.sh tokens              # Display submodule lifetime token and spend dashboard
./run.sh tokens sync         # Ingest current session tokens into logs/token-ledger.jsonl
./run.sh tokens tui          # Launch interactive terminal TUI dashboard

# Context & Payload Compression (Headroom)
./run.sh headroom status     # Check compression engine health
./run.sh headroom compress <path> # Benchmark token reduction on logs/payloads
./run.sh headroom stats      # Historical compression savings report

# Submodule Worklog
./run.sh worklog "<summary>" # Atomically append task to logs/WORKLOGS.md
```

---

## 🧪 Testing Suite

Run the isolated 5-tier test suite:
```bash
rtk ./run.sh test
```
