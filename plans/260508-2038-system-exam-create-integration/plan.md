---
status: completed
slug: 260508-2038-system-exam-create-integration
created: 2026-05-08
brainstorm: ../reports/brainstorm-260508-2038-system-exam-create-integration.md
---

# System Exam Create Integration

## Goal
Wire `POST /teacher/system/exams` into `/teacher/exams/create`, reusing existing classroom-agnostic `ExamForm`. Replace stale Zustand-based wizard.

## Brainstorm Source
[brainstorm-260508-2038-system-exam-create-integration.md](../reports/brainstorm-260508-2038-system-exam-create-integration.md)

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Rename API types to scope-agnostic | completed | [phase-01-rename-api-types.md](phase-01-rename-api-types.md) |
| 2 | Add `createTeacherSystemExam` service | completed | [phase-02-system-exam-service.md](phase-02-system-exam-service.md) |
| 3 | Build system exam create screen | completed | [phase-03-system-exam-create-screen.md](phase-03-system-exam-create-screen.md) |
| 4 | ExamForm submitContextLabel polish | completed | [phase-04-exam-form-context-label.md](phase-04-exam-form-context-label.md) |
| 5 | Swap create page + delete old wizard | completed | [phase-05-page-swap-and-cleanup.md](phase-05-page-swap-and-cleanup.md) |
| 6 | Verify build + smoke test | completed | [phase-06-verify.md](phase-06-verify.md) |

## Dependencies
- Phase 2 → Phase 1 (uses renamed type)
- Phase 3 → Phase 2 (calls service fn)
- Phase 5 → Phase 3 (renders new screen)
- Phase 4 can run parallel; ideally before Phase 5 so both screens land with prop set
- Phase 6 last

## Decisions Locked In
- Service location: `services/exam.service.ts`
- Type renames: `TeacherCreateClassExam*` → `TeacherCreateExam*`
- Old wizard deleted: `(wizard)/`, `[wizard]/`, `stores/exam-wizard-store.ts`
- Redirect target: `/teacher/exams`

## Success Criteria
- POST /teacher/system/exams integrated, redirects to list on success
- 3-step wizard UX matches class flow (info → questions → review)
- All Formik+Yup validations pass identically
- No imports of `useExamWizardStore` remain
- `npm run build` passes
- shadcn styling unchanged
