# Upload Timeout Fix

## Problem
File upload gets stuck at "Scanning document..." and never completes.

## Root Causes
1. CSRF token fetch failing due to CORS
2. Request timeout too short
3. Missing error handling

## Fixes Applied

### 1. Skip CSRF for AI Examiner (api.service.js)
Since CSRF is temporarily disabled for AI Examiner on backend, skip it on frontend too.

### 2. Add Timeout Support (api.service.js)
- Default timeout: 30 seconds
- File upload timeout: 60 seconds
- Proper abort controller implementation

### 3. Better Error Logging (aiExaminer.service.js)
- Console logs for debugging
- Explicit timeout configuration
- Better error messages

## Testing Steps

1. **Clear browser cache and reload**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Hard refresh (Ctrl+Shift+R)

2. **Test file upload**
   - Upload a small text file first
   - Check browser console for logs
   - Look for "Upload response:" message

3. **Check backend logs**
   - On Render dashboard, check logs
   - Look for upload requests
   - Check for any errors

## Debugging

### Check Browser Console
Look for these messages:
```
Uploading file: test.txt
Upload response: {success: true, data: {...}}
```

### Common Issues

**Issue: "NetworkError when attempting to fetch resource"**
- Solution: Backend CORS not configured properly
- Check CORS_ORIGIN on Render includes your Vercel domain

**Issue: Request timeout**
- Solution: File too large or backend slow
- Try smaller file (< 1MB)
- Check Render backend is running

**Issue: 401 Unauthorized**
- Solution: Not logged in or token expired
- Log out and log back in
- Check localStorage for auth token

## Backend Configuration

Make sure your Render backend has:
```
CORS_ORIGIN=https://innovateam.vercel.app,https://*.vercel.app
GEMINI_API_KEY=your_actual_key
```

## Alternative: Use Text Paste

If file upload still doesn't work:
1. Click "Paste Text" tab
2. Copy content from your document
3. Paste into text area
4. Click "Analyze Text"

This bypasses file upload entirely.

## Next Steps

1. Deploy these changes to Vercel
2. Test with a small text file
3. Check browser console for errors
4. If still failing, check Render logs
5. Consider increasing timeout for large files

## Files Modified
- ✅ `src/services/api.service.js` - Added timeout, skip CSRF for AI Examiner
- ✅ `src/services/aiExaminer.service.js` - Added logging and timeout config
