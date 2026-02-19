# ⚡ Quick Start - Deploy Grace Period System

## 🎯 Goal
Enable 7-day grace period for users exceeding subscription limits, then enforce hard blocks.

## ⏱️ Time Required: 5 minutes

---

## Step 1: Create Database Table (2 min)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Paste this SQL:

```sql
CREATE TABLE subscription_grace_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('students', 'questions', 'tests')),
  limit_exceeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grace_ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, resource_type)
);

CREATE INDEX idx_grace_periods_tutor_resource ON subscription_grace_periods(tutor_id, resource_type);
ALTER TABLE subscription_grace_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view own grace periods" ON subscription_grace_periods FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Service role can manage grace periods" ON subscription_grace_periods FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

5. Click **Run**
6. ✅ Should see "Success. No rows returned"

---

## Step 2: Restart Backend (1 min)

```bash
cd server
npm start
```

Wait for: `Server running on port 5000`

---

## Step 3: Test (2 min)

1. **Open your dashboard** (you already have 858/100 questions)
2. **Refresh the page**
3. **Look for the warning banner** - should now show:
   ```
   ⚠️ You've exceeded your plan limits
   questions: 858/100 • tests: 26/10
   
   ⏰ Grace Period Active
   Questions: 7 days remaining until [date]
   Tests: 7 days remaining until [date]
   ```

4. **Try creating a new question**
   - ✅ Should work (grace period active)
   - ⚠️ Warning persists with countdown

---

## ✅ Success Checklist

- [ ] Database table created (no errors in Supabase)
- [ ] Backend restarted successfully
- [ ] Dashboard shows countdown timer
- [ ] Can still create questions/tests
- [ ] Warning shows "Grace Period Active"

---

## 🧪 Test Grace Period Expiry (Optional)

To test what happens after 7 days:

1. Go to **Supabase Dashboard** → **Table Editor**
2. Find **subscription_grace_periods** table
3. Find your record
4. Edit **grace_ends_at** to yesterday's date
5. Refresh dashboard
6. Should see **red warning**: "🚫 Plan Limits Enforced"
7. Try creating question → Should be **blocked**

---

## 🎉 You're Done!

The system is now live:
- ✅ Users get 7-day grace period
- ✅ Countdown shows on dashboard
- ✅ Hard block after 7 days
- ✅ Clear upgrade prompts

---

## 🆘 Troubleshooting

### Issue: No countdown showing
**Fix**: Check browser console for errors, verify backend restarted

### Issue: SQL error
**Fix**: Make sure you're using Supabase service role, not anon key

### Issue: Still blocked immediately
**Fix**: Check that grace_ends_at is in the future

---

## 📞 Need Help?

Check these files:
- `IMPLEMENTATION_SUMMARY.md` - Full details
- `GRACE_PERIOD_SETUP.md` - Detailed setup guide
- `server/migrations/add_grace_periods.sql` - SQL script

---

**Current Status**: 
- Your account: 858/100 questions, 26/10 tests
- Grace period will start when you refresh dashboard
- You have 7 days to upgrade before hard block
