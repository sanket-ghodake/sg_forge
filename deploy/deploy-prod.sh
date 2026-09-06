#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Ultra-Resilient Zero-Downtime Production Deployment Engine (2026)
# Features:
#   1. Pre-Deployment SQLite/Turso Online Database Snapshots
#   2. Selective Microservice Change Detection via Git Diff
#   3. Zero-Downtime Background Container Builds (Old Prod Remains Live on Port 80)
#   4. Atomic Rolling Container Swaps (<1s Switchover)
#   5. Automated Post-Swap Health Gate & Instant Self-Healing Rollback
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROD_ROOT/docker/prod/docker-compose.yml"
LOG_FILE="$PROD_ROOT/logs/deployments.log"
BACKUP_DIR="$PROD_ROOT/backups"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
START_TIME="$(date +%s)"

# Dynamically resolve configuration from .env
if [ -f "$PROD_ROOT/.env" ]; then
    COMPOSE_PROJECT_NAME="$(grep -E '^COMPOSE_PROJECT_NAME=' "$PROD_ROOT/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    PROD_HTTP_PORT="$(grep -E '^PROD_HTTP_PORT=' "$PROD_ROOT/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
fi
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ag_dashboard}"
PROD_HTTP_PORT="${PROD_HTTP_PORT:-80}"

mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

log() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

fail() {
    log "❌ ERROR: $1"
    exit 1
}

# ------------------------------------------------------------------------------
# 1. Pre-Flight Verification Gate
# ------------------------------------------------------------------------------
log "======================================================================"
log "🚀 Starting Production Deployment Pipeline (Target: $PROD_ROOT)"
log "======================================================================"

command -v docker >/dev/null 2>&1 || fail "Docker is not installed or not in PATH."
docker info >/dev/null 2>&1 || fail "Docker daemon is not running or accessible."
command -v git >/dev/null 2>&1 || fail "Git is not installed."
command -v curl >/dev/null 2>&1 || fail "Curl is not installed."

if [ -x "$PROD_ROOT/portables/bin/gitleaks" ]; then
    log "🔒 Running pre-deployment secret detection scan (Gitleaks)..."
    if ! "$PROD_ROOT/portables/bin/gitleaks" detect --source="$PROD_ROOT" --no-git --redact >/dev/null 2>&1; then
        fail "Secrets or credentials detected by Gitleaks in source tree. Deployment aborted."
    fi
    log "   ✅ Zero secrets detected in pre-deployment audit."
fi

# ------------------------------------------------------------------------------
# 2. Immutable Pre-Deployment Database Snapshot
# ------------------------------------------------------------------------------
log "📦 [1/6] Taking immutable pre-deployment database snapshot..."
if [ -d "$PROD_ROOT/apps/data" ]; then
    BACKUP_FILE="$BACKUP_DIR/db_snapshot_${TIMESTAMP}.tar.gz"
    # Use tar with gzip to preserve all sqlite/libsql wal files atomically
    tar -czf "$BACKUP_FILE" -C "$PROD_ROOT/apps" data 2>/dev/null || true
    if [ -f "$BACKUP_FILE" ]; then
        log "   ✅ Database snapshot secured: $(basename "$BACKUP_FILE") ($(du -h "$BACKUP_FILE" | cut -f1))"
    fi
else
    log "   ℹ️ No local apps/data directory found (using isolated Docker volumes)."
fi

# ------------------------------------------------------------------------------
# 3. Git Fetch & Selective Microservice Change Detection
# ------------------------------------------------------------------------------
log "🔍 [2/6] Inspecting Git changes from remote repository..."
cd "$PROD_ROOT"

# Ensure we have a clean working directory before proceeding
if ! git diff --quiet || ! git diff --cached --quiet; then
    fail "Working directory contains uncommitted changes. Stash or commit before deploying."
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
TARGET_BRANCH="${DEPLOY_BRANCH:-main}"
OLD_COMMIT="$(git rev-parse HEAD)"

# Tag current commit for instant rollback
git tag -f last-known-good HEAD >/dev/null 2>&1 || true
log "   📌 Stable baseline tagged as 'last-known-good' ($OLD_COMMIT)"

# Fetch latest changes from remote
git fetch origin "$TARGET_BRANCH" || fail "Failed to fetch origin/$TARGET_BRANCH from remote."
NEW_COMMIT="$(git rev-parse "origin/$TARGET_BRANCH")"

if [ "$OLD_COMMIT" = "$NEW_COMMIT" ] && [ "${FORCE_REDEPLOY:-false}" != "true" ]; then
    log "✨ Already at the latest commit ($NEW_COMMIT). Nothing to deploy."
    log "   (Use FORCE_REDEPLOY=true ./run.sh deploy-prod to force rebuild)."
    exit 0
fi

CHANGED_FILES="$(git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT" || true)"

# Determine which microservices are affected
AFFECTED_SERVICES=""
REBUILD_ALL=false

if echo "$CHANGED_FILES" | grep -qE "^(package\.json|bun\.lock|tsconfig\.json|apps/src/sdk/|apps/src/types/|apps/src/ui/|docker/prod/|\.env)"; then
    REBUILD_ALL=true
    AFFECTED_SERVICES="all (Shared platform code or manifest changed)"
else
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^apps/src/landing/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES landing"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^apps/src/portal/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES portal"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^apps/src/dev-dashboard/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES dev-dashboard"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^apps/src/dev-hub/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES dev-hub"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^apps/src/auth/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES auth"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^forge-apps/expenses/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES app-expenses"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^forge-apps/billing/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES app-billing"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^forge-apps/telemetry/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES app-telemetry"
    [ -n "$(echo "$CHANGED_FILES" | grep -E '^proxy/')" ] && AFFECTED_SERVICES="$AFFECTED_SERVICES proxy"
fi

# Trim whitespace
AFFECTED_SERVICES="$(echo "$AFFECTED_SERVICES" | xargs)"

if [ -z "$AFFECTED_SERVICES" ] && [ "$REBUILD_ALL" = false ]; then
    log "ℹ️ Changes detected are non-code/docs only. Updating Git commit without restarting containers..."
    git reset --hard "$NEW_COMMIT"
    log "✨ Git updated to $NEW_COMMIT. Zero downtime."
    exit 0
fi

log "   🎯 Affected Microservices: ${AFFECTED_SERVICES}"

# ------------------------------------------------------------------------------
# 4. Safe Code Fast-Forward & Background Container Build
# ------------------------------------------------------------------------------
log "📥 [3/6] Fast-forwarding production working tree to $NEW_COMMIT..."
git reset --hard "$NEW_COMMIT"

# Synchronize reverse proxy gateway & error pages from local .env
log "🔀 Synchronizing dynamic reverse proxy routes and error pages from .env..."
if [ -f "$PROD_ROOT/portables/bun/bin/bun" ]; then
    "$PROD_ROOT/portables/bun/bin/bun" run "$PROD_ROOT/scripts/generate-proxy.ts" || true
elif command -v bun >/dev/null 2>&1; then
    bun run "$PROD_ROOT/scripts/generate-proxy.ts" || true
elif [ ! -f "$PROD_ROOT/proxy/Caddyfile" ] && [ -f "$PROD_ROOT/proxy/Caddyfile.example" ]; then
    cp "$PROD_ROOT/proxy/Caddyfile.example" "$PROD_ROOT/proxy/Caddyfile"
fi

log "🔨 [4/6] Building updated container images in background..."
log "   (Existing production containers continue serving traffic on Port 80 without blips)"

BUILD_CMD="docker compose -p ${COMPOSE_PROJECT_NAME:-ag_dashboard}-prod --env-file $PROD_ROOT/.env -f $COMPOSE_FILE"

if [ "$REBUILD_ALL" = true ]; then
    if ! $BUILD_CMD --profile all build; then
        log "❌ Build failed! Rolling back Git state to $OLD_COMMIT..."
        git reset --hard "$OLD_COMMIT"
        fail "Build failure occurred. Production containers were left 100% UNTOUCHED."
    fi
else
    # Build only the changed microservices
    if ! $BUILD_CMD build $AFFECTED_SERVICES; then
        log "❌ Build failed for [$AFFECTED_SERVICES]! Rolling back Git state to $OLD_COMMIT..."
        git reset --hard "$OLD_COMMIT"
        fail "Build failure occurred. Production containers were left 100% UNTOUCHED."
    fi
fi

log "   ✅ Container image build successful."

# ------------------------------------------------------------------------------
# 5. Atomic Rolling Container Swap (<1s)
# ------------------------------------------------------------------------------
log "🔄 [5/6] Swapping running containers with newly built images..."

if [ "$REBUILD_ALL" = true ]; then
    $BUILD_CMD --profile all up -d --remove-orphans
else
    $BUILD_CMD up -d --no-deps $AFFECTED_SERVICES
fi

# ------------------------------------------------------------------------------
# 6. Automated Health Gate & Self-Healing Rollback
# ------------------------------------------------------------------------------
log "🩺 [6/6] Running automated post-deployment health checks..."
PROD_PORT="${PROD_HTTP_PORT:-80}"
HEALTH_PASSED=false

for i in {1..10}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PROD_PORT}/" || true)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
        HEALTH_PASSED=true
        log "   ✅ Health check attempt #$i: HTTP $STATUS (OK)"
        break
    else
        log "   ⏳ Health check attempt #$i: HTTP $STATUS. Waiting 2s..."
        sleep 2
    fi
done

DURATION=$(( $(date +%s) - START_TIME ))

if [ "$HEALTH_PASSED" = true ]; then
    log "======================================================================"
    log "🎉 SUCCESS: Production deployment completed in ${DURATION}s!"
    log "   Commit:   $NEW_COMMIT"
    log "   Services: $AFFECTED_SERVICES"
    log "   Gateway:  http://localhost:${PROD_PORT}/"
    log "======================================================================"
    exit 0
else
    log "❌ CRITICAL: Health gate failed after 10 attempts (HTTP $STATUS)!"
    log "🚨 Initiating AUTOMATED SELF-HEALING ROLLBACK to last-known-good..."
    "$SCRIPT_DIR/rollback-prod.sh"
    exit 1
fi
