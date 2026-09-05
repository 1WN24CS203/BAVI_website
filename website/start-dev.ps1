# BAVI Dual-Portal Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Launching BAVI Platform (Customer Portal + Designer Portal)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting Customer Portal on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\User-side'; npm run dev"

Write-Host "[2/2] Starting Designer Portal on http://localhost:3001 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\Designer-side'; npm run dev"

Write-Host "`nBoth portals are launching in separate windows:" -ForegroundColor Green
Write-Host " -> Customer Portal: http://localhost:3000" -ForegroundColor White
Write-Host " -> Designer Portal: http://localhost:3001" -ForegroundColor White
