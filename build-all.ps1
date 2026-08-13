# build-all.ps1
# Full-Stack Build Integration Script for PAARI Network

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Building React Frontend Assets..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "React compilation failed!"
    exit $LASTEXITCODE
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Copying Frontend Assets to Spring Boot Static Path..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$staticDir = "../backend/src/main/resources/static"
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force "$staticDir\*" -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $staticDir -Force
}

Copy-Item -Recurse -Force dist\* $staticDir\

cd ..

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Building and Packaging Spring Boot backend JAR..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

cd backend
# Retrieve Maven executable path
$mvn = Get-ChildItem -Path "C:\Users\dell\.vscode\extensions" -Filter "mvn.cmd" -Recurse | Select-Object -First 1 -ExpandProperty FullName
if (-not $mvn) {
    # Fallback to general environment mvn if vs code extension maven is missing
    $mvn = "mvn"
}

Write-Host "Using Maven: $mvn" -ForegroundColor Cyan
& $mvn clean package
if ($LASTEXITCODE -ne 0) {
    Write-Error "Spring Boot packaging failed!"
    exit $LASTEXITCODE
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Full-Stack Integration Build Success!" -ForegroundColor Green
Write-Host "To run the integrated application:" -ForegroundColor Green
Write-Host "java -jar target/backend-0.0.1-SNAPSHOT.jar" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
