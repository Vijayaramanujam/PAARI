@echo off
setlocal
title PAARI Food Rescue Network Launcher

echo ========================================================
echo       PAARI SMART FOOD RESCUE NETWORK LAUNCHER
echo      Bilingual AI Assistant (English & Tamil)
echo ========================================================
echo.

cd /d "%~dp0"

REM Check if backend JAR exists
if not exist "backend\target\backend-0.0.1-SNAPSHOT.jar" (
    echo [INFO] JAR not found. Running full build first...
    powershell -ExecutionPolicy Bypass -File "%~dp0build-all.ps1"
    if errorlevel 1 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

echo [INFO] Starting PAARI Integrated Full-Stack Server...
echo [INFO] Web URL: http://localhost:10000
echo [INFO] H2 Console: http://localhost:10000/h2-console
echo.
echo [DEMO ACCOUNTS]:
echo   - Admin: admin@paari.org / admin123
echo   - Donor: donor@paari.org / donor123
echo   - NGO Shelter: ngo@paari.org / ngo123
echo   - Volunteer: volunteer@paari.org / volunteer123
echo.
echo Press Ctrl+C to stop the server at any time.
echo ========================================================
echo.

java -Dfile.encoding=UTF-8 -jar backend\target\backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

pause
