@echo off
setlocal
cd /d %~dp0

echo [*] compiling agent...
call bunx frida-compile src/agent/index.ts -o agent.js
if errorlevel 1 (echo AGENT COMPILE FAILED & exit /b 1)

echo [*] launching BackFinder...
call bun run main.ts %*
endlocal