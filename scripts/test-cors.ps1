# Test CORS Configuration
Write-Host "Testing CORS Configuration..." -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:5000/api/auth/login"
$body = '{"email":"test@test.com","password":"test"}'

# Test 1: Allowed origin (localhost:3000)
Write-Host "Test 1: Allowed Origin (localhost:3000)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{Origin="http://localhost:3000"} -ErrorAction Stop
    $acao = $response.Headers['Access-Control-Allow-Origin']
    Write-Host "Access-Control-Allow-Origin: $acao" -ForegroundColor $(if($acao -eq "http://localhost:3000"){"Green"}else{"Red"})
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Malicious origin (evil.com)
Write-Host "Test 2: Malicious Origin (evil.com)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{Origin="http://evil.com"} -ErrorAction Stop
    $acao = $response.Headers['Access-Control-Allow-Origin']
    Write-Host "Access-Control-Allow-Origin: $acao" -ForegroundColor Red
    Write-Host "VULNERABLE: Any origin allowed!" -ForegroundColor Red
} catch {
    Write-Host "Blocked (Expected): $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 3: No origin header
Write-Host "Test 3: No Origin Header" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method OPTIONS -ErrorAction Stop
    $acao = $response.Headers['Access-Control-Allow-Origin']
    Write-Host "Access-Control-Allow-Origin: $acao" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Wildcard check
Write-Host "Test 4: Checking for Wildcard (*)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{Origin="http://attacker.com"} -ErrorAction Stop
    $acao = $response.Headers['Access-Control-Allow-Origin']
    if ($acao -eq "*") {
        Write-Host "CRITICAL: Wildcard (*) detected - ANY website can access API!" -ForegroundColor Red
    } else {
        Write-Host "Access-Control-Allow-Origin: $acao" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Blocked (Good): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
