@echo off
REM ==============================================================================
REM SG Forge - Windows Command Prompt & PowerShell Shim for Bunx Runner
REM ==============================================================================

set "PORTABLE_BUNX=%~dp0..\bun\bin\bunx.cmd"
if exist "%PORTABLE_BUNX%" (
    "%PORTABLE_BUNX%" %*
    exit /b %ERRORLEVEL%
)

"%~dp0bun.cmd" x %*
exit /b %ERRORLEVEL%
