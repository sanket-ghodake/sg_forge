#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration - Docker Lifecycle Module (2026 LTS)
# Handles container stacks, profiles, hot reload, logs, metrics HUD & cleanups
# ==============================================================================
set -e

# Ensure environment is sourced
if [ -z "$PORTABLE_BUN" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/env.sh"
fi

DEV_PROJECT="${COMPOSE_PROJECT_NAME}-dev"
PROD_PROJECT="${COMPOSE_PROJECT_NAME}-prod"

# Fallback Caddyfile creation from template if missing
if [ ! -f "$REPO_ROOT/proxy/Caddyfile" ] && [ -f "$REPO_ROOT/proxy/Caddyfile.example" ]; then
    cp "$REPO_ROOT/proxy/Caddyfile.example" "$REPO_ROOT/proxy/Caddyfile"
fi

# ==============================================================================
# Standalone Forge App Submodule Orchestration Helpers
# Discovers isolated forge-apps/*/docker-compose.yml based on active .env registry
# ==============================================================================
ensure_forge_network() {
    local gateway_net="${CONTAINER_PREFIX:-ag}_forge_apps_net"
    if ! docker network inspect "$gateway_net" >/dev/null 2>&1; then
        docker network create "$gateway_net" >/dev/null 2>&1 || true
    fi
}

is_builtin_landing_active() {
    $PORTABLE_BUN -e 'import { isBuiltinLandingActive } from "./apps/src/sdk/src"; process.exit(isBuiltinLandingActive() ? 0 : 1);' 2>/dev/null
}

start_forge_apps() {
    local env_mode="$1" # "dev" or "prod"
    local specific_app="${2:-}"
    ensure_forge_network

    local active_apps
    active_apps="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-forge-active "$specific_app" 2>/dev/null || true)"

    for app_name in $active_apps; do
        local app_dir="$REPO_ROOT/forge-apps/$app_name"
        if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
            echo "📦 [${BRAND_NAME}] Starting standalone Forge App: $app_name ($env_mode)..."
            local build_flag=""
            [ "$env_mode" = "prod" ] && build_flag="--build"
            docker compose -p "${CONTAINER_PREFIX:-ag}-app-${app_name}-${env_mode}" \
                --env-file "$REPO_ROOT/.env" \
                -f "$app_dir/docker-compose.yml" up -d $build_flag
        fi
    done

    # Stop inactive forge apps that should not be running
    local inactive_apps
    inactive_apps="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-forge-inactive "$specific_app" 2>/dev/null || true)"
    for app_name in $inactive_apps; do
        local app_dir="$REPO_ROOT/forge-apps/$app_name"
        if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
            docker compose -p "${CONTAINER_PREFIX:-ag}-app-${app_name}-${env_mode}" \
                --env-file "$REPO_ROOT/.env" \
                -f "$app_dir/docker-compose.yml" stop 2>/dev/null || true
        fi
    done
}

stop_forge_apps() {
    local specific_app="${1:-}"
    local with_volumes="${2:-}"
    local v_flag=""
    [ "$with_volumes" = "true" ] && v_flag="-v"

    for app_dir in "$REPO_ROOT/forge-apps"/*; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
            local app_name
            app_name="$(basename "$app_dir")"
            if [ -n "$specific_app" ]; then
                local clean_target="${specific_app#app-}"
                [ "$app_name" != "$specific_app" ] && [ "$app_name" != "$clean_target" ] && continue
            fi
            docker compose -p "${CONTAINER_PREFIX:-ag}-app-${app_name}-dev" \
                --env-file "$REPO_ROOT/.env" \
                -f "$app_dir/docker-compose.yml" down $v_flag --remove-orphans 2>/dev/null || true
            docker compose -p "${CONTAINER_PREFIX:-ag}-app-${app_name}-prod" \
                --env-file "$REPO_ROOT/.env" \
                -f "$app_dir/docker-compose.yml" down $v_flag --remove-orphans 2>/dev/null || true
        fi
    done
}

status_forge_apps() {
    local env_mode="$1" # "dev" or "prod"
    for app_dir in "$REPO_ROOT/forge-apps"/*; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
            local app_name
            app_name="$(basename "$app_dir")"
            [ "$app_name" = "app-template" ] && continue
            docker compose -p "${CONTAINER_PREFIX:-ag}-app-${app_name}-${env_mode}" \
                --env-file "$REPO_ROOT/.env" \
                -f "$app_dir/docker-compose.yml" ps 2>/dev/null || true
        fi
    done
}

ACTION="$1"
shift || true

case "$ACTION" in
    up|dev)
        echo "🔀 [${BRAND_NAME}] Synchronizing dynamic reverse proxy routes from .env..."
        $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        ensure_forge_network
        PROFILE_ARG="all"
        TARGET_PARAM="${1:-}"
        if [ "$TARGET_PARAM" = "--profile" ] && [ -n "${2:-}" ]; then
            PROFILE_ARG="$2"
            TARGET_PARAM=""
        elif [ "$TARGET_PARAM" = "core" ] || [ "$TARGET_PARAM" = "apps" ] || [ "$TARGET_PARAM" = "monitoring" ] || [ "$TARGET_PARAM" = "all" ]; then
            PROFILE_ARG="$TARGET_PARAM"
            TARGET_PARAM=""
        fi

        if [ -n "$TARGET_PARAM" ]; then
            if ! $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" validate-target "$TARGET_PARAM" >/dev/null 2>&1; then
                echo "❌ [${BRAND_NAME}] Targeted service or app '$TARGET_PARAM' is not declared or active in .env." >&2
                echo "   Configure it in .env or run './run.sh docker dev' to start the configured stack." >&2
                exit 1
            fi

            CLEAN_TARGET="${TARGET_PARAM#app-}"
            if [ -d "$REPO_ROOT/forge-apps/$CLEAN_TARGET" ] && [ -f "$REPO_ROOT/forge-apps/$CLEAN_TARGET/docker-compose.yml" ]; then
                echo "🐳 [${BRAND_NAME}] Starting standalone Forge App '$CLEAN_TARGET' in Docker Dev..."
                docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" up -d proxy
                start_forge_apps dev "$CLEAN_TARGET"
                $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner dev "$CLEAN_TARGET"
                exit 0
            else
                echo "🐳 [${BRAND_NAME}] Starting targeted service '$TARGET_PARAM' in Docker Dev..."
                docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" up -d proxy "$TARGET_PARAM"
                $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner dev "$TARGET_PARAM"
                exit 0
            fi
        fi

        ACTIVE_CORE="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-core-active dev "$PROFILE_ARG")"
        INACTIVE_CORE="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-core-inactive dev "$PROFILE_ARG")"

        echo "🐳 [${BRAND_NAME}] Starting Docker Dev Stack (Hot Reload with bun --watch)..."
        docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" up -d $ACTIVE_CORE

        if [ -n "$INACTIVE_CORE" ]; then
            docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" stop $INACTIVE_CORE 2>/dev/null || true
        fi

        if [ "$PROFILE_ARG" = "all" ] || [ "$PROFILE_ARG" = "apps" ]; then
            start_forge_apps dev
        fi

        $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner dev
        ;;

    prod)
        echo "🔀 [${BRAND_NAME}] Synchronizing dynamic reverse proxy routes from .env..."
        $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        ensure_forge_network
        PROFILE_ARG="all"
        TARGET_PARAM="${1:-}"
        if [ "$TARGET_PARAM" = "--profile" ] && [ -n "${2:-}" ]; then
            PROFILE_ARG="$2"
            TARGET_PARAM=""
        elif [ "$TARGET_PARAM" = "core" ] || [ "$TARGET_PARAM" = "apps" ] || [ "$TARGET_PARAM" = "monitoring" ] || [ "$TARGET_PARAM" = "all" ]; then
            PROFILE_ARG="$TARGET_PARAM"
            TARGET_PARAM=""
        fi

        if [ -n "$TARGET_PARAM" ]; then
            if ! $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" validate-target "$TARGET_PARAM" >/dev/null 2>&1; then
                echo "❌ [${BRAND_NAME}] Targeted service or app '$TARGET_PARAM' is not declared or active in .env." >&2
                echo "   Configure it in .env or run './run.sh docker prod' to start the configured stack." >&2
                exit 1
            fi

            CLEAN_TARGET="${TARGET_PARAM#app-}"
            if [ -d "$REPO_ROOT/forge-apps/$CLEAN_TARGET" ] && [ -f "$REPO_ROOT/forge-apps/$CLEAN_TARGET/docker-compose.yml" ]; then
                echo "🚀 [${BRAND_NAME}] Starting standalone Forge App '$CLEAN_TARGET' in Docker Prod..."
                docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" up -d --build proxy
                start_forge_apps prod "$CLEAN_TARGET"
                $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner prod "$CLEAN_TARGET"
                exit 0
            else
                echo "🚀 [${BRAND_NAME}] Starting targeted service '$TARGET_PARAM' in Docker Prod..."
                docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" up -d --build proxy "$TARGET_PARAM"
                $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner prod "$TARGET_PARAM"
                exit 0
            fi
        fi

        ACTIVE_CORE="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-core-active prod "$PROFILE_ARG")"
        INACTIVE_CORE="$($PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" get-core-inactive prod "$PROFILE_ARG")"

        echo "🚀 [${BRAND_NAME}] Starting Production Docker Stack..."
        docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" up -d --build $ACTIVE_CORE

        if [ -n "$INACTIVE_CORE" ]; then
            docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" stop $INACTIVE_CORE 2>/dev/null || true
        fi

        if [ "$PROFILE_ARG" = "all" ] || [ "$PROFILE_ARG" = "apps" ]; then
            start_forge_apps prod
        fi

        $PORTABLE_BUN run "$REPO_ROOT/scripts/docker-resolver.ts" banner prod
        ;;

    build)
        TARGET_APP="${1:-}"
        if [ -n "$TARGET_APP" ]; then
            CLEAN_APP="${TARGET_APP#app-}"
            if [ -f "$REPO_ROOT/apps/src/$TARGET_APP/docker/Dockerfile" ]; then
                echo "🔨 Building image for apps/src/$TARGET_APP..."
                docker build -f "$REPO_ROOT/apps/src/$TARGET_APP/docker/Dockerfile" -t "${CONTAINER_PREFIX}-$TARGET_APP" "$REPO_ROOT"
            elif [ -f "$REPO_ROOT/forge-apps/$CLEAN_APP/docker-compose.yml" ]; then
                echo "🔨 Building image for forge-apps/$CLEAN_APP..."
                docker compose -p "${CONTAINER_PREFIX:-ag}-app-$CLEAN_APP-prod" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/forge-apps/$CLEAN_APP/docker-compose.yml" build
            elif [ -f "$REPO_ROOT/forge-apps/$TARGET_APP/docker-compose.yml" ]; then
                echo "🔨 Building image for forge-apps/$TARGET_APP..."
                docker compose -p "${CONTAINER_PREFIX:-ag}-app-$TARGET_APP-prod" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/forge-apps/$TARGET_APP/docker-compose.yml" build
            else
                echo "❌ Could not find Dockerfile or compose configuration for $TARGET_APP"
                exit 1
            fi
        else
            echo "🔨 Building all production images via docker/prod/docker-compose.yml..."
            BUILD_PROFILES="--profile all"
            if is_builtin_landing_active; then
                BUILD_PROFILES="$BUILD_PROFILES --profile landing"
            fi
            docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" $BUILD_PROFILES build
            for app_dir in "$REPO_ROOT/forge-apps"/*; do
                if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
                    app_name="$(basename "$app_dir")"
                    [ "$app_name" = "app-template" ] && continue
                    echo "🔨 Building standalone image for forge-apps/$app_name..."
                    docker compose -p "${CONTAINER_PREFIX:-ag}-app-$app_name-prod" --env-file "$REPO_ROOT/.env" -f "$app_dir/docker-compose.yml" build
                fi
            done
        fi
        ;;

    down)
        echo "🛑 [${BRAND_NAME}] Gracefully stopping Docker containers..."
        docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all --profile landing down --remove-orphans 2>/dev/null || true
        docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" --profile all --profile landing down --remove-orphans 2>/dev/null || true
        docker compose -p "$COMPOSE_PROJECT_NAME" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all --profile landing down --remove-orphans 2>/dev/null || true
        stop_forge_apps
        echo "✨ Containers stopped."
        ;;

    restart)
        SVC="${1:-}"
        FLAG="${2:-}"
        TARGET_COMPOSE="$REPO_ROOT/docker/dev/docker-compose.yml"
        TARGET_PROJECT="$DEV_PROJECT"
        if [ "$FLAG" = "--prod" ] || [ "$SVC" = "--prod" ]; then
            TARGET_COMPOSE="$REPO_ROOT/docker/prod/docker-compose.yml"
            TARGET_PROJECT="$PROD_PROJECT"
            [ "$SVC" = "--prod" ] && SVC=""
        fi
        if [ -n "$SVC" ]; then
            CLEAN_SVC="${SVC#app-}"
            if [ -d "$REPO_ROOT/forge-apps/$CLEAN_SVC" ] && [ -f "$REPO_ROOT/forge-apps/$CLEAN_SVC/docker-compose.yml" ]; then
                echo "🔄 [${BRAND_NAME}] Restarting standalone Forge App: $CLEAN_SVC..."
                docker compose -p "${CONTAINER_PREFIX:-ag}-app-$CLEAN_SVC-dev" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/forge-apps/$CLEAN_SVC/docker-compose.yml" restart
            else
                echo "🔄 [${BRAND_NAME}] Restarting service: $SVC..."
                docker compose -p "$TARGET_PROJECT" --env-file "$REPO_ROOT/.env" -f "$TARGET_COMPOSE" --profile all --profile landing restart "$SVC"
            fi
        else
            RESTART_PROFILES="--profile all"
            if is_builtin_landing_active; then
                RESTART_PROFILES="$RESTART_PROFILES --profile landing"
            fi
            echo "🔄 [${BRAND_NAME}] Restarting stack ($TARGET_COMPOSE)..."
            docker compose -p "$TARGET_PROJECT" --env-file "$REPO_ROOT/.env" -f "$TARGET_COMPOSE" $RESTART_PROFILES restart
            for app_dir in "$REPO_ROOT/forge-apps"/*; do
                if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
                    app_name="$(basename "$app_dir")"
                    [ "$app_name" = "app-template" ] && continue
                    docker compose -p "${CONTAINER_PREFIX:-ag}-app-$app_name-dev" --env-file "$REPO_ROOT/.env" -f "$app_dir/docker-compose.yml" restart 2>/dev/null || true
                fi
            done
        fi
        ;;

    ps|status)
        echo "📊 [${BRAND_NAME}] Live Container Status:"
        FLAG="${1:-}"
        if [ "$FLAG" = "--prod" ]; then
            docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" --profile all ps
            status_forge_apps prod
        else
            docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all ps
            docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" --profile all ps 2>/dev/null || true
            status_forge_apps dev
        fi
        ;;

    top|ctop)
        "$REPO_ROOT/portables/bin/ctop" "$@"
        ;;

    monitor)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/terminal-monitor.ts" "$@"
        ;;

    logs)
        SVC="${1:-}"
        FLAG="${2:-}"
        TARGET_COMPOSE="$REPO_ROOT/docker/dev/docker-compose.yml"
        TARGET_PROJECT="$DEV_PROJECT"
        if [ "$FLAG" = "--prod" ] || [ "$SVC" = "--prod" ]; then
            TARGET_COMPOSE="$REPO_ROOT/docker/prod/docker-compose.yml"
            TARGET_PROJECT="$PROD_PROJECT"
            [ "$SVC" = "--prod" ] && SVC=""
        fi
        if [ -n "$SVC" ]; then
            CLEAN_SVC="${SVC#app-}"
            if [ -d "$REPO_ROOT/forge-apps/$CLEAN_SVC" ] && [ -f "$REPO_ROOT/forge-apps/$CLEAN_SVC/docker-compose.yml" ]; then
                docker compose -p "${CONTAINER_PREFIX:-ag}-app-$CLEAN_SVC-dev" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/forge-apps/$CLEAN_SVC/docker-compose.yml" logs --tail=100
            else
                docker compose -p "$TARGET_PROJECT" --env-file "$REPO_ROOT/.env" -f "$TARGET_COMPOSE" --profile all logs --tail=100 "$SVC"
            fi
        else
            docker compose -p "$TARGET_PROJECT" --env-file "$REPO_ROOT/.env" -f "$TARGET_COMPOSE" --profile all logs --tail=50
            for app_dir in "$REPO_ROOT/forge-apps"/*; do
                if [ -d "$app_dir" ] && [ -f "$app_dir/docker-compose.yml" ]; then
                    app_name="$(basename "$app_dir")"
                    [ "$app_name" = "app-template" ] && continue
                    docker compose -p "${CONTAINER_PREFIX:-ag}-app-$app_name-dev" --env-file "$REPO_ROOT/.env" -f "$app_dir/docker-compose.yml" logs --tail=50 2>/dev/null || true
                fi
            done
        fi
        ;;

    purge)
        echo "⚠️ [${BRAND_NAME}] Purging dangling containers, build caches, and stale volumes..."
        docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all down --remove-orphans 2>/dev/null || true
        docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" --profile all down --remove-orphans 2>/dev/null || true
        docker compose -p "$COMPOSE_PROJECT_NAME" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all down --remove-orphans 2>/dev/null || true
        stop_forge_apps
        docker volume prune -f
        docker image prune -f
        echo "✨ Cleaned."
        ;;

    reset-data)
        echo "⚠️ [${BRAND_NAME}] FULL RESET: Stopping all containers, removing all images & persistent DB volumes..."
        if [ "$APP_ENV" = "production" ] && [ "${1:-}" != "--force-production-wipe" ] && [ "${2:-}" != "--force-production-wipe" ]; then
            echo "🛑 BLOCKED: APP_ENV is set to 'production'!"
            echo "   Persistent volume wipe protection active. Pass '--force-production-wipe' to proceed."
            exit 1
        fi
        docker compose -p "$DEV_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all down -v --remove-orphans 2>/dev/null || true
        docker compose -p "$PROD_PROJECT" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/prod/docker-compose.yml" --profile all down -v --remove-orphans 2>/dev/null || true
        docker compose -p "$COMPOSE_PROJECT_NAME" --env-file "$REPO_ROOT/.env" -f "$REPO_ROOT/docker/dev/docker-compose.yml" --profile all down -v --remove-orphans 2>/dev/null || true
        stop_forge_apps "" "true"
        docker volume prune -f
        docker image prune -a -f
        echo "✨ All containers, images, and volumes purged."
        ;;

    *)
        echo "Usage: ./run.sh docker [up|dev|prod|build|down|restart|status|top|ctop|monitor|logs|purge|reset-data]"
        exit 1
        ;;
esac
