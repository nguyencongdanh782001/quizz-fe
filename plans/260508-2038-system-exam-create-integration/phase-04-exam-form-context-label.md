# Phase 4 — ExamForm submitContextLabel Polish

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- File: `components/features/teacher-exam-form/exam-form.tsx:344` (review-step aside copy)

## Overview
- **Priority:** Medium (cosmetic, but cheap)
- **Status:** completed
- Review-step aside hardcodes "tạo bài thi cho lớp học". Add optional `submitContextLabel` prop so system flow renders correct copy.

## Key Insights
- Single hardcoded string. Default keeps current class-flow wording.
- Prop drilled from `ExamForm` → `ExamFormBody` → `stepAside` memo.

## Requirements
- Default value preserves existing class-flow text (no regression).
- Class screen passes `"lớp học"`, system screen passes `"hệ thống"`.

## Architecture
```
ExamForm (props: ..., submitContextLabel = "lớp học")
  └─ ExamFormBody (uses submitContextLabel in review-step aside copy)
      "Kiểm tra lại các chỉ số cuối cùng rồi tạo bài thi cho {submitContextLabel}."
```

## Related Code Files
**Modify:**
- `components/features/teacher-exam-form/exam-form.tsx`
- `app/(teacher)/teacher/classes/[id]/exams/create/teacher-class-exam-create-screen.tsx` — pass label
- `app/(teacher)/teacher/exams/create/teacher-system-exam-create-screen.tsx` (created in Phase 3) — pass label

## Implementation Steps
1. In `exam-form.tsx`:
   - Add `submitContextLabel?: string` to `ExamForm` props (default `"lớp học"`).
   - Add same prop to `ExamFormBody` props.
   - Thread it: `ExamForm` → `ExamFormBody`.
   - In `stepAside` memo for `review` step, replace hardcoded text with template literal using `submitContextLabel`.
   - Add `submitContextLabel` to memo deps array.
2. In class screen: pass `submitContextLabel="lớp học"` (or omit — default already covers).
3. In system screen (Phase 3): pass `submitContextLabel="hệ thống"`.

## Todo List
- [x] Add `submitContextLabel` prop to `ExamForm` (default `"lớp học"`)
- [x] Thread to `ExamFormBody`
- [x] Replace hardcoded text in review step aside
- [x] Update memo deps array
- [x] Pass `"hệ thống"` from system screen
- [x] Confirm class screen still renders identical copy (default fallback)

*Completion notes: Verified 2026-05-08.*

## Success Criteria
- System exam create page review step shows "...tạo bài thi cho hệ thống."
- Class exam create page unchanged.
- TS compiles.

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Forget to add to memo deps → stale render | Lint rule + manual review |
| Wider copy drift later | Only changes one substring; broader templating is YAGNI |

## Security Considerations
None — static literal.

## Next Steps
- Phase 5 — page swap + cleanup.
