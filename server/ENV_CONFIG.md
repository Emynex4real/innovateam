# 🔧 GEMINI SERVICE - ENVIRONMENT VARIABLES

## ✅ Current Configuration

Your `.env` is now configured with:

```bash
# Core Settings (Required)
GEMINI_API_KEY=AIzaSyCmTnfwJXgIRYe9wgyKa3jq9rClIUdMFXw  ✅ Set
GEMINI_MAX_CONCURRENCY=5                                ✅ Default
GEMINI_MAX_RETRIES=3                                    ✅ Default
GEMINI_TIMEOUT=45000                                    ✅ Default (45s)

# Optional Features (Disabled by default)
ENABLE_CACHE=false          # Set to 'true' when Redis is ready
CACHE_TTL=3600              # 1 hour cache
REDIS_URL=redis://localhost:6379

# Logging & Metrics
LOG_LEVEL=info              # info, warn, error, debug
STATSD_HOST=localhost       # For metrics (optional)
STATSD_PORT=8125
```

---

## 🎯 What Each Variable Does

| Variable | Purpose | Default | Required? |
|----------|---------|---------|-----------|
| `GEMINI_API_KEY` | Your Google AI API key | - | ✅ Yes |
| `GEMINI_MAX_CONCURRENCY` | Parallel batch processing | 5 | No |
| `GEMINI_MAX_RETRIES` | Retry attempts on failure | 3 | No |
| `GEMINI_TIMEOUT` | Request timeout (ms) | 45000 | No |
| `ENABLE_CACHE` | Enable Redis caching | false | No |
| `CACHE_TTL` | Cache expiry (seconds) | 3600 | No |
| `REDIS_URL` | Redis connection string | - | Only if caching |
| `LOG_LEVEL` | Logging verbosity | info | No |

---

## 🚀 Quick Start

**Your service is ready to use now!**

```javascript
// No changes needed - just use it
const geminiService = require('./services/gemini.service');

const questions = await geminiService.generateQuestionsFromContent({
  content: 'Your text here...',
  subject: 'Mathematics',
  topic: 'Algebra',
  totalQuestions: 10
});
```

---

## 💾 Enable Caching (Optional)

When you're ready to reduce costs by 50%+:

### 1. Install Redis

**Option A: Docker**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option B: Windows**
```bash
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use WSL: sudo apt install redis-server
```

**Option C: Cloud**
- AWS ElastiCache
- Redis Cloud (free tier)
- Upstash (serverless)

### 2. Update .env

```bash
ENABLE_CACHE=true
REDIS_URL=redis://localhost:6379
```

### 3. Restart Server

That's it! Caching is now active.

---

## 📊 Performance Tuning

### High Traffic?
```bash
GEMINI_MAX_CONCURRENCY=10  # Increase parallel processing
GEMINI_TIMEOUT=60000       # Increase timeout
```

### Low Budget?
```bash
GEMINI_MAX_CONCURRENCY=2   # Reduce parallel calls
ENABLE_CACHE=true          # Must enable caching
CACHE_TTL=7200             # Cache for 2 hours
```

### Debugging?
```bash
LOG_LEVEL=debug            # Verbose logging
```

---

## 🔍 Verify Configuration

```bash
# Check if Gemini API key works
node -e "console.log(process.env.GEMINI_API_KEY ? '✅ API Key Set' : '❌ Missing')"

# Check if Redis is running (if caching enabled)
redis-cli ping
# Should return: PONG
```

---

## ⚠️ Important Notes

1. **API Key Security**: Never commit `.env` to Git (already in `.gitignore`)
2. **Caching**: Disabled by default - enable when ready
3. **Metrics**: Optional - only needed for production monitoring
4. **Defaults**: All optional variables have sensible defaults

---

## 🆘 Troubleshooting

### "API Key Missing"
**Check**: `GEMINI_API_KEY` is set in `.env`
**Fix**: Get key from https://makersuite.google.com/app/apikey

### "Redis connection failed"
**Check**: `ENABLE_CACHE=true` but Redis not running
**Fix**: Set `ENABLE_CACHE=false` or start Redis

### "Too many requests"
**Check**: Hitting rate limits
**Fix**: Reduce `GEMINI_MAX_CONCURRENCY` or enable caching

---

## ✅ Summary

- ✅ Environment variables configured
- ✅ Service ready to use
- ✅ Caching disabled (enable when ready)
- ✅ Defaults optimized for development

**No further action needed - start using the service!** 🎉
