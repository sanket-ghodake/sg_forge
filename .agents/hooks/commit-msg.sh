#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Git Commit-Msg Validation Hook (Conventional Commits 1.0)
# ==============================================================================
set -e

MSG_FILE="$1"
COMMIT_MSG=$(cat "$MSG_FILE")

# Allowed commit types
REGEX="^(feat|fix|refactor|perf|test|tool|docs|chore|style)(\([a-zA-Z0-9_\-]+\))?: .+"

FIRST_LINE=$(head -n 1 "$MSG_FILE")

if ! echo "$FIRST_LINE" | grep -qE "$REGEX"; then
    echo "❌ [Git Commit-Msg Error] Commit message does not follow Conventional Commits 1.0!"
    echo "   Format: <type>(<scope>): <short description>"
    echo "   Types:  feat | fix | refactor | perf | test | tool | docs | chore | style"
    echo "   Example: feat(portal): add 2D canvas interactive node navigation"
    exit 1
fi

echo "✅ [Git Commit-Msg] Conventional Commit format validated."
