# Quick Reference: Subject Name Variations

## Supported Subject Aliases

### 📚 Arts & Humanities

**Literature in English**
- `Literature in English` (official)
- `Literature`
- `Lit`
- `Lit in Eng`
- `English Lit`
- `Literature in Eng`

**Use of English**
- `Use of English` (official)
- `English`
- `Use of Eng`

**Government**
- `Government` (official)
- `Govt`
- `Civic`

**Christian Religious Studies**
- `Christian Religious Studies` (official)
- `CRS`
- `Christian`

**Islamic Religious Studies**
- `Islamic Religious Studies` (official)
- `IRS`
- `Islamic`
- `Islamic Studies`

**History**
- `History` (official)

---

### 🔬 Sciences

**Biology**
- `Biology` (official)
- `Bio`

**Chemistry**
- `Chemistry` (official)
- `Chem`

**Physics**
- `Physics` (official)
- `Phy`

**Mathematics**
- `Mathematics` (official)
- `Math`
- `Maths`

---

### 💼 Commercial Subjects

**Economics**
- `Economics` (official)
- `Econs`
- `Econ`

**Commerce**
- `Commerce` (official)

**Accounting**
- `Accounting` (official)
- `Account`
- `Financial Accounting`

**Geography**
- `Geography` (official)
- `Geo`

---

## Usage Examples

### Browser/Frontend
```javascript
// All these are equivalent:
generateQuestions({ subject: 'Literature in English', topic: 'Poetry' })
generateQuestions({ subject: 'Literature', topic: 'Poetry' })
generateQuestions({ subject: 'Lit', topic: 'Poetry' })
generateQuestions({ subject: 'Lit in Eng', topic: 'Poetry' })
```

### API Request
```bash
# Any of these work:
curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"subject": "Math", "topic": "Algebra", "totalQuestions": 5}'

curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"subject": "Maths", "topic": "Algebra", "totalQuestions": 5}'

curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"subject": "Mathematics", "topic": "Algebra", "totalQuestions": 5}'
```

---

## Tips

✅ **Case doesn't matter**: `biology` = `Biology` = `BIOLOGY`

✅ **Extra spaces ignored**: `atomic  structure` = `atomic structure`

✅ **Typos tolerated**: Up to 3 character differences (e.g., `Biologgy` → `Biology`)

✅ **Partial topic matching**: `Algebra` matches `II. Algebra: Matrices and Determinants`

❌ **Too many typos**: `Biologyyyy` (5+ character difference) won't match

---

## Testing Your Input

Want to test if your subject/topic will work? Run:

```bash
cd server
node scripts/test-fuzzy-matching.js
```

Or test a specific combination:

```javascript
const { normalizeSubject, normalizeTopic } = require('./utils/fuzzyMatch');

console.log(normalizeSubject('Lit'));  // Output: "Literature in English"
console.log(normalizeSubject('Math')); // Output: "Mathematics"
console.log(normalizeTopic('ALGEBRA')); // Output: "algebra"
```

---

## Need Help?

If your subject/topic variation isn't working:
1. Check the spelling (max 3 character difference)
2. Try the official name from the list above
3. Open an issue on GitHub with your input
4. We'll add it to the alias list!
