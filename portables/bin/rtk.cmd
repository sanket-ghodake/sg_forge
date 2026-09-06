@echo off
REM ==============================================================================
REM SG Forge - Windows Command Prompt & PowerShell Shim for RTK Utility
REM Allows native Windows execution of 'rtk' commands without Git Bash or WSL
REM ==============================================================================

set "LOCAL_RTK=%USERPROFILE%\.local\bin\rtk.exe"
if exist "%LOCAL_RTK%" (
    "%LOCAL_RTK%" %*
    exit /b %ERRORLEVEL%
)

where rtk >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    rtk %*
    exit /b %ERRORLEVEL%
)

REM Fall through to direct execution of arguments if rtk is not installed
%*
exit /b %ERRORLEVEL%
