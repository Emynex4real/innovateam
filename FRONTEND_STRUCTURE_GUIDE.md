# Frontend Structure Guide

## Directory Structure Overview

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication-related components
│   ├── common/          # Common UI elements
│   ├── security/        # Security-related components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   └── ...              # Other component categories
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── layouts/             # Page layout components
├── pages/               # Page components
├── routes/              # Route definitions
├── services/            # API service functions
├── utils/               # Utility functions
├── config/              # Configuration files
└── assets/              # Static assets
```

## Key Components Explained

### Authentication Components (`src/components/auth/`)
- Handle user login, registration, and authentication flows
- Integrate with AuthContext for state management

### Layout Components (`src/layouts/`)
- **PublicLayout.jsx**: Layout for non-authenticated pages
- **PrivateLayout.jsx**: Layout for authenticated user pages
- **AdminLayout.jsx**: Layout for admin pages

### Context Providers (`src/contexts/`)

#### AuthContext.jsx
```javascript
// Manages user authentication state
const AuthContext = {
  user: null,              // Current user object
  isAuthenticated: false,  // Authentication status
  login: (credentials),    // Login function
  logout: (),             // Logout function
  register: (userData),   // Registration function
  updateProfile: (data)   // Profile update function
}
```

#### WalletContext.jsx
```javascript
// Manages wallet and transaction state
const WalletContext = {
  balance: 0,                    // Current wallet balance
  transactions: [],              // Transaction history
  fetchBalance: (),             // Fetch current balance
  fundWallet: (amount),         // Add funds to wallet
  fetchTransactions: ()         // Get transaction history
}
```

#### DarkModeContext.jsx
```javascript
// Manages UI theme state
const DarkModeContext = {
  isDarkMode: false,      // Current theme state
  toggleDarkMode: ()      // Toggle theme function
}
```

### Service Functions (`src/services/`)

#### auth.service.js
```javascript
// Authentication API calls
export const authService = {
  login: (email, password),
  register: (userData),
  logout: (),
  verifyToken: (),
  resetPassword: (email),
  changePassword: (oldPassword, newPassword)
}
```

#### api.service.js
```javascript
// Base API service with interceptors
export const apiService = {
  get: (url, config),
  post: (url, data, config),
  put: (url, data, config),
  delete: (url, config)
}
```

#### wallet.service.js
```javascript
// Wallet-related API calls
export const walletService = {
  getBalance: (),
  fundWallet: (amount, paymentData),
  getTransactions: (page, limit),
  processPayment: (serviceType, serviceData)
}
```

### Route Configuration (`src/routes/`)

#### publicRoutes.js
```javascript
// Routes accessible without authentication
export default [
  {
    path: "/",
    element: <Home />,
    title: "Home"
  },
  {
    path: "/login",
    element: <Login />,
    title: "Login"
  },
  {
    path: "/register",
    element: <Register />,
    title: "Register"
  }
]
```

#### privateRoutes.js
```javascript
// Routes requiring authentication
export default [
  {
    path: "/",
    element: <EducationalDashboard />,
    title: "Dashboard"
  },
  {
    path: "/profile",
    element: <ModernProfile />,
    title: "Profile"
  },
  {
    path: "/wallet",
    element: <ModernWallet />,
    title: "Wallet"
  },
  {
    path: "/transactions",
    element: <ModernTransactions />,
    title: "Transactions"
  }
]
```

## Page Components Structure

### Educational Dashboard (`src/pages/EducationalDashboard.jsx`)
- Main dashboard for authenticated users
- Displays wallet balance, recent transactions
- Quick access to educational services
- Responsive design with dark mode support

### Service Pages
- **WAEC Result Checker**: Form to check WAEC results
- **JAMB Services**: O-Level upload, result checking, pin vending
- **AI Examiner**: Practice examination system
- **Course Advisor**: Course recommendation system

### Admin Pages
- **AdminDashboard**: Overview of system statistics
- **AdminUsers**: User management interface
- **AdminTransactions**: Transaction monitoring
- **AdminServices**: Service configuration

## State Management Flow

### Authentication Flow
```
1. User enters credentials → Login component
2. Login component calls authService.login()
3. authService makes API call to backend
4. On success, token stored in localStorage
5. AuthContext updates user state
6. App redirects to dashboard
7. PrivateRoute checks authentication
8. Dashboard loads with user data
```

### Wallet Transaction Flow
```
1. User initiates service request
2. Check wallet balance via WalletContext
3. If sufficient balance, proceed with service
4. Create transaction record via API
5. Process service request
6. Update wallet balance
7. Refresh transaction history
8. Show success/error message
```

## Security Implementation

### Token Management
- JWT tokens stored in localStorage
- Automatic token refresh before expiration
- Token validation on protected routes
- Secure logout with token cleanup

### Input Validation
- Client-side validation for user experience
- Server-side validation for security
- XSS prevention through input sanitization
- CSRF protection on state-changing operations

### Error Handling
- Centralized error handling in API service
- User-friendly error messages
- Secure error logging (no sensitive data)
- Graceful fallbacks for failed requests

## Styling and UI

### Tailwind CSS Classes
- Responsive design with mobile-first approach
- Dark mode support with `dark:` prefixes
- Custom color palette for brand consistency
- Utility-first approach for maintainability

### Component Patterns
```javascript
// Standard component structure
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  const { contextValue } = useContext(SomeContext);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    // Event handlers
  };
  
  return (
    <div className="responsive-classes dark:dark-classes">
      {/* Component JSX */}
    </div>
  );
};
```

## Integration Points with Backend

### API Endpoints Expected by Frontend
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify-token` - Token validation
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/fund` - Add funds to wallet
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/services/*` - Various educational services

### Data Formats
All API responses should follow this format:
```javascript
// Success response
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error response
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Development Guidelines

### Code Standards
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript for type safety (future enhancement)

### Performance Optimization
- Lazy loading for route components
- Memoization for expensive calculations
- Proper dependency arrays in useEffect
- Image optimization and lazy loading

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API services
- Component tests for UI interactions
- End-to-end tests for critical user flows

This structure ensures maintainability, scalability, and security while providing a smooth user experience across all devices and use cases.