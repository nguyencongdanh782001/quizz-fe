# Phase 2 — System Exam Create Service

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- File: `services/exam.service.ts`
- Phase 1 prerequisite (renamed types)

## Overview
- **Priority:** High (blocks Phase 3)
- **Status:** completed
- Add `createTeacherSystemExam` to `services/exam.service.ts`. Stay consistent with existing system-exam read functions in same module.

## Key Insights
- File already has `getTeacherSystemExams`, `getTeacherSystemExamDetail`, `deleteTeacherSystemExam`, `updateTeacherSystemExamPublishState`.
- File already imports `client` directly (not via `teacherApi.*` endpoints object).
- Existing `mapTeacherExam` helper handles full response mapping incl. nested questions/options/accepted_answers.

## Requirements
- POST to `/teacher/system/exams` with `TeacherCreateExamRequest` payload
- Return `{message, exam}` with `exam` mapped via `mapTeacherExam`
- Throw on HTTP error (default axios behavior — let caller handle)

## Architecture
```
createTeacherSystemExam(data: TeacherCreateExamRequest)
  → client.post<TeacherCreateSystemExamResponse>("/teacher/system/exams", data)
  → return { message, exam: mapTeacherExam(response.data.exam) }
```

## Related Code Files
**Modify:**
- `services/exam.service.ts` — add new function + import `TeacherCreateExamRequest`, `TeacherCreateSystemExamResponse`

## Implementation Steps
1. In `services/exam.service.ts` imports section:
   - Add `TeacherCreateExamRequest`, `TeacherCreateSystemExamResponse` from `@/lib/api/types`.
2. Append at bottom of file:
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
3. Verify `mapTeacherExam` is already in scope (it is — used by other fns in same file).

## Todo List
- [x] Add type imports to `services/exam.service.ts`
- [x] Implement `createTeacherSystemExam` function
- [x] Verify TS compiles (`npm run build` or `tsc --noEmit`)

*Completion notes: Verified 2026-05-08.*

## Success Criteria
- Function exported, no TS errors
- Endpoint URL exactly matches backend: `/teacher/system/exams`
- Response mapping reuses existing `mapTeacherExam`

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| `client` base URL mismatch | Already confirmed — same `client` used by all 4 existing system-exam reads |
| Backend response missing `exam` field on error | Backend spec guarantees `exam` on success; errors throw before mapping |

## Security Considerations
- Auth header injected automatically by `client` (already configured).
- No PII handling beyond what backend validates.

## Next Steps
- Phase 3 — new screen calls this service function.
