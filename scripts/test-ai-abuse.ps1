# Test AI Endpoint Rate Limiting (10 requests per hour)
Write-Host "Testing AI Endpoint Abuse Protection..." -ForegroundColor Cyan
Write-Host "Limit: 10 requests per hour per user`n"

$url = "http://localhost:5000/api/admin/ai-questions/generate"
$token = "YOUR_ADMIN_JWT_TOKEN"  # Replace with valid admin token
$body = '{"text":"Sample educational content for testing","count":5}'

Write-Host "Simulating rapid AI generation requests..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le 12; $i++) {
    Write-Host "Request $i" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
        Write-Host "Status: 200 - Generation successful" -ForegroundColor Green
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 429) {
            Write-Host "Status: 429 - RATE LIMITED (Protected!)" -ForegroundColor Red
            if ($_.ErrorDetails.Message) {
                $error = $_.ErrorDetails.Message | ConvertFrom-Json
                Write-Host "Message: $($error.error)" -ForegroundColor Gray
                Write-Host "Retry After: $($error.retryAfter) seconds" -ForegroundColor Gray
            }
        } else {
            Write-Host "Status: $status" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "`nExpected: First 10 succeed, 11+ blocked with 429" -ForegroundColor Cyan
Write-Host "This prevents overnight AI bill abuse!" -ForegroundColor Green
