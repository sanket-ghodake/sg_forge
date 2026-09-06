#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Production Diagnostics & Status Engine (2026 LTS)
# Displays gateway health, live container metrics, and recent deployment audit history
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
PROD_PORT="${PROD_HTTP_PORT:-80}"

echo "======================================================================"
echo "📊 SG Forge Production Diagnostics & Audit Status"
echo "======================================================================"

# 1. Gateway Status
echo -e "\n1. Ingress Gateway Health (Port $PROD_PORT):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://localhost:${PROD_PORT}/" || echo "UNREACHABLE")

if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
    echo "   🟢 Gateway Active: http://localhost:${PROD_PORT}/ (Status: HTTP $STATUS)"
else
    echo "   🔴 Gateway Down or Degraded (Status: $STATUS)"
fi

# 2. Live Container Status
echo -e "\n2. Production Containers Status:"
if command -v docker >/dev/null 2>&1; then
    docker compose -p "${COMPOSE_PROJECT_NAME:-ag_dashboard}-prod" --env-file "$PROD_ROOT/.env" -f "$COMPOSE_FILE" --profile all ps || echo "   No production containers running."
else
    echo "   Docker CLI not available."
fi

# 3. Recent Database Snapshots
echo -e "\n3. Recent Immutable Database Snapshots ($BACKUP_DIR):"
if [ -d "$BACKUP_DIR" ] && [ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n 5 | awk '{print "   📁 " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}' || echo "   None found."
else
    echo "   No snapshots created yet."
fi

# 4. Recent Deployment Audit Log
echo -e "\n4. Recent Deployment Audit Logs ($LOG_FILE):"
if [ -f "$LOG_FILE" ]; then
    tail -n 12 "$LOG_FILE" | sed 's/^/   /'
else
    echo "   No deployment history recorded yet."
fi
echo "======================================================================"
