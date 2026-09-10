# AI AGENT DIRECTIVES - FORGE MICRO-APP SUBMODULE (2026 CLEAN ARCHITECTURE)

> ⚠️ **CRITICAL SUBMODULE GOVERNANCE NOTICE FOR ALL AI SESSIONS & LLMs**
> This repository is an INDEPENDENT, STANDALONE FORGE MICRO-APP SUBMODULE.
> It can operate, build, test, and be deployed completely autonomously without the main SG Forge monorepo.
> Every session agent MUST adhere to these inherited rules without exception.

---

## ⚡ 1. PRE-FLIGHT & PRE-COMMIT VERIFICATION GATE (14 CHECKS)
Before writing code, running commands, or staging changes in this microservice:
1. [ ] **Command Execution via Submodule Runner**: Prefer `./run.sh test`, `./run.sh dev`, `./run.sh verify`, or prefix with `rtk` if installed.
2. [ ] **Zero Monorepo Bleed**: All files, code, and dependencies MUST be self-contained within this repository. ZERO relative traversal imports to `../../apps/src/*` or central monorepo folders.
3. [ ] **500-Line Soft File Cap**: Source files must remain cohesive and **$\le 500$ lines** ($\le 300$ lines ideal).
4. [ ] **Astryx UI Tokens**: User interfaces MUST strictly use Astryx tokens and CSS variables (`--forge-*`). ZERO OS/browser defaults (slim scrollbars, styled custom dropdowns, no raw `alert()`/`confirm()`).
5. [ ] **Dedicated Turso DB Isolation**: Operates exclusively with its own local database in `data/<app>.db` via `getDatabaseClient`. Querying another app's DB or central DBs is strictly forbidden.
6. [ ] **Autonomous Outbound Network & Egress Security**:
   - The central platform core is strictly **AIR-GAPPED** (`internal: true`).
   - This micro-app operates on `forge-apps-net` and is **100% responsible for its own outbound calls** (e.g. external payment APIs, webhooks, LLM APIs).
   - All outbound calls must enforce timeouts, retries, and strict secret protection (credentials in `.env`, never in code).
7. [ ] **5-Tier Microservice Test Governance**: Maintain all 5 test tiers in `test/` (`unit/`, `integration/`, `security/`, `contracts/`, `e2e/`). Run via `./run.sh test`.
8. [ ] **Centralized Logging & RFC 7807 Error Boundaries**: Use local `createLogger` and `createSafeHandler` from `./src/lib/sdk`. Return RFC 7807 problem responses with trace IDs.
9. [ ] **ABSOLUTE ZERO AUTO-COMMITS (HARD BLOCKED)**: AI agents are STRICTLY FORBIDDEN from running `git commit` unless the user explicitly types `"commit changes"` or `"git commit"` in the CURRENT prompt.
10. [ ] **Per-Conversation Worklog Auto-Update**: At the end of every task, append strictly ONE line to `logs/WORKLOGS.md` (`YYYY-MM-DD HH:mm | <summary>`) via `./run.sh worklog "<summary>"`.
11. [ ] **Lifetime Submodule Token Ledger**: Track session tokens and spend in `logs/token-ledger.jsonl` via `./run.sh tokens sync`.
12. [ ] **Code Context & Dependency Graph (Graft)**: Inspect symbols and signatures via `./run.sh graft skeleton <file>` or `./run.sh graft callers <symbol>` before editing.
13. [ ] **Context Compression (Headroom)**: Compress large payloads or logs before prompting via `./run.sh headroom compress <file>`.
14. [ ] **System Traceability & Living Documentation**: Maintain colocated documentation in `docs/` (`docs/hlr/`, `docs/llr/`, `README.md`). All exported functions must carry `@requirements [LLR-...]` TSDoc tags. Local diagrams must use the `diagram-design` standard.

---

## 🛠️ LOCAL TECH STACK & TOOLCHAIN
- **Runtime**: Bun (portable or local system)
- **Database**: Local Turso libSQL (`bun:sqlite`) in WAL mode
- **Container**: Standalone Alpine-based container (`docker/Dockerfile`) with `context: .`
- **Testing**: Bun Test (`./run.sh test`)
- **Quality Gate**: Pre-commit quality gate (`./run.sh verify`)
- **Code Context**: Graft (`./run.sh graft`)
- **Spend Tracking**: CodeBurn & Lifetime Ledger (`./run.sh tokens`)
- **Context Compression**: Headroom (`./run.sh headroom`)
- **Hooks**: Versioned Git hooks in `.githooks/` activated via `./run.sh setup-hooks`

---

## 🧭 LOCAL SUBMODULE STRUCTURE
```text
.
├── .agents/                    # Autonomous AI agent rules & skills
│   ├── rules/                  # Domain rules (core, security, testing, graft, codeburn, headroom)
│   └── skills/                 # Tool workflows (graft, codeburn, headroom)
├── .githooks/                  # Pre-commit gate & post-commit logger
├── docker/
│   └── Dockerfile              # Standalone build (context: .)
├── docker-compose.yml          # Standalone local development compose
├── logs/
│   ├── WORKLOGS.md             # Submodule conversation worklog
│   ├── commits.jsonl           # Ground-truth commit ledger
│   └── token-ledger.jsonl      # Lifetime token & spend ledger
├── portables/bin/              # Self-resolving CLI wrappers (rtk, graft, codeburn, headroom)
├── scripts/
│   ├── verify-gate.ts          # Standalone 18-check quality gate
│   ├── log-commit.ts           # Ground-truth commit extractor
│   ├── sync-ignores.ts         # Ignore synchronization
│   ├── sync-tokens.ts          # Token ledger synchronizer
│   ├── display-tokens.ts       # Token dashboard renderer
│   ├── headroom-runner.ts      # Context compression runner
│   └── append-worklog.ts       # Atomic worklog appender
├── src/
│   ├── db/                     # Isolated Turso libSQL database instance
│   ├── lib/                    # Standalone micro-SDK, Astryx UI, and types
│   └── server.ts               # Microservice HTTP server
├── test/                       # 5-tier test suites
├── package.json                # Independent package dependencies
├── tsconfig.json               # Standalone TypeScript compiler settings
└── run.sh                      # Unified CLI orchestrator
```

---

## 🧭 DOMAIN RULE ROUTER
- **Core Directives**: [`.agents/rules/core.md`](file:///.agents/rules/core.md)
- **Security & Air-Gap**: [`.agents/rules/security.md`](file:///.agents/rules/security.md)
- **5-Tier Testing Rigor**: [`.agents/rules/testing.md`](file:///.agents/rules/testing.md)
- **Code Context Graph (Graft)**: [`.agents/rules/graft.md`](file:///.agents/rules/graft.md)
- **Lifetime Token Ledger (CodeBurn)**: [`.agents/rules/codeburn.md`](file:///.agents/rules/codeburn.md)
- **Context Compression (Headroom)**: [`.agents/rules/headroom.md`](file:///.agents/rules/headroom.md)
