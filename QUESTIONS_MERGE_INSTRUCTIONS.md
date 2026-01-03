# Questions Page - Complete Merge Instructions

## ✅ Analysis Complete

**Original file backed up to:** `Questions.backup.jsx`

### Features in OLD file that MUST be kept:
1. ✅ Add/Edit Question Form (full modal)
2. ✅ TagInput component integration
3. ✅ Category filter (Science, Commercial, Arts, General)
4. ✅ Bulk Import button
5. ✅ Full question display with options
6. ✅ Individual Edit/Delete
7. ✅ Tags display
8. ✅ Year and Exam Type fields

### NEW features to ADD:
1. ✅ Hierarchical view (Subject → Topic)
2. ✅ Bulk selection
3. ✅ Bulk delete
4. ✅ View mode toggle (Tree/Flat)
5. ✅ Enhanced search

## 🔧 Implementation Steps

### Step 1: Add New State Variables
Add after line 12 in Questions.jsx:

```javascript
const [groupedQuestions, setGroupedQuestions] = useState({});
const [selectedQuestions, setSelectedQuestions] = useState([]);
const [expandedSubjects, setExpandedSubjects] = useState({});
const [expandedTopics, setExpandedTopics] = useState({});
const [searchTerm, setSearchTerm] = useState('');
const [viewMode, setViewMode] = useState('hierarchical');
```

### Step 2: Add Grouping Function
Add after loadQuestions function:

```javascript
const groupQuestions = (qs) => {
  const grouped = {};
  qs.forEach(q => {
    const subject = q.subject || 'Uncategorized';
    const topic = q.topic || 'General';
    if (!grouped[subject]) grouped[subject] = {};
    if (!grouped[subject][topic]) grouped[subject][topic] = [];
    grouped[subject][topic].push(q);
  });
  setGroupedQuestions(grouped);
};
```

### Step 3: Update loadQuestions
Change line 45 to:

```javascript
setQuestions(response.questions);
groupQuestions(response.questions);
```

### Step 4: Add Bulk Selection Functions
Add before handleSubmit:

```javascript
const toggleSubject = (subject) => {
  setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
};

const toggleTopic = (subject, topic) => {
  const key = `${subject}-${topic}`;
  setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
};

const selectAllInTopic = (subject, topic) => {
  const topicQuestions = groupedQuestions[subject][topic].map(q => q.id);
  const allSelected = topicQuestions.every(id => selectedQuestions.includes(id));
  setSelectedQuestions(prev => 
    allSelected ? prev.filter(id => !topicQuestions.includes(id)) : [...new Set([...prev, ...topicQuestions])]
  );
};

const selectAllInSubject = (subject) => {
  const subjectQuestions = Object.values(groupedQuestions[subject]).flat().map(q => q.id);
  const allSelected = subjectQuestions.every(id => selectedQuestions.includes(id));
  setSelectedQuestions(prev => 
    allSelected ? prev.filter(id => !subjectQuestions.includes(id)) : [...new Set([...prev, ...subjectQuestions])]
  );
};

const handleBulkDelete = async () => {
  if (selectedQuestions.length === 0) {
    toast.error('No questions selected');
    return;
  }
  if (!window.confirm(`Delete ${selectedQuestions.length} questions?`)) return;
  
  const toastId = toast.loading(`Deleting...`);
  try {
    for (const id of selectedQuestions) {
      await tutorialCenterService.deleteQuestion(id);
    }
    toast.success(`Deleted ${selectedQuestions.length} questions`, { id: toastId });
    setSelectedQuestions([]);
    loadQuestions();
  } catch (error) {
    toast.error('Failed to delete some questions', { id: toastId });
  }
};
```

### Step 5: Update Filter Section
Replace the filter section (around line 140) with:

```javascript
<div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
  <div className="flex flex-wrap gap-3 mb-3">
    <input
      type="text"
      placeholder="🔍 Search questions..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={`flex-1 min-w-[200px] px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
    />
    <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
      <option value="">All Categories</option>
      <option value="Science">Science</option>
      <option value="Commercial">Commercial</option>
      <option value="Arts">Arts</option>
      <option value="General">General</option>
    </select>
    <select value={filter.difficulty} onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })} className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
      <option value="">All Difficulties</option>
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
    <button onClick={() => setViewMode(viewMode === 'hierarchical' ? 'flat' : 'hierarchical')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
      {viewMode === 'hierarchical' ? '📋 Flat' : '📁 Tree'}
    </button>
  </div>
  
  {selectedQuestions.length > 0 && (
    <div className="flex flex-wrap gap-2 items-center">
      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedQuestions.length} selected</span>
      <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">🗑️ Delete</button>
      <button onClick={() => setSelectedQuestions([])} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">Clear</button>
    </div>
  )}
</div>
```

### Step 6: Add Hierarchical View
Replace the questions display section (around line 300) with conditional rendering:

```javascript
{viewMode === 'hierarchical' ? (
  // Add hierarchical tree view here (see TestBuilder.jsx for reference)
  <div className="space-y-2">
    {Object.keys(groupedQuestions).map(subject => (
      // Subject → Topic → Questions structure
    ))}
  </div>
) : (
  // Keep existing flat view with checkboxes
  <div className="space-y-4">
    {questions.map((q) => (
      <div key={q.id} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-4 md:p-6`}>
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            checked={selectedQuestions.includes(q.id)} 
            onChange={() => setSelectedQuestions(prev => 
              prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
            )} 
            className="mt-1" 
          />
          {/* Keep existing question display */}
        </div>
      </div>
    ))}
  </div>
)}
```

## ⚠️ Important Notes

1. **Keep ALL existing functionality**
2. **Add checkboxes to flat view**
3. **Preserve the Add/Edit form modal**
4. **Keep TagInput integration**
5. **Maintain all filters**

## 🎯 Result

You'll have:
- ✅ Original features (Add/Edit/Tags/Filters)
- ✅ Hierarchical organization
- ✅ Bulk selection & delete
- ✅ View mode toggle
- ✅ Enhanced search

## 📝 Testing Checklist

- [ ] Can add new question
- [ ] Can edit existing question
- [ ] Can delete single question
- [ ] Can bulk select and delete
- [ ] Hierarchical view works
- [ ] Flat view works
- [ ] Search works
- [ ] Filters work
- [ ] Tags display correctly
