---
trigger: always_on
description: Consult Tokscale for repository-scoped lifetime AI token usage, spend tracking, and persistent ledger recording.
---

## tokscale

This project integrates Tokscale (`junhoyeo/tokscale`) alongside the persistent repo ledger (`logs/token-ledger.jsonl`) for accurate, cross-IDE, zero-API-key lifetime token and spend tracking across developer machine migrations.

### Rules & Workflow:
1. **Strict Repository Scope & Zero Foreign Bleed**:
   - Running `rtk ./run.sh tokens` uses `scripts/tokscale-runner.ts` to filter sessions strictly to the current workspace root and worktrees.
   - Foreign projects and outside workspace sessions on the developer's machine are excluded by default.
2. **Lifetime Repo Token Ledger (`logs/token-ledger.jsonl`)**:
   - Genuine token metrics (input, output, prompt cache reads, reasoning tokens, and calculated dollar cost) are persisted into `logs/token-ledger.jsonl`.
   - Never manually reset this ledger: it is committed to Git to ensure token spend history survives across machine transfers and repository clones.
3. **Session Sync & Observation**:
   - Sync session tokens anytime with `rtk ./run.sh tokens sync`.
   - Inspect repository-scoped spend, model breakdown, and cache ratios with `rtk ./run.sh tokens`.
   - Inspect detected local IDE storage roots with `rtk ./run.sh tokens clients`.
4. **Interactive TUI**:
   - Use `rtk ./run.sh tokens tui` to launch the interactive Tokscale terminal dashboard with heatmaps and filterable graphs.
5. **Zero Host Alterations**:
   - The CLI runs strictly through the portable repo wrapper `portables/bin/tokscale` via the repo's bundled Bun runtime with zero host modifications.
