#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration - Environment & Runtime Resolver (2026 LTS)
# 100% Dynamically Configured from .env (Brand, Docker, Proxy & Microservices)
# Cross-Platform: Linux (x86_64/ARM64), macOS (Darwin), Windows (WSL/Git Bash)
# ==============================================================================
set -e

# Resolve Repository Root
if [ -z "$REPO_ROOT" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

HOST_OS="$(uname -s)"
HOST_ARCH="$(uname -m)"
RTK="$REPO_ROOT/portables/bin/rtk"

# Cross-platform Bun resolution:
# 1. Linux x86_64: execute standalone ELF binary from portables
# 2. Linux ARM64, macOS (Darwin), or Windows (Git Bash/MSYS2): execute system bun
if [ "$HOST_OS" = "Linux" ] && [ "$HOST_ARCH" = "x86_64" ] && [ -x "$REPO_ROOT/portables/bun/bin/bun" ]; then
    PORTABLE_BUN="$REPO_ROOT/portables/bun/bin/bun"
    export PATH="$REPO_ROOT/portables/bin:$REPO_ROOT/portables/bun/bin:$PATH"
elif command -v bun >/dev/null 2>&1; then
    PORTABLE_BUN="bun"
    export PATH="$REPO_ROOT/portables/bin:$PATH"
elif [ -x "$REPO_ROOT/portables/bun/bin/bun.exe" ]; then
    PORTABLE_BUN="$REPO_ROOT/portables/bun/bin/bun.exe"
    export PATH="$REPO_ROOT/portables/bin:$PATH"
else
    # Diagnostic guide when Bun is not available on host
    echo "❌ [SG Forge] Bun runtime not detected on $HOST_OS ($HOST_ARCH)." >&2
    if [ "$HOST_OS" = "Darwin" ]; then
        echo "   👉 Install Bun on macOS: brew install oven-sh/bun/bun (or: curl -fsSL https://bun.sh/install | bash)" >&2
    elif [[ "$HOST_OS" == MINGW* ]] || [[ "$HOST_OS" == MSYS* ]] || [[ "$HOST_OS" == CYGWIN* ]]; then
        echo "   👉 Install Bun on Windows (PowerShell): powershell -c \"irm bun.sh/install.ps1 | iex\"" >&2
    elif [ "$HOST_ARCH" = "aarch64" ] || [ "$HOST_ARCH" = "arm64" ]; then
        echo "   👉 Install ARM64 Bun on Linux: curl -fsSL https://bun.sh/install | bash" >&2
    else
        echo "   👉 Install Bun from https://bun.sh" >&2
    fi
    exit 1
fi

# Dynamically resolve branding and container variables from .env
if [ -f "$REPO_ROOT/.env" ]; then
    ENV_APP_ENV="$(grep -E '^APP_ENV=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    BRAND_NAME="$(grep -E '^NEXT_PUBLIC_BRAND_NAME=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    CONTAINER_PREFIX="$(grep -E '^CONTAINER_PREFIX=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    COMPOSE_PROJECT_NAME="$(grep -E '^COMPOSE_PROJECT_NAME=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    HTTP_PORT="$(grep -E '^HTTP_PORT=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    PROD_HTTP_PORT="$(grep -E '^PROD_HTTP_PORT=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
    LANDING_PORT="$(grep -E '^LANDING_PORT=' "$REPO_ROOT/.env" 2>/dev/null | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
fi

BRAND_NAME="${BRAND_NAME:-AG Dashboard}"
CONTAINER_PREFIX="${CONTAINER_PREFIX:-ag}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ag_dashboard}"
APP_ENV="${APP_ENV:-${ENV_APP_ENV:-${NODE_ENV:-development}}}"
HTTP_PORT="${HTTP_PORT:-8080}"
PROD_HTTP_PORT="${PROD_HTTP_PORT:-80}"
LANDING_PORT="${LANDING_PORT:-3000}"

export REPO_ROOT HOST_OS HOST_ARCH RTK PORTABLE_BUN
export BRAND_NAME CONTAINER_PREFIX COMPOSE_PROJECT_NAME APP_ENV HTTP_PORT PROD_HTTP_PORT LANDING_PORT
