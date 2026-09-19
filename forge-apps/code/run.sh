#!/usr/bin/env bash
# ==============================================================================
# SG Forge Submodule - Autonomous Microservice CLI (2026 LTS)
# 100% Independent: Operates, tests, and deploys standalone or inside Monorepo
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Add local portables and monorepo fallback to PATH
export PATH="$DIR/portables/bin:$DIR/../../portables/bin:$DIR/../../portables/bun/bin:$PATH"

# Auto-copy .env.example to .env if .env is missing
if [ ! -f "$DIR/.env" ] && [ -f "$DIR/.env.example" ]; then
  echo "ℹ️ Auto-generating .env from .env.example..."
  cp "$DIR/.env.example" "$DIR/.env"
fi

CMD="${1:-help}"
shift || true

# Resolve Bun Runtime via 3-tier cascade (with autonomous setup bootstrap)
if [ -f "$DIR/portables/bun/bin/bun" ]; then
  BUN_BIN="$DIR/portables/bun/bin/bun"
elif [ -f "$DIR/../../portables/bun/bin/bun" ]; then
  BUN_BIN="$DIR/../../portables/bun/bin/bun"
elif command -v bun >/dev/null 2>&1; then
  BUN_BIN="bun"
elif [ "$CMD" = "setup" ]; then
  echo "📥 Bun runtime not detected on isolated machine. Auto-installing portable Bun..."
  if command -v curl >/dev/null 2>&1; then
    mkdir -p "$DIR/portables/bun"
    curl -fsSL https://bun.sh/install | BUN_INSTALL="$DIR/portables/bun" bash >/dev/null 2>&1 || true
  fi
  if [ -f "$DIR/portables/bun/bin/bun" ]; then
    BUN_BIN="$DIR/portables/bun/bin/bun"
  elif command -v bun >/dev/null 2>&1; then
    BUN_BIN="bun"
  else
    echo "❌ Error: Could not auto-install Bun. Please install Bun from https://bun.sh"
    exit 1
  fi
else
  echo "❌ Error: Bun runtime not found. Run './run.sh setup' to bootstrap or install Bun from https://bun.sh"
  exit 1
fi

APP_PORT="$(grep -E '^PORT=' "$DIR/.env" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo '8099')"
APP_NAME="$(grep -E '^APP_NAME=' "$DIR/.env" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo 'template')"

ensure_gateway_network() {
  local net_name="${FORGE_APPS_NETWORK:-${CONTAINER_PREFIX:-${PROJECT_NAME:-forge}}_apps_net}"
  if command -v docker >/dev/null 2>&1; then
    if ! docker network inspect "$net_name" >/dev/null 2>&1; then
      echo "🌐 Creating standalone gateway network: $net_name..."
      docker network create "$net_name" >/dev/null 2>&1 || true
    fi
  fi
}

case "$CMD" in
  # ----------------------------------------------------------------------------
  # Core Development & Lifecycle
  # ----------------------------------------------------------------------------
  setup)
    echo "⚡ [Forge App] Bootstrapping autonomous micro-app environment..."
    if [ ! -f "$DIR/.env" ] && [ -f "$DIR/.env.example" ]; then
      echo "📄 Provisioning .env from .env.example..."
      cp "$DIR/.env.example" "$DIR/.env"
    fi
    echo "⚓ Hardening script permissions & Git configuration..."
    chmod +x "$DIR"/run.sh "$DIR"/env.sh "$DIR"/portables/bin/* "$DIR"/.githooks/* 2>/dev/null || true
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      git config core.filemode false
      git config core.autocrlf false
      git config core.hooksPath .githooks
    fi
    echo "📦 Installing microservice dependencies with Bun..."
    "$BUN_BIN" install
    DB_FILE="$DIR/data/${APP_NAME}.db"
    if [ ! -f "$DB_FILE" ]; then
      echo "🌱 Bootstrapping dedicated local Turso DB ($DB_FILE)..."
      mkdir -p "$DIR/data"
      "$BUN_BIN" -e "
        import { Database } from 'bun:sqlite';
        const db = new Database('$DB_FILE');
        db.run('PRAGMA journal_mode = WAL;');
        db.run('PRAGMA foreign_keys = ON;');
        db.run('CREATE TABLE IF NOT EXISTS ${APP_NAME.replace(/-/g, '_')}_records (id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT \"ACTIVE\", created_at INTEGER NOT NULL);');
        db.close();
      " 2>/dev/null || true
    fi
    "$BUN_BIN" run scripts/sync-ignores.ts
    mkdir -p "$DIR/logs"
    [ ! -f "$DIR/logs/WORKLOGS.md" ] && echo "# WORKLOGS" > "$DIR/logs/WORKLOGS.md"
    [ ! -f "$DIR/logs/commits.jsonl" ] && touch "$DIR/logs/commits.jsonl"
    [ ! -f "$DIR/logs/token-ledger.jsonl" ] && touch "$DIR/logs/token-ledger.jsonl"
    echo "✅ Using Bun: $($BUN_BIN --version)"
    echo "💡 Tips for IDE & Terminal PATH:"
    echo "   ├─ VS Code / Cursor: Terminal PATH is pre-configured via .vscode/settings.json"
    echo "   ├─ External Shells:  run 'source env.sh'"
    echo "   └─ Direct Fallback:  run './portables/bin/rtk <command>'"
    echo "✨ Setup completed successfully! Run './run.sh dev' to start."
    ;;

  dev)
    echo "🚀 Starting standalone micro-app in watch mode..."
    exec "$BUN_BIN" --watch src/server.ts "$@"
    ;;

  start)
    echo "⚡ Starting standalone micro-app in production mode..."
    exec "$BUN_BIN" src/server.ts "$@"
    ;;

  docs:dev|docs)
    echo "📖 Starting standalone micro-app with Living Documentation Engine..."
    echo "   ├─ App Interface:   http://localhost:${APP_PORT}"
    echo "   ├─ Docs Hub:        http://localhost:${APP_PORT}/docs"
    echo "   └─ OpenAPI 3.1:     http://localhost:${APP_PORT}/docs/api"
    exec "$BUN_BIN" --watch src/server.ts "$@"
    ;;

  docs:coverage|doc-coverage)
    echo "📑 Running Living Documentation & Traceability Gate..."
    exec "$BUN_BIN" run scripts/verify-gate.ts "$@"
    ;;

  test)
    echo "🧪 Running 5-tier microservice tests..."
    NODE_ENV=test BUN_ENV=test FORGE_TEST_MODE=true exec "$BUN_BIN" test "$@"
    ;;

  compile)
    echo "📦 Compiling standalone micro-app production bundle..."
    exec "$BUN_BIN" build src/server.ts --target=bun --minify --sourcemap=none --outdir dist "$@"
    ;;

  reset-db)
    echo "⚠️ [Forge App] Dedicated Database Reset Tool"
    FORCE="${1:-}"
    if [ "$FORCE" = "--force" ] || [ "$FORCE" = "-y" ]; then
      CONFIRM="y"
    elif [ ! -t 0 ]; then
      echo "🛑 Non-interactive shell detected. Use '--force' or '-y' to confirm reset."
      exit 1
    else
      read -p "Delete and re-seed dedicated database for ${APP_NAME}? [y/N]: " -n 1 -r CONFIRM
      echo
    fi
    if [[ $CONFIRM =~ ^[Yy]$ ]]; then
      rm -f "$DIR"/data/*.db "$DIR"/data/*.db-wal "$DIR"/data/*.db-shm
      echo "🌱 Re-initializing clean dedicated database..."
      mkdir -p "$DIR/data"
      TABLE_NAME="$(echo "${APP_NAME}" | tr '-' '_')"
      "$BUN_BIN" -e "
        import { Database } from 'bun:sqlite';
        const db = new Database('$DIR/data/${APP_NAME}.db');
        db.run('PRAGMA journal_mode = WAL;');
        db.run('PRAGMA foreign_keys = ON;');
        db.run('CREATE TABLE IF NOT EXISTS ${TABLE_NAME}_records (id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT \"ACTIVE\", created_at INTEGER NOT NULL);');
        db.close();
      "
      echo "✨ Dedicated database reset to pristine seeded state."
    else
      echo "Cancelled."
    fi
    ;;

  sync-ignores)
    exec "$BUN_BIN" run scripts/sync-ignores.ts "$@"
    ;;

  sync-directives)
    echo "🤖 [Forge App] Synchronizing multi-agent directives..."
    if [ -f "$DIR/AGENTS.md" ]; then
      CONTENT="$(cat "$DIR/AGENTS.md")"
      for target in GEMINI.md CLAUDE.md .cursorrules .agents/AGENTS.md .cursor/rules/AGENTS.md .github/copilot-instructions.md; do
        target_path="$DIR/$target"
        mkdir -p "$(dirname "$target_path")"
        printf "%s\n" "$CONTENT" > "$target_path"
      done
      echo "✅ Multi-agent directives synchronized across all 6 targets."
    else
      echo "❌ AGENTS.md not found."
      exit 1
    fi
    ;;

  backup)
    echo "💾 Running autonomous database backup..."
    exec "$BUN_BIN" run scripts/backup-db.ts "$@"
    ;;

  # ----------------------------------------------------------------------------
  # Quality, Security & Toolchain Gates
  # ----------------------------------------------------------------------------
  verify)
    echo "🛡️ Running pre-commit quality verification gate (21 Checks)..."
    exec "$BUN_BIN" run scripts/verify-gate.ts "$@"
    ;;

  lint)
    exec "$DIR/portables/bin/biome" "$@"
    ;;

  deadcode)
    exec "$DIR/portables/bin/knip" "$@"
    ;;

  secrets)
    exec "$DIR/portables/bin/gitleaks" "$@"
    ;;

  semgrep)
    exec "$DIR/portables/bin/semgrep" "$@"
    ;;

  shellcheck)
    exec "$DIR/portables/bin/shellcheck" "$@"
    ;;

  complexity)
    exec "$DIR/portables/bin/lizard" "$@"
    ;;

  typecheck)
    exec "$DIR/portables/bin/type-coverage" "$@"
    ;;

  trivy)
    exec "$DIR/portables/bin/trivy" "$@"
    ;;

  vuln)
    exec "$DIR/portables/bin/osv-scanner" "$@"
    ;;

  sbom)
    exec "$DIR/portables/bin/syft" "$@"
    ;;

  pack)
    exec "$DIR/portables/bin/repomix" "$@"
    ;;

  benchmark)
    exec "$DIR/portables/bin/autocannon" "$@"
    ;;

  a11y)
    exec "$DIR/portables/bin/axe" "$@"
    ;;

  spectral|contracts)
    if [ $# -eq 0 ]; then
      set -- docs/api/openapi.yaml
    fi
    exec "$DIR/portables/bin/spectral" lint "$@"
    ;;

  # ----------------------------------------------------------------------------
  # AI Engineering, Spend Tracking & Context
  # ----------------------------------------------------------------------------
  tokens)
    exec "$DIR/portables/bin/tokscale" "$@"
    ;;

  graft)
    echo "🧠 Running Graft Code Context Graph..."
    exec "$DIR/portables/bin/graft" "$@"
    ;;

  headroom)
    exec "$DIR/portables/bin/headroom" "$@"
    ;;

  council)
    exec "$DIR/portables/bin/council" "$@"
    ;;

  worklog)
    if [ $# -eq 0 ]; then
      echo "❌ Usage: ./run.sh worklog <message>"
      exit 1
    fi
    exec "$BUN_BIN" run scripts/append-worklog.ts "$*"
    ;;

  # ----------------------------------------------------------------------------
  # Docker Lifecycle & Shortcuts
  # ----------------------------------------------------------------------------
  build)
    echo "🐳 Building standalone Docker image..."
    exec docker build -f docker/Dockerfile -t "${PWD##*/}" "$@" .
    ;;

  compose|docker)
    ensure_gateway_network
    exec docker compose "$@"
    ;;

  up)
    ensure_gateway_network
    echo "🐳 Starting standalone Docker Compose stack..."
    exec docker compose up -d "$@"
    ;;

  down)
    echo "🛑 Stopping standalone Docker Compose stack..."
    exec docker compose down "$@"
    ;;

  ps|status)
    exec docker compose ps "$@"
    ;;

  logs)
    exec docker compose logs -f "$@"
    ;;

  restart)
    exec docker compose restart "$@"
    ;;

  top|ctop)
    exec "$DIR/portables/bin/ctop" "$@"
    ;;

  # ----------------------------------------------------------------------------
  # Maintenance, Diagnostics & Housekeeping
  # ----------------------------------------------------------------------------
  doctor)
    echo "🩺 [Forge App] Running Pre-Flight Diagnostics..."
    echo "1. Bun Runtime:     $($BUN_BIN --version 2>/dev/null || echo 'Not installed')"
    echo "2. RTK Tool:        $(rtk --version 2>/dev/null || ./portables/bin/rtk --version 2>/dev/null || echo 'Ready')"
    echo "3. Dedicated DB:    $(ls -lh data/*.db 2>/dev/null || echo 'Not initialized (run ./run.sh setup)')"
    echo "4. Git Hooks:       $(git config core.hooksPath 2>/dev/null || echo 'Not configured')"
    echo "5. Host OS/Arch:    $(uname -s 2>/dev/null || echo 'Unknown') $(uname -m 2>/dev/null || true)"
    echo "6. Designated Port: ${APP_PORT}"
    if command -v lsof >/dev/null 2>&1 && lsof -i :"${APP_PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "   ⚠️ Port ${APP_PORT} is currently bound by an active process"
    else
      echo "   ✅ Port ${APP_PORT} is available"
    fi
    echo "✅ Diagnostics Completed."
    ;;

  clean)
    echo "🧹 [Forge App] Cleaning caches, transient logs, and build artifacts..."
    rm -rf .cache dist *.tsbuildinfo
    find "$DIR/logs" -maxdepth 1 -name "*.log" -exec rm -f {} + 2>/dev/null || true
    echo "✨ Cleaned."
    ;;

  setup-hooks)
    echo "⚓ Configuring Git hooks (.githooks)..."
    git config core.hooksPath .githooks
    chmod +x .githooks/* 2>/dev/null || true
    echo "✅ Git hooks activated! Pre-commit gate will verify tests before committing."
    ;;

  help|*)
    echo "
======================================================================
🚀 Forge Autonomous Micro-App CLI (2026 LTS Baseline)
======================================================================
Usage: ./run.sh <command> [options]

Core Development & Lifecycle:
  setup                 Bootstrap environment, permissions, DB, and dependencies
  dev                   Start local server in hot-reload watch mode
  start                 Start server in production mode
  test [opt]            Execute local 5-tier test suites (NODE_ENV=test)
  reset-db [--force]    Reset local dedicated database to pristine seeded state
  sync-ignores          Synchronize submodule ignore files & .gitattributes
  sync-directives       Synchronize multi-agent instructions from AGENTS.md
  backup                Run isolated database snapshot (VACUUM INTO)

Quality, Security & Toolchain:
  verify                Run quality verification gate (21 Deterministic Gates)
  lint                  Run Biome fast AST code quality & style checks
  deadcode              Run Knip dead code & unexported symbol audit
  secrets               Run Gitleaks secret & credential scanner
  semgrep               Run Semgrep SAST security vector analysis
  shellcheck            Audit bash & shell script safety
  complexity            Audit Cyclomatic Complexity (CCN <= 10, Lizard)
  typecheck             Audit strict TypeScript compilation & coverage
  trivy                 Audit container Dockerfile & configuration security
  vuln                  Audit dependencies against OSV vulnerability database
  sbom                  Generate CycloneDX 1.5 Software Bill of Materials (Syft)
  pack [output]         Package codebase into compressed AI context (Repomix)
  benchmark [url]       Benchmark HTTP throughput & latency (Autocannon)
  a11y                  Audit UI components for WCAG 2.1 AA accessibility (Axe)
  contracts [file]      Lint OpenAPI 3.1 specifications (Spectral)

AI Engineering & Token Observability:
  tokens [cmd]          Display lifetime spend, sync ledger, or launch TUI (Tokscale)
  graft [cmd]           Run Graft code context graph (skeleton, callers, blast)
  headroom [cmd]        Run Headroom context compression engine
  council [idea]        Run Council of AI multi-agent decision framework
  worklog <msg>         Append task completion to logs/WORKLOGS.md

Living Documentation:
  docs / docs:dev       Launch local server with Living Documentation Hub
  docs:coverage         Audit bidirectional requirement coverage & @requirements

Docker Stack Lifecycle:
  up                    Start standalone Docker Compose stack
  down                  Stop standalone Docker Compose stack
  ps / status           Inspect status of running container
  logs                  Tail container logs in real time
  restart               Restart container service
  top / ctop            Monitor real-time container metrics (ctop)
  build                 Build standalone container image (context: .)
  compose [cmd]         Execute raw Docker Compose command

Diagnostics & Housekeeping:
  doctor                Inspect toolchain, port binding, and database status
  clean                 Purge temporary build caches and transient logs
  setup-hooks           Activate versioned git hooks (.githooks)
  help                  Show this banner
======================================================================
"
    ;;
esac
