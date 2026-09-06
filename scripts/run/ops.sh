#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration - Production & Database Ops Module (2026 LTS)
# Handles zero-downtime deployment, rollbacks, backup snapshots, hardening
# ==============================================================================
set -e

# Ensure environment is sourced
if [ -z "$PORTABLE_BUN" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/env.sh"
fi

CMD="$1"
shift || true

case "$CMD" in
    deploy-prod)
        "$REPO_ROOT/deploy/deploy-prod.sh" "$@"
        ;;

    rollback-prod)
        "$REPO_ROOT/deploy/rollback-prod.sh" "$@"
        ;;

    prod-status)
        "$REPO_ROOT/deploy/status-prod.sh"
        ;;

    backup)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/backup-databases.ts" "$@"
        ;;

    backup-daemon)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/backup-databases.ts" --daemon "$@"
        ;;

    backup-verify)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/backup-databases.ts" --verify "$@"
        ;;

    harden)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/harden-storage.ts" "$@"
        ;;

    gen-key)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/harden-storage.ts" --gen-key "$@"
        ;;

    *)
        echo "❌ Unknown ops command: $CMD" >&2
        exit 1
        ;;
esac
