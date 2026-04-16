# Phase 4: Results + History

## Context Links
- Plan: [../plan.md](../plan.md)
- Phase 3: [../phase-03-exam-engine/phase-03-exam-engine.md](../phase-03-exam-engine/phase-03-exam-engine.md) — depends on submitted answers

## Overview
**Priority:** P2
**Status:** Pending
**Effort:** ~2h

Build the detailed result page (score breakdown, per-question review) and the Achievement & History page (past attempts, summary stats).

---

## Requirements

### Functional
- [ ] Result detail page: score, time, per-question breakdown, pass/fail badge
- [ ] History page: past attempts list, achievement summary, score trend
- [ ] Mock result calculation (server-side scoring using `exam-utils.ts`)
- [ ] ResultChart: simple score breakdown visualization

### Non-Functional
- Server Component for history list (fetches mock results)
- Client Component for interactive result detail (expand/collapse per-question review)

---

## Related Code Files

### Files to CREATE
```
features/exam/components/ResultSummary.tsx     (score card, pass/fail, stats)
features/exam/components/ResultChart.tsx      (score ring/bar chart)
features/exam/components/QuestionReview.tsx   (per-question breakdown with correct/wrong)
app/(main)/exam/[id]/result/page.tsx           (result detail page)
app/(main)/history/page.tsx                    (history + achievements)
data/mock/mock-results.ts                      (CREATE: 5+ past attempts)
```

### Files to MODIFY
```
app/(main)/exam/[id]/result/page.tsx           (CREATE from placeholder in Phase 3)
```

---

## Implementation Steps

### Step 4.1: Result Detail Page (`app/(main)/exam/[id]/result/page.tsx`)
```typescript
// SERVER component
// 1. Get submitted answers from store (via query param or cookie)
// 2. Calculate score using exam-utils
// 3. Render ResultSummary + per-question review
```
Layout:
```
<ResultSummary>
  Score: 8/10 (80%)  [PASS badge]
  Thời gian: 35 phút 42 giây
  Điểm tối đa: 10
</ResultSummary>

<ResultChart>  [ring chart: correct/wrong ratio]

<h3 className="font-display text-xl">Chi tiết câu hỏi</h3>
<QuestionReview>  [expandable per question]
  - Câu 1: Đúng ✓ (user selected correct, bg-secondary-container)
  - Câu 2: Sai ✗ (user selected A, correct was B, bg-error-container)
  - Câu 3: Đúng ✓
</QuestionReview>

<div className="flex gap-4">
  <GhostButton onClick={() => router.back()}>← Quay lại</GhostButton>
  <Button onClick={retake}>Làm lại</Button>
</div>
```

### Step 4.2: ResultSummary Component
SurfaceCard with:
- Large score display: `8/10` in Manrope display size
- Percentage badge: `80%` with pass/fail coloring (secondary = pass, error = fail)
- Time spent: formatted from seconds
- Correct/wrong counts
- "Làm lại" button

### Step 4.3: ResultChart Component
Simple SVG ring chart or CSS-based progress ring showing:
- Correct answers (secondary color)
- Wrong answers (error color)
- Unanswered (outline variant)

Use pure CSS/SVG — no chart library dependency.

### Step 4.4: QuestionReview Component
Client Component — accordion/expandable per question.
Each item shows:
- Question number + content
- User's selected answer(s) highlighted
- Correct answer(s) highlighted
- Status: ✓ correct (secondary-container bg) or ✗ wrong (error-container bg)
- Explanation if available (secondary text, italic)

### Step 4.5: History Page (`app/(main)/history/page.tsx`)
```typescript
// SERVER component — fetches mock results
// Shows: past attempts list + summary stats
```
Layout:
```
<h1 className="font-display text-3xl font-bold">Thành tích & Lịch sử</h1>

<div className="grid grid-cols-3 gap-4 mb-8">
  <SurfaceCard className="text-center p-6">
    <div className="font-display text-4xl font-bold text-primary">12</div>
    <div className="text-on-surface-variant">Bài thi đã làm</div>
  </SurfaceCard>
  <SurfaceCard className="text-center p-6">
    <div className="font-display text-4xl font-bold text-secondary">78%</div>
    <div className="text-on-surface-variant">Điểm trung bình</div>
  </SurfaceCard>
  <SurfaceCard className="text-center p-6">
    <div className="font-display text-4xl font-bold text-tertiary">8</div>
    <div className="text-on-surface-variant">Bài đạt điểm cao</div>
  </SurfaceCard>
</div>

<h2 className="font-display text-xl font-bold mb-4">Lịch sử bài thi</h2>
<NoLineList>
  {results.map(result => (
    <HistoryItem result={result} exam={getExam(result.examId)} />
  ))}
</NoLineList>
```

---

## Success Criteria
- [ ] Result page shows correct score (calculated from submitted answers vs mock correct options)
- [ ] Pass/fail badge correct based on passingScore threshold
- [ ] Per-question review shows user answer vs correct answer
- [ ] History page shows summary stats + chronological list
- [ ] "Làm lại" button navigates to exam taking page
- [ ] SVG ring chart renders without chart library

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| No answers in URL/cookie after redirect | Store submitted result in Zustand (already submitted state), read from store |
| Chart library overhead | Pure CSS/SVG — no additional dependency |

## Next Steps
- Phase 5: Teacher Flow — independent, can start immediately
- Phase 5 depends on mock exam types defined in Phase 2
