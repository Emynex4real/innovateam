# Test Financial Operations Rate Limit (20 requests per hour)
Write-Host "Testing Financial Rate Limit (20/hour)..." -ForegroundColor Cyan

$url = "http://localhost:5000/api/wallet/balance"
$token = "YOUR_JWT_TOKEN_HERE"  # Replace with valid token

for ($i = 1; $i -le 22; $i++) {
    Write-Host "Request $i" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
        Write-Host "Status: 200" -ForegroundColor Green
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}
