/**
 * Test Script for AI Examiner Backend
 * Run this after applying the fixes to verify everything works
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Examiner Backend Test\n');

// Test 1: Check if controller file was fixed
console.log('Test 1: Checking controller fixes...');
const controllerPath = path.join(__dirname, 'server', 'controllers', 'aiExaminer.controller.js');
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

const hasBuggyCode = controllerContent.includes('req.user?.sub || req.user?.id');
const hasFixedCode = controllerContent.includes('req.user?.id') && !hasBuggyCode;

if (hasFixedCode) {
  console.log('✅ Controller user ID extraction is fixed\n');
} else if (hasBuggyCode) {
  console.log('❌ Controller still has the bug (req.user?.sub)\n');
  console.log('   Fix: Replace all instances of "req.user?.sub || req.user?.id" with "req.user?.id"\n');
} else {
  console.log('⚠️  Could not verify controller fix\n');
}

// Test 2: Check if SQL file exists
console.log('Test 2: Checking SQL migration file...');
const sqlPath = path.join(__dirname, 'server', 'database', 'ai_examiner_tables.sql');
if (fs.existsSync(sqlPath)) {
  console.log('✅ SQL migration file exists at: server/database/ai_examiner_tables.sql\n');
  console.log('   📝 Next step: Run this SQL in your Supabase Dashboard\n');
} else {
  console.log('❌ SQL migration file not found\n');
}

// Test 3: Check required packages
console.log('Test 3: Checking required npm packages...');
const packageJsonPath = path.join(__dirname, 'server', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredPackages = ['pdf-parse', 'mammoth', 'multer', 'uuid'];
const missingPackages = [];

requiredPackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`✅ ${pkg} (v${packageJson.dependencies[pkg]})`);
  } else {
    console.log(`❌ ${pkg} - NOT INSTALLED`);
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.log(`\n⚠️  Missing packages: ${missingPackages.join(', ')}`);
  console.log(`   Run: cd server && npm install ${missingPackages.join(' ')}\n`);
} else {
  console.log('\n✅ All required packages are installed\n');
}

// Test 4: Check environment variables
console.log('Test 4: Checking environment variables...');
const envPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasGeminiKey = envContent.includes('GEMINI_API_KEY=') && 
                       !envContent.includes('GEMINI_API_KEY=your_');
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && 
                         !envContent.includes('SUPABASE_URL=your_');
  
  if (hasGeminiKey) {
    console.log('✅ GEMINI_API_KEY is configured');
  } else {
    console.log('❌ GEMINI_API_KEY is missing or not set');
  }
  
  if (hasSupabaseUrl) {
    console.log('✅ SUPABASE_URL is configured');
  } else {
    console.log('❌ SUPABASE_URL is missing or not set');
  }
  console.log('');
} else {
  console.log('❌ .env file not found in server directory\n');
}

// Test 5: Check routes
console.log('Test 5: Checking routes configuration...');
const routesPath = path.join(__dirname, 'server', 'routes', 'aiExaminer.routes.js');
if (fs.existsSync(routesPath)) {
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  
  const hasUploadRoute = routesContent.includes("'/upload'");
  const hasSubmitTextRoute = routesContent.includes("'/submit-text'");
  const hasGenerateRoute = routesContent.includes("'/generate'");
  
  if (hasUploadRoute && hasSubmitTextRoute && hasGenerateRoute) {
    console.log('✅ All required routes are configured');
    console.log('   - POST /api/ai-examiner/upload');
    console.log('   - POST /api/ai-examiner/submit-text');
    console.log('   - POST /api/ai-examiner/generate\n');
  } else {
    console.log('⚠️  Some routes may be missing\n');
  }
} else {
  console.log('❌ Routes file not found\n');
}

// Summary
console.log('═══════════════════════════════════════════════════════');
console.log('📋 SUMMARY\n');

const allGood = hasFixedCode && 
                fs.existsSync(sqlPath) && 
                missingPackages.length === 0;

if (allGood) {
  console.log('✅ Backend code is ready!');
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Run the SQL migration in Supabase Dashboard');
  console.log('   (Copy from: server/database/ai_examiner_tables.sql)');
  console.log('2. Restart your backend server');
  console.log('3. Test document upload and text paste\n');
} else {
  console.log('⚠️  Some issues need to be fixed:');
  if (!hasFixedCode) {
    console.log('   - Fix user ID extraction in controller');
  }
  if (!fs.existsSync(sqlPath)) {
    console.log('   - Create SQL migration file');
  }
  if (missingPackages.length > 0) {
    console.log(`   - Install missing packages: ${missingPackages.join(', ')}`);
  }
  console.log('\n📖 See FIX_AI_EXAMINER_NOW.md for detailed instructions\n');
}

console.log('═══════════════════════════════════════════════════════\n');
