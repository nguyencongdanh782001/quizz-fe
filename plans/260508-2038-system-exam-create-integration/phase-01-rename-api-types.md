# Phase 1 — Rename API Types

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- File: `lib/api/types.ts:330-360`

## Overview
- **Priority:** High (blocks all subsequent phases)
- **Status:** completed
- Rename class-scoped exam create types → scope-agnostic so both class & system endpoints share one source of truth.

## Key Insights
- Backend payload for system exam = byte-identical to class exam payload.
- Current `TeacherCreateClassExam*` names misrepresent universality.
- Existing `TeacherSystemExamDetailResponse` already covers system response `exam` shape — reuse it.

## Requirements
- All existing class-exam create flow must keep working unchanged after rename.
- Keep response wrappers per-scope (different envelopes).

## Architecture
```
TeacherCreateExamRequest          ← shared (both class & system POST body)
  ├── TeacherCreateExamQuestionRequest
  └── TeacherCreateExamOptionRequest

TeacherCreateClassExamResponse    ← class-specific {message, exam?}
TeacherCreateSystemExamResponse   ← system-specific {message, exam: TeacherSystemExamDetailResponse}
```

## Related Code Files
**Modify:**
- `lib/api/types.ts` — perform renames + add `TeacherCreateSystemExamResponse`
- `lib/api/endpoints/teacher.ts` — update import names
- `lib/teacher-classes.ts` — update import names
- `components/features/teacher-exam-form/utils.ts` — update import + return type

## Implementation Steps
1. In `lib/api/types.ts`:
   - Rename `TeacherCreateClassExamOptionRequest` → `TeacherCreateExamOptionRequest`
   - Rename `TeacherCreateClassExamQuestionRequest` → `TeacherCreateExamQuestionRequest`
   - Rename `TeacherCreateClassExamRequest` → `TeacherCreateExamRequest`
   - Keep `TeacherCreateClassExamResponse` as-is
   - Add new `TeacherCreateSystemExamResponse`:
     ```ts
     export interface TeacherCreateSystemExamResponse {
       message: string;
       exam: TeacherSystemExamDetailResponse;
     }
     ```
2. In `lib/api/endpoints/teacher.ts`: update import line + the `createExam` data param type to `TeacherCreateExamRequest`.
3. In `lib/teacher-classes.ts`: update import line + `createTeacherClassExam` `data` param type.
4. In `components/features/teacher-exam-form/utils.ts`:
   - Update imports: `TeacherCreateExamRequest`, `TeacherCreateExamQuestionRequest`
   - Update `mapTeacherExamFormToPayload` return type → `TeacherCreateExamRequest`
   - Update `mapQuestion` return type → `TeacherCreateExamQuestionRequest`

## Todo List
- [x] Rename 3 request types in `lib/api/types.ts`
- [x] Add `TeacherCreateSystemExamResponse` interface
- [x] Update import in `lib/api/endpoints/teacher.ts`
- [x] Update import in `lib/teacher-classes.ts`
- [x] Update imports + return types in `utils.ts`
- [x] Run `npm run build` (or `tsc --noEmit`) — confirm no type errors

*Completion notes: Verified 2026-05-08.*

## Success Criteria
- TypeScript compiles with no errors
- `grep -r "TeacherCreateClassExamRequest\|TeacherCreateClassExamQuestion\|TeacherCreateClassExamOption" .` returns 0 hits in source code

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Hidden import we missed | Run TS compiler — catches all usages |
| Future merge conflict with parallel work | Small change set, low conflict risk |

## Security Considerations
None — type-only changes.

## Next Steps
- Phase 2 — add system exam service function (uses new `TeacherCreateExamRequest` type).
