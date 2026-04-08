Write-Host ""
Write-Host "Starting Barista Scheduler..." -ForegroundColor Green
Write-Host ""
Write-Host "1. Starting Flask API on http://localhost:5000" -ForegroundColor Cyan
Write-Host "2. Starting Frontend on http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for both servers to start, then open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""

# Start Python API in a new terminal
Write-Host "Launching Flask API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend/api.py"

# Wait for API to start
Start-Sleep -Seconds 2

# Start frontend in a new terminal
Write-Host "Launching React Frontend..." -ForegroundColor Green
$frontendPath = ".\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-WorkingDirectory", $frontendPath, "-Command", "pnpm dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Browser should open automatically to http://localhost:5173" -ForegroundColor Cyan
