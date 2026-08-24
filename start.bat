@echo off
title PashuPramaan

echo ============================================
echo   PashuPramaan - Starting all services...
echo ============================================
echo.

echo [1/2] Starting FastAPI backend on http://127.0.0.1:8000 ...
start "PashuPramaan - Backend" cmd /k "cd /d %~dp0backend && .\\venv\\Scripts\\activate && set PYTHONPATH=. && .\\venv\\Scripts\\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/2] Starting Next.js frontend on http://localhost:3000 ...
start "PashuPramaan - Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ============================================
echo.
pause
