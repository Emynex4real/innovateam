# PHASE 1: INTEGRATION GUIDE - CODE SNIPPETS

## Quick Integration Steps

### 1️⃣ SERVER SETUP

#### Add to your main server file (server.js or index.js):

```javascript
// After your existing routes
const analyticsRoutes = require('./routes/analyticsRoutes');

// Register analytics routes
app.use('/api/analytics', analyticsRoutes);
```

### 2️⃣ ROUTER SETUP

#### Add to your React Router configuration file:

```javascript
import StudentAnalytics from './pages/student/analytics/MyAnalytics';
import TutorAnalyticsDashboard from './pages/tutor/AnalyticsDashboard';

// Student routes
<Route path="/student/analytics/:centerId" element={<StudentAnalytics />} />

// Tutor routes  
<Route path="/tutor/analytics" element={<TutorAnalyticsDashboard />} />
```

### 3️⃣ STUDENT DASHBOARD INTEGRATION

#### Add button in Student Dashboard or Navigation:

```jsx
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();
  const centerId = '...'; // Get from context/props

  return (
    <div>
      {/* Your existing content */}
      
      <button 
        onClick={() => navigate(`/student/analytics/${centerId}`)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        📊 View My Analytics
      </button>
    </div>
  );
}
```

### 4️⃣ TUTOR DASHBOARD INTEGRATION

#### Add button in Tutor Dashboard or Navigation:

```jsx
import { useNavigate } from 'react-router-dom';

function TutorDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Your existing content */}
      
      <button 
        onClick={() => navigate('/tutor/analytics')}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        📈 Advanced Analytics
      </button>
    </div>
  );
}
```

### 5️⃣ NAVIGATION MENU INTEGRATION

#### Add to your main navigation component:

```jsx
{/* For Students */}
<Link to={`/student/analytics/${centerId}`} className="nav-link">
  📊 Analytics
</Link>

{/* For Tutors */}
<Link to="/tutor/analytics" className="nav-link">
  📈 Analytics
</Link>
```

---

## Testing the Integration

### Test Student Analytics Endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/student/analytics/CENTER_ID
```

Expected Response:
```json
{
  "success": true,
  "analytics": {
    "total_attempts": 5,
    "average_score": 75.5,
    "overall_accuracy": 78.2,
    "study_consistency": 85,
    "current_streak": 3,
    "strongest_subject": "Mathematics",
    "weakest_subject": "Biology"
  },
  "subjects": [...],
  "history": [...]
}
```

### Test At-Risk Endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/predictions/at-risk/CENTER_ID
```

Expected Response:
```json
{
  "success": true,
  "all": [...],
  "critical": [
    {
      "student_id": "...",
      "at_risk_score": 85,
      "at_risk_level": "critical",
      "recommended_action": "Immediate intervention required"
    }
  ],
  "high": [...],
  "medium": [...],
  "total": 8,
  "criticalCount": 1
}
```

---

## Using Analytics in Custom Components

### Display Student Analytics:

```jsx
import { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import { ScoreTrendChart } from '../components/analytics/AnalyticsCharts';

function MyCustomAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await analyticsService.getStudentAnalytics(centerId);
      setAnalytics(res.analytics);
      
      const trendsRes = await analyticsService.getPerformanceTrends(centerId, 30);
      setTrends(trendsRes.trend.scores);
    };
    load();
  }, []);

  return (
    <div>
      <h2>Average Score: {analytics?.average_score}%</h2>
      <ScoreTrendChart data={trends} />
    </div>
  );
}

export default MyCustomAnalytics;
```

### Display At-Risk Students:

```jsx
import { useEffect, useState } from 'react';
import predictionService from '../services/predictionService';

function AtRiskStudents() {
  const [atRiskStudents, setAtRiskStudents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await predictionService.getAtRiskStudents(centerId);
      setAtRiskStudents(res.critical); // Get critical risk students
    };
    load();
  }, []);

  return (
    <div>
      {atRiskStudents.map(student => (
        <div key={student.student_id}>
          <h3>{student.studentName}</h3>
          <p>Risk Score: {student.at_risk_score}/100</p>
          <p>Action: {student.recommended_action}</p>
        </div>
      ))}
    </div>
  );
}

export default AtRiskStudents;
```

---

## Monitoring Analytics Quality

### Schedule Periodic Updates:

```javascript
// In your server/jobs or cron file
setInterval(async () => {
  try {
    // Update at-risk predictions for all centers
    const { data: centers } = await supabase
      .from('tutorial_centers')
      .select('id');

    for (const center of centers) {
      await predictionService.updateCenterAtRiskPredictions(center.id);
    }
    console.log('Updated at-risk predictions');
  } catch (error) {
    console.error('Error updating predictions:', error);
  }
}, 3600000); // Every hour
```

### Log Study Sessions:

```javascript
// After a student completes a test
async function submitTest(studentId, centerId, testData) {
  // ... submit test logic ...

  // Log the session
  await analyticsService.logStudySession(studentId, centerId, {
    question_set_id: testData.testId,
    start_time: testData.startTime,
    end_time: new Date(),
    questions_attempted: testData.totalQuestions,
    questions_correct: testData.correctAnswers,
    score: testData.score,
    focus_quality: 'normal'
  });
}
```

---

## Customization Examples

### Change At-Risk Thresholds:

```javascript
// In predictionService.js, modify calculateAtRiskScore():

const score = 0;

// Increase weight for low scores
if (analytics.average_score < 50) {
  score += 40; // Changed from 30
} else if (analytics.average_score < 70) {
  score += 20; // Changed from 15
}

// Increase weight for inactivity
if (daysSinceActivity > 7) {
  score += 30; // Changed from 25
}

// ... rest of logic
```

### Add Custom Recommendation Logic:

```javascript
// In analyticsService.js, modify getStudyRecommendations():

const recommendations = weakSubjects?.map(s => ({
  subject: s.subject,
  currentMastery: s.mastery_level,
  suggestedStudyHours: Math.ceil((100 - s.mastery_level) / 15), // Adjusted
  priority: s.mastery_level < 30 ? 'critical' : s.mastery_level < 60 ? 'high' : 'medium',
  customMessage: `Your ${s.subject} needs work - here's why...`
})) || [];
```

### Add Additional Charts:

```jsx
// In components/analytics/AnalyticsCharts.jsx

export const CustomAnalyticsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {/* Your custom chart using Recharts */}
    </ResponsiveContainer>
  );
};
```

---

## Environment Setup

### Required Dependencies:

```bash
npm install recharts
# Already have: axios, react-router-dom, react-hot-toast
```

### Environment Variables (if needed):

```env
REACT_APP_API_BASE=http://localhost:5000/api
REACT_APP_ANALYTICS_ENABLED=true
```

---

## Troubleshooting

### Issue: "Analytics service not found"
```javascript
// Make sure import is correct
import analyticsService from '../../services/analyticsService';
// Not: import analyticsService from '../../services/analytics';
```

### Issue: Charts not displaying
```bash
npm install recharts
# Or check browser console for specific chart error
```

### Issue: No data in analytics
```javascript
// Make sure student has completed at least one test
// Check database: SELECT * FROM tc_student_attempts WHERE student_id = '...';
```

### Issue: API 500 errors
```javascript
// Check server logs
// Verify database migration was run
// Check auth token is valid
```

---

## Performance Tips

1. **Cache analytics data**:
```javascript
const [cachedAnalytics, setCachedAnalytics] = useState(null);
const [cacheTime, setCacheTime] = useState(null);

const getAnalytics = async (centerId) => {
  const now = Date.now();
  if (cachedAnalytics && now - cacheTime < 300000) { // 5 min cache
    return cachedAnalytics;
  }
  const data = await analyticsService.getStudentAnalytics(centerId);
  setCachedAnalytics(data);
  setCacheTime(now);
  return data;
};
```

2. **Paginate large student lists**:
```javascript
const [page, setPage] = useState(1);
const pageSize = 10;

const getAtRiskStudents = async () => {
  const res = await predictionService.getAtRiskStudents(centerId);
  return res.all.slice((page-1)*pageSize, page*pageSize);
};
```

3. **Lazy load charts**:
```javascript
const LazyChart = lazy(() => import('./AnalyticsCharts'));

<Suspense fallback={<div>Loading chart...</div>}>
  <LazyChart data={data} />
</Suspense>
```

---

**Ready to integrate! Follow the steps above and your analytics will be live.** ✅
