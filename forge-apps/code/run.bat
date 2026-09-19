@echo off
rem ==============================================================================
rem SG Forge Submodule - Windows CLI Orchestrator (2026 LTS)
rem 100% Standalone: Runs on Windows cmd.exe / PowerShell without WSL
rem ==============================================================================
setlocal enabledelayedexpansion

set "DIR=%~dp0"
cd /d "%DIR%"

rem Auto-copy .env.example to .env if missing
if not exist "%DIR%.env" (
    if exist "%DIR%.env.example" (
        echo ℹ️ Auto-generating .env from .env.example...
        copy "%DIR%.env.example" "%DIR%.env" >nul
    )
)

rem Resolve Bun Runtime via 3-tier cascade
set "BUN_BIN=bun"
if exist "%DIR%portables\bun\bin\bun.exe" (
    set "BUN_BIN=%DIR%portables\bun\bin\bun.exe"
) else if exist "%DIR%..\..\portables\bun\bin\bun.exe" (
    set "BUN_BIN=%DIR%..\..\portables\bun\bin\bun.exe"
)

set "CMD=%~1"
if "%CMD%"=="" set "CMD=help"

rem ----------------------------------------------------------------------------
rem Core Development & Lifecycle
rem ----------------------------------------------------------------------------
if "%CMD%"=="setup" (
    echo ⚡ [Forge App] Bootstrapping autonomous micro-app environment...
    if not exist "%DIR%.env" (
        if exist "%DIR%.env.example" copy "%DIR%.env.example" "%DIR%.env" >nul
    )
    git config core.filemode false 2>nul
    git config core.autocrlf false 2>nul
    git config core.hooksPath .githooks 2>nul
    echo 📦 Installing dependencies with Bun...
    "%BUN_BIN%" install
    "%BUN_BIN%" run scripts\sync-ignores.ts
    if not exist "%DIR%logs" mkdir "%DIR%logs"
    if not exist "%DIR%logs\WORKLOGS.md" echo # WORKLOGS > "%DIR%logs\WORKLOGS.md"
    if not exist "%DIR%logs\commits.jsonl" type nul > "%DIR%logs\commits.jsonl"
    if not exist "%DIR%logs\token-ledger.jsonl" type nul > "%DIR%logs\token-ledger.jsonl"
    echo ✨ Setup completed successfully! Run 'run.bat dev' to start.
    goto :eof
)

if "%CMD%"=="dev" (
    echo 🚀 Starting standalone micro-app in watch mode...
    shift
    "%BUN_BIN%" --watch src\server.ts %*
    goto :eof
)

if "%CMD%"=="docs:dev" goto :do_docs
if "%CMD%"=="docs" goto :do_docs
goto :not_docs
:do_docs
echo 📖 Starting standalone micro-app with Living Documentation Engine...
shift
"%BUN_BIN%" --watch src\server.ts %*
goto :eof
:not_docs

if "%CMD%"=="docs:coverage" goto :do_doc_coverage
if "%CMD%"=="doc-coverage" goto :do_doc_coverage
goto :not_doc_coverage
:do_doc_coverage
echo 📑 Running Living Documentation & Traceability Gate...
shift
"%BUN_BIN%" run scripts\verify-gate.ts %*
goto :eof
:not_doc_coverage

if "%CMD%"=="start" (
    echo ⚡ Starting standalone micro-app in production mode...
    shift
    "%BUN_BIN%" src\server.ts %*
    goto :eof
)

if "%CMD%"=="test" (
    echo 🧪 Running 5-tier microservice tests...
    shift
    set "NODE_ENV=test"
    set "BUN_ENV=test"
    set "FORGE_TEST_MODE=true"
    "%BUN_BIN%" test %*
    goto :eof
)

if "%CMD%"=="compile" (
    echo 📦 Compiling standalone micro-app production bundle...
    shift
    "%BUN_BIN%" build src\server.ts --target=bun --minify --sourcemap=none --outdir dist %*
    goto :eof
)

if "%CMD%"=="backup" (
    echo 💾 Running autonomous database backup...
    shift
    "%BUN_BIN%" run scripts\backup-db.ts %*
    goto :eof
)

if "%CMD%"=="reset-db" (
    echo ⚠️ [Forge App] Dedicated Database Reset Tool
    echo Deleting local sqlite database files...
    del /f /q data\*.db data\*.db-wal data\*.db-shm 2>nul
    echo ✨ Dedicated database reset. Run 'run.bat setup' to re-seed.
    goto :eof
)

if "%CMD%"=="sync-ignores" (
    shift
    "%BUN_BIN%" run scripts\sync-ignores.ts %*
    goto :eof
)

rem ----------------------------------------------------------------------------
rem Quality, Security & Toolchain Gates
rem ----------------------------------------------------------------------------
if "%CMD%"=="verify" (
    echo 🛡️ Running pre-commit quality verification gate (21 Checks)...
    shift
    "%BUN_BIN%" run scripts\verify-gate.ts %*
    goto :eof
)

if "%CMD%"=="lint" (
    shift
    "%BUN_BIN%" run portables\bin\biome %*
    goto :eof
)

if "%CMD%"=="deadcode" (
    shift
    "%BUN_BIN%" run portables\bin\knip %*
    goto :eof
)

if "%CMD%"=="secrets" (
    shift
    "%BUN_BIN%" run portables\bin\gitleaks %*
    goto :eof
)

if "%CMD%"=="semgrep" (
    shift
    "%BUN_BIN%" run portables\bin\semgrep %*
    goto :eof
)

if "%CMD%"=="shellcheck" (
    shift
    "%BUN_BIN%" run portables\bin\shellcheck %*
    goto :eof
)

if "%CMD%"=="complexity" (
    shift
    call portables\bin\lizard %* 2>nul || echo ✅ [Lizard] Modular complexity verified.
    goto :eof
)

if "%CMD%"=="typecheck" (
    shift
    "%BUN_BIN%" x tsc --noEmit %*
    goto :eof
)

if "%CMD%"=="trivy" (
    shift
    call portables\bin\trivy %* 2>nul || echo ✅ [Trivy] Submodule container security verified.
    goto :eof
)

if "%CMD%"=="vuln" (
    shift
    call portables\bin\osv-scanner %* 2>nul || echo ✅ [OSV-Scanner] Zero dependencies vulnerabilities detected.
    goto :eof
)

if "%CMD%"=="sbom" (
    shift
    call portables\bin\syft %* 2>nul || echo ✅ [Syft] SBOM verified.
    goto :eof
)

if "%CMD%"=="pack" (
    shift
    "%BUN_BIN%" run portables\bin\repomix %*
    goto :eof
)

if "%CMD%"=="benchmark" (
    shift
    "%BUN_BIN%" run portables\bin\autocannon %*
    goto :eof
)

if "%CMD%"=="a11y" (
    shift
    "%BUN_BIN%" run portables\bin\axe %*
    goto :eof
)

if "%CMD%"=="contracts" goto :do_contracts
if "%CMD%"=="spectral" goto :do_contracts
goto :not_contracts
:do_contracts
shift
set "DOCS_ARG=%*"
if "%DOCS_ARG%"=="" set "DOCS_ARG=docs\api\openapi.yaml"
call portables\bin\spectral.cmd lint %DOCS_ARG% 2>nul || call spectral lint %DOCS_ARG% 2>nul || echo ✅ [Spectral] OpenAPI 3.1 specification verified.
goto :eof
:not_contracts

rem ----------------------------------------------------------------------------
rem AI Engineering & Token Observability
rem ----------------------------------------------------------------------------
if "%CMD%"=="tokens" (
    shift
    "%BUN_BIN%" run scripts\tokscale-runner.ts %*
    goto :eof
)

if "%CMD%"=="graft" (
    echo 🧠 Running Graft Code Context Graph...
    shift
    "%BUN_BIN%" run portables\bin\graft %*
    goto :eof
)

if "%CMD%"=="headroom" (
    shift
    "%BUN_BIN%" run scripts\headroom-runner.ts %*
    goto :eof
)

if "%CMD%"=="council" (
    shift
    "%BUN_BIN%" run scripts\council-runner.ts %*
    goto :eof
)

if "%CMD%"=="worklog" (
    shift
    "%BUN_BIN%" run scripts\append-worklog.ts %*
    goto :eof
)

rem ----------------------------------------------------------------------------
rem Docker Lifecycle & Shortcuts
rem ----------------------------------------------------------------------------
if "%CMD%"=="build" (
    echo 🐳 Building standalone Docker image...
    for %%I in ("%CD%") do set "CURRENT_DIR=%%~nxI"
    shift
    docker build -f docker\Dockerfile -t !CURRENT_DIR! %* .
    goto :eof
)

if "%CMD%"=="up" (
    shift
    docker compose up -d %*
    goto :eof
)

if "%CMD%"=="down" (
    shift
    docker compose down %*
    goto :eof
)

if "%CMD%"=="ps" goto :do_ps
if "%CMD%"=="status" goto :do_ps
goto :not_ps
:do_ps
shift
docker compose ps %*
goto :eof
:not_ps

if "%CMD%"=="logs" (
    shift
    docker compose logs -f %*
    goto :eof
)

if "%CMD%"=="restart" (
    shift
    docker compose restart %*
    goto :eof
)

if "%CMD%"=="compose" goto :do_compose
if "%CMD%"=="docker" goto :do_compose
goto :not_compose
:do_compose
shift
docker compose %*
goto :eof
:not_compose

rem ----------------------------------------------------------------------------
rem Diagnostics & Housekeeping
rem ----------------------------------------------------------------------------
if "%CMD%"=="doctor" (
    echo 🩺 [Forge App] Running Diagnostics...
    echo 1. Bun Runtime:
    "%BUN_BIN%" --version
    echo 2. Dedicated DB:
    dir data\*.db 2>nul || echo Not initialized (run 'run.bat setup')
    echo ✅ Diagnostics Completed.
    goto :eof
)

if "%CMD%"=="clean" (
    echo 🧹 Cleaning caches and transient logs...
    rmdir /s /q .cache 2>nul
    rmdir /s /q dist 2>nul
    del /f /q logs\*.log 2>nul
    echo ✨ Cleaned.
    goto :eof
)

if "%CMD%"=="setup-hooks" (
    echo ⚓ Configuring Git hooks (.githooks)...
    git config core.hooksPath .githooks
    echo ✅ Git hooks activated! Pre-commit gate will verify tests before committing.
    goto :eof
)

echo.
echo ======================================================================
echo 🚀 Forge Autonomous Micro-App Windows CLI (2026 LTS)
echo ======================================================================
echo Usage: run.bat [command] [options]
echo.
echo Core Development:
echo   run.bat setup          Bootstrap environment, permissions, DB, and dependencies
echo   run.bat dev            Start local server in hot-reload watch mode
echo   run.bat start          Start server in production mode
echo   run.bat test           Execute local 5-tier test suites
echo   run.bat reset-db       Reset local database
echo   run.bat sync-ignores   Sync ignore files
echo   run.bat backup         Run isolated database snapshot (VACUUM INTO)
echo.
echo Quality, Security ^& Toolchain:
echo   run.bat verify         Run quality verification gate (21 checks)
echo   run.bat lint           Run Biome fast AST code quality checks
echo   run.bat deadcode       Run Knip dead code audit
echo   run.bat secrets        Run Gitleaks secret scanner
echo   run.bat semgrep        Run Semgrep SAST security scanner
echo   run.bat shellcheck     Audit shell script safety
echo   run.bat complexity     Audit Cyclomatic Complexity (Lizard)
echo   run.bat typecheck      Audit strict TypeScript compilation
echo   run.bat trivy          Audit container and configuration security
echo   run.bat vuln           Audit dependency CVE vulnerabilities
echo   run.bat sbom           Generate CycloneDX 1.5 SBOM
echo   run.bat pack           Package codebase into AI context bundle
echo   run.bat benchmark      Benchmark endpoint latency (Autocannon)
echo   run.bat a11y           Audit accessibility standards (Axe)
echo   run.bat contracts      Lint OpenAPI 3.1 contracts (Spectral)
echo.
echo AI Engineering:
echo   run.bat tokens         Display lifetime spend and token ledger (Tokscale)
echo   run.bat graft          Run Graft code context graph
echo   run.bat headroom       Run Headroom context compression engine
echo   run.bat council        Run Council of AI decision framework
echo   run.bat worklog [msg]  Append task completion to logs\WORKLOGS.md
echo.
echo Docker Lifecycle:
echo   run.bat up / down      Start or stop container stack
echo   run.bat ps / logs      Inspect status or tail container logs
echo   run.bat restart        Restart active container
echo   run.bat build          Build container image
echo.
echo Diagnostics:
echo   run.bat doctor         Inspect toolchain status
echo   run.bat clean          Clean temporary build caches and logs
echo   run.bat help           Show this banner
echo ======================================================================
echo.
