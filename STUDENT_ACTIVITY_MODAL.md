# Student Activity Modal Feature

## Overview
Added student name display in recent activity and a detailed popup modal that shows comprehensive information about the student and their test when clicking on any activity item.

## Changes Made

### 1. New Component: StudentActivityModal
**File:** `src/components/StudentActivityModal.jsx`

A modal component that displays:
- **Student Information:**
  - Full name
  - Student ID (truncated for privacy)
  
- **Test Information:**
  - Test title
  - Score with color-coded status (green for pass, orange for fail)
  - Pass/Fail status badge
  - Completion date and time
  
- **Integrity Monitoring:**
  - Integrity score with visual progress bar
  - Color-coded based on score (green ≥80%, yellow ≥60%, red <60%)
  
- **Suspicious Activity Alerts:**
  - List of suspicious events if detected
  - Event type and timestamp
  
- **Actions:**
  - Close button
  - "View Full Profile" button to navigate to student detail page

### 2. Backend Enhancement
**File:** `server/controllers/tutorialCenter.controller.js`

Updated `getCenterAttempts` endpoint to:
- Join with `user_profiles` table to get student names
- Join with `tc_question_sets` table to get test titles and passing scores
- Return formatted data with:
  - `student_name`: Full name or email prefix
  - `test_title`: Test title
  - `passing_score`: Test passing score

### 3. Frontend Dashboard Update
**File:** `src/pages/tutor/EnterpriseDashboard.jsx`

Enhanced recent activity section:
- Display actual student names instead of generic "Student"
- Made activity items clickable
- Added hover effect for better UX
- Integrated modal to show on click
- Simplified data fetching (backend now provides all needed info)

## Features

### Recent Activity Display
- Shows last 5 test attempts
- Displays student name, test title, score, and date
- Visual indicators (✓ for pass, ○ for fail)
- Color-coded scores (green for pass, orange for fail)

### Modal Popup
- Triggered by clicking any activity item
- Smooth animation (fade in + scale)
- Click outside to close
- Comprehensive student and test details
- Integrity monitoring information
- Direct navigation to full student profile

## User Experience

1. **Tutor views dashboard** → Sees recent activity with student names
2. **Clicks on activity item** → Modal opens with detailed information
3. **Reviews details** → Can see score, integrity, and any suspicious activity
4. **Takes action** → Can close modal or view full student profile

## Technical Details

### Data Flow
```
Frontend Request → Backend Controller → Supabase Query (with joins) → 
Format Response → Return to Frontend → Display in UI
```

### Database Queries
The backend now performs efficient joins:
```sql
SELECT 
  tc_student_attempts.*,
  user_profiles.full_name,
  user_profiles.email,
  tc_question_sets.title,
  tc_question_sets.passing_score
FROM tc_student_attempts
JOIN user_profiles ON tc_student_attempts.student_id = user_profiles.id
JOIN tc_question_sets ON tc_student_attempts.question_set_id = tc_question_sets.id
ORDER BY completed_at DESC
```

### State Management
- `recentActivity`: Array of formatted activity objects
- `selectedActivity`: Currently selected activity for modal display
- Modal visibility controlled by `selectedActivity` state

## Benefits

1. **Better Visibility:** Tutors can immediately see which students are taking tests
2. **Quick Access:** One click to see detailed test results
3. **Integrity Monitoring:** Easy identification of potential cheating
4. **Efficient Navigation:** Direct link to full student profile
5. **Professional UI:** Clean, modern design with smooth animations

## Future Enhancements

Potential improvements:
- Add filtering by student or test
- Export activity reports
- Real-time updates using WebSocket
- Bulk actions on multiple activities
- Email notifications for suspicious activity
- Comparative analytics in modal

## Testing Checklist

- [x] Student names display correctly in recent activity
- [x] Modal opens when clicking activity item
- [x] Modal closes when clicking outside or close button
- [x] All student and test information displays correctly
- [x] Integrity score shows with correct color coding
- [x] Suspicious events display when present
- [x] "View Full Profile" button navigates correctly
- [x] Responsive design works on mobile devices
- [x] Backend returns correct data with joins
- [x] Error handling for missing data

## Files Modified

1. `src/components/StudentActivityModal.jsx` (NEW)
2. `src/pages/tutor/EnterpriseDashboard.jsx` (MODIFIED)
3. `server/controllers/tutorialCenter.controller.js` (MODIFIED)

## Dependencies

- `framer-motion`: For modal animations
- `react-hot-toast`: For error notifications
- Existing design system components

## Notes

- Modal uses event propagation stopping to prevent closing when clicking inside
- Student ID is truncated in display for privacy
- Backend gracefully handles missing student or test data
- All dates are formatted using browser locale
