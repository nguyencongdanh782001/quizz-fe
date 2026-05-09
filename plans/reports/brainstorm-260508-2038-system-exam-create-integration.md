# Brainstorm — System Exam Create Integration

**Date:** 2026-05-08
**Scope:** Integrate `POST /teacher/system/exams` into `/teacher/exams/create`, reuse class-exam create UX/flow.

---

## Problem Statement

Teacher needs UI flow to create **system-scoped** exams (no classroom binding).

Existing class-exam create flow (`/teacher/classes/[id]/exams/create`) has all needed UI:
- 3-step wizard (info → questions → review)
- Formik + Yup validation
- Add/remove/reorder questions, dynamic options, auto `order_index`
- Already-decoupled `ExamForm` component (no classroom prop)

Existing `/teacher/exams/create/` is a stale Zustand-based wizard using deprecated payload fields (subject/grade/difficulty). Must be replaced.

Backend payload for system exam is **byte-identical** to class exam payload — only endpoint and response wrapper differ.

---

## Current State

### Reusable as-is
- `components/features/teacher-exam-form/exam-form.tsx` — accepts `initialValues`, `onSubmit`, `cancelHref`, `isSubmitting`, `submitLabel`, `submitError`. **Zero classroom coupling.**
- `exam-info-step.tsx`, `question-builder-step.tsx`, `review-step.tsx`, `exam-step-layout.tsx`, `option-item.tsx`, `question-item.tsx`
- `types.ts` — form value types
- `utils.ts` — `createInitialTeacherExamFormValues`, `mapTeacherExamFormToPayload`, `teacherExamFormSchema`
- `lib/api/types.ts` — `TeacherCreateClassExamRequest/Response` (request shape exact match, will rename)

### Dead code (delete)
- `app/(teacher)/teacher/exams/create/(wizard)/` — Zustand wizard, deprecated payload
- `app/(teacher)/teacher/exams/create/[wizard]/` — empty subdirs (stale)
- `stores/exam-wizard-store.ts` — only consumer is the (wizard) routes

### Missing
- `createTeacherSystemExam` service function
- New screen component for `/teacher/exams/create`

---

## Approaches Evaluated

### A. Full clone of class screen (REJECTED)
Copy `teacher-class-exam-create-screen.tsx` → `teacher-system-exam-create-screen.tsx`, swap API call.

**Cons:** Duplicates ~80 lines of submit/error/redirect boilerplate. Two files to maintain for nearly-identical logic.

### B. Generalized create-exam screen with scope prop (CONSIDERED)
Single `TeacherExamCreateScreen` with `scope: "class" | "system"` and `classId?` prop.

**Cons:** Forces conditional logic (different cancel hrefs, redirect targets, submit handlers, header copy). Branching reduces readability. Violates KISS; classes are different enough from system that two thin screens win.

### C. Two thin screens, shared form (CHOSEN) ✓
Keep two screens (class + system) since redirect/cancel/copy differ. Shared `ExamForm` already abstracts the heavy 90% of work. Each screen is ~80 LOC of glue (state + submit + error handling).

**Pros:** YAGNI-friendly, no premature abstraction, future divergence (e.g., system needs categories/tags later) absorbed naturally.

---

## Recommended Solution

### 1. Type renames (`lib/api/types.ts`)
Rename to scope-agnostic. Reflects fact that payload is universal.
- `TeacherCreateClassExamRequest` → `TeacherCreateExamRequest`
- `TeacherCreateClassExamQuestionRequest` → `TeacherCreateExamQuestionRequest`
- `TeacherCreateClassExamOptionRequest` → `TeacherCreateExamOptionRequest`
- `TeacherCreateClassExamResponse` → keep (class-specific wrapper)

Add new system response type using existing `TeacherSystemExamDetailResponse` (scope/classroom_id null/0):
```ts
export interface TeacherCreateSystemExamResponse {
  message: string;
  exam: TeacherSystemExamDetailResponse; // existing type, has all fields per spec
}
```

Update imports: `lib/api/endpoints/teacher.ts`, `lib/teacher-classes.ts`, `components/features/teacher-exam-form/utils.ts`.

### 2. Service function (`services/exam.service.ts`)
Add to existing system-exam service module (consistent with `getTeacherSystemExams`, `deleteTeacherSystemExam`, etc.):

```ts
export async function createTeacherSystemExam(
  data: TeacherCreateExamRequest,
): Promise<{ message: string; exam: TeacherExam }> {
  const response = await client.post<TeacherCreateSystemExamResponse>(
    "/teacher/system/exams",
    data,
  );
  return {
    message: response.data.message,
    exam: mapTeacherExam(response.data.exam),
  };
}
```

Reuses existing `mapTeacherExam` helper.

### 3. New screen (`app/(teacher)/teacher/exams/create/page.tsx`)
Replace current page (which renders the old wizard layout) with a single client component:

`app/(teacher)/teacher/exams/create/teacher-system-exam-create-screen.tsx` — clone of class screen with:
- No `classId` param
- Cancel href → `/teacher/exams`
- Submit calls `createTeacherSystemExam(payload)`
- Redirect → `/teacher/exams` after 1.2s success message
- Header copy: "Tạo bài thi hệ thống" / supporting subtext

`page.tsx` becomes thin server component:
```tsx
import { TeacherSystemExamCreateScreen } from "./teacher-system-exam-create-screen";
export default function TeacherSystemExamCreatePage() {
  return <TeacherSystemExamCreateScreen />;
}
```

### 4. Cleanup deletes
- `app/(teacher)/teacher/exams/create/(wizard)/` (entire dir)
- `app/(teacher)/teacher/exams/create/[wizard]/` (entire dir)
- `stores/exam-wizard-store.ts`
- Verify no remaining imports of `useExamWizardStore` (grep returned 0 outside the deleted dirs)

### 5. Optional polish — review step copy
Review step's aside (`exam-form.tsx` line ~344) hardcodes "tạo bài thi cho lớp học". Two options:
- **A (KISS):** Leave as-is — minor wording drift acceptable.
- **B:** Add optional prop `submitContextLabel?: string` to `ExamForm`, default to current copy. Class screen passes "lớp học", system screen passes "hệ thống".

**Recommendation: B** — 4-line change, eliminates wording bug.

---

## Implementation Considerations

### File touch list
**Modify:**
- `lib/api/types.ts` — rename types + add system response
- `lib/api/endpoints/teacher.ts` — update import
- `lib/teacher-classes.ts` — update import
- `components/features/teacher-exam-form/utils.ts` — update import + return type
- `components/features/teacher-exam-form/exam-form.tsx` — add `submitContextLabel` prop (optional polish)
- `app/(teacher)/teacher/classes/[id]/exams/create/teacher-class-exam-create-screen.tsx` — pass `submitContextLabel` (optional polish)
- `app/(teacher)/teacher/exams/create/page.tsx` — replace wizard rendering
- `services/exam.service.ts` — add `createTeacherSystemExam`

**Create:**
- `app/(teacher)/teacher/exams/create/teacher-system-exam-create-screen.tsx`

**Delete:**
- `app/(teacher)/teacher/exams/create/(wizard)/` (full)
- `app/(teacher)/teacher/exams/create/[wizard]/` (full)
- `stores/exam-wizard-store.ts`

### State management
- Formik in-memory (no persistence) — same as class flow.
- No global store needed.
- Single `useState` flags for `isSubmitting`, `submitError`, `successMessage` — mirror class screen.

### Validation
Reuse `teacherExamFormSchema` unchanged. Validates:
- title required
- duration > 0
- ≥1 question
- Each question: prompt required, points > 0
- single_choice: ≥2 options, exactly 1 correct, all option_text required
- text: accepted_answers required

### Loading / Error / Success
- `isSubmitting` disables submit + shows "Đang tạo bài thi..."
- API error → red banner inline (same `submitError` flow)
- Success → green banner + auto-redirect after 1.2s
- Cleanup `setTimeout` ref on unmount (already in class screen)

### Image upload
Currently only URL input via `InputField`. No file-upload component exists yet. Stays URL-only — out of scope per requirements ("reuse existing image upload components" → only URL field exists).

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Type rename ripples breaks build | Medium | TS compiler catches all 3 usage sites; verify with `npm run build` |
| Old wizard delete breaks navigation links | Low | Grep entire codebase for `/teacher/exams/create/(questions|review|settings)` paths; nav uses `/teacher/exams/create` only |
| Backend response shape mismatch | Low | Spec confirms identical structure to class create; `mapTeacherExam` already handles all fields |
| Submit context label propagation | Low | Default fallback keeps existing class behavior unchanged |

---

## Success Criteria

- ✅ `POST /teacher/system/exams` integrated, returns parsed `TeacherExam`
- ✅ Visiting `/teacher/exams/create` shows the same 3-step wizard UI as class flow
- ✅ Form validates identically (title, duration, ≥1 question, etc.)
- ✅ Add/remove/reorder questions works; `order_index` auto-assigned
- ✅ Add/remove options works; exactly 1 correct enforced for single_choice
- ✅ Successful create redirects to `/teacher/exams` after success message
- ✅ Error state displays inline, doesn't lose form data
- ✅ No imports of `useExamWizardStore` remain
- ✅ `npm run build` passes
- ✅ shadcn styling consistent (uses same `ExamForm` component)

---

## Next Steps

1. Run `/ck:plan` with this report as context to generate phased implementation plan
2. Implementation order suggestion: types rename → service fn → new screen → page swap → deletes → polish copy

---

## Unresolved Questions

None — all decisions captured above.
