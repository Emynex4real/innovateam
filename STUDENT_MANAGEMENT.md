# Enhanced Student Management System

## Overview
The enhanced student management system provides tutors with comprehensive tools to track, analyze, and report on individual student performance.

## Features Implemented

### 1. Individual Student Profiles
- **Access**: Click on any student in the Students list
- **Information Displayed**:
  - Basic info (name, email, enrollment date)
  - Overall statistics (tests taken, average score, XP, level, tier)
  - Quick stats cards for key metrics

### 2. Tabbed Interface
Each student profile includes 5 tabs:

#### Overview Tab
- Subject-wise performance visualization
- Bar chart showing average scores by subject
- Number of attempts per subject

#### History Tab
- Complete test history
- Each test shows:
  - Test name
  - Date and time taken
  - Score with color coding (green ≥70%, yellow ≥50%, red <50%)

#### Progress Tab
- Line chart showing score trends over time
- Visual representation of improvement/decline
- Filterable by time period (week/month/quarter)

#### Notes Tab
- Add private tutor notes about students
- Track observations, behavioral notes, parent communications
- Timestamped entries
- Quick note entry with textarea

#### Reports Tab
- Generate downloadable reports
- Period selection: Last Week, Last Month, Last Quarter
- Report includes:
  - Student information
  - Summary statistics
  - Test history for the period
  - Highest and lowest scores

## API Endpoints

### Student Management
```
GET /api/tutorial-centers/students/:studentId/profile
GET /api/tutorial-centers/students/:studentId/test-history
GET /api/tutorial-centers/students/:studentId/analytics
GET /api/tutorial-centers/students/:studentId/progress?period=month
POST /api/tutorial-centers/students/:studentId/report
GET /api/tutorial-centers/students/:studentId/notes
POST /api/tutorial-centers/students/:studentId/notes
GET /api/tutorial-centers/students/alerts/all
```

## Database Schema

### New Table: tutor_notes
```sql
CREATE TABLE tutor_notes (
  id UUID PRIMARY KEY,
  tutor_id UUID REFERENCES auth.users(id),
  student_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Usage Guide

### For Tutors

1. **View All Students**
   - Navigate to `/tutor/students`
   - See list of all enrolled students with quick stats

2. **View Student Profile**
   - Click on any student row
   - Redirects to `/tutor/students/:studentId`

3. **Analyze Performance**
   - Use Overview tab for subject breakdown
   - Use Progress tab for trends over time

4. **Track History**
   - History tab shows all test attempts
   - Click to see detailed results

5. **Add Notes**
   - Switch to Notes tab
   - Type observation in textarea
   - Click "Add Note" to save

6. **Generate Reports**
   - Go to Reports tab
   - Select period (week/month/quarter)
   - Click "Generate Report"
   - Report downloads as JSON file

## Future Enhancements

### Phase 2 (Planned)
- PDF report generation with professional formatting
- Email reports directly to parents
- Goal setting and tracking
- Automated alerts for students falling behind
- Comparative analytics (student vs class average)
- Attendance tracking
- Parent portal access

### Phase 3 (Planned)
- Custom report templates
- Bulk report generation
- Export to Excel/CSV
- Print-friendly report cards
- Performance predictions using ML
- Personalized study recommendations

## Technical Details

### Frontend Components
- `StudentProfile.jsx` - Main profile page with tabs
- `Students.jsx` - Student list with navigation
- Uses `recharts` for data visualization
- Responsive design with dark mode support

### Backend Services
- `tutorialCenter.controller.js` - Enhanced with 8 new endpoints
- `tutorialCenter.service.js` - Frontend service layer
- Supabase integration for data persistence

### Security
- All routes protected with authentication
- RLS policies on tutor_notes table
- Tutors can only access their own students
- Students cannot access tutor notes

## Installation

1. Run the SQL migration:
```bash
psql -d your_database -f server/migrations/create_tutor_notes_table.sql
```

2. Install frontend dependencies (if not already installed):
```bash
cd client
npm install recharts
```

3. Restart the server:
```bash
cd server
npm start
```

## Testing

1. Login as a tutor
2. Navigate to Students page
3. Click on a student
4. Test each tab functionality
5. Add a note
6. Generate a report

## Support

For issues or questions:
- Check the GitHub Issues page
- Create a new issue with detailed information
- Include screenshots if applicable
