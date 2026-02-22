# 🛡️ Anti-Cheat / Proctoring System

## Overview

Industry-standard browser-based exam proctoring system for tutorial centers. Monitors student behavior during tests, flags suspicious activities, and provides detailed reports to tutors.

## ✨ Features

### For Students
- ✅ Real-time violation counter
- ✅ Transparent monitoring (no hidden tracking)
- ✅ Color-coded risk level indicator
- ✅ Browser-only (no webcam/screen recording)
- ✅ Automatic protections (copy/paste blocking, etc.)

### For Tutors
- ✅ Comprehensive dashboard with statistics
- ✅ Detailed violation reports
- ✅ Risk scoring (0-100 scale)
- ✅ Timeline of suspicious activities
- ✅ Search and filter capabilities
- ✅ Device fingerprint information

### Technical
- ✅ Automatic risk calculation
- ✅ Real-time monitoring
- ✅ Secure (RLS policies)
- ✅ Performant (indexed queries)
- ✅ Privacy-compliant
- ✅ Dark mode support

## 🚀 Quick Start

### 1. Run Database Migration
```bash
# In Supabase SQL Editor
supabase/proctoring_system.sql
```

### 2. Restart Backend
```bash
cd server
npm start
```

### 3. Add Frontend Route
```javascript
// In your router
import ProctoringDashboard from './pages/tutor/ProctoringDashboard';

<Route path="/tutor/proctoring" element={<ProctoringDashboard />} />
```

### 4. Test
- Take a test as student
- View reports as tutor

## 📁 Files Created

### Database
- `supabase/proctoring_system.sql` - Complete schema

### Backend
- `server/controllers/proctoring.controller.js` - API logic
- `server/routes/proctoring.routes.js` - Endpoints
- `server/server.js` - Updated with routes

### Frontend
- `src/hooks/useAntiCheat.js` - Core monitoring
- `src/services/proctoring.service.js` - API client
- `src/components/exam/ProctoringMonitor.jsx` - Student UI
- `src/components/tutor/ProctoringReport.jsx` - Report modal
- `src/pages/tutor/ProctoringDashboard.jsx` - Tutor dashboard
- `src/pages/student/tutorial-center/EnterpriseTakeTest.jsx` - Updated

### Documentation
- `ANTI_CHEAT_SETUP.md` - Detailed setup guide
- `ANTI_CHEAT_ARCHITECTURE.md` - System architecture
- `ANTI_CHEAT_IMPLEMENTATION.md` - Implementation summary
- `TUTOR_PROCTORING_GUIDE.md` - Tutor reference
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps

## 🎯 What Gets Monitored

### Tracked
- ✅ Tab/window switches
- ✅ Copy/paste attempts
- ✅ Right-click attempts
- ✅ Keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
- ✅ Fullscreen exits
- ✅ Focus losses
- ✅ Mouse leaving exam area
- ✅ Connection status (heartbeat)

### NOT Tracked
- ❌ Webcam/microphone
- ❌ Screen recording
- ❌ Keylogging
- ❌ Personal files
- ❌ Location data

## 📊 Risk Scoring

| Level | Score | Violations | Action |
|-------|-------|------------|--------|
| 🟢 LOW | 0-24 | <5 | No action |
| 🟡 MEDIUM | 25-49 | 5-9 | Review |
| 🟠 HIGH | 50-74 | 10-19 | Investigate |
| 🔴 CRITICAL | 75+ | 20+ | Flag for review |

## 🔧 Configuration

### Adjust Risk Thresholds
Edit `supabase/proctoring_system.sql`:
```sql
-- In update_risk_level() function
IF new_score >= 75 OR violation_count >= 20 THEN
  new_level := 'CRITICAL';
```

### Adjust Violation Weights
Edit `supabase/proctoring_system.sql`:
```sql
-- In calculate_risk_score() function
score := LEAST(100, 
  (tab_switches * 15) +    -- Adjust these weights
  (copy_attempts * 20) + 
  (focus_loss * 10)
);
```

## 🎨 Screenshots

### Student View
```
┌─────────────────────────────────────────┐
│  [Test Question]                    🟢  │
│                                     │   │
│  Proctoring Active                  │   │
│  2 Flags (Low)                      │   │
│                                     │   │
│  [Options A, B, C, D]                   │
└─────────────────────────────────────────┘
```

### Tutor Dashboard
```
┌─────────────────────────────────────────┐
│  🛡️ Proctoring Dashboard                │
│                                          │
│  [Total: 45] [Critical: 3] [High: 8]    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Student    Test    Risk   Actions  │ │
│  │ John Doe   Math    🔴 85   [View]  │ │
│  │ Jane Smith Bio     🟢 12   [View]  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [ANTI_CHEAT_SETUP.md](ANTI_CHEAT_SETUP.md) | Complete setup instructions |
| [ANTI_CHEAT_ARCHITECTURE.md](ANTI_CHEAT_ARCHITECTURE.md) | System architecture diagrams |
| [ANTI_CHEAT_IMPLEMENTATION.md](ANTI_CHEAT_IMPLEMENTATION.md) | Implementation details |
| [TUTOR_PROCTORING_GUIDE.md](TUTOR_PROCTORING_GUIDE.md) | Tutor quick reference |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Deployment steps |

## 🔒 Privacy & Compliance

### GDPR Compliant
- ✅ Transparent monitoring
- ✅ Student notification
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Right to access

### Student Consent
Add to terms of service:
> "During exams, we monitor browser activity to ensure academic integrity. This includes tracking tab switches, copy/paste attempts, and focus changes. No webcam, screen recording, or keylogging is used."

## 🐛 Troubleshooting

### Violations Not Logging
1. Check browser console for errors
2. Verify database migration ran
3. Check RLS policies
4. Test API endpoints

### Tutor Can't See Reports
1. Verify tutor has `center_id`
2. Check RLS policies
3. Ensure test belongs to center

### Risk Scores Not Calculating
1. Check database triggers
2. Verify function exists
3. Test manually: `SELECT calculate_risk_score('session_id');`

## 📞 Support

- **Setup Issues:** See [ANTI_CHEAT_SETUP.md](ANTI_CHEAT_SETUP.md)
- **Architecture Questions:** See [ANTI_CHEAT_ARCHITECTURE.md](ANTI_CHEAT_ARCHITECTURE.md)
- **Tutor Training:** See [TUTOR_PROCTORING_GUIDE.md](TUTOR_PROCTORING_GUIDE.md)
- **Deployment:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## 🎯 Roadmap

### Phase 1 (Current) ✅
- Browser-based monitoring
- Risk scoring
- Tutor dashboard
- Student notifications

### Phase 2 (Future)
- [ ] Webcam snapshots (optional, with consent)
- [ ] AI-powered anomaly detection
- [ ] Session playback
- [ ] PDF report export
- [ ] Email alerts

### Phase 3 (Advanced)
- [ ] Machine learning predictions
- [ ] Behavioral biometrics
- [ ] Multi-device detection
- [ ] Live monitoring

## 📄 License

MIT License - Part of InnovaTeam platform

## 🙏 Credits

Built with:
- React + Hooks
- Supabase (PostgreSQL)
- Express.js
- Framer Motion
- Tailwind CSS

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** January 2025

**Questions?** Check the documentation or contact your development team.
