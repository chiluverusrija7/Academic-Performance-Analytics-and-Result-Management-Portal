# start_all_services.ps1 - PowerShell launcher for EduInsight AI Services

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   EduInsight AI Platform - Launching All Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Express Backend
Write-Host "1. Starting Express Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend'; node server.js"

Start-Sleep -Seconds 2

# 2. FastAPI Service
Write-Host "2. Starting FastAPI AI Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir'; & 'C:\Users\Srija Ch\anaconda3\python.exe' -m uvicorn fastapi_service.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

# 3. Flask Presentation App
Write-Host "3. Starting Flask Presentation Web App (Port 5001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir'; & 'C:\Users\Srija Ch\anaconda3\python.exe' flask_app/app.py"

Start-Sleep -Seconds 2

# 4. React Frontend
Write-Host "4. Starting React Frontend UI (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   All 4 Services Launched!" -ForegroundColor Green
Write-Host "   - React Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "   - Flask UI:         http://localhost:5001" -ForegroundColor White
Write-Host "   - FastAPI Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host "   - Express API:      http://localhost:5000" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
