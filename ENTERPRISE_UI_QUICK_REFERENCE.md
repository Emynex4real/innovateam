# Enterprise UI - Quick Reference Guide

## 🚀 How to Use the New UI

### For Users:

1. **Login**: Visit `/login` - Split-screen design with branding
2. **Register**: Visit `/register` - 3-step wizard (Info → Password → Role)
3. **Student Dashboard**: Visit `/student/dashboard` - Stats, quick actions, gamification
4. **Tests**: Visit `/student/tests` - Filter, view, and take tests
5. **Results**: Visit `/student/results/:testId` - View scores and generate remedial tests
6. **Tutor Dashboard**: Visit `/tutor/dashboard` - Analytics and management

---

## 🎨 Design System Usage

### Import:
```javascript
import { componentStyles } from '../styles/designSystem';
```

### Buttons:
```jsx
<button className={componentStyles.button.primary}>Primary</button>
<button className={componentStyles.button.secondary}>Secondary</button>
<button className={componentStyles.button.ghost}>Ghost</button>
```

### Cards:
```jsx
<div className={componentStyles.card.default}>Default Card</div>
<div className={componentStyles.card.interactive}>Interactive Card</div>
```

### Inputs:
```jsx
<input className={componentStyles.input.default} />
```

### Badges:
```jsx
<span className={componentStyles.badge.success}>Success</span>
<span className={componentStyles.badge.warning}>Warning</span>
<span className={componentStyles.badge.error}>Error</span>
<span className={componentStyles.badge.info}>Info</span>
```

---

## 🔧 Common Tasks

### Add a New Page:
1. Create file in appropriate directory
2. Import design system
3. Use componentStyles for consistency
4. Add route in App.js
5. Test thoroughly

### Add a New Feature:
1. Check if backend endpoint exists
2. Add service function if needed
3. Create/update component
4. Add loading/error states
5. Test edge cases

### Fix a Bug:
1. Identify the issue
2. Check backend logs
3. Check browser console
4. Fix the issue
5. Test thoroughly
6. Document the fix

---

## 📊 File Structure

```
src/
├── pages/
│   ├── login/
│   │   ├── EnterpriseLogin.jsx ✅ NEW
│   │   └── index.jsx (old)
│   ├── register/
│   │   ├── EnterpriseRegister.jsx ✅ NEW
│   │   └── index.jsx (old)
│   ├── student/
│   │   └── tutorial-center/
│   │       ├── EnterpriseDashboard.jsx ✅ NEW
│   │       ├── EnterpriseTestList.jsx ✅ NEW
│   │       ├── EnterpriseTakeTest.jsx ✅ NEW
│   │       ├── EnterpriseResults.jsx ✅ NEW
│   │       └── [old files]
│   └── tutor/
│       ├── EnterpriseDashboard.jsx ✅ NEW
│       └── [other files]
├── styles/
│   └── designSystem.js ✅ NEW
├── components/
│   ├── StreakBadge.jsx ✅
│   └── LeagueCard.jsx ✅
└── services/
    ├── studentTC.service.js
    └── tutorialCenter.service.js
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load dashboard"
**Solution:** Check if backend is running and user has a center

### Issue: Questions not loading
**Solution:** Backend now returns empty array if no center exists (fixed)

### Issue: Routing not working
**Solution:** Clear browser cache and restart dev server

### Issue: Styles not applying
**Solution:** Check if designSystem.js is imported correctly

### Issue: API calls failing
**Solution:** Check if auth token is valid and backend is running

---

## 📝 Code Snippets

### Loading State:
```jsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
    </div>
  );
}
```

### Empty State:
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className={componentStyles.card.default + ' text-center py-12'}
>
  <div className="text-6xl mb-4">📝</div>
  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data</h2>
  <p className="text-gray-600 mb-6">Description here</p>
  <button className={componentStyles.button.primary}>
    Action Button
  </button>
</motion.div>
```

### Error Handling:
```jsx
try {
  const response = await service.getData();
  if (response.success) {
    setData(response.data);
  }
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to load data');
}
```

---

## 🔍 Debugging Tips

1. **Check Browser Console** - Look for errors
2. **Check Network Tab** - Verify API calls
3. **Check Backend Logs** - See server-side errors
4. **Use React DevTools** - Inspect component state
5. **Check localStorage** - Verify auth tokens

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Check ENTERPRISE_UI_FINAL_STATUS.md
3. Check ENTERPRISE_VS_OLD_COMPARISON.md
4. Check backend logs
5. Create detailed bug report

---

## ✅ Pre-Deployment Checklist

- [ ] All pages load correctly
- [ ] All features work as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error handling works
- [ ] Empty states display correctly
- [ ] Animations are smooth
- [ ] Backend connections verified
- [ ] Authentication works
- [ ] Role-based access works
- [ ] Performance is acceptable

---

## 🎯 Quick Commands

### Start Development:
```bash
# Frontend
cd innovateam
npm start

# Backend
cd innovateam/server
npm start
```

### Build for Production:
```bash
cd innovateam
npm run build
```

### Clear Cache:
```bash
# Browser: Ctrl+Shift+Delete
# Or manually clear localStorage
localStorage.clear();
```

---

## 📚 Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** December 27, 2025
**Version:** 1.0.0
**Status:** Production Ready (after testing)
