---
trigger: always_on
description: Consult CodeBurn for lifetime repo token usage, AI spend tracking, and persistent session recording.
---

## codeburn

This project integrates CodeBurn (`getagentseal/codeburn`) alongside the persistent repo ledger (`logs/token-ledger.jsonl`) for lifetime token and spend tracking across machine migrations.

### Rules & Workflow:
1. **Lifetime Repo Token Ledger (`logs/token-ledger.jsonl`)**:
   - Every AI coding session's token consumption, model allocation, and cost must be recorded in `logs/token-ledger.jsonl`.
   - Never reset this ledger: it is committed to Git so that whenever this repository is cloned on any new machine, the full lifetime token history and spend remain intact.
2. **Session Sync & Observation**:
   - Before completing significant feature epics or at conversation conclusion, verify session token tracking with `rtk ./run.sh tokens sync`.
   - Use `rtk ./run.sh tokens` to inspect cumulative spend, model breakdown, and cache hit ratios.
3. **Interactive TUI**:
   - Use `rtk ./run.sh tokens tui` to launch the interactive CodeBurn terminal dashboard for granular date and tool filtering.
4. **Zero Host Alterations**:
   - The CLI runs strictly through the portable repo wrapper `portables/bin/codeburn` using Bun's isolated Node 24 runtime.
