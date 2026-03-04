---
name: InnovaTeam Development
description: Standards and workflow for the InnovaTeam JAMB/WAEC educational platform
---

# InnovaTeam Development Skill

## Self-Learning & Verification Protocol

### Step 1: Context Acquisition

Before executing any request, read `CLAUDE.md` in the project root to load:

- Tech stack constraints
- Architectural boundaries
- Lessons learned from past mistakes

### Step 2: Plan & Execute Loop

For any non-trivial change (touching 2+ files or adding new logic):

1. Write a brief plan outlining the steps
2. Ask the user for approval before writing code
3. Implement with minimal, elegant code — do not refactor unrelated files

### Step 3: Self-Correction Mandate

When corrected on a bug, style, or architecture error:

1. Fix the error immediately
2. Append a new entry to `[LESSONS LEARNED]` in `CLAUDE.md`
3. Format: `* [YYYY-MM-DD] - [Topic]: Rule.`
