# PowerShell script to rebuild frontend for CloudFront deployment
# This fixes the mixed content error by using relative API URLs

$EC2_IP = "15.237.181.208"
$KEY_PATH = "C:\Users\andre\Downloads\fintech-key.pem"

Write-Host "=== Rebuilding Frontend for CloudFront ===" -ForegroundColor Cyan
Write-Host "EC2 Instance: $EC2_IP" -ForegroundColor Yellow
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Error: Key file not found at $KEY_PATH" -ForegroundColor Red
    Write-Host "Please update KEY_PATH in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Pulling latest code..." -ForegroundColor Green
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd ~/fintech && git pull"

Write-Host ""
Write-Host "Step 2: Rebuilding frontend container..." -ForegroundColor Green
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd ~/fintech/frontend && docker compose -f ../backend/docker-compose.prod.yml build frontend"

Write-Host ""
Write-Host "Step 3: Restarting frontend container..." -ForegroundColor Green
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd ~/fintech/backend && docker compose -f docker-compose.prod.yml restart frontend"

Write-Host ""
Write-Host "Step 4: Checking container status..." -ForegroundColor Green
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "cd ~/fintech/backend && docker compose -f docker-compose.prod.yml ps"

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "The frontend has been rebuilt with the updated API client." -ForegroundColor White
Write-Host "The API client now uses relative URLs (/api) when served from CloudFront." -ForegroundColor White
Write-Host ""
Write-Host "Test at: https://d8hyh9dyaxuno.cloudfront.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: CloudFront may cache the old frontend. If issues persist:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Invalidate CloudFront cache (AWS Console > CloudFront > Invalidations)" -ForegroundColor White

