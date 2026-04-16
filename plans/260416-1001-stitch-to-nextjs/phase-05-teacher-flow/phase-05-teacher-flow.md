# Phase 5: Teacher Flow

## Context Links
- Plan: [../plan.md](../plan.md)
- Phase 1: [../phase-01-foundation/phase-01-foundation.md](../phase-01-foundation/phase-01-foundation.md) — AppShell + auth
- Phase 2: [../phase-02-student-flow/phase-02-student-flow.md](../phase-02-student-flow/phase-02-student-flow.md) — exam types

## Overview
**Priority:** P2
**Status:** Pending
**Effort:** ~6h (most complex phase)

Build the complete teacher experience: class management (table + create), exam management (table), and the 4-step exam creation wizard (basic info → question builder → settings → review).

---

## Key Insights

1. **4-step wizard URL**: `/teacher/exams/create?step=1|2|3|4`. Each step is a separate page. Formik state persisted in URL search params or Zustand draft store.
2. **Question builder**: Formik `FieldArray` with nested arrays (questions → options). Dynamic add/remove.
3. **Auto-save draft**: Debounced (2s) Zustand persist. If teacher closes tab, draft is recoverable.
4. **Step validation**: Validate only current step fields on "Tiếp theo". Validate all on final "Xuất bản".
5. **Separate route for each step** allows direct URL access (bookmarkable).

---

## Architecture

### Exam Wizard URL Strategy
```
/teacher/exams/create?step=1  → ExamBasicForm
/teacher/exams/create/questions?step=2  → QuestionBuilder (FieldArray)
/teacher/exams/create/settings?step=3   → ExamSettingsForm
/teacher/exams/create/review?step=4     → ExamReviewSummary + Publish
```
Zustand `examDraftStore` persists all step data across navigations.

### Teacher Layout
Same AppShell but different sidebar items:
- Logo: "Scholar Clarity — Giáo viên"
- Nav: Tổng quan, Quản lý lớp, Quản lý bài thi, Tài liệu
- `app/(main)/teacher/layout.tsx`: Server Component checks `auth.role === 'teacher'` → redirect if student

---

## Related Code Files

### Files to CREATE
```
app/(main)/teacher/layout.tsx                   (teacher-specific layout)
app/(main)/teacher/classes/page.tsx            (class management table)
app/(main)/teacher/classes/create/page.tsx     (create class form)
app/(main)/teacher/exams/page.tsx              (exam management table)
app/(main)/teacher/exams/create/page.tsx       (Step 1: basic info)
app/(main)/teacher/exams/create/questions/page.tsx (Step 2: question builder)
app/(main)/teacher/exams/create/settings/page.tsx  (Step 3: settings)
app/(main)/teacher/exams/create/review/page.tsx   (Step 4: review + publish)
app/(main)/teacher/documents/page.tsx           (document management)
stores/exam-draft-store.ts                     (Zustand: exam wizard draft, persisted)
features/teacher/components/ClassTable.tsx      (teacher view: all classes)
features/teacher/components/CreateClassForm.tsx (Formik + Yup)
features/teacher/components/ExamWizard/
  StepIndicator.tsx                            (progress dots/stepper)
  ExamBasicForm.tsx                             (step 1)
  QuestionTypeSelector.tsx                      (step 2: choose type)
  QuestionBuilder.tsx                           (step 2: FieldArray)
  ExamSettingsForm.tsx                          (step 3)
  ExamReviewSummary.tsx                         (step 4)
features/teacher/schemas/
  exam-basic.schema.ts                          (Yup: title, description, subject, grade)
  exam-settings.schema.ts                       (Yup: duration, attempts, shuffle, passingScore)
  class-create.schema.ts                        (Yup: class name, description, grade)
features/classroom/components/ClassTable.tsx    (shared class table)
```

### Files to MODIFY
```
middleware.ts                                   (teacher route check enhancement)
```

---

## Implementation Steps

### Step 5.1: Teacher Layout (`app/(main)/teacher/layout.tsx`)
Server Component. If `auth.role !== 'teacher'`, redirect to `/`. Otherwise render AppShell with teacher nav items.

### Step 5.2: `stores/exam-draft-store.ts`
```typescript
interface ExamDraft {
  id: string | null;
  // Step 1
  title: string; description: string; gradeLevel: number; subject: string;
  // Step 2
  questions: Array<{
    content: string; type: 'single' | 'multiple';
    options: Array<{ content: string; isCorrect: boolean }>;
  }>;
  // Step 3
  durationMinutes: number; passingScore: number;
  maxAttempts: number; shuffleQuestions: boolean; shuffleOptions: boolean;
  // Meta
  currentStep: 1 | 2 | 3 | 4;
  savedAt: number | null;
}
```
Persist with `localStorage`, key `exam-draft`, debounced 2s auto-save.

### Step 5.3: Class Management Page
Server Component with mock class data.
- SurfaceCard table: class name, grade level, student count, assigned exams, actions
- Actions: "Sửa" (edit icon), "Xóa" (trash icon), "Xem chi tiết" (arrow)
- shadcn `Table` component for the table layout

### Step 5.4: Create Class Form
Formik + Yup (`class-create.schema.ts`):
- `name`: required, min 3 chars
- `description`: optional, textarea
- `gradeLevel`: select (10, 11, 12)
- `subject`: text input
On submit: add to mock classes, redirect to `/teacher/classes`.

### Step 5.5: Exam Management Page
Server Component — table of teacher's exams.
Columns: title, subject, grade, questions, status (draft/published), created date, actions.
Actions: "Sửa" (if draft), "Xóa", "Xem chi tiết", "Xuất bản" (if draft).

### Step 5.6: Step Indicator (`StepIndicator.tsx`)
```typescript
// 4 steps, horizontal dots or numbered
// Active: primary bg
// Completed: secondary bg with checkmark
// Pending: outline border, dim
// Label below each dot
```

### Step 5.7: Step 1 — ExamBasicForm
Formik form:
- Title (InputField, required)
- Description (TextAreaField, optional)
- Grade Level (SelectField: 10, 11, 12)
- Subject (InputField, required)
- Thumbnail (optional URL input)

On "Tiếp theo" → validate step 1 schema → save to draft store → router.push to step 2.

### Step 5.8: Step 2 — QuestionBuilder (FieldArray)
Most complex step. Formik `FieldArray` with:
```typescript
<FieldArray name="questions">
  {({ push, remove }) => (
    questions.map((q, qIndex) => (
      <SurfaceCard key={qIndex}>
        <Field name={`questions[${qIndex}].content`} />
        <Field as="select" name={`questions[${qIndex}].type`}>
          <option value="single">Một đáp án</option>
          <option value="multiple">Nhiều đáp án</option>
        </Field>
        <FieldArray name={`questions[${qIndex}].options`}>
          {({ push: pushOpt, remove: removeOpt }) => (
            options.map((opt, oIndex) => (
              <div key={oIndex}>
                <Field type={q.type === 'single' ? 'radio' : 'checkbox'}
                       checked={opt.isCorrect}
                       onChange={() => setCorrect(qIndex, oIndex)} />
                <Field name={`questions[${qIndex}].options[${oIndex}].content`} />
                <button type="button" onClick={() => removeOpt(oIndex)}>×</button>
              </div>
            ))
          )}
        </FieldArray>
      </SurfaceCard>
    ))
  )}
</FieldArray>
```
"Thêm câu hỏi" button → `push({ content: '', type: 'single', options: [{ content: '', isCorrect: false }] })`

### Step 5.9: Step 3 — ExamSettingsForm
Formik form:
- Thời gian làm bài (SelectField: 15, 30, 45, 60, 90, 120 phút)
- Điểm đạt (%) (InputField, 0-100, default 50)
- Số lần làm tối đa (InputField, default 1)
- Xáo trộn câu hỏi (Switch)
- Xáo trộn đáp án (Switch)

### Step 5.10: Step 4 — ExamReviewSummary
Read-only display of all data from draft store.
- Summary: title, subject, grade, duration, passing score, attempt limit
- Question list: collapsible, shows each question + correct answers
- "Lưu nháp" → save draft, stay on page
- "Xuất bản" → mark as published, redirect to `/teacher/exams`

### Step 5.11: Teacher Documents Page
Table of teacher's uploaded documents.
Columns: title, subject, type, upload date, size, actions (download, delete).

---

## Success Criteria
- [ ] Teacher layout redirects students to `/` — role guard works
- [ ] 4-step wizard: can navigate forward/backward, data persists across steps
- [ ] Question builder: can add/remove questions, add/remove options, set correct answers
- [ ] Draft auto-saves to localStorage within 2s of any change
- [ ] On page reload, wizard restores last saved draft
- [ ] Step validation prevents proceeding with invalid data
- [ ] Class management table renders with all 3 mock classes
- [ ] Create class form validates + submits

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Formik FieldArray complex nested state | Keep it flat; use dot notation paths |
| Draft recovery on page refresh | Zustand persist handles this automatically |
| Multiple drafts clobbering | Key by draft ID, allow "resume draft" vs "new exam" |
| Step validation blocking back navigation | "Quay lại" never validates — always allowed |

## Security Considerations
- Teacher routes protected by middleware + server layout check
- Mock: any authenticated user can access teacher URLs — real app needs server-side role verification
- Exam drafts stored in localStorage — not appropriate for production

## Next Steps
- Phase 6: Polish — responsive, localStorage, dark mode extension
