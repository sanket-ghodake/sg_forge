@echo off
REM ==============================================================================
REM SG Forge - Windows Command Prompt & PowerShell Shim for Bun Runtime
REM ==============================================================================

set "PORTABLE_BUN=%~dp0..\bun\bin\bun.exe"
if exist "%PORTABLE_BUN%" (
    "%PORTABLE_BUN%" %*
    exit /b %ERRORLEVEL%
)

where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    bun %*
    exit /b %ERRORLEVEL%
)

echo [SG Forge] Bun runtime not detected on PATH or portable toolchain.
echo Please install Bun for Windows via PowerShell:
echo powershell -c "irm bun.sh/install.ps1 | iex"
exit /b 1
