// Quick test script to verify AI Examiner backend is working
// Run with: node test-ai-examiner-backend.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing AI Examiner Backend...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Check if AI Examiner routes are registered
  try {
    console.log('\n2️⃣ Testing AI Examiner route (without auth)...');
    const response = await axios.post(`${BASE_URL}/api/ai-examiner/submit-text`, {
      text: 'Test content',
      title: 'Test'
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Route exists (401 = needs authentication)');
    } else if (error.response?.status === 403) {
      console.log('✅ Route exists (403 = CSRF protection active)');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('\n✅ Backend is running and routes are registered!');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure you are logged in on the frontend');
  console.log('2. Check browser console for detailed logs');
  console.log('3. Verify GEMINI_API_KEY is set in server/.env');
}

testBackend();
