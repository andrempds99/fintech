# PowerShell script to check seed accounts on EC2 instance
# Usage: .\check-ec2-seed-accounts.ps1

$EC2_IP = "15.237.181.208"
$KEY_PATH = "C:\Users\andre\Downloads\fintech-key.pem"

Write-Host "=== Checking Seed Accounts on EC2 ===" -ForegroundColor Cyan
Write-Host "EC2 Instance: $EC2_IP" -ForegroundColor Yellow
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Error: Key file not found at $KEY_PATH" -ForegroundColor Red
    Write-Host "Please update KEY_PATH in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Checking database connection and tables..." -ForegroundColor Green
Write-Host ""

# First, check if database exists and has tables
Write-Host "=== Checking Database Status ===" -ForegroundColor Cyan
$checkTablesCmd = "sudo -u postgres psql -d fintech_db -c '\dt' 2>&1"
$tableCheck = ssh -i "$KEY_PATH" ubuntu@$EC2_IP $checkTablesCmd

if ($tableCheck -match "Did not find any relations" -or $tableCheck -match "does not exist" -or $tableCheck -match "ERROR.*relation") {
    Write-Host "WARNING: Database tables not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Migrations haven't been run yet" -ForegroundColor White
    Write-Host "2. Database permissions issue (permission denied for schema public)" -ForegroundColor White
    Write-Host "3. Database hasn't been seeded" -ForegroundColor White
    Write-Host ""
    Write-Host "If you see 'permission denied for schema public' error:" -ForegroundColor Yellow
    Write-Host "  sudo -u postgres psql -d fintech_db" -ForegroundColor White
    Write-Host "  GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;" -ForegroundColor White
    Write-Host "  GRANT ALL ON SCHEMA public TO fintech_user;" -ForegroundColor White
    Write-Host "  GRANT CREATE ON SCHEMA public TO fintech_user;" -ForegroundColor White
    Write-Host ""
    Write-Host "To fix, SSH into EC2 and run:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If using Docker (EC2 production - RECOMMENDED):" -ForegroundColor Cyan
    Write-Host "  cd ~/fintech/backend" -ForegroundColor White
    Write-Host "  # Step 1: Run migrations FIRST (creates tables)" -ForegroundColor Gray
    Write-Host "  docker compose -f docker-compose.prod.yml exec backend npm run migrate" -ForegroundColor White
    Write-Host "  # Step 2: Then run seed (populates data)" -ForegroundColor Gray
    Write-Host "  docker compose -f docker-compose.prod.yml exec backend npm run seed" -ForegroundColor White
    Write-Host ""
    Write-Host "If backend container is not running:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.prod.yml up -d backend" -ForegroundColor White
    Write-Host ""
    Write-Host "If NOT using Docker (direct installation):" -ForegroundColor Cyan
    Write-Host "  cd ~/fintech/backend" -ForegroundColor White
    Write-Host "  npm install  # Install dependencies first" -ForegroundColor White
    Write-Host "  npm run migrate" -ForegroundColor White
    Write-Host "  npm run seed" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Database tables found. Fetching user accounts..." -ForegroundColor Green
Write-Host ""

# Get all users first
Write-Host "=== USERS & CREDENTIALS ===" -ForegroundColor Cyan
$usersCmd = "sudo -u postgres psql -d fintech_db -c 'SELECT email, name, role FROM users ORDER BY role DESC, email;'"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP $usersCmd

Write-Host ""
Write-Host "=== DETAILED ACCOUNT INFORMATION ===" -ForegroundColor Cyan
Write-Host ""

# Get detailed account information with all fields
$accountsCmd = "sudo -u postgres psql -d fintech_db -c 'SELECT u.email, u.name as user_name, u.role, a.name as account_name, a.type as account_type, a.account_number, ROUND(a.balance::numeric, 2) as balance, a.currency, a.status FROM accounts a JOIN users u ON a.user_id = u.id ORDER BY u.role DESC, u.email, a.name;'"
ssh -i "$KEY_PATH" ubuntu@$EC2_IP $accountsCmd

Write-Host ""
Write-Host "=== QUICK REFERENCE ===" -ForegroundColor Cyan
Write-Host "Default password for all users: password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Account Numbers:" -ForegroundColor Green
Write-Host "  - Format: ****1234 (use last 4 digits for transfers)" -ForegroundColor White
Write-Host "  - Active accounts (marked with ACTIVE) can receive transfers" -ForegroundColor White
Write-Host ""
Write-Host "Login Instructions:" -ForegroundColor Green
Write-Host "  1. Use any email from the USERS list above" -ForegroundColor White
Write-Host "  2. Password: password123" -ForegroundColor White
Write-Host "  3. Admin users can access admin dashboard" -ForegroundColor White

