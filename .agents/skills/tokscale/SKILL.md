---
name: tokscale
description: "Use Tokscale and the persistent repo token ledger (logs/token-ledger.jsonl) to track lifetime AI coding token spend, model breakdown, and cache hit ratios for this repository."
---

# /tokscale

Local-first, cross-IDE AI token & spend tracker integrated with SG Forge's git-tracked lifetime token ledger.

## When to use
- Checking lifetime repository AI coding token consumption and dollar spend (`rtk ./run.sh tokens`)
- Synchronizing verified repository token metrics into the persistent ledger (`rtk ./run.sh tokens sync`)
- Launching the interactive terminal TUI dashboard (`rtk ./run.sh tokens tui`)
- Inspecting detected local IDE clients (Cursor, Antigravity, Claude Code, Copilot, etc.) (`rtk ./run.sh tokens clients`)
- Exporting repository-isolated metrics as JSON (`rtk ./run.sh tokens json`)

## Usage

```bash
# View repository-isolated token summary table (zero foreign project bleed)
rtk ./run.sh tokens

# Synchronize verified repository tokens to logs/token-ledger.jsonl
rtk ./run.sh tokens sync

# Launch interactive terminal TUI dashboard
rtk ./run.sh tokens tui

# Inspect active local IDE scan directories
rtk ./run.sh tokens clients

# View machine-wide token metrics across all projects
rtk ./run.sh tokens all
```
