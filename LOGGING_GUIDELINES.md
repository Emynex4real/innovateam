# Logging Guidelines - Preventing HTTP 431 Errors

## What Caused the Issue
The HTTP 431 "Request Header Fields Too Large" error was caused by excessive debug logging that created oversized request headers.

## Prevention Rules

### 1. Use the Safe Logger
Always use `src/utils/logger.js` instead of direct console.log:
```javascript
import logger from '../utils/logger';
logger.auth('Simple message');
logger.service('API call', { status: 200 });
```

### 2. Keep Messages Short
- Max 100 characters per log message
- Avoid logging full objects or arrays
- Use essential data only

### 3. Never Log Sensitive Data
- No tokens, passwords, or auth headers
- No user personal information
- No API keys or secrets

### 4. Production Logging
- Minimal logging in production
- Error logging only for critical issues
- No debug logs in production builds

### 5. API Request Logging
- Avoid logging in request/response interceptors
- Don't add debug data to request headers
- Keep interceptor logic minimal

## Safe Logging Examples

✅ **Good:**
```javascript
logger.auth('Login started');
logger.service('API error', { status: 401 });
```

❌ **Bad:**
```javascript
console.log('Login attempt', { 
  email: user.email,
  token: fullToken,
  headers: requestHeaders,
  timestamp: new Date().toISOString()
});
```

## Emergency Fix
If HTTP 431 errors occur again:
1. Check for excessive logging in auth service
2. Remove detailed object logging
3. Simplify request interceptors
4. Clear browser cache and restart server