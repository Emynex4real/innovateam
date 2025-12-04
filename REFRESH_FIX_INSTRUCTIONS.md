# Dashboard Refresh Issue - Fix Instructions

## Problem
The dashboard keeps refreshing on mobile for the account `emynex4real@gmail.com`. This happens because:

1. **App.js** has a redirect that triggers on auth state changes
2. **WalletContext** was fetching data multiple times
3. **ProtectedRoute** checks auth on every render
4. The account likely has more transaction data, making the issue more noticeable

## Files Causing the Issue

### 1. src/App.js (Line 113-119)
**Problem:** Redirects to dashboard with `window.location.href` when user signs in
```javascript
if (session.user.email_confirmed_at) {
  console.log('Email confirmed, redirecting to dashboard');
  setTimeout(() => window.location.href = '/dashboard', 1000);
}
```

**Fix:** Remove the hard redirect or use React Router's navigate instead

### 2. src/contexts/WalletContext.jsx
**Problem:** Had duplicate useEffect hooks causing multiple data fetches
**Status:** ✅ ALREADY FIXED

### 3. src/pages/dashboard/index.jsx
**Problem:** Had `window.location.reload()` in PaymentModal success callback
**Status:** ✅ ALREADY FIXED

### 4. src/components/ProtectedRoute.jsx
**Problem:** useEffect runs on every render and checks auth repeatedly
**Potential Issue:** Could cause navigation loops on mobile

### 5. src/components/EducationalSidebar.jsx (Line 147-148)
**Problem:** Uses `window.location.href = '/login'` on logout
**Note:** This is OK for logout, but could be improved

## Quick Fix

Remove the auto-redirect in App.js:

**File:** src/App.js
**Line:** 113-119

**Change FROM:**
```javascript
if (event === 'SIGNED_IN' && session?.user) {
  setUser(session.user);
  // If email is confirmed, redirect to dashboard
  if (session.user.email_confirmed_at) {
    console.log('Email confirmed, redirecting to dashboard');
    setTimeout(() => window.location.href = '/dashboard', 1000);
  }
}
```

**Change TO:**
```javascript
if (event === 'SIGNED_IN' && session?.user) {
  setUser(session.user);
  // User is signed in, no need to redirect
  // Let the user stay on current page or use React Router navigation
}
```

## Why This Happens Only on Mobile for That Account

1. **More transaction data** - The account has more transactions, taking longer to fetch
2. **Mobile network** - Slower connections make race conditions more likely
3. **Auth state changes** - Mobile browsers handle localStorage differently
4. **Multiple triggers** - Auth state change + wallet fetch + protected route check all happening together

## Testing After Fix

1. Clear browser cache and localStorage
2. Login with `emynex4real@gmail.com`
3. Navigate to dashboard
4. Check if page stops refreshing
5. Try on mobile device

## Additional Recommendations

1. Add debouncing to wallet data fetches
2. Use React Router's `useNavigate` instead of `window.location`
3. Add loading states to prevent multiple simultaneous fetches
4. Consider using React Query or SWR for data fetching
