---
trigger: always_on
description: Consult Tokscale for micro-app scoped lifetime AI token usage, spend tracking, and persistent ledger recording.
---

## tokscale

This autonomous micro-app submodule integrates Tokscale (`junhoyeo/tokscale`) alongside its isolated repo ledger (`logs/token-ledger.jsonl`) for accurate, cross-IDE, zero-API-key lifetime token and spend tracking.

### Rules & Workflow:
1. **Micro-App Submodule Isolation**:
   - Running `rtk ./run.sh tokens` uses `scripts/tokscale-runner.ts` to filter sessions strictly to this micro-app's directory.
   - Zero token bleed from central platform apps or other Forge apps.
2. **Local Token Ledger (`logs/token-ledger.jsonl`)**:
   - Metrics (input, output, cache reads, reasoning, and cost) are stored in `logs/token-ledger.jsonl`.
   - Committed to Git so historical spend is preserved when the submodule is cloned independently.
3. **Commands**:
   - `rtk ./run.sh tokens`: View micro-app scoped token summary.
   - `rtk ./run.sh tokens sync`: Sync latest verified token records.
   - `rtk ./run.sh tokens tui`: Open interactive Tokscale dashboard.
   - `rtk ./run.sh tokens clients`: Show detected local IDE storage roots.
4. **Zero Host Alterations**:
   - Executes strictly via `portables/bin/tokscale` with zero host modifications.
