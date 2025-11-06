const fs = require('fs');
const path = require('path');

// Load current data
const usersFile = path.join(__dirname, '../data/users.json');
const transactionsFile = path.join(__dirname, '../data/transactions.json');

const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
const transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));

// Find the new user
const newUser = users.find(u => u.name === 'Opadiya Iyanuoluwa');

if (newUser) {
  // Add a sample transaction for the new user
  const newTransaction = {
    id: `tx_${Date.now()}`,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    },
    amount: 2500,
    type: 'purchase',
    status: 'completed',
    createdAt: new Date().toISOString(),
    description: 'Sample transaction for new user'
  };

  transactions.push(newTransaction);
  
  // Save updated transactions
  fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  
  console.log('Added sample transaction for:', newUser.name);
  console.log('Transaction ID:', newTransaction.id);
} else {
  console.log('User "Opadiya Iyanuoluwa" not found');
}