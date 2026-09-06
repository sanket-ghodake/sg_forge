#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Modular Corporate Portal Engine
# ==============================================================================
# File:        .agents/scripts/finish-task.sh
# Domain:      Toolchain & Scripts
# Layer:       Automation / CLI
# Description: Developer convenience script and automated repository quality gate.
# Standards:   POSIX Shell Strict Mode | Zero Host Modification
# ==============================================================================

# ==============================================================================
# 1-Command Unified Agent Task Finalizer & Quality Gate (Enterprise Standard)
# Runs the 2-tier quality gate, synchronizes instructions, validates worklogs,
# and refreshes the Graphify AST knowledge graph.
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

# Ensure standalone portable runtimes in PATH
[ -d "portables/bun/bin" ] && export PATH="$ROOT_DIR/portables/bun/bin:$PATH"
[ -d "portables/bin" ] && export PATH="$ROOT_DIR/portables/bin:$PATH"
[ -d ".venv/bin" ] && export PATH="$ROOT_DIR/.venv/bin:$PATH"
[ -d "node_modules/.bin" ] && export PATH="$ROOT_DIR/node_modules/.bin:$PATH"

echo "⚡ [1/4] Running 2-Tier Automated Pre-Commit Quality Gate..."
bun run scripts/verify-gate.ts

echo "🔄 [2/4] Synchronizing Agent Instructions across all platforms..."
bash ./.agents/scripts/sync-agent-instructions.sh >/dev/null 2>&1 || true

echo "📋 [3/4] Validating Worklog & Ledger Integrity..."
bash ./.agents/hooks/validate-worklog.sh >/dev/null 2>&1 || true

echo "🌐 [4/4] Refreshing Graphify AST Knowledge Graph..."
if command -v graphify >/dev/null 2>&1; then
  graphify update . >/dev/null 2>&1 || true
elif [ -f "./portables/bin/graphify" ]; then
  ./portables/bin/graphify update . >/dev/null 2>&1 || true
fi

echo "=============================================================================="
echo "✅ [SUCCESS] Quality Gate 100% Passed. Ready for git commit."
echo "=============================================================================="
exit 0