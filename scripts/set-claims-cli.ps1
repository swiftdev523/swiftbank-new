# Set Custom Claims Using Firebase CLI

# Developer
Write-Host "Setting custom claims for developer@swiftbank.com..." -ForegroundColor Cyan
firebase auth:import auth-users-export.json --hash-algo=SCRYPT --hash-key="$env:FIREBASE_AUTH_HASH_KEY" --salt-separator="Bw==" --rounds=8 --mem-cost=14

Write-Host "`nSetting custom claims..." -ForegroundColor Yellow

# Set custom claims for each user
$claims = @{
    "developer@swiftbank.com" = '{"developer":true,"role":"developer"}'
    "seconds@swiftbank.com" = '{"admin":true,"role":"admin"}'
    "kindestwavelover@gmail.com" = '{"customer":true,"role":"customer"}'
}

foreach ($email in $claims.Keys) {
    Write-Host "`nUpdating $email..." -ForegroundColor Green
    $claimJson = $claims[$email]
    
    # Use Firebase CLI to set custom claims
    $command = "firebase auth:update `"$email`" --custom-claims '$claimJson'"
    Write-Host "  Command: $command" -ForegroundColor DarkGray
    
    # Execute
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Success!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed!" -ForegroundColor Red
    }
}

Write-Host "`n✅ Custom claims update complete!" -ForegroundColor Green
