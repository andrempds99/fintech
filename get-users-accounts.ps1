# FinTech - Get Users and Their Bank Accounts
# This script fetches all demo users and their associated bank accounts

$CloudFrontUrl = "https://d8hyh9dyaxuno.cloudfront.net"
$Password = "password123"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FinTech Users & Bank Accounts" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get demo accounts
$demoAccounts = (Invoke-WebRequest -Uri "$CloudFrontUrl/api/auth/demo-accounts" -UseBasicParsing).Content | ConvertFrom-Json

foreach ($user in $demoAccounts.accounts) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "👤 $($user.name)" -ForegroundColor Yellow
    Write-Host "   Email: $($user.email)" -ForegroundColor White
    Write-Host "   Role:  $($user.role)" -ForegroundColor White
    Write-Host ""
    
    # Login as this user
    try {
        $loginBody = @{
            email = $user.email
            password = $Password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri "$CloudFrontUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing
        $token = ($loginResponse.Content | ConvertFrom-Json).accessToken
        
        # Get accounts for this user
        $accountsResponse = Invoke-WebRequest -Uri "$CloudFrontUrl/api/accounts" -Headers @{Authorization="Bearer $token"} -UseBasicParsing
        $accounts = ($accountsResponse.Content | ConvertFrom-Json).accounts
        
        if ($accounts.Count -gt 0) {
            Write-Host "   💳 Bank Accounts:" -ForegroundColor Cyan
            foreach ($account in $accounts) {
                $statusIcon = if ($account.status -eq "active") { "✅" } else { "❌" }
                Write-Host "      $statusIcon $($account.name)" -ForegroundColor White
                Write-Host "         Type:    $($account.type)" -ForegroundColor Gray
                Write-Host "         Number:  $($account.account_number)" -ForegroundColor Gray
                Write-Host "         Balance: `$$($account.balance) $($account.currency)" -ForegroundColor Gray
                Write-Host "         Status:  $($account.status)" -ForegroundColor Gray
                Write-Host ""
            }
        } else {
            Write-Host "   💳 No bank accounts found" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "   ⚠️  Could not fetch accounts: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Password for all users: $Password" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

