# Phase 6 — Verify Build & Smoke Test

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- Phases 1–5 prerequisite

## Overview
- **Priority:** High (definition of done)
- **Status:** completed
- Final verification: clean build, lint pass, manual smoke test of create flow.

## Requirements
- TypeScript build clean
- Linter clean
- Manual UI walkthrough confirms feature works end-to-end

## Implementation Steps
1. **Static checks:**
   ```bash
   npm run build
   npm run lint   # if configured
   ```
2. **Dead code audit:**
   ```bash
   grep -rn "useExamWizardStore\|TeacherCreateClassExamRequest\|TeacherCreateClassExamQuestion\|TeacherCreateClassExamOption" app components lib services types stores --exclude-dir=node_modules
   ```
   All must return 0 (except `TeacherCreateClassExamResponse` which is intentionally retained for class scope).
3. **Dev server smoke test (`npm run dev`):**
   a. Navigate to `/teacher/exams/create`.
   b. Verify 3-step wizard renders, identical layout to class flow.
   c. Step 1: try empty title → error blocks Next.
   d. Step 1: fill title, duration → Next enabled.
   e. Step 2: add question, add 3 options, mark 1 correct, fill prompts.
   f. Step 2: try removing options below 2 → blocked.
   g. Step 2: reorder questions → `order_index` re-numbers.
   h. Step 2: switch question_type to `text` → accepted_answers field appears, options hidden.
   i. Step 3: aside shows "...tạo bài thi cho hệ thống."
   j. Submit → Network tab shows `POST /teacher/system/exams` with correct payload shape.
   k. Success: green banner appears, redirects to `/teacher/exams` after ~1.2s.
   l. Cause an API error (e.g. 401 by clearing token) → red inline banner, form data retained.
4. **Regression check on class flow:**
   - Navigate to a class → create exam.
   - Verify wizard renders identically, posts to `/teacher/classes/{id}/exams`, redirects to class detail.
   - Verify aside copy still reads "...tạo bài thi cho lớp học."

## Todo List
- [x] `npm run build` passes
- [x] Lint clean
- [x] Dead-code grep returns 0 (per allowlist)
- [x] System exam create smoke test passes (steps a–l)
- [x] Class exam create regression test passes
- [x] No console errors in browser DevTools

*Completion notes: Verified 2026-05-08. All gates green.*

## Success Criteria
All bullets above pass. Plan status → completed.

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Build passes but runtime breaks | Manual smoke test catches |
| Class regression | Explicit regression step |
| Network payload mismatch | Inspect Network tab, compare to spec JSON |

## Security Considerations
- Verify auth token attached on POST.
- Confirm no secrets logged to console.

## Next Steps
Mark plan as completed. Archive via `/ck:plan archive` when ready.
