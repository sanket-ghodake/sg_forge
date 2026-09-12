# Telemetry Forge App - Git Hooks

This directory houses deterministic lifecycle Git hooks configured to enforce pre-commit validation and post-commit ledger telemetry within the Telemetry submodule.

## Hooks
- `pre-commit`: Executes `scripts/verify-gate.ts` to block commits violating code limits, license policies, or test failures.
- `post-commit`: Automatically appends commit records to `logs/commits.jsonl`.
