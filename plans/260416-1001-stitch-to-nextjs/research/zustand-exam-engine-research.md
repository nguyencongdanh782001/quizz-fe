# Research: Zustand + Formik + Exam Engine Patterns

## 1. Zustand Exam Session Store

```typescript
// Key: endTime for drift-free, partialize for persist
type ExamStatus = 'not_started' | 'in_progress' | 'submitted' | 'time_expired';

interface Answer {
  questionId: string;
  selectedOptionIds: string[];
  flagged: boolean;
  answeredAt?: number;
}

const useExamSessionStore = create<ExamSessionState>()(
  persist(
    (set, get) => ({
      examId: null,
      status: 'not_started' as ExamStatus,
      currentQuestionIndex: 0,
      answers: {},
      timeLeftMs: 0,
      endTime: null,

      startExam: (examId: string, durationMs: number) => {
        const endTime = Date.now() + durationMs;
        set({ examId, status: 'in_progress', endTime, timeLeftMs: durationMs, currentQuestionIndex: 0, answers: {} });
      },

      tick: () => {
        const { endTime, status } = get();
        if (status !== 'in_progress' || !endTime) return;
        const remaining = endTime - Date.now();
        if (remaining <= 0) set({ timeLeftMs: 0, status: 'time_expired' });
        else set({ timeLeftMs: remaining });
      },

      selectAnswer: (questionId, optionIds) => {
        set(state => ({
          answers: { ...state.answers, [questionId]: { questionId, selectedOptionIds: optionIds, flagged: state.answers[questionId]?.flagged ?? false, answeredAt: Date.now() } }
        }));
      },

      submitExam: () => set({ status: 'submitted' }),
    }),
    {
      name: 'exam-session',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-timer state (endTime handles time calculation)
      partialize: (state) => ({
        examId: state.examId,
        status: state.status,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        // Do NOT persist timeLeftMs or endTime — recalculate on hydration
      }),
    }
  )
);
```

## 2. Drift-Free Timer Hook

```typescript
export function useExamTimer({ onTimeExpired, onWarning } = {}) {
  const { status, endTime, tick, timeLeftMs } = useExamSessionStore();

  useEffect(() => {
    if (status !== 'in_progress') return;
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [status, endTime, tick]);

  // Handle tab backgrounding
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && status === 'in_progress') tick();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, tick]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return {
    timeLeftMs,
    formattedTime: formatTime(timeLeftMs),
    isWarning: timeLeftMs <= 5 * 60 * 1000 && timeLeftMs > 0,
    isExpired: timeLeftMs <= 0,
  };
}
```

## 3. Formik Multi-Step Wizard Pattern

URL-driven steps: `/exam/create?step=basic|questions|settings|review`

```typescript
// Each step page: reads draft from Zustand store, validates on submit
// "Tiếp theo" → validate current step schema → save to draft store → router.push next step
// "Quay lại" → router.back() — never validates
// Step 4 "Xuất bản" → validate full schema → submit
```

FieldArray for question builder:
```typescript
<FieldArray name="questions">
  {({ push, remove }) => (
    questions.map((q, qIndex) => (
      <SurfaceCard key={qIndex}>
        <Field name={`questions[${qIndex}].content`} />
        <FieldArray name={`questions[${qIndex}].options`}>
          {({ push: pushOpt, remove: removeOpt }) => (
            options.map((opt, oIndex) => (
              <div key={oIndex}>
                <Field type={q.type === 'single' ? 'radio' : 'checkbox'} checked={opt.isCorrect} />
                <Field name={`questions[${qIndex}].options[${oIndex}].content`} />
              </div>
            ))
          )}
        </FieldArray>
      </SurfaceCard>
    ))
  )}
</FieldArray>
```

## 4. Progress Orbs CSS

```css
.progress-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.progress-orb--answered {
  background: var(--secondary);
  box-shadow: 0 0 8px var(--secondary);
}
.progress-orb--current {
  background: var(--primary);
  transform: scale(1.3);
  animation: pulse-ring 2s infinite;
}
.progress-orb--flagged {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 var(--secondary); }
  50% { box-shadow: 0 0 0 4px transparent; }
}
```

## 5. Dependencies to Install

```bash
npm install zustand formik yup use-debounce
npm install -D @types/use-debounce
```
