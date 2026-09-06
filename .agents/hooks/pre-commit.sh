#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Git Pre-Commit AI Agent Quality Gate Hook
# ==============================================================================
set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "⚡ [Git Pre-Commit Hook] Running SG Forge Quality Gate (12 Deterministic Gates)..."

# Determine bun runtime (use portable ELF binary on Linux; fallback to host bun on macOS/other)
BUN_BIN="bun"
if [ "$(uname -s)" = "Linux" ] && [ -x "$REPO_ROOT/portables/bun/bin/bun" ]; then
    BUN_BIN="$REPO_ROOT/portables/bun/bin/bun"
fi

# Run pre-commit quality gate. Exit with non-zero on failure to strictly block git commit.
if ! "$BUN_BIN" run "$REPO_ROOT/scripts/verify-gate.ts"; then
    echo "❌ [PRE-COMMIT GATE FAILED] Git commit aborted. Fix all errors above before committing."
    exit 1
fi

# Automatically stage updated Graphify outputs, regenerated CycloneDX SBOM, and security audit logs if git staging is active
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git add "$REPO_ROOT/graphify-out/graph.json" "$REPO_ROOT/graphify-out/graph.html" "$REPO_ROOT/graphify-out/GRAPH_REPORT.md" "$REPO_ROOT/graphify-out/manifest.json" "$REPO_ROOT/docs/security/sbom/cyclonedx-sbom.json" "$REPO_ROOT/logs/security" 2>/dev/null || true
fi

