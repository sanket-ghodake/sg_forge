#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration CLI (2026 LTS)
# 100% Dynamically Configured from .env (Brand, Docker, Proxy & Microservices)
# Clean Architecture Modular Dispatcher (<100 Lines, Zero Host Modifications)
# ==============================================================================
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export REPO_ROOT

# Source cross-platform environment & portable runtime resolver
source "$REPO_ROOT/scripts/run/env.sh"

CMD="${1:-help}"

case "$CMD" in
    # Help & Documentation
    help|-h|--help)
        "$REPO_ROOT/scripts/run/help.sh"
        ;;

    # Core Development, Scaffolding & Testing
    setup|sync-submodules|dev|sync-proxy|certs|trust-cert|fallback|sync-ignores|test|reset-db|doctor|clean|create-app|lock-logo|unlock-logo|logo-status|lock-landing|unlock-landing|landing-status)
        "$REPO_ROOT/scripts/run/core.sh" "$@"
        ;;

    # Docker Stack Lifecycle & Real-Time Ergonomic Aliases
    docker)
        shift || true
        "$REPO_ROOT/scripts/run/docker.sh" "$@"
        ;;
    up|down|ps|status|top|ctop|monitor|logs|restart)
        "$REPO_ROOT/scripts/run/docker.sh" "$@"
        ;;

    # Quality Gates, Linters, SAST & Security Toolchain
    verify|lint|deadcode|secrets|arch|typecheck|shellcheck|semgrep|a11y|spectral|contracts|complexity|check-pkg|licenses|vuln|trivy|sbom|lhci|fuzz|schemathesis|loadtest|k6|benchmark|pack|graft|tokens|codeburn|headroom|council|diagram:lint|diagram-lint|diagram:convert-mermaid|mermaid-extract|diagram:convert-drawio|drawio-extract|docs:coverage|doc-coverage|docs:dev|docs:build)
        "$REPO_ROOT/scripts/run/quality.sh" "$@"
        ;;

    # Production Deployment, Database Snapshots, Hardening & Cryptography
    deploy-prod|rollback-prod|prod-status|backup|backup-daemon|backup-verify|harden|gen-key)
        "$REPO_ROOT/scripts/run/ops.sh" "$@"
        ;;

    *)
        echo "❌ Unknown command: $CMD" >&2
        echo "Run './run.sh help' to inspect all available platform orchestration commands." >&2
        exit 1
        ;;
esac
