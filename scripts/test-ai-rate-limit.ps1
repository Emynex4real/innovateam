# Test AI Operations Rate Limit (10 requests per hour)
Write-Host "Testing AI Rate Limit (10/hour)..." -ForegroundColor Cyan

$url = "http://localhost:5000/api/ai-questions/generate"
$token = "YOUR_JWT_TOKEN_HERE"  # Replace with valid token
$body = '{"text":"Sample text","count":5}'

for ($i = 1; $i -le 12; $i++) {
    Write-Host "Request $i" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
        Write-Host "Status: 200" -ForegroundColor Green
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}
