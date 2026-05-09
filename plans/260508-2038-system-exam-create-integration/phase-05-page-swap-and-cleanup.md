# Phase 5 — Page Swap & Old Wizard Cleanup

## Context Links
- Brainstorm: [brainstorm report](../reports/brainstorm-260508-2038-system-exam-create-integration.md)
- Phase 3 prerequisite (new screen exists)

## Overview
- **Priority:** High (final wiring step)
- **Status:** completed
- Replace `app/(teacher)/teacher/exams/create/page.tsx` to render new screen. Delete stale Zustand wizard, empty `[wizard]/`, unused store.

## Key Insights
- Current `page.tsx` does NOT exist at top level — the route is served by `(wizard)/page.tsx` (route group). Need to create top-level `page.tsx` AND remove the route group.
- `useExamWizardStore` only consumed by files in `(wizard)/` — safe to delete.
- `[wizard]/` dir contains empty subdirs — pure noise.

## Requirements
- Visiting `/teacher/exams/create` renders new system-exam create screen.
- No 404 for any previously valid sub-route (verify nothing links to `/teacher/exams/create/questions` etc.).
- No dangling imports of `useExamWizardStore`.

## Architecture
```
Before:
  app/(teacher)/teacher/exams/create/
    ├─ (wizard)/                  ← route group (acts as "/teacher/exams/create")
    │  ├─ layout.tsx
    │  ├─ page.tsx                (uses useExamWizardStore)
    │  ├─ questions/page.tsx
    │  ├─ review/page.tsx
    │  └─ settings/page.tsx
    └─ [wizard]/                  ← empty stale subdirs

After:
  app/(teacher)/teacher/exams/create/
    ├─ page.tsx                   (renders TeacherSystemExamCreateScreen)
    └─ teacher-system-exam-create-screen.tsx
```

## Related Code Files
**Create:**
- `app/(teacher)/teacher/exams/create/page.tsx` (server component, renders client screen)

**Delete:**
- `app/(teacher)/teacher/exams/create/(wizard)/` (entire dir incl. layout, page, questions/, review/, settings/)
- `app/(teacher)/teacher/exams/create/[wizard]/` (entire dir)
- `stores/exam-wizard-store.ts`

## Implementation Steps
1. Sanity grep for `useExamWizardStore` outside the to-be-deleted dirs:
   ```bash
   grep -rn "useExamWizardStore\|exam-wizard-store" app components lib services types stores --exclude-dir=node_modules
   ```
   Expect hits ONLY in `(wizard)/` files. If anywhere else, fix before delete.
2. Sanity grep for any link to wizard sub-routes:
   ```bash
   grep -rn "/teacher/exams/create/questions\|/teacher/exams/create/review\|/teacher/exams/create/settings" app components --exclude-dir=node_modules
   ```
   Expect hits ONLY inside `(wizard)/` itself. Confirm no external linker.
3. Create `app/(teacher)/teacher/exams/create/page.tsx`:
   ```tsx
   import { TeacherSystemExamCreateScreen } from "./teacher-system-exam-create-screen";

   export default function TeacherSystemExamCreatePage() {
     return <TeacherSystemExamCreateScreen />;
   }
   ```
4. Delete `app/(teacher)/teacher/exams/create/(wizard)/` recursively.
5. Delete `app/(teacher)/teacher/exams/create/[wizard]/` recursively.
6. Delete `stores/exam-wizard-store.ts`.
7. Run `npm run build` — confirm clean.

## Todo List
- [x] Grep `useExamWizardStore` — confirm only in dirs to delete
- [x] Grep wizard sub-route links — confirm no external linkers
- [x] Create top-level `page.tsx` for create route
- [x] Delete `(wizard)/` directory
- [x] Delete `[wizard]/` directory
- [x] Delete `stores/exam-wizard-store.ts`
- [x] `npm run build` passes

*Completion notes: Verified 2026-05-08.*

## Success Criteria
- `/teacher/exams/create` renders new screen
- `npm run build` passes
- `grep -r "useExamWizardStore" .` returns 0 in source
- `find app/\(teacher\)/teacher/exams/create -name "(wizard)" -o -name "[wizard]"` returns nothing

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| External nav uses old wizard sub-routes | Pre-delete grep confirms |
| Route group (wizard) collision with same-level page.tsx | Delete (wizard)/ before adding page.tsx — Next.js conflict avoided |
| Store file imported by non-wizard code | Pre-delete grep confirms isolation |

## Security Considerations
None.

## Next Steps
- Phase 6 — verification.
