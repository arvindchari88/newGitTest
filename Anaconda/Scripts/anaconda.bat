@echo off

rem +=====================================================================
rem | Initialisation
rem +=====================================================================

for %%i in ("%~dp0..\envs") do (
    set ANACONDA_ENVS=%%~fi
)

if not "%1" == "" (
    if not exist "%ANACONDA_ENVS%\%1\python.exe" (
        echo No environment named "%1" exists in %ANACONDA_ENVS%
        goto :eof
    )
    set ANACONDA_ENV_NAME=%1
    set ANACONDA="%ANACONDA_ENVS%\%1"
    title Anaconda (%ANACONDA_ENV_NAME%^)
) else (
    set ANACONDA_ENV_NAME=
    for %%i in ("%~dp0..") do (
        set ANACONDA=%%~fi
    )
    title Anaconda
)

set ANACONDA_SCRIPTS=%ANACONDA%\Scripts
set "PATH=%ANACONDA%;%ANACONDA_SCRIPTS%;%PATH%"
echo Added %ANACONDA% and %ANACONDA_SCRIPTS% to PATH.

if not "%ANACONDA_ENV_NAME%" == "" (
    echo Activating environment %ANACONDA_ENV_NAME%...
    set PROMPT=[%ANACONDA_ENV_NAME%] $P$G
)
