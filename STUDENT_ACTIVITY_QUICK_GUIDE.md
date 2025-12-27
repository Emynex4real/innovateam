# Student Activity Modal - Quick Reference

## What's New? 🎉

### Before
- Recent activity showed generic "Student" label
- No way to see details without navigating away
- Limited information at a glance

### After
- **Student names** displayed in recent activity
- **Click any activity** to see detailed popup
- **Comprehensive information** in one place

## How to Use

### Step 1: View Recent Activity
On the tutor dashboard, look at the "Recent Activity" section in the right sidebar.

```
Recent Activity
├─ ✓ John Doe
│  └─ Mathematics Quiz - 85% - Jan 15
├─ ○ Jane Smith  
│  └─ Physics Test - 45% - Jan 15
└─ ✓ Mike Johnson
   └─ Chemistry Exam - 92% - Jan 14
```

### Step 2: Click on Any Activity
Click on any activity item to open the detailed modal.

### Step 3: View Details
The modal shows:

```
┌─────────────────────────────────────┐
│  Test Details                    ×  │
├─────────────────────────────────────┤
│                                     │
│  Student Information                │
│  ┌─────────────────────────────┐   │
│  │ Name: John Doe              │   │
│  │ Student ID: abc12345...     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Test Information                   │
│  ┌─────────────────────────────┐   │
│  │ Test: Mathematics Quiz      │   │
│  │ Score: 85%                  │   │
│  │ Status: Passed ✓            │   │
│  │ Completed: Jan 15, 2:30 PM  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Integrity Score                    │
│  ┌─────────────────────────────┐   │
│  │ ████████████░░░░░░░░  85%   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Close]  [View Full Profile]      │
└─────────────────────────────────────┘
```

### Step 4: Take Action
- **Close**: Click "Close" or click outside the modal
- **View Profile**: Click "View Full Profile" to see complete student details

## Color Coding

### Score Status
- 🟢 **Green**: Passed (score ≥ passing score)
- 🟠 **Orange**: Failed (score < passing score)

### Integrity Score
- 🟢 **Green**: ≥80% (Good)
- 🟡 **Yellow**: 60-79% (Moderate)
- 🔴 **Red**: <60% (Suspicious)

## Information Displayed

### Student Section
- Full name
- Student ID (first 8 characters)

### Test Section
- Test title
- Score percentage
- Pass/Fail status
- Completion date and time

### Integrity Section (if available)
- Integrity score with progress bar
- Color-coded based on score

### Suspicious Activity (if detected)
- List of suspicious events
- Event types and timestamps
- Examples:
  - Tab switch
  - Window blur
  - Copy/paste attempts
  - Right-click attempts

## Quick Tips 💡

1. **Fast Access**: Click directly on activity items instead of navigating to student page
2. **Monitor Integrity**: Check integrity scores to identify potential cheating
3. **Quick Review**: See all important info without leaving the dashboard
4. **Mobile Friendly**: Works perfectly on tablets and phones
5. **Keyboard Shortcut**: Press ESC to close the modal

## Common Scenarios

### Scenario 1: Check Recent Test Results
1. Open tutor dashboard
2. Scroll to "Recent Activity"
3. Click on the student's activity
4. Review score and details

### Scenario 2: Investigate Suspicious Activity
1. Notice low integrity score in activity
2. Click to open modal
3. Review suspicious events list
4. Click "View Full Profile" for detailed investigation

### Scenario 3: Quick Student Lookup
1. See student name in recent activity
2. Click to confirm it's the right student
3. Use "View Full Profile" to access full details

## Troubleshooting

### Issue: Student name shows as "Unknown Student"
- **Cause**: Student profile not complete
- **Solution**: Ask student to complete their profile

### Issue: Modal doesn't open
- **Cause**: JavaScript error or slow connection
- **Solution**: Refresh the page and try again

### Issue: No recent activity shown
- **Cause**: No students have taken tests recently
- **Solution**: This is normal if no tests have been completed

## API Endpoint

For developers integrating with the system:

```javascript
GET /api/tutorial-center/attempts

Response:
{
  success: true,
  attempts: [
    {
      id: "uuid",
      student_id: "uuid",
      student_name: "John Doe",
      test_title: "Mathematics Quiz",
      score: 85,
      passing_score: 50,
      completed_at: "2025-01-15T14:30:00Z",
      integrity_score: 85,
      suspicious_events: []
    }
  ]
}
```

## Related Features

- **Student Management**: `/tutor/students`
- **Student Detail Page**: `/tutor/students/:id`
- **Analytics Dashboard**: `/tutor/analytics`
- **Test Management**: `/tutor/tests`

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify you have tutor permissions
3. Ensure you have a tutorial center created
4. Contact support with error details
