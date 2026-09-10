# 🧰 CodeBurn - Lifetime AI Token & Spend Tracker

> **Zero Host Modification & Lifetime Repo Tracking (2026 LTS Baseline)**: CodeBurn is an open-source, local-first engine that tracks AI coding token spend and usage across 41 tools and agents (Claude Code, Cursor, Antigravity, Gemini, Codex, etc.). Integrated directly with SG Forge's persistent git-tracked token ledger (`logs/token-ledger.jsonl`), ensuring historical spend and token metrics **never reset to zero** across machines or environment migrations.

---

## 📦 Upstream Architecture & Provenance

- **Upstream Repository**: [github.com/getagentseal/codeburn](https://github.com/getagentseal/codeburn)
- **License**: Apache-2.0
- **Version**: `v0.9.24` (LTS 2026)
- **Executable Wrapper**: [`portables/bin/codeburn`](../bin/codeburn)
- **Host Modifications**: ZERO (`bun x --bun codeburn` uses portable Bun's Node 24 runtime).

---

## 🧠 Core Features in SG Forge

1. **Lifetime Repo Ledger (`logs/token-ledger.jsonl`)**:
   - Commits cumulative token consumption and cost data into Git.
   - Preserves historical records of input tokens, output tokens, cache hit tokens, model breakdown, and USD cost across migrations.
2. **Terminal Dashboard & Overview**:
   - Run `./run.sh tokens` to inspect formatted spend tables, active tool breakdown, and recent sessions.
3. **Interactive TUI**:
   - Run `./run.sh tokens tui` for the full interactive terminal dashboard with date range navigation and model breakdown.
4. **Automated Sync Engine (`scripts/sync-tokens.ts`)**:
   - Ingests Antigravity conversation transcripts and local session histories into the persistent ledger without duplicates.

---

## ⚡ CLI Usage & Commands

```bash
# 1. View lifetime token summary and spend
./run.sh tokens

# 2. Synchronize current session tokens into the lifetime ledger
./run.sh tokens sync

# 3. Launch interactive terminal TUI dashboard
./run.sh tokens tui

# 4. Direct CodeBurn CLI subcommands via wrapper
./portables/bin/codeburn status
./portables/bin/codeburn overview
./portables/bin/codeburn doctor
```
