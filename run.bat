@echo off
REM ==============================================================================
REM Dynamic Platform Orchestration CLI (Windows 2026 LTS)
REM 100% Dynamically Configured from .env (Brand, Docker, Proxy & Microservices)
REM ==============================================================================

set "REPO_ROOT=%~dp0"
set "PORTABLE_BUN=%REPO_ROOT%portables\bun\bin\bun.exe"
set "PATH=%REPO_ROOT%portables\bin;%REPO_ROOT%portables\bun\bin;%PATH%"

where bun >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if not exist "%PORTABLE_BUN%" (
        if "%1"=="setup" (
            echo ⚠️ [Windows] Bun runtime not detected on PATH or portable toolchain.
            echo    Please install Bun for Windows via PowerShell:
            echo    powershell -c "irm bun.sh/install.ps1 | iex"
        )
    )
)

set "COMPOSE_PROJECT_NAME=ag_dashboard"
if exist "%REPO_ROOT%.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%REPO_ROOT%.env") do (
        if "%%A"=="COMPOSE_PROJECT_NAME" (
            set "COMPOSE_PROJECT_NAME=%%~B"
        )
    )
)

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="setup" goto setup
if "%1"=="dev" goto dev
if "%1"=="up" goto alias_up
if "%1"=="down" goto alias_down
if "%1"=="ps" goto alias_status
if "%1"=="status" goto alias_status
if "%1"=="top" goto alias_top
if "%1"=="ctop" goto alias_top
if "%1"=="monitor" goto alias_monitor
if "%1"=="doctor" goto doctor
if "%1"=="clean" goto clean
if "%1"=="test" goto test
if "%1"=="docker" goto docker
if "%1"=="deploy-prod" goto deploy_prod
if "%1"=="rollback-prod" goto rollback_prod
if "%1"=="prod-status" goto prod_status
if "%1"=="backup" goto backup
if "%1"=="backup-daemon" goto backup_daemon
if "%1"=="backup-verify" goto backup_verify
if "%1"=="harden" goto harden
if "%1"=="gen-key" goto gen_key
goto help

:setup
echo ⚡ Bootstrapping portable environment on Windows...
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    git config core.filemode false
    git config core.autocrlf false
)
bun install
bun run "%REPO_ROOT%scripts\sync-ignores.ts"
bun run "%REPO_ROOT%scripts\generate-proxy.ts"
echo ✨ Setup completed successfully! Run 'run.bat dev' or 'run.bat docker up' to start.
goto end

:dev
bun run "%REPO_ROOT%scripts\dev-runner.ts" %2 %3
goto end

:alias_up
docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" up -d
goto end

:alias_down
docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all down
docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all down
docker compose -p "%COMPOSE_PROJECT_NAME%" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all down
goto end

:alias_status
docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all ps
docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all ps
goto end

:alias_top
where ctop >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    ctop
) else (
    docker stats
)
goto end

:alias_monitor
bun run "%REPO_ROOT%scripts\terminal-monitor.ts"
goto end

:doctor
echo 🩺 Running Windows system diagnostics...
bun --version
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Git core.filemode:
    git config core.filemode
    echo Git core.autocrlf:
    git config core.autocrlf
)
bun run "%REPO_ROOT%scripts\generate-proxy.ts"
echo ✅ Pre-flight checks passed.
goto end

:clean
echo 🧹 Cleaning caches and logs...
if exist .next rmdir /s /q .next
if exist .turbo rmdir /s /q .turbo
echo ✨ Workspace cleaned.
goto end

:test
echo 🧪 Running tests...
bun test
goto end

:docker
if "%2"=="up" (
    bun run "%REPO_ROOT%scripts\generate-proxy.ts"
    docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" up -d
) else if "%2"=="down" (
    docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all down
    docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all down
    docker compose -p "%COMPOSE_PROJECT_NAME%" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all down
) else if "%2"=="status" (
    docker compose -p "%COMPOSE_PROJECT_NAME%-dev" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\dev\docker-compose.yml" --profile all ps
    docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all ps
) else (
    echo Usage: run.bat docker [up ^| down ^| status]
)
goto end

:deploy_prod
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash "%REPO_ROOT%deploy\deploy-prod.sh"
) else (
    echo 🚀 [Windows] Running Production Deployment via Docker Compose...
    docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all up -d --build
)
goto end

:rollback_prod
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash "%REPO_ROOT%deploy\rollback-prod.sh" %2 %3
) else (
    echo ⚠️ [Windows] Reverting to last-known-good...
    git checkout last-known-good
    docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all up -d --build
)
goto end

:prod_status
where bash >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bash "%REPO_ROOT%deploy\status-prod.sh"
) else (
    echo 📊 [Windows] Production Container Status:
    docker compose -p "%COMPOSE_PROJECT_NAME%-prod" --env-file "%REPO_ROOT%.env" -f "%REPO_ROOT%docker\prod\docker-compose.yml" --profile all ps
)
goto end

:backup
bun run "%REPO_ROOT%scripts\backup-databases.ts" %2 %3
goto end

:backup_daemon
bun run "%REPO_ROOT%scripts\backup-databases.ts" --daemon %2 %3
goto end

:backup_verify
bun run "%REPO_ROOT%scripts\backup-databases.ts" --verify %2 %3
goto end

:harden
bun run "%REPO_ROOT%scripts\harden-storage.ts" %2 %3
goto end

:gen_key
bun run "%REPO_ROOT%scripts\harden-storage.ts" --gen-key %2 %3
goto end

:help
echo ======================================================================
echo 🚀 Platform Orchestrator (Windows 2026 LTS)
echo ======================================================================
echo Usage: run.bat [setup ^| dev ^| doctor ^| clean ^| test ^| docker ^| deploy-prod ^| rollback-prod ^| prod-status ^| backup ^| backup-daemon ^| backup-verify ^| harden ^| gen-key]
echo ======================================================================
goto end

:end
