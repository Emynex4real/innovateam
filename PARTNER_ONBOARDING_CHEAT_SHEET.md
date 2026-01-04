# 🚀 15-MINUTE PARTNER ONBOARDING CHEAT SHEET

## Prerequisites
- Partner's logo URL (hosted on Cloudinary/AWS S3)
- Partner's primary brand color (hex code)
- Partner's tutorial center name
- Access to Supabase SQL Editor

---

## STEP 1: Run SQL Migrations (2 min)
```sql
-- First, add center_id to user_profiles (if not exists)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES tutorial_centers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_center ON user_profiles(center_id);

-- Then, add theme_config column (if not exists)
ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "primary_color": "#10b981",
  "logo_url": null,
  "custom_domain": null
}'::jsonb;
```

---

## STEP 2: Insert Partner's Branding (2 min)

### Option A: New Partner (Creating Center)
```sql
-- Replace with actual values
INSERT INTO tutorial_centers (tutor_id, name, description, theme_config)
VALUES (
  '<TUTOR_USER_ID>',  -- Get from auth.users table
  'Excellence Tutorial Center',
  'Premium JAMB preparation',
  '{
    "primary_color": "#FF6B35",
    "logo_url": "https://res.cloudinary.com/yourapp/image/upload/v1/partner-logo.png",
    "custom_domain": null
  }'::jsonb
)
RETURNING id, access_code;
```

### Option B: Existing Partner (Update Theme)
```sql
-- Update existing center
UPDATE tutorial_centers
SET theme_config = '{
  "primary_color": "#FF6B35",
  "logo_url": "https://res.cloudinary.com/yourapp/image/upload/v1/partner-logo.png",
  "custom_domain": null
}'::jsonb
WHERE tutor_id = '<TUTOR_USER_ID>';
```

---

## STEP 3: Link Students to Center (3 min)

### Get the Center ID
```sql
SELECT id, access_code FROM tutorial_centers 
WHERE tutor_id = '<TUTOR_USER_ID>';
```

### Set center_id in user_profiles (for branding to apply)
```sql
-- For all students enrolled in this center
UPDATE user_profiles
SET center_id = '<CENTER_ID>'
WHERE id IN (
  SELECT student_id FROM tc_enrollments 
  WHERE center_id = '<CENTER_ID>'
);
```

---

## STEP 4: Verify Branding (2 min)

### Test Query
```sql
SELECT 
  tc.name,
  tc.theme_config->>'primary_color' as color,
  tc.theme_config->>'logo_url' as logo,
  COUNT(e.student_id) as student_count
FROM tutorial_centers tc
LEFT JOIN tc_enrollments e ON e.center_id = tc.id
WHERE tc.tutor_id = '<TUTOR_USER_ID>'
GROUP BY tc.id, tc.name, tc.theme_config;
```

Expected Output:
```
name                          | color    | logo                        | student_count
------------------------------|----------|-----------------------------|--------------
Excellence Tutorial Center    | #FF6B35  | https://cloudinary.com/...  | 25
```

---

## STEP 5: Test Login (2 min)

1. Login as the tutor
2. Navigate to `/tutor/theme-editor`
3. Verify logo and color appear
4. Login as a student from that center
5. Verify Navbar shows partner logo

---

## STEP 6: Share Access Code (1 min)

```sql
-- Get the access code to share with students
SELECT access_code FROM tutorial_centers 
WHERE tutor_id = '<TUTOR_USER_ID>';
```

Share this code with students to join: `ABC123`

---

## TROUBLESHOOTING

### Logo Not Showing?
```sql
-- Check if logo URL is valid
SELECT theme_config->>'logo_url' FROM tutorial_centers 
WHERE tutor_id = '<TUTOR_USER_ID>';
```

### Color Not Applying?
- Clear browser cache
- Check CSS variable in DevTools: `--primary`
- Verify hex code format: `#FF6B35` (not `FF6B35`)

### Students See Default Branding?
```sql
-- Ensure center_id is set in user_profiles
SELECT id, email, center_id FROM user_profiles 
WHERE id IN (
  SELECT student_id FROM tc_enrollments 
  WHERE center_id = '<CENTER_ID>'
);
```

---

## QUICK REFERENCE

### Get Tutor User ID
```sql
SELECT id, email FROM auth.users 
WHERE email = 'tutor@example.com';
```

### Get All Centers
```sql
SELECT id, name, tutor_id, access_code, theme_config 
FROM tutorial_centers 
ORDER BY created_at DESC;
```

### Reset to Default Theme
```sql
UPDATE tutorial_centers
SET theme_config = '{
  "primary_color": "#10b981",
  "logo_url": null,
  "custom_domain": null
}'::jsonb
WHERE id = '<CENTER_ID>';
```

---

## TOTAL TIME: ~10-15 minutes ✅

**Next Steps:**
- Send welcome email to partner with access code
- Schedule training call for test creation
- Set up weekly analytics report automation
