---
description: Unified Agent & Developer Verification Quality Gate (Enterprise Standard)
---

# Unified Verification Quality Gate

Use this workflow before completing any feature, refactoring, or bugfix to guarantee zero production gaps and strict compliance with repository directives.

## Step 1: Run 2-Tier Automated Pre-Commit Gate
Execute the comprehensive 12-check deterministic gate and AI review report:
```bash
rtk bun scripts/verify-gate.ts
```

## Step 2: Synchronize Multi-Agent Instructions (Rule 9)
Ensure all agent instructions remain identical across `AGENTS.md`, `.agents/AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`:
```bash
rtk bash .agents/scripts/sync-agent-instructions.sh
```

## Step 3: Validate Worklog & Ledger Integrity (Rule 10)
Verify that `logs/WORKLOGS.md` and `logs/commits.jsonl` conform strictly to the ground-truth format:
```bash
rtk bash .agents/hooks/validate-worklog.sh
```

## Step 4: Git Commit with Conventional Format
When the user instructs you to commit, the pre-commit gate verifies checks and the post-commit hook automatically extracts commit metadata and updates logs:
```bash
rtk git commit -m "feat(scope): descriptive summary"
```
*(Commit SHA, author, diff statistics, and touched apps are automatically recorded into `logs/commits.jsonl` and `logs/WORKLOGS.md`)*
