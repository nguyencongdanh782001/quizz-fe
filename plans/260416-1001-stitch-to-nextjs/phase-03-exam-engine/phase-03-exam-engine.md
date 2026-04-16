# Phase 3: Exam Engine

## Context Links
- Plan: [../plan.md](../plan.md)
- Phase 1: [../phase-01-foundation/phase-01-foundation.md](../phase-01-foundation/phase-01-foundation.md)
- Phase 2: [../phase-02-student-flow/phase-02-student-flow.md](../phase-02-student-flow/phase-02-student-flow.md) — depends on types + mock questions
- Research: [Zustand + Exam Engine Patterns](../research/zustand-exam-engine-research.md)

## Overview
**Priority:** P1 (exam-taking is the core product)
**Status:** Pending
**Effort:** ~5h

Build the complete exam-taking experience: drift-free timer, session store with localStorage persistence, glassmorphic floating timer, progress orbs, question cards with single/multiple-select, navigation, and exam submission.

---

## Key Insights

1. **Drift-free timer**: Store `endTime = Date.now() + durationMs`. On each tick: `timeLeft = endTime - Date.now()`. Never decrement a counter.
2. **Visibility API**: Re-sync timer when user returns to tab after backgrounding.
3. **Progress orbs**: Glowing dots using CSS `box-shadow` + `filter: blur()`. States: unanswered (dim), answered (glowing), current (pulsing), flagged (amber).
4. **Single vs Multiple select**: Single — only one option selectable (radio). Multiple — checkbox, can select N options.
5. **localStorage persistence**: Use Zustand `partialize` to only persist answers + current index (not `timeLeftMs` — recalculate from `endTime`).

---

## Architecture

### Exam Session Store (Zustand)
```
State: examId, status, currentQuestionIndex, answers{}, endTime
Actions: startExam(), selectAnswer(), toggleFlag(), goToQuestion(), tick(), submitExam(), resetExam()
Partialize: exclude timeLeftMs (ephemeral), keep endTime
Persist: localStorage, key 'exam-session'
```

### Server vs Client Boundary
```
app/exam/[id]/take/page.tsx    → SERVER: fetch exam metadata, validate access
components/exam/ExamTakingClient.tsx → CLIENT: timer, answers, navigation
```

### Component Hierarchy
```
ExamTakingClient
  ├── ExamTimer (floating glassmorphic, top-right)
  ├── ExamHeader (exam title, progress text)
  ├── ProgressOrbs (navigation dots)
  ├── QuestionCard
  │   ├── Question number + flagged indicator
  │   ├── Question content
  │   └── AnswerOptions (radio or checkbox based on type)
  └── ExamNavigation (Prev / Next buttons + Submit)
```

---

## Related Code Files

### Files to CREATE
```
stores/exam-session-store.ts                (Zustand: answers, timer, status)
hooks/useExamTimer.ts                        (drift-free timer hook)
hooks/useExamSession.ts                      (session actions wrapper)
components/common/FocusTimer.tsx             (floating glassmorphic timer)
components/common/ProgressOrbs.tsx           (glowing navigation dots)
features/exam/components/QuestionCard.tsx     (question display + options)
features/exam/components/AnswerOption.tsx    (single radio / multiple checkbox)
features/exam/components/ExamProgress.tsx    (progress bar + orb summary)
features/exam/components/ExamNavigation.tsx  (prev/next/submit)
features/exam/components/ExamTakingClient.tsx (client shell)
features/exam/components/ExamStartScreen.tsx (before exam begins)
app/(main)/exam/[id]/take/page.tsx           (SERVER: exam taking page)
app/(main)/exam/[id]/result/page.tsx         (SERVER: placeholder, filled Phase 4)
lib/exam-utils.ts                            (scoring, time formatting)
```

### Files to MODIFY
```
app/(main)/page.tsx                           (link ExamCards → take page)
```

---

## Implementation Steps

### Step 3.1: `stores/exam-session-store.ts`
```typescript
// Key: endTime for drift-free, partialize for persist
type ExamStatus = 'not_started' | 'in_progress' | 'submitted' | 'time_expired';

interface Answer {
  questionId: string;
  selectedOptionIds: string[];
  flagged: boolean;
  answeredAt?: number;
}

startExam: (examId: string, durationMs: number) => {
  const endTime = Date.now() + durationMs;
  set({ examId, status: 'in_progress', endTime, currentQuestionIndex: 0, answers: {} });
}

tick: () => {
  const { endTime, status } = get();
  if (status !== 'in_progress' || !endTime) return;
  const remaining = endTime - Date.now();
  if (remaining <= 0) set({ timeLeftMs: 0, status: 'time_expired' });
  else set({ timeLeftMs: remaining });
}

partialize: (state) => ({
  examId: state.examId, status: state.status,
  currentQuestionIndex: state.currentQuestionIndex,
  answers: state.answers,  // endTime NOT persisted
})
```

### Step 3.2: `hooks/useExamTimer.ts`
- `setInterval(1000)` calling `tick()`
- `useEffect` on `visibilitychange` → call `tick()` when tab becomes visible
- `formatTime(ms)`: `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
- Warning state at 5 minutes remaining (visual change)
- `onTimeExpired` callback: auto-submit when timer hits 0

### Step 3.3: `hooks/useExamSession.ts`
Convenience hook wrapping store actions:
```typescript
const { start, answer, flag, goTo, submit, current, answered, flagged } = useExamSession();
// answer(questionId, optionIds): sets selectedOptionIds
// current: currentQuestionIndex
// answered(questionId): boolean
// flagged(questionId): boolean
```

### Step 3.4: `components/common/FocusTimer.tsx`
GlassSurface variant — top-right fixed position, backdrop-blur, primary-fixed text color.
- Shows formatted time: `25:30`
- Warning state: turns tertiary/orange color when < 5min
- Expired: turns error color

### Step 3.5: `components/common/ProgressOrbs.tsx`
```typescript
// States via CSS classes
<div className="flex gap-2 flex-wrap" role="navigation" aria-label="Câu hỏi">
  {questions.map((_, i) => {
    const isCurrent = i === currentIndex;
    const isAnswered = !!answers[`q-${i}`]?.selectedOptionIds.length;
    const isFlagged = !!answers[`q-${i}`]?.flagged;
    return (
      <button
        key={i}
        onClick={() => goTo(i)}
        className={cn(
          'w-3 h-3 rounded-full transition-all',
          isCurrent ? 'bg-primary scale-125 animate-pulse-ring' : '',
          isAnswered ? 'bg-secondary' : 'bg-outline opacity-40',
          isFlagged ? 'ring-2 ring-amber-400' : ''
        )}
        aria-label={`Câu ${i+1}`}
      />
    );
  })}
</div>
```

### Step 3.6: `features/exam/components/QuestionCard.tsx`
SurfaceCard with:
- Question number badge (primary container bg)
- Flag icon button (top right) — calls `toggleFlag`
- Question content (body-lg, on-surface)
- List of AnswerOptions

### Step 3.7: `features/exam/components/AnswerOption.tsx`
```typescript
interface Props {
  option: Option;
  type: 'single' | 'multiple';
  selected: boolean;
  onSelect: (optionId: string) => void;
}
// Single: radio input, group by questionId
// Multiple: checkbox input
// Selected: bg-primary-container/30, border-primary, checkmark icon
// Unselected: bg-surface-container-highest, border-outline/15
```

### Step 3.8: `features/exam/components/ExamTakingClient.tsx`
Client component wrapping the full exam UI.
- On mount: if session exists → restore, else show ExamStartScreen
- ExamStartScreen: exam info (title, duration, questions) + "Bắt đầu" button → calls `startExam()`
- Exam in progress: FocusTimer + ProgressOrbs + QuestionCard + Navigation
- Submit: confirmation dialog (native `<dialog>`) → calls `submitExam()` → router.push to result

### Step 3.9: `app/(main)/exam/[id]/take/page.tsx`
```typescript
// Server Component
export default async function ExamTakePage({ params }) {
  const exam = await getExamById(params.id); // from mock
  if (!exam) notFound();
  return (
    <div className="min-h-screen bg-surface">
      <ExamTakingClient exam={exam} />
    </div>
  );
}
```

### Step 3.10: `lib/exam-utils.ts`
```typescript
calculateScore(answers: Record<string, string[]>, questions: Question[]): number
calculatePercentage(score: number, total: number): number
formatDuration(ms: number): string   // "45 phút"
getTimeRemaining(endTime: number): number  // recalculate from Date.now()
```

---

## Success Criteria
- [ ] Timer accurate to ±1s over 60-minute simulated session
- [ ] Timer warning state triggers at 5 minutes (orange color)
- [ ] Answers persist to localStorage — survive page refresh
- [ ] Progress orbs show correct state (answered/unanswered/current/flagged)
- [ ] Single-select: selecting new option deselects previous
- [ ] Multiple-select: can select/deselect any combination
- [ ] Submit triggers confirmation, navigates to result page
- [ ] Flag button toggles flag state on current question
- [ ] No layout shift when timer updates (fixed-width display)

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Timer drift over 60+ min | `endTime - Date.now()` delta approach — not decrement |
| Tab backgrounding stops timer | `visibilitychange` → recalculate on `visible` |
| localStorage full (rare) | Wrap in try/catch, fail gracefully |
| Answering too fast (spam) | Debounce answer selection 50ms |
| Double-submit | Disable submit button after first click |

## Security Considerations
- Exam questions fetched server-side (not exposed in client bundle until start)
- Submit is client-side mock only — no real grading
- Session stored in localStorage (mock) — not appropriate for production

## Next Steps
- Phase 4: Results page — uses `exam-session-store` submitted answers + mock scoring
- Phase 5: Teacher exam wizard — uses same exam types + question schemas
