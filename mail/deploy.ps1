# Mailu deployment script — Windows (local testing)
# For production, deploy to a Linux VPS and use deploy.sh

$ErrorActionPreference = "Stop"

Write-Host "=== Mailu deployment (Windows) ===" -ForegroundColor Cyan

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Create override directories
Write-Host "Creating override directories..." -ForegroundColor Yellow
$dirs = @("data/overrides/nginx", "data/overrides/dovecot", "data/overrides/postfix", "data/overrides/rspamd", "data/overrides/roundcube")
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Check .env
if (-not (Test-Path .env)) {
    Write-Host "ERROR: .env not found. Copy mailu.env to .env and edit." -ForegroundColor Red
    Write-Host "  Copy-Item mailu.env .env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For local testing, keep BIND_ADDRESS4=127.0.0.1 and TLS_FLAVOR=notls" -ForegroundColor Gray
    exit 1
}

# Note: Port 25 may be blocked by ISP on residential connections
Write-Host ""
Write-Host "Starting Mailu..." -ForegroundColor Yellow
docker compose up -d

Write-Host ""
Write-Host "=== Mailu is running ===" -ForegroundColor Green
Write-Host "Admin UI:  http://127.0.0.1:8080/admin"
Write-Host "Webmail:    http://127.0.0.1:8080/webmail"
Write-Host ""
Write-Host "Use 127.0.0.1 (not localhost) to avoid HTTPS/HSTS issues." -ForegroundColor Gray
Write-Host ""
Write-Host "For production: deploy to a Linux VPS, add DNS, set TLS_FLAVOR=letsencrypt" -ForegroundColor Gray
