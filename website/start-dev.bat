@echo off
echo ============================================================
echo   Launching BAVI Platform (Customer Portal + Designer Portal)
echo ============================================================
echo.
echo [1/2] Starting BAVI Customer Portal on http://localhost:3000 ...
start "BAVI Customer Portal (Port 3000)" cmd /k "cd /d "%~dp0User-side" && npm run dev"

echo [2/2] Starting BAVI Designer Portal on http://localhost:3001 ...
start "BAVI Designer Portal (Port 3001)" cmd /k "cd /d "%~dp0Designer-side" && npm run dev"

echo.
echo ============================================================
echo   Both applications are running!
echo   - Customer Portal: http://localhost:3000
echo   - Designer Portal: http://localhost:3001
echo ============================================================
echo.
pause
