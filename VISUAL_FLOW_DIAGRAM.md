# Student Activity Modal - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TUTOR DASHBOARD                              │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Quick Stats   │  │  Quick Actions  │  │  Recent Activity│ │
│  │                 │  │                 │  │                 │ │
│  │  👥 Students    │  │  ❓ Questions   │  │  ✓ John Doe    │ │
│  │  📝 Tests       │  │  📝 Create Test │  │    Math - 85%  │ │
│  │  ❓ Questions   │  │  👥 Students    │  │                 │ │
│  │  📊 Avg Score   │  │  📊 Analytics   │  │  ○ Jane Smith  │ │
│  └─────────────────┘  └─────────────────┘  │    Physics-45% │ │
│                                             │                 │ │
│                                             │  ✓ Mike Johnson│ │
│                                             │    Chem - 92%  │ │
│                                             └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Click on Activity
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODAL POPUP (Overlay)                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Test Details                                          ×  │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  Student Information                                      │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Name: John Doe                                      │ │  │
│  │  │ Student ID: abc12345...                             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  Test Information                                         │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Test: Mathematics Quiz                              │ │  │
│  │  │ Score: 85%                                          │ │  │
│  │  │ Status: Passed ✓                                    │ │  │
│  │  │ Completed: Jan 15, 2025 2:30 PM                     │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  Integrity Score                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ ████████████████░░░░░░░░░░░░  85%                   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  [Close]                    [View Full Profile]          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. Load Dashboard
       ▼
┌──────────────────────────────────────────┐
│  EnterpriseDashboard.jsx                 │
│                                          │
│  useEffect(() => {                       │
│    loadData();  ◄─────────────┐         │
│  }, []);                       │         │
└──────┬───────────────────────┬─┘         │
       │                       │           │
       │ 2. Fetch Attempts     │           │
       ▼                       │           │
┌──────────────────────────────┴───────┐   │
│  tutorialCenter.service.js           │   │
│                                      │   │
│  getCenterAttempts()                 │   │
└──────┬───────────────────────────────┘   │
       │                                   │
       │ 3. API Request                    │
       ▼                                   │
┌──────────────────────────────────────┐   │
│  Backend API                         │   │
│  /api/tutorial-centers/              │   │
│      tc-attempts/center-attempts     │   │
└──────┬───────────────────────────────┘   │
       │                                   │
       │ 4. Database Query                 │
       ▼                                   │
┌──────────────────────────────────────┐   │
│  Supabase Database                   │   │
│                                      │   │
│  SELECT tc_student_attempts.*,       │   │
│         user_profiles.full_name,     │   │
│         tc_question_sets.title       │   │
│  FROM tc_student_attempts            │   │
│  JOIN user_profiles ...              │   │
│  JOIN tc_question_sets ...           │   │
└──────┬───────────────────────────────┘   │
       │                                   │
       │ 5. Return Data                    │
       ▼                                   │
┌──────────────────────────────────────┐   │
│  Response Data                       │   │
│  {                                   │   │
│    success: true,                    │   │
│    attempts: [                       │   │
│      {                               │   │
│        student_name: "John Doe",     │   │
│        test_title: "Math Quiz",      │   │
│        score: 85,                    │   │
│        ...                           │   │
│      }                               │   │
│    ]                                 │   │
│  }                                   │   │
└──────┬───────────────────────────────┘   │
       │                                   │
       │ 6. Update State ──────────────────┘
       ▼
┌──────────────────────────────────────┐
│  Recent Activity Display             │
│                                      │
│  {recentActivity.map(activity => (   │
│    <div onClick={() =>               │
│      setSelectedActivity(activity)   │
│    }>                                │
│      {activity.studentName}          │
│      {activity.testTitle}            │
│      {activity.score}%               │
│    </div>                            │
│  ))}                                 │
└──────┬───────────────────────────────┘
       │
       │ 7. User Clicks Activity
       ▼
┌──────────────────────────────────────┐
│  State Update                        │
│  setSelectedActivity(activity)       │
└──────┬───────────────────────────────┘
       │
       │ 8. Render Modal
       ▼
┌──────────────────────────────────────┐
│  StudentActivityModal.jsx            │
│                                      │
│  {selectedActivity && (              │
│    <StudentActivityModal             │
│      activity={selectedActivity}     │
│      onClose={() =>                  │
│        setSelectedActivity(null)     │
│      }                               │
│    />                                │
│  )}                                  │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App
└── TutorRoutes
    └── EnterpriseDashboard
        ├── Header
        ├── Stats Grid
        │   ├── Students Card
        │   ├── Tests Card
        │   ├── Questions Card
        │   └── Avg Score Card
        ├── Main Content
        │   └── Quick Actions Grid
        └── Sidebar
            ├── Center Info
            ├── Pro Tip
            └── Recent Activity
                ├── Activity Item 1 (clickable)
                ├── Activity Item 2 (clickable)
                ├── Activity Item 3 (clickable)
                ├── Activity Item 4 (clickable)
                └── Activity Item 5 (clickable)
                    │
                    │ onClick
                    ▼
                StudentActivityModal (Portal)
                ├── Header (with close button)
                ├── Student Info Section
                ├── Test Info Section
                ├── Integrity Score Section
                ├── Suspicious Events Section
                └── Action Buttons
                    ├── Close Button
                    └── View Profile Button
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Component State                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  const [center, setCenter] = useState(null);                │
│  const [stats, setStats] = useState({...});                 │
│  const [loading, setLoading] = useState(true);              │
│  const [recentActivity, setRecentActivity] = useState([]);  │
│  const [selectedActivity, setSelectedActivity] = useState(null); │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ User Interaction
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Event Handlers                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  handleActivityClick(activity) {                            │
│    setSelectedActivity(activity);  ◄── Opens Modal          │
│  }                                                           │
│                                                              │
│  handleModalClose() {                                       │
│    setSelectedActivity(null);      ◄── Closes Modal         │
│  }                                                           │
│                                                              │
│  handleViewProfile(studentId) {                             │
│    navigate(`/tutor/students/${studentId}`);               │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

```
START
  │
  ▼
┌─────────────────────┐
│ Tutor Opens         │
│ Dashboard           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Dashboard Loads     │
│ Recent Activity     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Tutor Sees          │
│ Student Names       │
│ in Activity List    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐      ┌─────────────────────┐
│ Tutor Clicks on     │──NO──│ Continue Browsing   │
│ Activity Item?      │      │ Dashboard           │
└──────┬──────────────┘      └─────────────────────┘
       │ YES
       ▼
┌─────────────────────┐
│ Modal Opens with    │
│ Smooth Animation    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Tutor Reviews:      │
│ • Student Name      │
│ • Test Title        │
│ • Score             │
│ • Integrity Score   │
│ • Suspicious Events │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Tutor Takes Action: │
└──────┬──────────────┘
       │
       ├──────────────────────┬──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Close Modal │      │ View Full   │      │ Click       │
│             │      │ Profile     │      │ Outside     │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                     │
       │                    ▼                     │
       │             ┌─────────────┐              │
       │             │ Navigate to │              │
       │             │ Student     │              │
       │             │ Detail Page │              │
       │             └─────────────┘              │
       │                                          │
       └──────────────────┬───────────────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │ Modal Closes│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Back to     │
                    │ Dashboard   │
                    └─────────────┘
                           │
                           ▼
                         END
```

## Database Schema (Relevant Tables)

```
┌─────────────────────────────────────┐
│     tc_student_attempts             │
├─────────────────────────────────────┤
│ id (PK)                             │
│ student_id (FK) ──────────┐         │
│ question_set_id (FK) ─────┼────┐    │
│ score                     │    │    │
│ completed_at              │    │    │
│ integrity_score           │    │    │
│ suspicious_events         │    │    │
└───────────────────────────┼────┼────┘
                            │    │
                            │    │
        ┌───────────────────┘    │
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│  user_profiles  │    │ tc_question_sets│
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ email           │    │ title           │
│ full_name       │    │ passing_score   │
└─────────────────┘    └─────────────────┘
```

## API Endpoint Details

```
Endpoint: GET /api/tutorial-centers/tc-attempts/center-attempts

Request Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "attempts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "John Doe",
      "question_set_id": "uuid",
      "test_title": "Mathematics Quiz",
      "score": 85,
      "passing_score": 50,
      "completed_at": "2025-01-15T14:30:00Z",
      "integrity_score": 85,
      "suspicious_events": [
        {
          "type": "tab_switch",
          "time": "2025-01-15T14:25:00Z"
        }
      ]
    }
  ]
}
```

## Color Coding System

```
Score Status:
┌─────────────────────────────────────┐
│ Score ≥ Passing Score               │
│ ✓ Green (#10B981)                   │
│ "Passed"                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Score < Passing Score               │
│ ○ Orange (#F59E0B)                  │
│ "Failed"                            │
└─────────────────────────────────────┘

Integrity Score:
┌─────────────────────────────────────┐
│ Score ≥ 80%                         │
│ Green (#10B981)                     │
│ "Good"                              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 60% ≤ Score < 80%                   │
│ Yellow (#F59E0B)                    │
│ "Moderate"                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Score < 60%                         │
│ Red (#EF4444)                       │
│ "Suspicious"                        │
└─────────────────────────────────────┘
```

This visual guide provides a comprehensive overview of how the Student Activity Modal feature works from both technical and user perspectives.
