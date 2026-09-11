#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Shell Environment Activator (2026 LTS)
# Sources portable toolchain into current interactive shell session.
# Usage: source env.sh   (or: . env.sh)
# ==============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export REPO_ROOT="$SCRIPT_DIR"

source "$REPO_ROOT/scripts/run/env.sh"

echo "⚡ [${BRAND_NAME:-SG Forge}] Portable toolchain activated on PATH:"
echo "   ├─ RTK:     $($RTK --version 2>/dev/null || echo 'Ready')"
echo "   ├─ Bun:     $($PORTABLE_BUN --version 2>/dev/null || echo 'Ready')"
echo "   └─ Bin:     $REPO_ROOT/portables/bin"
