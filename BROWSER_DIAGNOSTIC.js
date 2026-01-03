// PASTE THIS IN BROWSER CONSOLE (F12) ON ADMIN PAGE

console.log('=== ADMIN USERS DIAGNOSTIC ===');

// Check localStorage
const token = localStorage.getItem('token');
console.log('1. Token exists:', !!token);

// Check API call
fetch('http://localhost:5000/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('2. API Response:', data);
  console.log('3. Users count:', data.users?.length || 0);
  console.log('4. Success:', data.success);
  if (data.users) {
    console.log('5. First user:', data.users[0]);
  }
})
.catch(err => console.error('API Error:', err));
