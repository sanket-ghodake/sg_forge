#!/usr/bin/env bash
# ==============================================================================
# Dynamic Platform Orchestration - Quality & Toolchain Module (2026 LTS)
# Handles verification gates, AST linters, security scanners, licenses, SBOM
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
    verify)
        echo "🛡️ [${BRAND_NAME}] Running Automated AI Agent Quality Gate (27 Deterministic Gates)..."
        $PORTABLE_BUN run "$REPO_ROOT/scripts/generate-proxy.ts"
        $PORTABLE_BUN run "$REPO_ROOT/scripts/verify-gate.ts" "$@"
        ;;

    lint)
        "$REPO_ROOT/portables/bin/biome" "$@"
        ;;

    deadcode)
        "$REPO_ROOT/portables/bin/knip" "$@"
        ;;

    secrets)
        "$REPO_ROOT/portables/bin/gitleaks" "$@"
        ;;

    arch)
        echo "🏛️ [${BRAND_NAME}] Auditing monorepo architecture and circular dependencies..."
        "$REPO_ROOT/portables/bin/depcruise" apps/src forge-apps
        "$REPO_ROOT/portables/bin/madge" apps/src
        ;;

    typecheck)
        "$REPO_ROOT/portables/bin/type-coverage" "$@"
        ;;

    shellcheck)
        "$REPO_ROOT/portables/bin/shellcheck" "$@"
        ;;

    semgrep)
        "$REPO_ROOT/portables/bin/semgrep" "$@"
        ;;

    a11y)
        "$REPO_ROOT/portables/bin/axe" "$@"
        ;;

    spectral|contracts)
        if [ $# -ge 1 ]; then
            "$REPO_ROOT/portables/bin/spectral" "$@"
        else
            "$REPO_ROOT/portables/bin/spectral" lint "$REPO_ROOT/apps/src/docs/api/openapi.yaml"
        fi
        ;;

    complexity)
        "$REPO_ROOT/portables/bin/lizard" "$@"
        ;;

    check-pkg)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/check-package-health.ts" "$@"
        ;;

    licenses)
        $PORTABLE_BUN -e 'import { checkDependencyLicenses } from "./scripts/verify-checks.ts"; const res = checkDependencyLicenses(); console.log(res.details);'
        ;;

    vuln)
        "$REPO_ROOT/portables/bin/osv-scanner" "$@"
        ;;

    trivy)
        "$REPO_ROOT/portables/bin/trivy" "$@"
        ;;

    sbom)
        "$REPO_ROOT/scripts/generate-sbom.sh" "$@"
        ;;

    lhci)
        "$REPO_ROOT/portables/bin/lhci" "$@"
        ;;

    fuzz|schemathesis)
        "$REPO_ROOT/portables/bin/schemathesis" "$@"
        ;;

    loadtest|k6)
        "$REPO_ROOT/portables/bin/k6" "$@"
        ;;

    benchmark)
        "$REPO_ROOT/portables/bin/autocannon" "$@"
        ;;

    pack)
        "$REPO_ROOT/portables/bin/repomix" "$@"
        ;;

    graft)
        "$REPO_ROOT/portables/bin/graft" "$@"
        ;;

    tokens|codeburn)
        ACTION="${1:-}"
        case "$ACTION" in
            tui)
                shift || true
                "$REPO_ROOT/portables/bin/codeburn" "$@"
                ;;
            sync)
                shift || true
                $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-tokens.ts" "$@"
                ;;
            *)
                $PORTABLE_BUN run "$REPO_ROOT/scripts/display-tokens.ts" "$@"
                ;;
        esac
        ;;

    headroom)
        "$REPO_ROOT/portables/bin/headroom" "$@"
        ;;

    council)
        "$REPO_ROOT/portables/bin/council" "$@"
        ;;

    diagram:lint|diagram-lint)
        python3 "$REPO_ROOT/scripts/diagrams/self_check.py" "$@"
        ;;

    diagram:convert-mermaid|mermaid-extract)
        python3 "$REPO_ROOT/scripts/diagrams/mermaid_extract.py" "$@"
        ;;

    diagram:convert-drawio|drawio-extract)
        python3 "$REPO_ROOT/scripts/diagrams/drawio_extract.py" "$@"
        ;;

    docs:coverage|doc-coverage)
        $PORTABLE_BUN run "$REPO_ROOT/scripts/verify-doc-coverage.ts" "$@"
        ;;

    docs:dev)
        if [ -d "$REPO_ROOT/apps/src/docs" ]; then
            $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-submodule-docs.ts"
            (cd "$REPO_ROOT/apps/src/docs" && $PORTABLE_BUN run dev)
        else
            echo "❌ Docs application directory not found at apps/src/docs" >&2
            exit 1
        fi
        ;;

    docs:build)
        if [ -d "$REPO_ROOT/apps/src/docs" ]; then
            $PORTABLE_BUN run "$REPO_ROOT/scripts/sync-submodule-docs.ts"
            (cd "$REPO_ROOT/apps/src/docs" && $PORTABLE_BUN run build)
        else
            echo "❌ Docs application directory not found at apps/src/docs" >&2
            exit 1
        fi
        ;;

    *)
        echo "❌ Unknown quality/toolchain command: $CMD" >&2
        exit 1
        ;;
esac
