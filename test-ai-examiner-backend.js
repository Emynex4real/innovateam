// Quick test script to verify AI Examiner backend
// Run with: node test-ai-examiner-backend.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Get your auth token from browser localStorage
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token

async function testSubmitText() {
  console.log('🧪 Testing AI Examiner text submission...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-examiner/submit-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        text: 'Photosynthesis is the process by which plants convert light energy into chemical energy. This occurs in chloroplasts and requires sunlight, water, and carbon dioxide.',
        title: 'Biology Test Document'
      })
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Document ID:', data.data.documentId);
    } else {
      console.log('\n❌ FAILED:', data.message);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

// Instructions
console.log('='.repeat(60));
console.log('AI EXAMINER BACKEND TEST');
console.log('='.repeat(60));
console.log('\n📝 Instructions:');
console.log('1. Make sure backend is running (npm start in server folder)');
console.log('2. Get your auth token from browser:');
console.log('   - Open DevTools Console (F12)');
console.log('   - Run: localStorage.getItem("auth_token")');
console.log('   - Copy the token');
console.log('3. Replace AUTH_TOKEN in this file');
console.log('4. Run: node test-ai-examiner-backend.js\n');

if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
  console.log('⚠️  Please set AUTH_TOKEN first!\n');
} else {
  testSubmitText();
}
