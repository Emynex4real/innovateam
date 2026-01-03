# Test Authentication on Protected Endpoints
Write-Host "Testing Endpoint Authentication..." -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{url="http://localhost:5000/api/admin/stats"; name="Admin Stats"},
    @{url="http://localhost:5000/api/admin/users"; name="Admin Users"},
    @{url="http://localhost:5000/api/wallet/balance"; name="Wallet Balance"},
    @{url="http://localhost:5000/api/admin/ai-questions/banks"; name="AI Questions"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.name)" -ForegroundColor Yellow
    
    # Test without token
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method GET -ErrorAction Stop
        Write-Host "VULNERABLE: No auth required!" -ForegroundColor Red
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 401) {
            Write-Host "SECURE: 401 Unauthorized" -ForegroundColor Green
        } else {
            Write-Host "Status: $status" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

Write-Host "Test complete!" -ForegroundColor Cyan
