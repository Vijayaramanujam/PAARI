# build-all.ps1
# Full-Stack Build Integration Script for PAARI Network

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Building React Frontend Assets..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Set-Location "$ScriptDir\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "React compilation failed!"
    exit $LASTEXITCODE
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Copying Frontend Assets to Spring Boot Static Path..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$staticDir = "$ScriptDir\backend\src\main\resources\static"
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force "$staticDir\*" -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $staticDir -Force | Out-Null
}

Copy-Item -Recurse -Force "$ScriptDir\frontend\dist\*" "$staticDir\"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Building and Packaging Spring Boot Backend JAR..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Set-Location "$ScriptDir\backend"

# Detect Maven executable
$bundledMvn = "$ScriptDir\apache-maven-3.9.6\bin\mvn.cmd"
if (Test-Path $bundledMvn) {
    $mvn = $bundledMvn
} elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
    $mvn = "mvn"
} else {
    $mvn = Get-ChildItem -Path "C:\Users\dell\.vscode\extensions" -Filter "mvn.cmd" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if (-not $mvn) { $mvn = "mvn" }
}

Write-Host "Using Maven: $mvn" -ForegroundColor Cyan
& $mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Error "Spring Boot packaging failed!"
    exit $LASTEXITCODE
}

Set-Location $ScriptDir

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Full-Stack Integration Build Success!" -ForegroundColor Green
Write-Host "To launch the integrated PAARI application:" -ForegroundColor Green
Write-Host "java -jar backend/target/backend-0.0.1-SNAPSHOT.jar" -ForegroundColor Cyan
Write-Host "Application will be available at: http://localhost:10000" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green
