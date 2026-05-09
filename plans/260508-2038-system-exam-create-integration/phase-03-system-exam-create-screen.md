# Phase 3 — System Exam Create Screen

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- Reference impl: `app/(teacher)/teacher/classes/[id]/exams/create/teacher-class-exam-create-screen.tsx`
- Phases 1 & 2 prerequisite

## Overview
- **Priority:** High
- **Status:** completed
- Build `TeacherSystemExamCreateScreen` at `app/(teacher)/teacher/exams/create/teacher-system-exam-create-screen.tsx`. Near-clone of class screen, swap API call + redirect target + header copy.

## Key Insights
- `ExamForm` already classroom-agnostic — pass `initialValues`, `onSubmit`, `cancelHref`, `isSubmitting`, `submitLabel`, `submitError`.
- Class screen template handles state cleanly: `useState` for submit/error/success + `useRef` for redirect timeout cleanup.
- Validation, payload mapping reused via existing `utils.ts` (`createInitialTeacherExamFormValues`, `mapTeacherExamFormToPayload`).

## Requirements
- Render the same 3-step wizard UI (info → questions → review)
- Submit via `createTeacherSystemExam` from Phase 2
- Loading: `isSubmitting` disables submit + label changes
- Error: inline red banner via `submitError` prop
- Success: green banner + auto-redirect to `/teacher/exams` after 1.2s
- Cancel link → `/teacher/exams`
- Cleanup `setTimeout` on unmount

## Architecture
```
TeacherSystemExamCreatePage (server component)
  → TeacherSystemExamCreateScreen (client)
      ├─ useState(isSubmitting, submitError, successMessage)
      ├─ useRef(redirectTimeoutRef)
      ├─ handleSubmit(values):
      │    payload = mapTeacherExamFormToPayload(values)
      │    { message } = await createTeacherSystemExam(payload)
      │    → setSuccessMessage; redirect to /teacher/exams
      └─ <ExamForm initialValues={createInitialTeacherExamFormValues()} ...>
```

## Related Code Files
**Create:**
- `app/(teacher)/teacher/exams/create/teacher-system-exam-create-screen.tsx`

## Implementation Steps
1. Create new file with `"use client"` directive.
2. Imports:
   - `Link` from `next/link`, `useRouter` from `next/navigation`, `useEffect/useRef/useState`
   - `ArrowLeft` from `lucide-react`
   - `ExamForm`, `TeacherExamFormValues`
   - `createInitialTeacherExamFormValues`, `mapTeacherExamFormToPayload`
   - `createTeacherSystemExam` from `@/services/exam.service`
3. Copy `getErrorMessage` and `scrollTeacherContentToTop` helpers from class screen (or extract to shared util later — YAGNI for now).
4. Component shape (mirror class screen):
   - Props: none (`{}`)
   - Header: `Tạo bài thi hệ thống`
   - Subtitle: `Hoàn thiện bài thi theo từng bước rõ ràng: nhập thông tin chung, xây dựng câu hỏi, sau đó xem lại toàn bộ nội dung trước khi xuất bản.`
   - Back link: `/teacher/exams` with text `Quay lại danh sách bài thi`
   - Success message: `Tạo bài thi thành công. Đang chuyển về danh sách...`
   - Error fallback: `Không thể tạo bài thi. Vui lòng thử lại.`
   - `cancelHref="/teacher/exams"`
   - On success → `router.push("/teacher/exams")` after 1200ms
5. After Phase 4 lands, pass `submitContextLabel="hệ thống"` to `ExamForm`.

## Todo List
- [x] Create `teacher-system-exam-create-screen.tsx`
- [x] Implement `handleSubmit` with `createTeacherSystemExam`
- [x] Wire `useRef` cleanup for redirect timeout
- [x] Verify file size <200 LOC (per modularization rule)
- [x] Verify TS compiles

*Completion notes: Verified 2026-05-08.*

## Success Criteria
- File compiles, no warnings
- Mirrors class screen layout/spacing/colors
- Cancel → `/teacher/exams`
- Success redirect → `/teacher/exams`
- Error keeps form data + shows inline message

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Helper duplication (getErrorMessage, scrollToTop) | Acceptable now — extract to shared util only when 3rd consumer appears (YAGNI) |
| Submit handler races (double-click) | Already guarded by `isSubmitting` |
| Memory leak on unmount mid-redirect | `useEffect` cleanup clears `redirectTimeoutRef` |

## Security Considerations
- No raw HTML rendering — all values flow through React text nodes.
- API client auto-attaches auth.

## Next Steps
- Phase 4 — polish ExamForm copy
- Phase 5 — wire screen into create page
