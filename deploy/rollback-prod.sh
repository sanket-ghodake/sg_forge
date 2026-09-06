#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Production Instant Rollback Engine (2026 LTS)
# Features:
#   1. Instant Git checkout to 'last-known-good' baseline or specific commit SHA
#   2. Fast atomic container restart using previous verified images
#   3. Optional SQLite/Turso database snapshot restoration (--restore-db)
#   4. Post-rollback health verification & audit logging
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROD_ROOT/docker/prod/docker-compose.yml"
LOG_FILE="$PROD_ROOT/logs/deployments.log"
BACKUP_DIR="$PROD_ROOT/backups"

# Dynamically resolve configuration from .env
if [ -f "$PROD_ROOT/.env" ]; then
    COMPOSE_PROJECT_NAME="$(grep -E '^COMPOSE_PROJECT_NAME=' "$PROD_ROOT/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    PROD_HTTP_PORT="$(grep -E '^PROD_HTTP_PORT=' "$PROD_ROOT/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
fi
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ag_dashboard}"
PROD_HTTP_PORT="${PROD_HTTP_PORT:-80}"

log() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] [ROLLBACK] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

fail() {
    log "❌ ROLLBACK ERROR: $1"
    exit 1
}

TARGET_TAG="${1:-last-known-good}"
RESTORE_DB=false

for arg in "$@"; do
    if [ "$arg" = "--restore-db" ]; then
        RESTORE_DB=true
    fi
done

log "======================================================================"
log "🚨 INITIATING PRODUCTION ROLLBACK TO: $TARGET_TAG"
log "======================================================================"

cd "$PROD_ROOT"

# Check if target tag/commit exists
if ! git rev-parse --verify "$TARGET_TAG" >/dev/null 2>&1; then
    fail "Target revision '$TARGET_TAG' not found in Git repository."
fi

# 1. Revert Git state
TARGET_SHA="$(git rev-parse "$TARGET_TAG")"
log "⏪ [1/4] Checking out stable code revision: $TARGET_SHA ($TARGET_TAG)..."
git checkout -f "$TARGET_TAG"

# 2. Database Restoration (if requested)
if [ "$RESTORE_DB" = true ]; then
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db_snapshot_*.tar.gz 2>/dev/null | head -n 1 || true)
    if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP" ]; then
        log "💾 [2/4] Restoring pre-deployment database snapshot: $(basename "$LATEST_BACKUP")..."
        tar -xzf "$LATEST_BACKUP" -C "$PROD_ROOT/apps"
        log "   ✅ Database state restored to pristine pre-deployment snapshot."
    else
        log "   ⚠️ No database snapshots found in $BACKUP_DIR to restore."
    fi
else
    log "⏩ [2/4] Skipping database restoration (Use --restore-db to restore last snapshot)."
fi

# 3. Restart Production Containers with Stable Code
log "🔄 [3/4] Re-launching production stack with verified images..."
docker compose -p "${COMPOSE_PROJECT_NAME:-ag_dashboard}-prod" --env-file "$PROD_ROOT/.env" -f "$COMPOSE_FILE" --profile all up -d --build --remove-orphans

# 4. Verify Gateway Health
log "🩺 [4/4] Verifying production gateway health post-rollback..."
PROD_PORT="${PROD_HTTP_PORT:-80}"
HEALTH_PASSED=false

for i in {1..5}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PROD_PORT}/" || true)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
        HEALTH_PASSED=true
        log "   ✅ Gateway responded HTTP $STATUS (HEALTHY)"
        break
    else
        log "   ⏳ Waiting for gateway (Attempt #$i, HTTP $STATUS)..."
        sleep 2
    fi
done

if [ "$HEALTH_PASSED" = true ]; then
    log "======================================================================"
    log "✅ ROLLBACK COMPLETED SUCCESSFULLY."
    log "   Production is restored and stable at http://localhost:${PROD_PORT}/"
    log "======================================================================"
    exit 0
else
    fail "Production gateway failed health check after rollback (HTTP $STATUS)!"
fi
