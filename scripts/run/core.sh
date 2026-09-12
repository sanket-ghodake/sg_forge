#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration - Core Development Module (2026 LTS)
# Handles workspace setup, dev servers, proxies, certificates, DB reset, testing
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
    setup)
        echo "⚡ [${BRAND_NAME}] Bootstrapping portable environment..."
        if [ ! -f "$PORTABLE_BUN" ] && ! command -v "$PORTABLE_BUN" >/dev/null 2>&1; then
            echo "❌ Portable Bun runtime not found at $PORTABLE_BUN"
            exit 1
        fi
        # Ensure .env is provisioned from .env.example if missing
        if [ ! -f "$REPO_ROOT/.env" ] && [ -f "$REPO_ROOT/.env.example" ]; then
            echo "📄 [${BRAND_NAME}] Provisioning initial .env from .env.example..."
            cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
        fi
        # Cross-platform permission & git attribute hardening (Windows/WSL/macOS/Linux)
        chmod +x "$REPO_ROOT"/portables/bin/* "$REPO_ROOT"/portables/bun/bin/* "$REPO_ROOT"/portables/rtk/bin/* "$REPO_ROOT"/portables/scc/* "$REPO_ROOT"/portables/hyperfine/* "$REPO_ROOT"/portables/ctop/* "$REPO_ROOT"/run.sh "$REPO_ROOT"/scripts/run/*.sh "$REPO_ROOT"/.githooks/* "$REPO_ROOT"/env.sh 2>/dev/null || true
        if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            git config core.filemode false
            git config core.autocrlf false
            git config core.hooksPath .githooks
        fi
        echo "✅ Using Bun Runtime: $($PORTABLE_BUN --version)"
        echo "✅ Using Portable RTK: $($RTK --version 2>/dev/null || echo 'Ready')"
        echo "📦 Installing workspace packages with Bun..."
        $PORTABLE_BUN install
        $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-ignores.ts"
        if [ ! -f "$REPO_ROOT/proxy/certs/cert.pem" ]; then
            echo "🔒 [${BRAND_NAME}] Generating local development TLS certificates..."
            $PORTABLE_BUN run "$REPO_ROOT/scripts/setup-certs.ts"
        else
            $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        fi
        # Initialize Git Submodules if present
        if [ -f "$REPO_ROOT/.gitmodules" ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            echo "🧩 [${BRAND_NAME}] Synchronizing autonomous Git submodules..."
            git submodule update --init --recursive 2>/dev/null || true
        fi
        # Initialize databases if not yet provisioned
        if [ ! -f "$REPO_ROOT/apps/data/auth.db" ]; then
            echo "🌱 [${BRAND_NAME}] Initializing initial development databases..."
            $PORTABLE_BUN run "$REPO_ROOT/scripts/init-all-databases.ts" 2>/dev/null || true
        fi
        # Initialize Graft Tier 1 code context graph if not already built
        if [ ! -d "$REPO_ROOT/graft" ]; then
            echo "🌿 [${BRAND_NAME}] Initializing Graft Tier 1 code context graph..."
            "$REPO_ROOT/portables/bin/graft" build 2>/dev/null || true
        fi
        # Initialize lifetime token ledger if missing
        if [ ! -f "$REPO_ROOT/logs/token-ledger.jsonl" ]; then
            touch "$REPO_ROOT/logs/token-ledger.jsonl"
        fi
        echo "💡 Tip for IDE & Terminal PATH:"
        echo "   ├─ VS Code / Cursor: Terminal PATH is pre-configured via .vscode/settings.json"
        echo "   ├─ External Shells:  run 'source env.sh' (or: export PATH=\"\$PWD/portables/bin:\$PWD/portables/bun/bin:\$PATH\")"
        echo "   └─ Direct Fallback:  run './portables/bin/rtk <command>'"
        echo "✨ Setup completed successfully! Run './run.sh dev' or './run.sh docker up' to start."
        ;;

    sync-submodules)
        echo "🧩 [${BRAND_NAME}] Updating all Git submodules to latest upstream..."
        git submodule update --init --recursive --remote --merge
        echo "✅ Submodules synchronized successfully."
        ;;

    dev)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/dev-runner.ts" "$@"
        ;;

    sync-proxy)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        ;;

    certs)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/setup-certs.ts" "$@"
        ;;

    trust-cert)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/trust-cert.ts" "$@"
        ;;

    fallback)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/fallback-server.ts" "$@"
        ;;

    sync-ignores)
        FLAG="${1:-}"
        if [ "$FLAG" = "--check" ]; then
            $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-ignores.ts" --check
        else
            $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-ignores.ts"
        fi
        ;;

    test)
        SUITE="${1:-all}"
        echo "🧪 [${BRAND_NAME}] Running test suite: $SUITE..."
        if [ "$SUITE" = "all" ] || [ -z "$SUITE" ]; then
            NODE_ENV=test BUN_ENV=test FORGE_TEST_MODE=true $PORTABLE_BUN test
        else
            NODE_ENV=test BUN_ENV=test FORGE_TEST_MODE=true $PORTABLE_BUN test "$@"
        fi
        ;;

    reset-db)
        echo "⚠️ [${BRAND_NAME}] Development Database Reset Tool"
        if [ "$APP_ENV" = "production" ] && [ "${1:-}" != "--force-production-wipe" ] && [ "${2:-}" != "--force-production-wipe" ]; then
            echo "🛑 BLOCKED: APP_ENV is set to 'production'!"
            echo "   Accidental database wipe protection active. Pass '--force-production-wipe' to proceed."
            exit 1
        fi
        FORCE="${1:-}"
        if [ "$FORCE" = "--force" ] || [ "$FORCE" = "-y" ]; then
            CONFIRM="y"
        elif [ ! -t 0 ]; then
            echo "🛑 Non-interactive shell detected. Use '--force' or '-y' to confirm reset."
            exit 1
        else
            read -p "Are you sure you want to delete and re-seed all local development databases? [y/N]: " -n 1 -r CONFIRM
            echo
        fi
        if [[ $CONFIRM =~ ^[Yy]$ ]]; then
            rm -f "$REPO_ROOT"/apps/data/*.db "$REPO_ROOT"/apps/data/*.db-wal "$REPO_ROOT"/apps/data/*.db-shm
            echo "🌱 Re-initializing and seeding clean databases..."
            ALLOW_DB_WIPE=true $PORTABLE_BUN run "$REPO_ROOT/scripts/init-all-databases.ts"
            echo "✨ All development databases reset to pristine seeded state."
        else
            echo "Cancelled."
        fi
        ;;

    doctor)
        echo "🩺 [${BRAND_NAME}] Running Pre-Flight Diagnostics & Toolchain Inspection..."
        echo "1. Bun Runtime:"
        $PORTABLE_BUN --version
        echo "2. Bunx Wrapper:"
        "$REPO_ROOT/portables/bun/bin/bunx" --version 2>/dev/null || $PORTABLE_BUN x --version 2>/dev/null || echo "bunx ready"
        echo "3. RTK Token Compressor:"
        $RTK --version 2>/dev/null || echo "RTK Portable Ready"
        echo "4. Active Environment Brand:"
        echo "   Brand Name:     $BRAND_NAME"
        echo "   Container Pfx:  $CONTAINER_PREFIX"
        echo "   Compose Name:   $COMPOSE_PROJECT_NAME"
        echo "5. Host OS & Architecture:"
        echo "   OS:             $HOST_OS"
        echo "   Architecture:   $HOST_ARCH"
        echo "6. Cross-Platform Git Configuration:"
        if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            echo "   core.filemode:  $(git config core.filemode || echo 'unset')"
            echo "   core.autocrlf:  $(git config core.autocrlf || echo 'unset')"
        fi
        echo "7. Ingress Reverse Proxy Configuration:"
        $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        echo "8. Port Binding Inspection (from .env):"
        PORTS_TO_CHECK="$(grep -E '(PORT=|APP_)' "$REPO_ROOT/.env" 2>/dev/null | grep -oE '[0-9]{2,5}' | sort -u || true)"
        for P in ${PORTS_TO_CHECK:-8080 8443 3000 3001 3002 3003 3004}; do
            if command -v lsof >/dev/null 2>&1 && lsof -i :"$P" -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo "   ⚠️ Port $P is currently bound by an active process"
            fi
        done
        echo "✅ Diagnostics Completed."
        ;;

    clean)
        echo "🧹 [${BRAND_NAME}] Cleaning workspace caches, temporary logs, and build artifacts..."
        rm -rf "$REPO_ROOT/.next" "$REPO_ROOT/.turbo" "$REPO_ROOT/dist"
        find "$REPO_ROOT" -type d -name "logs" -exec sh -c 'rm -f "$1"/*.log "$1"/*.txt' _ {} \; 2>/dev/null || true
        echo "✨ Workspace cleaned."
        ;;

    create-app)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/create-app.ts" "$@"
        ;;

    lock-logo)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" lock logo
        ;;

    unlock-logo)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" unlock logo
        ;;

    logo-status)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" status logo
        ;;

    lock-landing)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" lock landing
        ;;

    unlock-landing)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" unlock landing
        ;;

    landing-status)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/brand-lock.ts" status landing
        ;;

    *)
        echo "❌ Unknown core command: $CMD" >&2
        exit 1
        ;;
esac
