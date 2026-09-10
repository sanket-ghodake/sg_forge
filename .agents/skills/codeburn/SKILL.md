---
name: codeburn
description: "Use CodeBurn and the persistent repo token ledger (logs/token-ledger.jsonl) to track lifetime AI coding token spend, model breakdown, and session waste across all machines."
---

# /codeburn

Local-first AI token & spend tracker integrated with SG Forge's git-tracked lifetime token ledger.

## When to use
- Checking lifetime repository AI coding token consumption and dollar spend (`rtk ./run.sh tokens`)
- Synchronizing current session tokens and transcripts into the persistent ledger (`rtk ./run.sh tokens sync`)
- Launching the interactive terminal TUI dashboard (`rtk ./run.sh tokens tui`)
- Auditing session waste and prompt token overhead (`rtk ./portables/bin/codeburn optimize`)

## Usage

```bash
# View formatted repository lifetime token summary table
rtk ./run.sh tokens

# Synchronize current session tokens to logs/token-ledger.jsonl
rtk ./run.sh tokens sync

# Launch interactive terminal TUI dashboard
rtk ./run.sh tokens tui

# Inspect raw session export
rtk ./portables/bin/codeburn status
```
