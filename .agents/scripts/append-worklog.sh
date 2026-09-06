#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Atomic Worklog Appender Hook
# ==============================================================================
set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
BUN_BIN="bun"
if [ -f "$REPO_ROOT/portables/bun/bin/bun" ]; then
    BUN_BIN="$REPO_ROOT/portables/bun/bin/bun"
fi

"$BUN_BIN" run "$REPO_ROOT/scripts/append-worklog.ts" "$@"
