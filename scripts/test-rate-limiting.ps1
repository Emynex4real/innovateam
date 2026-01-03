# Test Authentication Rate Limit
Write-Host "Testing Authentication Rate Limit..." -ForegroundColor Cyan
Write-Host "Expected: First 5 return 401, 6th returns 429`n"

$url = "http://localhost:5000/api/auth/login"
$body = '{"email":"test@test.com","password":"wrong"}'

for ($i = 1; $i -le 7; $i++) {
    Write-Host "Request $i" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "Status: 200 - $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status: $statusCode" -ForegroundColor $(if($statusCode -eq 429){"Red"}else{"Yellow"})
        if ($_.ErrorDetails.Message) {
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

Write-Host "Test complete!" -ForegroundColor Cyan
