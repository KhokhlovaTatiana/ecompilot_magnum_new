@echo off
setlocal

cd /d "%~dp0"

set "PORT=5174"
set "URL=http://127.0.0.1:%PORT%/"
set "NODE_EXE=C:\Users\TKhokhlova\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "dist\index.html" (
  echo Build output was not found: dist\index.html
  echo Please ask Codex to rebuild the landing first.
  pause
  exit /b 1
)

if not exist "scripts\serve-dist.cjs" (
  echo Server script was not found: scripts\serve-dist.cjs
  pause
  exit /b 1
)

if not exist "%NODE_EXE%" (
  echo Bundled Node.js was not found:
  echo %NODE_EXE%
  pause
  exit /b 1
)

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul
if errorlevel 1 (
  start "EcomPilot Magnat server" cmd /k ""%NODE_EXE%" "scripts\serve-dist.cjs""
  timeout /t 2 /nobreak >nul
)

start "" "%URL%"
