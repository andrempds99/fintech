# PowerShell script to check EC2 instance status
# This helps diagnose connection issues

$EC2_IP = "15.237.142.105"
$KEY_PATH = "C:\Users\andre\Downloads\fintech-key.pem"

Write-Host "=== EC2 Connection Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking if key file exists..." -ForegroundColor Green
if (Test-Path $KEY_PATH) {
    Write-Host "  [OK] Key file found: $KEY_PATH" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Key file NOT found: $KEY_PATH" -ForegroundColor Red
    Write-Host "  Please update KEY_PATH in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Testing basic network connectivity..." -ForegroundColor Green
$pingResult = Test-Connection -ComputerName $EC2_IP -Count 2 -Quiet -ErrorAction SilentlyContinue
if ($pingResult) {
    Write-Host "  [OK] Instance is reachable (ping successful)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Instance may not be reachable (ping failed)" -ForegroundColor Yellow
    Write-Host "  This could mean:" -ForegroundColor White
    Write-Host "    - Instance is stopped" -ForegroundColor Gray
    Write-Host "    - Security group blocks ICMP (ping)" -ForegroundColor Gray
    Write-Host "    - IP address changed" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Testing SSH port (22) connectivity..." -ForegroundColor Green
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect($EC2_IP, 22)
    $tcpClient.Close()
    Write-Host "  [OK] SSH port (22) is open" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] SSH port (22) is not accessible" -ForegroundColor Red
    Write-Host "  Possible reasons:" -ForegroundColor Yellow
    Write-Host "    - Security group doesn't allow SSH from your IP" -ForegroundColor White
    Write-Host "    - Instance is stopped or not running" -ForegroundColor White
    Write-Host "    - IP address changed" -ForegroundColor White
}

Write-Host ""
Write-Host "Step 4: Testing HTTP port (80) connectivity..." -ForegroundColor Green
$tcpClient2 = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient2.Connect($EC2_IP, 80)
    $tcpClient2.Close()
    Write-Host "  [OK] HTTP port (80) is open" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] HTTP port (80) is not accessible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If SSH is not working:" -ForegroundColor Yellow
Write-Host "1. Check AWS Console > EC2 > Instances" -ForegroundColor White
Write-Host "   - Verify instance is 'Running'" -ForegroundColor Gray
Write-Host "   - Check the actual Public IP (it may have changed)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Check Security Group:" -ForegroundColor White
Write-Host "   - Go to EC2 > Security Groups" -ForegroundColor Gray
Write-Host "   - Find your instance's security group" -ForegroundColor Gray
Write-Host "   - Ensure Inbound rule allows SSH (port 22) from your IP" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If IP changed, update:" -ForegroundColor White
Write-Host "   - terraform.tfvars (origin_domain)" -ForegroundColor Gray
Write-Host "   - All PowerShell scripts with EC2_IP variable" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Try connecting manually:" -ForegroundColor White
Write-Host "   ssh -i `"$KEY_PATH`" ubuntu@$EC2_IP" -ForegroundColor Gray

