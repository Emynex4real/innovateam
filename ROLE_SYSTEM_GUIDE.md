# User Role System Guide

## Overview
The platform now supports 3 user roles:
- **Student** - Access to learning features, can join tutorial centers
- **Tutor** - Can create tutorial centers, manage questions and tests
- **Admin** - Full system access

## Setup Instructions

### 1. Run SQL Migration
Execute this in your Supabase SQL Editor:

```sql
-- Add tutor role to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';
```

### 2. How It Works

#### Registration
- Users select their role during registration (Student or Tutor)
- Role is saved in `user_profiles.role` column
- Role determines which dashboard they see after login

#### Login Redirect
After login, users are redirected based on role:
- **Student** → `/dashboard` (main student dashboard)
- **Tutor** → `/tutor` (tutor dashboard)
- **Admin** → `/admin/dashboard` (admin panel)

### 3. Testing

#### Create a Tutor Account:
1. Go to `/register`
2. Fill in details
3. Select "Tutor" from the "I am a" dropdown
4. Complete registration
5. Login - you'll be redirected to `/tutor`

#### Create a Student Account:
1. Go to `/register`
2. Fill in details
3. Select "Student" (default)
4. Complete registration
5. Login - you'll be redirected to `/dashboard`

### 4. Manually Change User Role

If you need to change an existing user's role:

```sql
-- Make user a tutor
UPDATE public.user_profiles 
SET role = 'tutor' 
WHERE email = 'user@example.com';

-- Make user a student
UPDATE public.user_profiles 
SET role = 'student' 
WHERE email = 'user@example.com';

-- Make user an admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 5. Features by Role

#### Student Features:
- Join tutorial centers using access codes
- Take tests
- View results and leaderboards
- Practice questions
- Course advisor
- AI Examiner

#### Tutor Features:
- Create tutorial center (gets unique 6-char access code)
- Build question bank
- AI-powered question generation
- Create tests from question bank
- View enrolled students
- View test leaderboards
- Toggle answer visibility

#### Admin Features:
- User management
- Transaction management
- System analytics
- AI question banks
- Service management

## Troubleshooting

### Issue: User sees wrong dashboard
**Solution:** Check user role in database:
```sql
SELECT id, email, role FROM public.user_profiles WHERE email = 'user@example.com';
```

### Issue: Tutor can't create center
**Solution:** Verify role is 'tutor':
```sql
UPDATE public.user_profiles SET role = 'tutor' WHERE email = 'tutor@example.com';
```

### Issue: Student sees "Create Tutorial Center"
**Solution:** User is registered as tutor. Change to student:
```sql
UPDATE public.user_profiles SET role = 'student' WHERE email = 'student@example.com';
```

## Database Schema

```sql
-- user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'student', -- 'student', 'tutor', or 'admin'
  wallet_balance DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Next Steps

1. Run the SQL migration to add 'tutor' role
2. Test registration with both Student and Tutor roles
3. Verify login redirects work correctly
4. Test tutor features (create center, add questions, create tests)
5. Test student features (join center, take tests)
