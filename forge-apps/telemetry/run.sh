#!/usr/bin/env bash
# ==============================================================================
# SG Forge Submodule - Autonomous Microservice CLI (2026 LTS)
# 100% Independent: Works standalone or embedded within SG Forge Monorepo
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Add local portables to PATH if present
export PATH="$DIR/portables/bin:$PATH"

# Auto-copy .env.example to .env if .env is missing
if [ ! -f "$DIR/.env" ] && [ -f "$DIR/.env.example" ]; then
  echo "ℹ️ Auto-generating .env from .env.example..."
  cp "$DIR/.env.example" "$DIR/.env"
fi

# Resolve Bun Runtime
if [ -f "$DIR/portables/bun/bin/bun" ]; then
  BUN_BIN="$DIR/portables/bun/bin/bun"
elif [ -f "$DIR/../../portables/bun/bin/bun" ]; then
  BUN_BIN="$DIR/../../portables/bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  BUN_BIN="bun"
else
  echo "❌ Error: Bun runtime not found."
  exit 1
fi

ensure_gateway_network() {
  local net_name="${CONTAINER_PREFIX:-ag}_forge_apps_net"
  if ! docker network inspect "$net_name" >/dev/null 2>&1; then
    echo "🌐 Creating standalone gateway network: $net_name..."
    docker network create "$net_name" >/dev/null 2>&1 || true
  fi
}

CMD="${1:-help}"
shift || true

case "$CMD" in
  dev)
    echo "🚀 Starting standalone micro-app in watch mode..."
    exec "$BUN_BIN" --watch src/server.ts "$@"
    ;;
  start)
    echo "⚡ Starting standalone micro-app..."
    exec "$BUN_BIN" src/server.ts "$@"
    ;;
  test)
    echo "🧪 Running 5-tier microservice tests..."
    exec "$BUN_BIN" test "$@"
    ;;
  verify)
    echo "🛡️ Running pre-commit quality verification gate..."
    exec "$BUN_BIN" run scripts/verify-gate.ts "$@"
    ;;
  backup)
    echo "💾 Running autonomous database backup..."
    exec "$BUN_BIN" run scripts/backup-db.ts "$@"
    ;;
  build)
    echo "🐳 Building standalone Docker image..."
    exec docker build -f docker/Dockerfile -t "${PWD##*/}" .
    ;;
  compose|docker)
    ensure_gateway_network
    echo "🐳 Running standalone Docker Compose (${*:-up -d})..."
    exec docker compose "${@:-up -d}"
    ;;
  setup-hooks)
    echo "⚓ Configuring Git hooks (.githooks)..."
    git config core.hooksPath .githooks
    chmod +x .githooks/* 2>/dev/null || true
    echo "✅ Git hooks activated! Pre-commit gate will verify tests before committing."
    ;;
  help|*)
    echo "
SG Forge Autonomous Micro-App Submodule CLI

Usage:
  ./run.sh dev           Start local server in hot-reload watch mode
  ./run.sh start         Start server in production mode
  ./run.sh test          Execute local 5-tier test suites
  ./run.sh verify        Run quality verification gate (18 checks)
  ./run.sh backup        Run isolated database snapshot (VACUUM INTO)
  ./run.sh compose [cmd] Run standalone docker compose (e.g. up -d, down)
  ./run.sh build         Build standalone Docker container image
  ./run.sh setup-hooks   Activate git hooks (.githooks)
  ./run.sh help          Show this banner
"
    ;;
esac
