# start-paari.ps1
# PowerShell launcher for PAARI Food Rescue Network

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Green
Write-Host "      PAARI SMART FOOD RESCUE NETWORK LAUNCHER" -ForegroundColor Green
Write-Host "      Bilingual AI Assistant (English & Tamil)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

$jarPath = "$ScriptDir\backend\target\backend-0.0.1-SNAPSHOT.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "[INFO] Backend JAR not found. Running full build..." -ForegroundColor Yellow
    & "$ScriptDir\build-all.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit $LASTEXITCODE
    }
}

Write-Host "[INFO] Starting PAARI Integrated Full-Stack Server on Port 10000..." -ForegroundColor Green
Write-Host "[INFO] Web Interface: http://localhost:10000" -ForegroundColor Cyan
Write-Host "[INFO] Database Console: http://localhost:10000/h2-console" -ForegroundColor Cyan
Write-Host ""
Write-Host "[DEMO LOGIN ACCOUNTS]:" -ForegroundColor Magenta
Write-Host "  - Admin:       admin@paari.org       / admin123" -ForegroundColor White
Write-Host "  - Donor:       donor@paari.org       / donor123" -ForegroundColor White
Write-Host "  - NGO Shelter: ngo@paari.org         / ngo123" -ForegroundColor White
Write-Host "  - Volunteer:   volunteer@paari.org   / volunteer123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to terminate the server." -ForegroundColor DarkGray
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

java -Dfile.encoding=UTF-8 -jar "$jarPath" --spring.profiles.active=dev
