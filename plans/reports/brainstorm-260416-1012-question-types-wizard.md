# Brainstorm Report — Question Types Refactor (Step 2)

**Date:** 2026-04-16  
**Route:** `/teacher/exams/create/questions`  
**Status:** Completed

---

## Problem Statement

The exam wizard Step 2 question builder only supported 2 question types (`single`, `multiple`).
Needed to extend it with 3 new types: `multiple_choice`, `true_false`, `text` (with OTP input),
while keeping backward compatibility with existing data.

---

## Evaluated Approaches

| Approach | Pros | Cons |
|---|---|---|
| Extend existing `type` toggle buttons | Minimal change, existing pattern | No room for future types, UI would get crowded |
| Shadcn `Select` + conditional rendering (chosen) | Clean separation, reusable components, type-safe | Requires shadcn install |
| Separate pages per type | Very clear UX per type | Overkill for a wizard step, adds navigation complexity |

**Chosen:** shadcn `Select` + conditional rendering — clean, type-safe, minimal risk to existing flow.

---

## Final Solution

### Type Changes

- `types/exam.types.ts`: `QuestionType = 'single' | 'multiple' | 'multiple_choice' | 'true_false' | 'text'`
- `stores/exam-wizard-store.ts`: `WizardQuestion.type` uses `QuestionType`; added `answer?: string` for `text` type

### Components Created

```
components/features/question/
├── otp-input.tsx              (~90 lines) — 4-char OTP box with paste, backspace, auto-focus
├── true-false-fields.tsx      (~40 lines) — True/False toggle pair
└── question-type-select.tsx   (~30 lines) — shadcn Select wrapper
```

### Page Refactored

- `app/(main)/teacher/exams/create/(wizard)/questions/page.tsx`: Extracted `QuestionForm` + `QuestionCard` components, drives conditional rendering by `q.type`
- `app/(main)/teacher/exams/create/(wizard)/review/page.tsx`: Updated `hasCorrectAnswers` check + type badges/labels for all 5 types

### Behavior by Type

| Type | UI | Answer stored in |
|---|---|---|
| `multiple_choice` | 4 option rows + single-correct checkbox | `options[].isCorrect` |
| `true_false` | Two large toggle buttons (Đúng / Sai) | `answer: 'true' | 'false'` |
| `text` | 4 OTP boxes | `answer: string` (4 chars) |
| `single` / `multiple` | 4 option rows + checkbox | `options[].isCorrect` (legacy) |

### shadcn Components Installed

`select`, `input`, `textarea`, `label`, `card`

---

## Implementation Notes

- `WizardQuestion.answer` is optional — existing `localStorage` drafts (with no `answer` field) remain valid
- `resetOptionsForType()` rebuilds the options array when type changes — clears prior state correctly
- `canSave()` enforces: non-empty text + type-specific answer required
- Review page's `hasCorrectAnswers` check now handles all 5 types

---

## Files Changed

| File | Change |
|---|---|
| `types/exam.types.ts` | Extended `QuestionType` |
| `stores/exam-wizard-store.ts` | Added `QuestionType` import, `answer` field |
| `components/features/question/otp-input.tsx` | **NEW** |
| `components/features/question/true-false-fields.tsx` | **NEW** |
| `components/features/question/question-type-select.tsx` | **NEW** |
| `app/(main)/teacher/exams/create/(wizard)/questions/page.tsx` | **REFACTORED** |
| `app/(main)/teacher/exams/create/(wizard)/review/page.tsx` | Updated answer validation + type labels |

---

## Unresolved

- `inputMode="text"` on OTP — for mobile, `inputMode="text"` is fine since it allows any char. Could use `inputMode="numeric"` for pure numbers only. User preference not specified, went with text.
