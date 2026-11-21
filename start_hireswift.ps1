Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         HireSwift ATS: Smart ATS for Small Teams         " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting HireSwift full-stack server on http://localhost:8000..." -ForegroundColor Yellow
Write-Host "API Documentation available at: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

python backend\run_backend.py
