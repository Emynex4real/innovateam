# Enterprise Security Setup Script
# Run this script to set up all security features

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔒 InnovaTeam Enterprise Security Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing security dependencies..." -ForegroundColor Yellow
Set-Location server
npm install validator --save
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully`n" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies`n" -ForegroundColor Red
    exit 1
}

# Step 2: Generate secrets
Write-Host "🔑 Step 2: Generating secure secrets..." -ForegroundColor Yellow
$JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$SESSION_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$REQUEST_SIGNING_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Write-Host "✓ Secrets generated successfully`n" -ForegroundColor Green

# Step 3: Update .env file
Write-Host "📝 Step 3: Updating environment variables..." -ForegroundColor Yellow

if (Test-Path ".env") {
    # Backup existing .env
    Copy-Item ".env" ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "✓ Backed up existing .env file" -ForegroundColor Green
}

# Add security variables to .env
$envContent = @"

# ============================================
# SECURITY CONFIGURATION (Auto-generated)
# ============================================
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
REQUEST_SIGNING_SECRET=$REQUEST_SIGNING_SECRET

# Security Features
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOGGING=true

# Rate Limiting
AUTH_RATE_LIMIT_MAX=5
RATE_LIMIT_MAX_REQUESTS=100

# Password Security
PASSWORD_MIN_LENGTH=12
PASSWORD_MAX_LENGTH=128
"@

Add-Content -Path ".env" -Value $envContent
Write-Host "✓ Environment variables updated`n" -ForegroundColor Green

# Step 4: Run database migration
Write-Host "🗄️  Step 4: Setting up security audit logs..." -ForegroundColor Yellow
Write-Host "Please run the following SQL in your Supabase dashboard:" -ForegroundColor Cyan
Write-Host "File: supabase/security_audit_logs.sql`n" -ForegroundColor Cyan

# Step 5: Test security
Write-Host "🧪 Step 5: Running security tests..." -ForegroundColor Yellow
Set-Location ..
node scripts/test-security.js

# Step 6: Display summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Security Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run the SQL migration in Supabase (supabase/security_audit_logs.sql)" -ForegroundColor White
Write-Host "2. Review the security guide (ENTERPRISE_SECURITY_GUIDE.md)" -ForegroundColor White
Write-Host "3. Update your CORS_ORIGIN in .env for production" -ForegroundColor White
Write-Host "4. Restart your server: cd server && npm start" -ForegroundColor White
Write-Host "5. Test the security features`n" -ForegroundColor White

Write-Host "🔐 Generated Secrets (SAVE THESE SECURELY):" -ForegroundColor Yellow
Write-Host "JWT_SECRET: $JWT_SECRET" -ForegroundColor Gray
Write-Host "SESSION_SECRET: $SESSION_SECRET" -ForegroundColor Gray
Write-Host "REQUEST_SIGNING_SECRET: $REQUEST_SIGNING_SECRET`n" -ForegroundColor Gray

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "- Never commit .env to version control" -ForegroundColor White
Write-Host "- Rotate secrets every 90 days" -ForegroundColor White
Write-Host "- Use different secrets for production" -ForegroundColor White
Write-Host "- Review audit logs regularly`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "- Security Guide: ENTERPRISE_SECURITY_GUIDE.md" -ForegroundColor White
Write-Host "- Environment Template: server/.env.example.secure`n" -ForegroundColor White

Set-Location ..
