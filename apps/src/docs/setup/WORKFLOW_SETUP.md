# Developer Setup Guide — Org Website (2026 Standalone Stack)

> **Who is this for?**
> This guide is written for developers and AI agents working on **Org Website**. It documents the 2026 technology stack, standalone portable runtime management, environment scripts, and static analysis tools.

---

## 1. 2026 Technology Stack Overview

| Component | Framework / Technology | Version (2026 Baseline) | Standalone Location |
| :--- | :--- | :--- | :--- |
| **JS / TS Engine** | Portable Bun Runtime | **v1.3.14 LTS** | `portables/bun/bin/bun` |
| **Frontend Framework** | Next.js App Router | **v16.2.9** | `node_modules/next` |
| **UI Library** | React 19 / Astryx UI | **v19.2.4** | `@forge/ui` |
| **ORM & Database** | Drizzle ORM + Turso / libSQL | **v0.45.2** | Dedicated Turso DB per app |
| **Doc Generator** | Astro Starlight + Pagefind | **v0.32+** | `apps/src/docs` |
| **Type Checker** | TypeScript Strict | **v5.6.3** | `node_modules/typescript` |

---

## 2. Portable Runtimes & Zero-Host-Pollution Strategy

To ensure reproducible builds across different development environments without host OS package conflicts, SG Forge utilizes standalone portable runtimes:

- **Bun Runtime (`bun`)**: Portable JavaScript / TypeScript execution engine and package manager stored in `portables/bun/bin/bun`.
- **Portable Executables & Wrappers (`portables/bin/`)**: 34 standalone binary distributions isolated inside repository folders (RTK, Caveman, Graft, CodeBurn, Headroom, Lizard, SCC, Biome, Knip, Gitleaks, etc.).
- **Zero Host Pollution**: All setup and run commands automatically target these repository-local environments without requiring `apt`, `brew`, `npm -g`, or `pip install`.

---

## 3. Standalone 1-Command Setup

### Linux, macOS & WSL2
```bash
./run.sh setup
./run.sh dev
```

### Windows Native (CMD & PowerShell)
```cmd
run.bat setup
run.bat dev
```

The `setup` command automatically:
1. Hardens execution permissions on all portable binaries (`chmod +x`).
2. Configures Git to prevent cross-platform CRLF drift (`core.autocrlf false`) and filemode permission drift (`core.filemode false`).
3. Installs monorepo workspace dependencies via `$PORTABLE_BUN install`.
4. Synchronizes canonical ignore files and `.gitattributes` across the monorepo (`scripts/sync-ignores.ts`).
5. Generates local development TLS certificates and Caddy ingress reverse proxy mappings.
6. Synchronizes autonomous Git submodules in `forge-apps/`.
7. Seeds initial SQLite / Turso databases (`apps/data/auth.db`) if not already provisioned.
8. Builds the Graft Tier 1 code context graph and initializes the lifetime token ledger.

---

## 4. Standalone Code Analysis, Benchmarking & Tooling Setup

All code analysis, benchmarking, design system, and token optimization tools are installed strictly isolated inside `./portables/bin/` with ZERO system/host machine dependencies:

| Tool | Purpose | Executable Path | Execution Example |
| :--- | :--- | :--- | :--- |
| [**`scc`**](https://github.com/boyter/scc) | Code Statistics & Language Breakdown | `./portables/bin/scc` | `./portables/bin/scc .` |
| [**`lizard`**](https://github.com/terryyin/lizard) | Cyclomatic Complexity Analyzer (CCN ≤ 10) | `./portables/bin/lizard` | `./portables/bin/lizard -C 10 core/ packages/` |
| [**`tree`**](https://github.com/Old-Man-Programmer/tree) | Project Hierarchy Visualizer | `./portables/bin/tree` | `./portables/bin/tree -L 3` |
| [**`hyperfine`**](https://github.com/sharkdp/hyperfine) | Build & Test Benchmarker | `./portables/bin/hyperfine` | `./portables/bin/hyperfine 'bun test test/unit'` |
| [**`ctop`**](https://github.com/bcicen/ctop) | Real-Time Container Resource Telemetry | `./portables/bin/ctop` | `./run.sh top` |
| [**`astryx`**](../../ui) | Meta Design System CLI | `./portables/bin/astryx` | `./portables/bin/astryx status` |
| [**`caveman`**](../../../../portables/caveman) | Token Compression CLI | `./portables/bin/caveman` | `./portables/bin/caveman status` |
| [**`graphify`**](https://github.com/safishamsi/graphify) | Architecture & Knowledge Graph Engine | `./portables/bin/graphify` | `./run.sh graphify` |
| [**`graft`**](https://github.com/trailhq/Graft) | Code Context & Symbol Dependency Graph | `./portables/bin/graft` | `./run.sh graft map` |
| [**`codeburn`**](https://github.com/getagentseal/codeburn) | Lifetime AI Token & Spend Tracker | `./portables/bin/codeburn` | `./run.sh tokens` |
| [**`headroom`**](https://github.com/headroomlabs-ai/headroom) | Context & Prompt Compression Engine | `./portables/bin/headroom` | `./run.sh headroom status` |
| [**`council`**](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584) | Council of AI Multi-Agent Decision Framework | `./portables/bin/council` | `./run.sh council "<topic>"` |

### Tooling Execution Examples:

```bash
# 1. Code Statistics & SLOC breakdown
./portables/bin/scc .

# 2. Function Cyclomatic Complexity check
./portables/bin/lizard -C 10 core/ packages/

# 3. Project Directory Visualizer
./portables/bin/tree -L 3

# 4. Command Benchmark
./portables/bin/hyperfine --runs 3 './portables/bin/scc .'

# 5. Symbol Callers & API Skeletons (Graft)
./run.sh graft callers <symbol>
./run.sh graft skeleton <path/to/file.ts>
```


---

## 5. Worklog Audit System & Hooks

The workspace implements a token-efficient, git-tracked audit trail in `logs/WORKLOGS.md`.

- **Log Appender Hook**: `./.agents/hooks/append-log.sh`
- **Usage**:
  ```bash
  ./.agents/hooks/append-log.sh "installed standalone dependencies and configured agent rules"
  ```
- **Log Format**: `YYYY-MM-DD HH:mm | <brief summary>`

---

## 6. Multi-IDE Instruction Synchronization

To ensure AI agent behavior is identical across Antigravity, Claude Code, GitHub Copilot, Cursor, and OpenCode:

- Master file: `AGENTS.md`
- Synchronization command:
  ```bash
  chmod +x .agents/scripts/sync-agent-instructions.sh
  ./.agents/scripts/sync-agent-instructions.sh
  ```

---

## 7. Development & Quality Gate Commands Summary

```bash
# Run local dev environment
./run.sh dev

# Run 27-Check Pre-Commit Verification Gate
./run.sh verify

# Run 5-Tier microservice tests
./run.sh test

# Audit dependencies against Google OSV vulnerability database
./run.sh vuln

# Audit container manifests and configurations with Trivy
./run.sh trivy

# Verify an external package before installation (Anti-Slopsquatting)
./run.sh check-pkg <pkg>

# Lint OpenAPI 3.1 contracts with Spectral
./run.sh contracts

# Audit function complexity (CCN <= 10) with Lizard
./run.sh complexity

# Audit workspace dependency licenses against OSI allowlist
./run.sh licenses

# Generate CycloneDX 1.5 SBOM with Syft
./run.sh sbom

# Append task summary to worklogs
rtk bun scripts/append-worklog.ts "your log message"
```
