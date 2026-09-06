#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Modular Corporate Portal Engine
# ==============================================================================
# File:        .agents/scripts/sync-agent-instructions.sh
# Domain:      Toolchain & Scripts
# Layer:       Automation / CLI
# Description: Synchronizes agent instruction files across all IDE and LLM targets.
# Standards:   POSIX Shell Strict Mode | Zero Host Modification | Max 300 Lines
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

AGENTS_FILE="$REPO_ROOT/AGENTS.md"
DOT_AGENTS_FILE="$REPO_ROOT/.agents/AGENTS.md"
CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"
COPILOT_FILE="$REPO_ROOT/.github/copilot-instructions.md"
CURSOR_FILE="$REPO_ROOT/.cursorrules"
CURSOR_RULES_DIR="$REPO_ROOT/.cursor/rules"
GEMINI_FILE="$REPO_ROOT/GEMINI.md"

echo "Syncing agent instruction files in $REPO_ROOT..."

# 1. Sync AGENTS.md to .agents/AGENTS.md
cp "$AGENTS_FILE" "$DOT_AGENTS_FILE"
echo "  [✓] Synced AGENTS.md -> .agents/AGENTS.md"

# 2. Sync to CLAUDE.md
cp "$AGENTS_FILE" "$CLAUDE_FILE"
echo "  [✓] Synced to CLAUDE.md"

# 3. Sync to .github/copilot-instructions.md
mkdir -p "$REPO_ROOT/.github"
cp "$AGENTS_FILE" "$COPILOT_FILE"
echo "  [✓] Synced to .github/copilot-instructions.md"

# 4. Sync to .cursorrules and .cursor/rules/
cp "$AGENTS_FILE" "$CURSOR_FILE"
mkdir -p "$CURSOR_RULES_DIR"
cp "$AGENTS_FILE" "$CURSOR_RULES_DIR/AGENTS.md"
echo "  [✓] Synced to .cursorrules & .cursor/rules/AGENTS.md"

# 5. Sync to GEMINI.md
cp "$AGENTS_FILE" "$GEMINI_FILE"
echo "  [✓] Synced to GEMINI.md"

echo "All agent instruction files successfully synchronized."