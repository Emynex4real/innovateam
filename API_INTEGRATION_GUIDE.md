# API Integration Guide for PHP Backend Developer

## Current API Integration Points

This document details how the React frontend currently integrates with the backend API and what the PHP backend needs to implement for seamless integration.

## Base API Configuration

### Frontend API Setup
```javascript
// src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
```

### Expected Backend Base URL Structure
```
Production: https://api.arewagate.com/api
Development: http://localhost:5000/api
```

## Authentication Integration

### Frontend Auth Service Implementation
```javascript
// src/services/auth.service.js
class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }
  
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return await response.json();
  }
  
  async verifyToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false };
    
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return await response.json();
  }
}
```

### Required PHP Endpoints for Authentication

#### 1. POST /api/auth/register
```php
<?php
// Expected request body
$requestBody = [
    'firstName' => 'John',
    'lastName' => 'Doe', 
    'email' => 'john@example.com',
    'password' => 'SecurePassword123!',
    'confirmPassword' => 'SecurePassword123!'
];

// Required response format
$successResponse = [
    'success' => true,
    'message' => 'Registration successful. Please verify your email.',
    'user' => [
        'id' => 'generated_user_id',
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'john@example.com',
        'role' => 'user',
        'isEmailVerified' => false,
        'walletBalance' => 0.00
    ]
];

// Error response format
$errorResponse = [
    'success' => false,
    'message' => 'Registration failed',
    'errors' => [
        'email' => ['Email already exists'],
        'password' => ['Password too weak']
    ]
];
?>
```

#### 2. POST /api/auth/login
```php
<?php
// Expected request body
$requestBody = [
    'email' => 'john@example.com',
    'password' => 'SecurePassword123!'
];

// Required response format
$successResponse = [
    'success' => true,
    'message' => 'Login successful',
    'token' => 'jwt_token_here',
    'user' => [
        'id' => 'user_id',
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'john@example.com',
        'role' => 'user',
        'isEmailVerified' => true,
        'walletBalance' => 5000.00
    ]
];
?>
```

#### 3. GET /api/auth/verify-token
```php
<?php
// Expected headers
$headers = [
    'Authorization' => 'Bearer jwt_token_here'
];

// Required response format
$successResponse = [
    'success' => true,
    'user' => [
        'id' => 'user_id',
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'john@example.com',
        'role' => 'user',
        'isEmailVerified' => true,
        'walletBalance' => 5000.00
    ]
];
?>
```

## Wallet Integration

### Frontend Wallet Service
```javascript
// src/services/wallet.service.js
class WalletService {
  async getBalance() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  }
  
  async fundWallet(amount, paymentReference) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/wallet/fund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, paymentReference })
    });
    return await response.json();
  }
  
  async getTransactions(page = 1, limit = 10) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  }
}
```

### Required PHP Endpoints for Wallet

#### 1. GET /api/wallet/balance
```php
<?php
// Required response format
$response = [
    'success' => true,
    'balance' => 5000.00,
    'currency' => 'NGN'
];
?>
```

#### 2. POST /api/wallet/fund
```php
<?php
// Expected request body
$requestBody = [
    'amount' => 1000.00,
    'paymentReference' => 'payment_ref_123'
];

// Required response format
$response = [
    'success' => true,
    'message' => 'Wallet funded successfully',
    'newBalance' => 6000.00,
    'transaction' => [
        'id' => 'txn_id',
        'type' => 'credit',
        'amount' => 1000.00,
        'description' => 'Wallet funding',
        'status' => 'completed',
        'timestamp' => '2024-01-15T10:30:00Z'
    ]
];
?>
```

#### 3. GET /api/wallet/transactions
```php
<?php
// Query parameters: ?page=1&limit=10&type=all

// Required response format
$response = [
    'success' => true,
    'transactions' => [
        [
            'id' => 'txn_id_1',
            'type' => 'debit',
            'amount' => 500.00,
            'description' => 'WAEC Result Check',
            'status' => 'completed',
            'timestamp' => '2024-01-15T10:30:00Z'
        ],
        [
            'id' => 'txn_id_2',
            'type' => 'credit',
            'amount' => 1000.00,
            'description' => 'Wallet funding',
            'status' => 'completed',
            'timestamp' => '2024-01-14T15:20:00Z'
        ]
    ],
    'pagination' => [
        'currentPage' => 1,
        'totalPages' => 5,
        'totalRecords' => 50,
        'hasNext' => true,
        'hasPrev' => false
    ]
];
?>
```

## Educational Services Integration

### Frontend Service Calls
```javascript
// src/services/educational.service.js
class EducationalService {
  async checkWaecResult(examData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/services/waec-result-check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(examData)
    });
    return await response.json();
  }
  
  async uploadJambOlevel(oLevelData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/services/jamb-olevel-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oLevelData)
    });
    return await response.json();
  }
}
```

### Required PHP Endpoints for Educational Services

#### 1. POST /api/services/waec-result-check
```php
<?php
// Expected request body
$requestBody = [
    'examNumber' => '1234567890',
    'examYear' => '2023',
    'scratchCardPin' => '123456789012'
];

// Service cost: ₦500
// Required response format
$successResponse = [
    'success' => true,
    'message' => 'Result retrieved successfully',
    'cost' => 500.00,
    'result' => [
        'candidateName' => 'John Doe',
        'examNumber' => '1234567890',
        'examYear' => '2023',
        'centerName' => 'Test Center',
        'subjects' => [
            [
                'subject' => 'Mathematics',
                'grade' => 'B3'
            ],
            [
                'subject' => 'English Language', 
                'grade' => 'C4'
            ],
            [
                'subject' => 'Physics',
                'grade' => 'B2'
            ]
        ]
    ]
];

// Error response (insufficient balance)
$errorResponse = [
    'success' => false,
    'message' => 'Insufficient wallet balance',
    'requiredAmount' => 500.00,
    'currentBalance' => 200.00
];
?>
```

#### 2. POST /api/services/jamb-olevel-upload
```php
<?php
// Expected request body
$requestBody = [
    'jambRegNumber' => '12345678AB',
    'examType' => 'WAEC', // or 'NECO'
    'examYear' => '2023',
    'subjects' => [
        [
            'subject' => 'Mathematics',
            'grade' => 'B3'
        ],
        [
            'subject' => 'English Language',
            'grade' => 'C4'
        ],
        [
            'subject' => 'Physics', 
            'grade' => 'B2'
        ],
        [
            'subject' => 'Chemistry',
            'grade' => 'C5'
        ]
    ]
];

// Service cost: ₦1000
// Required response format
$successResponse = [
    'success' => true,
    'message' => 'O-Level results uploaded successfully',
    'cost' => 1000.00,
    'uploadReference' => 'upload_ref_123',
    'uploadedSubjects' => 4
];
?>
```

## Admin Integration

### Frontend Admin Service
```javascript
// src/services/admin.service.js
class AdminService {
  async getUsers(page = 1, limit = 10, search = '') {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search
    });
    
    const response = await fetch(
      `${API_BASE_URL}/admin/users?${queryParams}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  }
  
  async getTransactions(page = 1, limit = 10, filters = {}) {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await fetch(
      `${API_BASE_URL}/admin/transactions?${queryParams}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return await response.json();
  }
}
```

### Required PHP Endpoints for Admin

#### 1. GET /api/admin/users
```php
<?php
// Query parameters: ?page=1&limit=10&search=john&role=user

// Required response format (admin only)
$response = [
    'success' => true,
    'users' => [
        [
            'id' => 'user_id_1',
            'firstName' => 'John',
            'lastName' => 'Doe',
            'email' => 'john@example.com',
            'role' => 'user',
            'walletBalance' => 5000.00,
            'isEmailVerified' => true,
            'createdAt' => '2024-01-01T00:00:00Z',
            'lastLogin' => '2024-01-15T10:30:00Z',
            'totalTransactions' => 25,
            'totalSpent' => 12500.00
        ]
    ],
    'pagination' => [
        'currentPage' => 1,
        'totalPages' => 10,
        'totalRecords' => 100
    ],
    'statistics' => [
        'totalUsers' => 100,
        'activeUsers' => 85,
        'newUsersToday' => 5
    ]
];
?>
```

#### 2. GET /api/admin/transactions
```php
<?php
// Query parameters: ?page=1&limit=10&type=all&userId=user_id&dateFrom=2024-01-01&dateTo=2024-01-31

// Required response format (admin only)
$response = [
    'success' => true,
    'transactions' => [
        [
            'id' => 'txn_id_1',
            'userId' => 'user_id_1',
            'userEmail' => 'john@example.com',
            'userName' => 'John Doe',
            'type' => 'debit',
            'amount' => 500.00,
            'description' => 'WAEC Result Check',
            'serviceType' => 'waec-result-check',
            'status' => 'completed',
            'timestamp' => '2024-01-15T10:30:00Z'
        ]
    ],
    'pagination' => [
        'currentPage' => 1,
        'totalPages' => 20,
        'totalRecords' => 200
    ],
    'statistics' => [
        'totalRevenue' => 50000.00,
        'totalTransactions' => 200,
        'todayRevenue' => 2500.00,
        'todayTransactions' => 15
    ]
];
?>
```

## Error Handling Standards

### Frontend Error Handling
```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden
        toast.error('Access denied');
        break;
      case 422:
        // Validation errors
        return data.errors;
      case 500:
        // Server error
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(data.message || 'An error occurred');
    }
  } else {
    // Network error
    toast.error('Network error. Please check your connection.');
  }
};
```

### Required PHP Error Response Format
```php
<?php
// Validation error (422)
$validationError = [
    'success' => false,
    'message' => 'Validation failed',
    'errors' => [
        'email' => ['Email is required', 'Email must be valid'],
        'password' => ['Password must be at least 8 characters']
    ],
    'timestamp' => date('c')
];

// Authentication error (401)
$authError = [
    'success' => false,
    'message' => 'Invalid credentials',
    'timestamp' => date('c')
];

// Authorization error (403)
$authzError = [
    'success' => false,
    'message' => 'Access denied',
    'timestamp' => date('c')
];

// Server error (500)
$serverError = [
    'success' => false,
    'message' => 'Internal server error',
    'timestamp' => date('c')
];
?>
```

## Security Headers and CORS

### Required CORS Configuration
```php
<?php
// CORS headers for development
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// CORS headers for production
header('Access-Control-Allow-Origin: https://arewagate.com');
?>
```

### JWT Token Validation
```php
<?php
function validateJWT($token) {
    try {
        $decoded = JWT::decode($token, $_ENV['JWT_SECRET'], ['HS256']);
        return [
            'valid' => true,
            'user' => $decoded->user
        ];
    } catch (Exception $e) {
        return [
            'valid' => false,
            'error' => $e->getMessage()
        ];
    }
}
?>
```

This integration guide ensures the PHP backend will work seamlessly with the existing React frontend without requiring any frontend changes.