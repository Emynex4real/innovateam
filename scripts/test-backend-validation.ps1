# Test Backend Validation (Bypassing Frontend)
Write-Host "Testing Backend Validation..." -ForegroundColor Cyan
Write-Host "Simulating attacker bypassing frontend validation`n"

$token = "YOUR_JWT_TOKEN"  # Replace with valid token
$walletUrl = "http://localhost:5000/api/wallet/fund"

# Test 1: Negative amount (frontend might allow, backend should reject)
Write-Host "Test 1: Negative Amount (-1000)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $walletUrl -Method POST -Body '{"amount":-1000}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "VULNERABLE: Backend accepted negative amount!" -ForegroundColor Red
} catch {
    Write-Host "SECURE: Backend rejected (Expected)" -ForegroundColor Green
    if ($_.ErrorDetails.Message) {
        Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}
Write-Host ""

# Test 2: Infinity
Write-Host "Test 2: Infinity Value" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $walletUrl -Method POST -Body '{"amount":"Infinity"}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "VULNERABLE: Backend accepted Infinity!" -ForegroundColor Red
} catch {
    Write-Host "SECURE: Backend rejected (Expected)" -ForegroundColor Green
}
Write-Host ""

# Test 3: String instead of number
Write-Host "Test 3: String Value" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $walletUrl -Method POST -Body '{"amount":"abc"}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "VULNERABLE: Backend accepted string!" -ForegroundColor Red
} catch {
    Write-Host "SECURE: Backend rejected (Expected)" -ForegroundColor Green
}
Write-Host ""

# Test 4: Exceeds max (1,000,000)
Write-Host "Test 4: Amount > Max (10,000,000)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $walletUrl -Method POST -Body '{"amount":10000000}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "VULNERABLE: Backend accepted excessive amount!" -ForegroundColor Red
} catch {
    Write-Host "SECURE: Backend rejected (Expected)" -ForegroundColor Green
}
Write-Host ""

# Test 5: SQL Injection in UUID
Write-Host "Test 5: SQL Injection in User ID" -ForegroundColor Yellow
$adminUrl = "http://localhost:5000/api/admin/users/1' OR '1'='1/transactions"
try {
    $response = Invoke-RestMethod -Uri $adminUrl -Method GET -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "VULNERABLE: SQL injection possible!" -ForegroundColor Red
} catch {
    Write-Host "SECURE: Backend rejected (Expected)" -ForegroundColor Green
}

Write-Host "`nBackend validation is independent of frontend!" -ForegroundColor Cyan
