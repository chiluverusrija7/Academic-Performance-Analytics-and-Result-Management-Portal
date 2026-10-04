@echo off
title EduInsight AI Platform - Multi-Service Launcher
echo ========================================================
echo   EduInsight AI Platform - Launching All Services
echo ========================================================
echo.

echo 1. Starting Express Backend API (Port 5000)...
start "EduInsight - Express API (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 2 /nobreak >nul

echo 2. Starting FastAPI AI & pgvector Microservice (Port 8000)...
start "EduInsight - FastAPI (Port 8000)" cmd /k "cd /d %~dp0 && python -m uvicorn fastapi_service.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 /nobreak >nul

echo 3. Starting Flask Presentation Web App (Port 5001)...
start "EduInsight - Flask UI (Port 5001)" cmd /k "cd /d %~dp0 && python flask_app/app.py"
timeout /t 2 /nobreak >nul

echo 4. Starting React Frontend UI (Port 5173)...
start "EduInsight - React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================================
echo   All Services Launched Successfully!
echo ========================================================
echo.
echo   - React Futuristic Web UI:    http://localhost:5173
echo   - Flask Presentation UI:      http://localhost:5001
echo   - FastAPI Swagger API Docs:   http://localhost:8000/docs
echo   - Express Backend REST API:   http://localhost:5000
echo.
echo   Login: admin / admin123
echo ========================================================
pause
