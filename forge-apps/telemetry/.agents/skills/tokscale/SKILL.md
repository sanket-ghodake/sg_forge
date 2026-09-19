---
name: tokscale
description: "Use Tokscale and the micro-app token ledger (logs/token-ledger.jsonl) to inspect AI coding token spend and model usage for this submodule."
---

# /tokscale

Local-first AI token & spend tracker scoped strictly to this micro-app submodule.

## Usage

```bash
# View micro-app isolated token summary table
rtk ./run.sh tokens

# Synchronize verified tokens to logs/token-ledger.jsonl
rtk ./run.sh tokens sync

# Launch interactive terminal TUI dashboard
rtk ./run.sh tokens tui

# Inspect detected local IDE scan directories
rtk ./run.sh tokens clients
```
