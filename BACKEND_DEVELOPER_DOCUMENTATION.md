# ArewaGate Educational Platform - Backend Developer Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Security Requirements](#security-requirements)
7. [Frontend Integration](#frontend-integration)
8. [File Structure](#file-structure)
9. [Business Logic](#business-logic)
10. [Implementation Guidelines](#implementation-guidelines)

---

## System Overview

**ArewaGate** is an educational services platform that provides Nigerian students with:
- Educational dashboard and profile management
- Wallet system for service payments
- JAMB services (O-Level upload, result checking, pin vending)
- WAEC/NECO result checking services
- AI-powered examination practice
- Course advisory services
- Admin panel for system management

### Technology Stack
- **Frontend**: React 18, Tailwind CSS, React Router
- **Backend**: Currently Node.js (to be replaced with PHP)
- **Database**: Currently JSON files (to be replaced with MySQL/PostgreSQL)
- **Authentication**: JWT tokens with secure storage
- **Payment**: Wallet-based system

---

## Architecture

### Current System Architecture
```
Frontend (React) ←→ Backend API (Node.js) ←→ Database (JSON Files)
```

### Target Architecture (PHP Implementation)
```
Frontend (React) ←→ Backend API (PHP) ←→ Database (MySQL/PostgreSQL)
```

### Key Components
1. **Authentication Service**: User registration, login, JWT management
2. **Wallet Service**: Balance management, transactions, funding
3. **Educational Services**: JAMB, WAEC, NECO result checking
4. **Admin Service**: User management, transaction monitoring
5. **Profile Service**: User profile management
6. **Security Service**: Input validation, CSRF protection, logging

---

## Authentication System

### User Types
1. **Regular Users**: Students accessing educational services
2. **Admin Users**: System administrators with elevated privileges

### Authentication Flow
```
1. User Registration → Email verification → Account activation
2. User Login → JWT token generation → Token storage (localStorage)
3. Protected Routes → Token validation → Access granted/denied
4. Token Refresh → Automatic renewal before expiration
5. Logout → Token invalidation → Cleanup
```

### JWT Token Structure
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user|admin",
    "isEmailVerified": true
  },
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Security Requirements
- Password hashing (bcrypt with salt rounds ≥ 12)
- JWT secret rotation capability
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Email verification for new accounts
- Password reset with secure tokens

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: Register new user account
```json
Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

Response (201):
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": false
  }
}
```

#### POST /api/auth/login
**Purpose**: Authenticate user and return JWT token
```json
Request Body:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isEmailVerified": true
  }
}
```

#### POST /api/auth/logout
**Purpose**: Invalidate user session
```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/verify-token
**Purpose**: Validate JWT token and return user data
```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Wallet Endpoints

#### GET /api/wallet/balance
**Purpose**: Get user's current wallet balance
```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "balance": 5000.00,
  "currency": "NGN"
}
```

#### POST /api/wallet/fund
**Purpose**: Add funds to user wallet
```json
Headers: Authorization: Bearer <token>
Request Body:
{
  "amount": 1000.00,
  "paymentMethod": "bank_transfer",
  "reference": "payment_reference"
}

Response (200):
{
  "success": true,
  "message": "Wallet funded successfully",
  "newBalance": 6000.00,
  "transaction": {
    "id": "txn_id",
    "type": "credit",
    "amount": 1000.00,
    "description": "Wallet funding",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /api/wallet/transactions
**Purpose**: Get user's transaction history
```json
Headers: Authorization: Bearer <token>
Query Parameters: ?page=1&limit=10&type=all

Response (200):
{
  "success": true,
  "transactions": [
    {
      "id": "txn_id",
      "type": "debit",
      "amount": 500.00,
      "description": "WAEC Result Check",
      "status": "completed",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 50
  }
}
```

### Educational Services Endpoints

#### POST /api/services/waec-result-check
**Purpose**: Check WAEC examination results
```json
Headers: Authorization: Bearer <token>
Request Body:
{
  "examNumber": "1234567890",
  "examYear": "2023",
  "scratchCardPin": "123456789012"
}

Response (200):
{
  "success": true,
  "message": "Result retrieved successfully",
  "cost": 500.00,
  "result": {
    "candidateName": "John Doe",
    "examNumber": "1234567890",
    "examYear": "2023",
    "subjects": [
      {
        "subject": "Mathematics",
        "grade": "B3"
      },
      {
        "subject": "English Language",
        "grade": "C4"
      }
    ]
  }
}
```

#### POST /api/services/jamb-olevel-upload
**Purpose**: Upload O-Level results to JAMB profile
```json
Headers: Authorization: Bearer <token>
Request Body:
{
  "jambRegNumber": "12345678AB",
  "examType": "WAEC",
  "examYear": "2023",
  "subjects": [
    {
      "subject": "Mathematics",
      "grade": "B3"
    }
  ]
}

Response (200):
{
  "success": true,
  "message": "O-Level results uploaded successfully",
  "cost": 1000.00,
  "uploadReference": "upload_ref_123"
}
```

### Admin Endpoints

#### GET /api/admin/users
**Purpose**: Get all users (admin only)
```json
Headers: Authorization: Bearer <admin_token>
Query Parameters: ?page=1&limit=10&search=john

Response (200):
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "walletBalance": 5000.00,
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 100
  }
}
```

#### GET /api/admin/transactions
**Purpose**: Get all transactions (admin only)
```json
Headers: Authorization: Bearer <admin_token>
Query Parameters: ?page=1&limit=10&type=all&userId=user_id

Response (200):
{
  "success": true,
  "transactions": [
    {
      "id": "txn_id",
      "userId": "user_id",
      "userEmail": "john@example.com",
      "type": "debit",
      "amount": 500.00,
      "description": "WAEC Result Check",
      "status": "completed",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "statistics": {
    "totalRevenue": 50000.00,
    "totalTransactions": 200,
    "todayRevenue": 2500.00
  }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    reference_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Service Requests Table
```sql
CREATE TABLE service_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    request_data JSON NOT NULL,
    response_data JSON,
    cost DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    INDEX idx_user_id (user_id),
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);
```

---

## Security Requirements

### Input Validation
- Sanitize all user inputs to prevent XSS attacks
- Validate email formats and password strength
- Implement rate limiting on all endpoints
- Use parameterized queries to prevent SQL injection

### Authentication Security
- Implement JWT with secure secret keys
- Token expiration and refresh mechanism
- Account lockout after failed login attempts
- Password complexity requirements

### Data Protection
- Hash passwords with bcrypt (salt rounds ≥ 12)
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement CORS properly

### Logging and Monitoring
- Log all authentication attempts
- Log all financial transactions
- Monitor for suspicious activities
- Implement audit trails for admin actions

---

## Frontend Integration

### API Communication
The frontend uses Axios for API communication with the following configuration:

```javascript
// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Request interceptor for adding auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### State Management
The frontend uses React Context for state management:

1. **AuthContext**: User authentication state
2. **WalletContext**: Wallet balance and transactions
3. **DarkModeContext**: UI theme preferences
4. **AdminContext**: Admin-specific data and functions

### Error Handling
- Display user-friendly error messages
- Log errors for debugging
- Graceful fallbacks for failed requests
- Toast notifications for user feedback

---

## Business Logic

### Service Pricing
```javascript
const SERVICE_PRICES = {
  'waec-result-check': 500.00,
  'neco-result-check': 500.00,
  'jamb-olevel-upload': 1000.00,
  'jamb-result-check': 300.00,
  'jamb-pin-vending': 4700.00,
  'jamb-reprinting': 1000.00
};
```

### Transaction Processing
1. **Debit Transaction Flow**:
   - Check user wallet balance
   - Create pending transaction record
   - Process service request
   - Update transaction status
   - Update wallet balance
   - Send confirmation to user

2. **Credit Transaction Flow**:
   - Verify payment reference
   - Create credit transaction
   - Update wallet balance
   - Send confirmation to user

### Wallet Management
- Minimum balance checks before service requests
- Transaction history with pagination
- Balance updates are atomic operations
- Audit trail for all balance changes

---

## Implementation Guidelines

### PHP Framework Recommendations
- **Laravel**: Full-featured framework with built-in authentication, ORM, and security features
- **Symfony**: Component-based framework with excellent security components
- **CodeIgniter**: Lightweight framework suitable for educational platforms

### Database Considerations
- Use MySQL 8.0+ or PostgreSQL 12+ for better JSON support
- Implement proper indexing for performance
- Use database transactions for financial operations
- Regular backups and point-in-time recovery

### Security Best Practices
```php
// Example: Input validation and sanitization
function validateAndSanitizeInput($input, $type) {
    switch ($type) {
        case 'email':
            return filter_var(trim($input), FILTER_VALIDATE_EMAIL);
        case 'string':
            return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
        case 'number':
            return filter_var($input, FILTER_VALIDATE_FLOAT);
        default:
            return false;
    }
}

// Example: JWT token generation
function generateJWT($user) {
    $payload = [
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
}
```

### Error Response Format
```php
// Standardized error response
function errorResponse($message, $code = 400, $errors = []) {
    http_response_code($code);
    return json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors,
        'timestamp' => date('c')
    ]);
}

// Standardized success response
function successResponse($data, $message = 'Success') {
    return json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ]);
}
```

### Environment Configuration
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=arewagate_db
DB_USER=db_user
DB_PASS=db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=86400

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Application Configuration
APP_ENV=production
APP_DEBUG=false
APP_URL=https://arewagate.com

# Security Configuration
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
```

---

## Testing Requirements

### Unit Tests
- Test all authentication functions
- Test wallet operations
- Test input validation
- Test security functions

### Integration Tests
- Test complete user registration flow
- Test service request processing
- Test payment and wallet operations
- Test admin functions

### Security Tests
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting effectiveness

---

## Deployment Considerations

### Server Requirements
- PHP 8.0+
- MySQL 8.0+ or PostgreSQL 12+
- SSL certificate for HTTPS
- Sufficient storage for logs and backups

### Performance Optimization
- Database query optimization
- Caching for frequently accessed data
- CDN for static assets
- Load balancing for high traffic

### Monitoring and Maintenance
- Application performance monitoring
- Database performance monitoring
- Security vulnerability scanning
- Regular security updates

---

This documentation provides a comprehensive guide for implementing the PHP backend. The new backend should maintain API compatibility with the existing frontend while improving security, performance, and maintainability.