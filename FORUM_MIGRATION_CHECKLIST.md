# Forum Migration Checklist ✅

## Pre-Migration Verification

- [ ] All dependencies are installed (check `package.json`)
  - [ ] react-router-dom ✓
  - [ ] react-markdown ✓
  - [ ] remark-math ✓
  - [ ] rehype-katex ✓
  - [ ] katex ✓
  - [ ] date-fns ✓

- [ ] Supabase is configured (`src/config/supabase.js` exists)
- [ ] ForumsService is working (`src/services/forumsService.js`)
- [ ] Current forum is accessible at `/student/forums`

---

## Migration Steps

### Step 1: Backup Current System ⏱️ 2 minutes

- [ ] Create backup of old Forums.jsx:
  ```bash
  cp src/pages/student/Forums.jsx src/pages/student/Forums.BACKUP.jsx
  ```

- [ ] Commit current changes to git:
  ```bash
  git add .
  git commit -m "Backup before forum upgrade"
  ```

### Step 2: Verify New Files Exist ⏱️ 1 minute

Check that these files were created:

- [ ] `src/pages/student/ForumsLayout.jsx`
- [ ] `src/components/forums/CategoryList.jsx`
- [ ] `src/components/forums/ThreadList.jsx`
- [ ] `src/components/forums/ThreadDetail.jsx`
- [ ] `src/components/ui/Skeleton.jsx`

Check that these files were updated:

- [ ] `src/components/forums/EnhancedPostCard.jsx` (now has ReactMarkdown)

### Step 3: Update Main Routing ⏱️ 5 minutes

**File to edit:** `src/App.js` or `src/routes/index.js` (wherever your routes are defined)

**Find this line:**
```jsx
<Route path="/student/forums" element={<Forums />} />
```

**Replace with:**
```jsx
<Route path="/student/forums/*" element={<ForumsLayout centerId={centerId} userId={userId} />} />
```

**Important notes:**
- [ ] Added `/*` wildcard for nested routes
- [ ] Passing `centerId` prop
- [ ] Passing `userId` prop
- [ ] Import statement updated:
  ```jsx
  import ForumsLayout from './pages/student/ForumsLayout';
  ```

### Step 4: Test Basic Navigation ⏱️ 5 minutes

- [ ] Start development server: `npm start`
- [ ] Navigate to `/student/forums`
- [ ] Should see category list
- [ ] Click on a category
- [ ] URL should change to `/student/forums/category/[id]`
- [ ] Click on a thread
- [ ] URL should change to `/student/forums/thread/[id]`
- [ ] Back button should work correctly

### Step 5: Test Math Rendering ⏱️ 5 minutes

- [ ] Open a thread
- [ ] Click "Add Your Reply"
- [ ] Type: `The formula is $x^2 + y^2 = z^2$`
- [ ] Click "Preview" button
- [ ] Math should render beautifully
- [ ] Post the reply
- [ ] Math should display in the posted message

**Test these equations:**
- [ ] Inline: `$\frac{1}{2}$`
- [ ] Block: `$$E = mc^2$$`
- [ ] Complex: `$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$`

### Step 6: Test Real-Time Updates ⏱️ 5 minutes

- [ ] Open a thread in Chrome
- [ ] Open the SAME thread in Firefox (or incognito)
- [ ] Post a reply in Chrome
- [ ] Firefox should update automatically (within 1-2 seconds)
- [ ] Check browser console for "Realtime change received!" message

### Step 7: Test Deep Linking ⏱️ 3 minutes

- [ ] Open a thread
- [ ] Copy the URL from address bar
- [ ] Open a new browser tab
- [ ] Paste the URL
- [ ] Should load directly to that thread (not homepage)
- [ ] Share link with another device/browser
- [ ] Should work correctly

### Step 8: Test Edge Cases ⏱️ 10 minutes

- [ ] Empty category (no threads)
- [ ] Thread with no replies
- [ ] Very long thread title
- [ ] Thread with 50+ replies
- [ ] Math equation with syntax error (should not crash)
- [ ] Navigate back/forward with browser buttons
- [ ] Refresh page while on thread detail
- [ ] Bookmark a thread URL

### Step 9: Mobile Testing ⏱️ 5 minutes

- [ ] Open on mobile device or use Chrome DevTools mobile view
- [ ] Category cards are responsive
- [ ] Thread list is readable
- [ ] Math equations render correctly
- [ ] Rich text editor works on mobile
- [ ] Navigation buttons are accessible

### Step 10: Performance Check ⏱️ 5 minutes

- [ ] Open Chrome DevTools → Network tab
- [ ] Navigate through forum
- [ ] Check for unnecessary API calls
- [ ] Verify real-time connection is established
- [ ] Check bundle size (should not increase significantly)
- [ ] Test with slow 3G throttling

---

## Post-Migration Verification

### Functionality Checklist

- [ ] Can view categories
- [ ] Can view threads in a category
- [ ] Can view thread details
- [ ] Can create new thread
- [ ] Can post reply
- [ ] Can vote on posts
- [ ] Can mark answer (if thread creator)
- [ ] Can follow/unfollow thread
- [ ] Math equations render correctly
- [ ] Real-time updates work
- [ ] Search functionality works
- [ ] Sorting/filtering works
- [ ] Infinite scroll works

### User Experience Checklist

- [ ] Loading states show skeleton loaders (not "Loading..." text)
- [ ] Error messages are clear and helpful
- [ ] URLs are shareable
- [ ] Back button works as expected
- [ ] No console errors
- [ ] No console warnings (except expected ones)
- [ ] Smooth transitions between views
- [ ] Rich text editor is intuitive

### Code Quality Checklist

- [ ] No unused imports
- [ ] No console.log statements (except intentional ones)
- [ ] PropTypes or TypeScript types defined
- [ ] Components are properly documented
- [ ] CSS classes are consistent
- [ ] No duplicate code

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Immediate rollback:**
   ```bash
   git checkout src/App.js  # or wherever you changed routes
   ```

2. **Restore old Forums.jsx:**
   ```bash
   cp src/pages/student/Forums.BACKUP.jsx src/pages/student/Forums.jsx
   ```

3. **Restart server:**
   ```bash
   npm start
   ```

4. **Report issues:**
   - Check browser console for errors
   - Check terminal for build errors
   - Document what went wrong

---

## Common Issues & Solutions

### Issue: "Cannot find module 'ForumsLayout'"
**Solution:** Check import path in your routing file

### Issue: Routes not working (404)
**Solution:** Ensure parent route has `/*` wildcard

### Issue: Math not rendering
**Solution:** 
1. Check if `katex/dist/katex.min.css` is imported
2. Verify ReactMarkdown is installed
3. Check browser console for errors

### Issue: Real-time not working
**Solution:**
1. Check Supabase configuration
2. Verify Supabase Realtime is enabled in dashboard
3. Check browser console for connection errors

### Issue: Props undefined (centerId, userId)
**Solution:** Pass props from parent component correctly

### Issue: Infinite scroll not working
**Solution:** Check IntersectionObserver browser support

---

## Success Criteria

Migration is successful when:

✅ All tests pass
✅ No console errors
✅ URLs are shareable
✅ Math renders correctly
✅ Real-time updates work
✅ Mobile experience is good
✅ Performance is acceptable

---

## Timeline

| Task | Estimated Time | Status |
|------|---------------|--------|
| Pre-migration verification | 5 min | ⬜ |
| Backup current system | 2 min | ⬜ |
| Verify new files | 1 min | ⬜ |
| Update routing | 5 min | ⬜ |
| Test navigation | 5 min | ⬜ |
| Test math rendering | 5 min | ⬜ |
| Test real-time | 5 min | ⬜ |
| Test deep linking | 3 min | ⬜ |
| Test edge cases | 10 min | ⬜ |
| Mobile testing | 5 min | ⬜ |
| Performance check | 5 min | ⬜ |
| **Total** | **~50 min** | |

---

## Next Steps After Migration

1. **Monitor in production:**
   - Watch for errors in Sentry/logging
   - Monitor Supabase real-time connections
   - Check user feedback

2. **Optimize:**
   - Add caching for frequently accessed threads
   - Implement lazy loading for images
   - Add service worker for offline support

3. **Enhance:**
   - Add notifications for new replies
   - Implement @mentions
   - Add file upload support
   - Create moderation tools

---

## Sign-Off

- [ ] Developer tested: _________________ Date: _______
- [ ] QA tested: _________________ Date: _______
- [ ] Product owner approved: _________________ Date: _______
- [ ] Ready for production: ⬜ Yes ⬜ No

---

**Notes:**
_Use this space to document any issues encountered or deviations from the plan:_

---

**Status:** 🟡 Ready to Begin
**Last Updated:** 2025
**Version:** 1.0
