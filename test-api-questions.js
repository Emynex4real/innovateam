// Quick API Test - Run this in browser console or as Node script
// Test if the fixed controller returns questions

// TEST 1: Get test with questions (replace TEST_ID)
const testId = 'eb938d98-9ffc-4994-a413-2b7aa551c8a7'; // HHH test

fetch(`http://localhost:5000/api/tc-question-sets/${testId}`, {
  headers: {
    'Authorization': `Bearer YOUR_TOKEN_HERE`
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Test Response:', data);
  console.log('📊 Questions Count:', data.questionSet?.questions?.length || 0);
  if (data.questionSet?.questions?.length > 0) {
    console.log('✅ SUCCESS: Questions are being returned!');
  } else {
    console.log('❌ FAIL: No questions in response');
  }
})
.catch(err => console.error('❌ Error:', err));

// TEST 2: Check if backend server was restarted
console.log('⚠️ IMPORTANT: Did you restart the backend server?');
console.log('Run: cd server && npm start');
