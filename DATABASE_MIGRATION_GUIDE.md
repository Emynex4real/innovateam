# Database Migration Guide

## Current Data Structure (JSON Files)

The current system uses JSON files for data storage. This guide shows how to migrate to a proper database system.

## Current JSON File Structure

### users.json
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "$2b$12$hashedPasswordHere",
    "role": "user",
    "walletBalance": 5000.00,
    "isEmailVerified": true,
    "emailVerificationToken": null,
    "passwordResetToken": null,
    "passwordResetExpires": null,
    "failedLoginAttempts": 0,
    "accountLockedUntil": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
]
```

### user_transactions.json
```json
[
  {
    "id": "txn_550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "debit",
    "amount": 500.00,
    "description": "WAEC Result Check",
    "serviceType": "waec-result-check",
    "referenceId": "waec_check_123",
    "status": "completed",
    "metadata": {
      "examNumber": "1234567890",
      "examYear": "2023"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## MySQL Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    INDEX idx_email_verification (email_verification_token),
    INDEX idx_password_reset (password_reset_token)
);
```

### 2. Transactions Table
```sql
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NULL,
    reference_id VARCHAR(255) NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_service_type (service_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference_id (reference_id)
);
```

### 3. Service Requests Table
```sql
CREATE TABLE service_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    request_data JSON NOT NULL,
    response_data JSON NULL,
    cost DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(36) NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_transaction_id (transaction_id)
);
```

### 4. Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (nullable for system actions)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
);
```

### 5. Email Verification Tokens Table
```sql
CREATE TABLE email_verification_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

### 6. Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

## Data Migration Script

### PHP Migration Script
```php
<?php
/**
 * Data Migration Script from JSON to MySQL
 * Run this script once to migrate existing data
 */

require_once 'config/database.php';

class DataMigration {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function migrateUsers() {
        echo "Migrating users...\n";
        
        // Read JSON file
        $usersJson = file_get_contents('server/data/users.json');
        $users = json_decode($usersJson, true);
        
        if (!$users) {
            echo "No users found or invalid JSON\n";
            return;
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO users (
                id, first_name, last_name, email, password_hash, role,
                wallet_balance, is_email_verified, failed_login_attempts,
                created_at, updated_at, last_login
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $migrated = 0;
        foreach ($users as $user) {
            try {
                $stmt->execute([
                    $user['id'],
                    $user['firstName'],
                    $user['lastName'],
                    $user['email'],
                    $user['password'],
                    $user['role'],
                    $user['walletBalance'] ?? 0.00,
                    $user['isEmailVerified'] ?? false,
                    $user['failedLoginAttempts'] ?? 0,
                    $user['createdAt'],
                    $user['updatedAt'],
                    $user['lastLogin']
                ]);
                $migrated++;
            } catch (PDOException $e) {
                echo "Error migrating user {$user['email']}: " . $e->getMessage() . "\n";
            }
        }
        
        echo "Migrated {$migrated} users\n";
    }
    
    public function migrateTransactions() {
        echo "Migrating transactions...\n";
        
        // Read JSON file
        $transactionsJson = file_get_contents('server/data/user_transactions.json');
        $transactions = json_decode($transactionsJson, true);
        
        if (!$transactions) {
            echo "No transactions found or invalid JSON\n";
            return;
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO transactions (
                id, user_id, type, amount, description, service_type,
                reference_id, status, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $migrated = 0;
        foreach ($transactions as $transaction) {
            try {
                $stmt->execute([
                    $transaction['id'],
                    $transaction['userId'],
                    $transaction['type'],
                    $transaction['amount'],
                    $transaction['description'],
                    $transaction['serviceType'] ?? null,
                    $transaction['referenceId'] ?? null,
                    $transaction['status'] ?? 'completed',
                    json_encode($transaction['metadata'] ?? null),
                    $transaction['createdAt'],
                    $transaction['updatedAt']
                ]);
                $migrated++;
            } catch (PDOException $e) {
                echo "Error migrating transaction {$transaction['id']}: " . $e->getMessage() . "\n";
            }
        }
        
        echo "Migrated {$migrated} transactions\n";
    }
    
    public function validateMigration() {
        echo "Validating migration...\n";
        
        // Count records
        $userCount = $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $transactionCount = $this->pdo->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
        
        echo "Database contains:\n";
        echo "- {$userCount} users\n";
        echo "- {$transactionCount} transactions\n";
        
        // Validate wallet balances
        $stmt = $this->pdo->query("
            SELECT 
                u.id,
                u.email,
                u.wallet_balance,
                COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_credits,
                COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_debits
            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
            GROUP BY u.id, u.email, u.wallet_balance
            HAVING u.wallet_balance != (total_credits - total_debits)
        ");
        
        $inconsistencies = $stmt->fetchAll();
        if (empty($inconsistencies)) {
            echo "✓ All wallet balances are consistent\n";
        } else {
            echo "⚠ Found wallet balance inconsistencies:\n";
            foreach ($inconsistencies as $user) {
                $calculated = $user['total_credits'] - $user['total_debits'];
                echo "  - {$user['email']}: DB={$user['wallet_balance']}, Calculated={$calculated}\n";
            }
        }
    }
}

// Run migration
try {
    $migration = new DataMigration($pdo);
    
    echo "Starting data migration...\n";
    $migration->migrateUsers();
    $migration->migrateTransactions();
    $migration->validateMigration();
    echo "Migration completed!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
```

## Database Configuration

### PHP Database Connection
```php
<?php
// config/database.php

class Database {
    private $host;
    private $dbname;
    private $username;
    private $password;
    private $pdo;
    
    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->dbname = $_ENV['DB_NAME'] ?? 'arewagate_db';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
    }
    
    public function connect() {
        if ($this->pdo === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                throw new Exception("Database connection failed: " . $e->getMessage());
            }
        }
        
        return $this->pdo;
    }
}

// Global database instance
$database = new Database();
$pdo = $database->connect();
?>
```

## Data Access Layer Examples

### User Repository
```php
<?php
// repositories/UserRepository.php

class UserRepository {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function findByEmail($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }
    
    public function create($userData) {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (
                first_name, last_name, email, password_hash, role
            ) VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userData['firstName'],
            $userData['lastName'],
            $userData['email'],
            $userData['passwordHash'],
            $userData['role'] ?? 'user'
        ]);
        
        return $this->pdo->lastInsertId();
    }
    
    public function updateWalletBalance($userId, $newBalance) {
        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        return $stmt->execute([$newBalance, $userId]);
    }
    
    public function getUsers($page = 1, $limit = 10, $search = '') {
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE CONCAT(first_name, ' ', last_name, ' ', email) LIKE ?";
            $params[] = "%{$search}%";
        }
        
        // Get total count
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM users {$whereClause}");
        $countStmt->execute($params);
        $totalRecords = $countStmt->fetchColumn();
        
        // Get users
        $stmt = $this->pdo->prepare("
            SELECT 
                id, first_name, last_name, email, role, wallet_balance,
                is_email_verified, created_at, last_login,
                (SELECT COUNT(*) FROM transactions WHERE user_id = users.id) as total_transactions,
                (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = users.id AND type = 'debit') as total_spent
            FROM users 
            {$whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        $params[] = $limit;
        $params[] = $offset;
        $stmt->execute($params);
        
        return [
            'users' => $stmt->fetchAll(),
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => ceil($totalRecords / $limit),
                'totalRecords' => $totalRecords
            ]
        ];
    }
}
?>
```

### Transaction Repository
```php
<?php
// repositories/TransactionRepository.php

class TransactionRepository {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    public function create($transactionData) {
        $stmt = $this->pdo->prepare("
            INSERT INTO transactions (
                user_id, type, amount, description, service_type,
                reference_id, status, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $transactionData['userId'],
            $transactionData['type'],
            $transactionData['amount'],
            $transactionData['description'],
            $transactionData['serviceType'] ?? null,
            $transactionData['referenceId'] ?? null,
            $transactionData['status'] ?? 'pending',
            json_encode($transactionData['metadata'] ?? null)
        ]);
        
        return $this->pdo->lastInsertId();
    }
    
    public function getUserTransactions($userId, $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        // Get total count
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ?");
        $countStmt->execute([$userId]);
        $totalRecords = $countStmt->fetchColumn();
        
        // Get transactions
        $stmt = $this->pdo->prepare("
            SELECT * FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$userId, $limit, $offset]);
        
        return [
            'transactions' => $stmt->fetchAll(),
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => ceil($totalRecords / $limit),
                'totalRecords' => $totalRecords
            ]
        ];
    }
    
    public function processWalletTransaction($userId, $amount, $type, $description) {
        try {
            $this->pdo->beginTransaction();
            
            // Create transaction record
            $transactionId = $this->create([
                'userId' => $userId,
                'type' => $type,
                'amount' => $amount,
                'description' => $description,
                'status' => 'completed'
            ]);
            
            // Update wallet balance
            $balanceChange = $type === 'credit' ? $amount : -$amount;
            $stmt = $this->pdo->prepare("
                UPDATE users 
                SET wallet_balance = wallet_balance + ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$balanceChange, $userId]);
            
            $this->pdo->commit();
            return $transactionId;
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
?>
```

## Performance Optimization

### Database Indexes
```sql
-- Additional indexes for better performance
CREATE INDEX idx_users_wallet_balance ON users(wallet_balance);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_service_requests_user_service ON service_requests(user_id, service_type);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_users_role_created ON users(role, created_at DESC);
```

### Database Maintenance
```sql
-- Regular maintenance queries
ANALYZE TABLE users, transactions, service_requests, activity_logs;
OPTIMIZE TABLE users, transactions, service_requests, activity_logs;

-- Clean up old logs (run monthly)
DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Clean up expired tokens
DELETE FROM email_verification_tokens WHERE expires_at < NOW();
DELETE FROM password_reset_tokens WHERE expires_at < NOW();
```

This migration guide provides a complete roadmap for moving from JSON file storage to a robust MySQL database system while maintaining data integrity and improving performance.