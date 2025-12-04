# CORS Error Fix Guide

## Problem
Getting CORS errors when uploading documents on Vercel deployment:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:5000/api/...
```

## Root Cause
The backend server was only configured to accept requests from `localhost:3000` and `localhost:3001`, blocking requests from your Vercel domain.

## Solution Applied

### 1. Backend Changes (server/server.js)
Updated CORS configuration to accept requests from:
- `http://localhost:3000` (local development)
- `http://localhost:3001` (local development)
- `https://innovateam.vercel.app` (your Vercel domain)
- Any Vercel preview URLs
- Custom domains from environment variable

### 2. Environment Configuration (server/.env)
Added Vercel domains to CORS_ORIGIN:
```
CORS_ORIGIN=http://localhost:3000,https://innovateam.vercel.app,https://*.vercel.app
```

### 3. Frontend Configuration (.env.production)
Ensured production API URL is set:
```
REACT_APP_API_URL=https://innovateam-api.onrender.com/api
```

## Deployment Steps

### Step 1: Update Render Backend
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service (innovateam-api)
3. Go to "Environment" tab
4. Add/Update environment variable:
   - Key: `CORS_ORIGIN`
   - Value: `https://innovateam.vercel.app,https://*.vercel.app`
5. Click "Save Changes"
6. Render will automatically redeploy

### Step 2: Redeploy Vercel Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (innovateam)
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment
   OR
5. Push changes to GitHub to trigger automatic deployment

### Step 3: Verify the Fix
1. Visit your Vercel app: https://innovateam.vercel.app
2. Navigate to AI Examiner
3. Try uploading a document
4. Check browser console for errors

## Testing Locally
To test the changes locally:
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm start
```

## Troubleshooting

### If CORS errors persist:
1. Check Render logs for CORS blocked messages
2. Verify environment variable is set correctly on Render
3. Ensure backend is using the updated code
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Check your actual Vercel URL:
Your Vercel URL might be different. Check:
- Vercel Dashboard → Your Project → Domains
- Update `CORS_ORIGIN` with your actual domain

### Common Vercel URL patterns:
- `https://your-project.vercel.app`
- `https://your-project-git-branch.vercel.app`
- `https://your-project-username.vercel.app`

## Additional Notes

### For Custom Domains:
If you add a custom domain to Vercel, add it to CORS_ORIGIN:
```
CORS_ORIGIN=https://innovateam.vercel.app,https://yourdomain.com
```

### Security Considerations:
- Never use `*` (wildcard) for CORS origin in production
- Only whitelist domains you control
- Keep credentials: true for cookie-based auth

### Backend URL Configuration:
Make sure your frontend points to the correct backend:
- Local: `http://localhost:5000/api`
- Production: `https://innovateam-api.onrender.com/api`

## Files Modified
- ✅ `server/server.js` - Updated CORS configuration
- ✅ `server/.env` - Added Vercel domains
- ✅ `.env.production` - Added production API URL

## Next Steps
1. Deploy backend to Render with new environment variable
2. Redeploy frontend to Vercel
3. Test file upload functionality
4. Monitor for any remaining CORS issues
