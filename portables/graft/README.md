# 🌿 Standalone Graft Context Graph Engine (`portables/graft/`)

Fast, deterministic code context and symbol dependency graph layer for AI coding agents (2026 LTS).

---

## 📖 Overview

**Graft** (`@nanonets/graft`) provides AI agents with fine-grained symbol-level call graphs, API skeletons, and instant working-tree freshness without burning tokens through repeated file grepping.

Within **SG Forge**, Graft is integrated as a zero-host-modification portable toolchain component. It operates locally within the repository boundary and hard-disables all remote telemetry by default.

---

## 🏛️ Dual-Graph Architecture

SG Forge maintains a clear separation between microscopic and macroscopic knowledge graphs:

| Scope | Tool | Role & Use Case |
| :--- | :--- | :--- |
| **Microscopic (Code & Symbol)** | **Graft** (`graft`) | AST symbol call graphs (`callers`), API contract extraction (`skeleton`), blast radius (`blast`), and task-to-code routing (`ask`). Re-indexed structurally in ~3ms across working tree. |
| **Macroscopic (Architecture & Docs)** | **Graphify** (`graphify`) | System architecture comprehension, Louvain community clustering, Obsidian vault generation, and multimodal analysis (Markdown docs, PDF research papers, Whisper audio). |

---

## ⚡ Core Commands

All commands can be run directly via `./run.sh graft [command]` or `./portables/bin/graft [command]`:

```bash
# Build deterministic Tier 1 wiring graph ($0, no external API keys required)
./run.sh graft build

# Show token-budgeted repository map (hotspots, hubs, directory clusters)
./run.sh graft map

# Show symbol call hierarchy (who calls X, or what does X call)
./run.sh graft callers <symbol>
./run.sh graft callers <symbol> --direction out
./run.sh graft callers <symbol> --depth 3

# Signatures-only view of a file (API surface without bodies to save context tokens)
./run.sh graft skeleton <path/to/file.ts>

# Query the graph for relevant files and lines for a task
./run.sh graft ask "<task description>"

# Assess blast radius of current git diff (Mermaid PR comment output)
./run.sh graft blast --format markdown

# Verify graph freshness in CI / pre-commit
./run.sh graft check
```

---

## 🔒 Enterprise Privacy & Telemetry Guard

- **Zero Host Modification**: Uses repo-local toolchain wrappers (`portables/bin/graft`); never requires global npm/apt/brew packages.
- **Strict Privacy**: Telemetry is hard-disabled via `GRAFT_TELEMETRY=0` and `DO_NOT_TRACK=1` in the portable wrapper.
- **Cache Isolation**: Generated `graft/` files are treated as ephemeral local caches and ignored across all 7 canonical ignore files.
