# ============================================
# Docker Quick Start Script (PowerShell)
# ============================================
# Run this script to quickly start your Docker environment

Write-Host "🐳 Docker Quick Start" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String "Server Version"

if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is running!" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "✅ .env file created. Please review and update it if needed." -ForegroundColor Green
    Write-Host ""
}

# Ask user which mode to run
Write-Host "Which mode would you like to run?" -ForegroundColor Cyan
Write-Host "1. Production (optimized, no hot-reload)" -ForegroundColor White
Write-Host "2. Development (hot-reload enabled)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "🚀 Starting Development Environment..." -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml up -d
    
    Write-Host ""
    Write-Host "✅ Development environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access your application at:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host "   MySQL:    localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 View logs with: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Stop with: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🚀 Starting Production Environment..." -ForegroundColor Cyan
    docker-compose up -d
    
    Write-Host ""
    Write-Host "✅ Production environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access your application at:" -ForegroundColor Cyan
    Write-Host "   Application: http://localhost" -ForegroundColor White
    Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:     http://localhost:5000" -ForegroundColor White
    Write-Host "   MySQL:       localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 View logs with: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Stop with: docker-compose down" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 All set! Your application should be running now." -ForegroundColor Green
Write-Host ""
