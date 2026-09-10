@echo off
rem ==============================================================================
rem SG Forge Submodule - Windows CLI Orchestrator (2026 LTS)
rem 100% Standalone: Runs on Windows cmd.exe / PowerShell without WSL
rem ==============================================================================
setlocal enabledelayedexpansion

set "DIR=%~dp0"
cd /d "%DIR%"

rem Resolve Bun Runtime
set "BUN_BIN=bun"
if exist "%DIR%portables\bun\bin\bun.exe" (
    set "BUN_BIN=%DIR%portables\bun\bin\bun.exe"
) else if exist "%DIR%..\..\portables\bun\bin\bun.exe" (
    set "BUN_BIN=%DIR%..\..\portables\bun\bin\bun.exe"
)

set "CMD=%~1"
if "%CMD%"=="" set "CMD=help"

if "%CMD%"=="dev" (
    echo 🚀 Starting standalone micro-app in watch mode...
    "%BUN_BIN%" --watch src\server.ts
    goto :eof
)

if "%CMD%"=="start" (
    echo ⚡ Starting standalone micro-app...
    "%BUN_BIN%" src\server.ts
    goto :eof
)

if "%CMD%"=="test" (
    echo 🧪 Running 5-tier microservice tests...
    "%BUN_BIN%" test
    goto :eof
)

if "%CMD%"=="verify" (
    echo 🛡️ Running pre-commit quality verification gate...
    "%BUN_BIN%" run scripts\verify-gate.ts
    goto :eof
)

if "%CMD%"=="build" (
    echo 🐳 Building standalone Docker image...
    for %%I in ("%CD%") do set "CURRENT_DIR=%%~nxI"
    docker build -f docker\Dockerfile -t !CURRENT_DIR! .
    goto :eof
)

if "%CMD%"=="graft" (
    echo 🧠 Running Graft Code Context Graph...
    shift
    "%BUN_BIN%" run portables\bin\graft %*
    goto :eof
)

if "%CMD%"=="tokens" (
    set "SUB_CMD=%~2"
    if "!SUB_CMD!"=="sync" (
        "%BUN_BIN%" run scripts\sync-tokens.ts
    ) else if "!SUB_CMD!"=="tui" (
        bun x --bun codeburn
    ) else (
        "%BUN_BIN%" run scripts\display-tokens.ts
    )
    goto :eof
)

if "%CMD%"=="headroom" (
    shift
    "%BUN_BIN%" run scripts\headroom-runner.ts %*
    goto :eof
)

if "%CMD%"=="worklog" (
    shift
    "%BUN_BIN%" run scripts\append-worklog.ts %*
    goto :eof
)

if "%CMD%"=="setup-hooks" (
    echo ⚓ Configuring Git hooks (.githooks)...
    git config core.hooksPath .githooks
    echo ✅ Git hooks activated! Pre-commit gate will verify tests before committing.
    goto :eof
)

echo.
echo SG Forge Autonomous Micro-App Submodule Windows CLI
echo.
echo Usage:
echo   run.bat dev            Start local server in hot-reload watch mode
echo   run.bat start          Start server in production mode
echo   run.bat test           Execute local 5-tier test suites
echo   run.bat verify         Run quality verification gate (18 checks)
echo   run.bat build          Build standalone Docker container
echo   run.bat graft [cmd]    Run Graft code context graph
echo   run.bat tokens [cmd]   Display lifetime spend, sync ledger, or launch TUI
echo   run.bat headroom [cmd] Run Headroom context compression engine
echo   run.bat worklog [msg]  Append task completion to logs\WORKLOGS.md
echo   run.bat setup-hooks    Activate git hooks (.githooks)
echo   run.bat help           Show this banner
echo.
