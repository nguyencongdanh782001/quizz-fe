import { useRouter } from 'next/navigation';
import { useExamWizardStore } from '@/stores/exam-wizard-store';
import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionsPage() {
  const router = useRouter();
  const { questions, addQuestion, removeQuestion, updateQuestion } = useExamWizardStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddQuestion = () => {
    addQuestion({
      id: Date.now().toString(),
      text: '',
      type: 'single',
      options: [{ id: Date.now().toString(), text: '', isCorrect: true }],
      explanation: '',
      points: 1,
    });
  };

  const handleOptionChange = (qId: string, oIdx: number, text: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    const updated = {
      ...q,
      options: q.options.map((o, i) => i === oIdx ? { ...o, text } : o),
    };
    updateQuestion(qId, updated);
  };

  const handleAddOption = (qId: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      ...q,
      options: [...q.options, { id: Date.now().toString(), text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (qId: string, oIdx: number) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      ...q,
      options: q.options.filter((_, i) => i !== oIdx),
    });
  };

  const handleCorrectChange = (qId: string, oIdx: number) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    let options;
    if (q.type === 'single') {
      options = q.options.map((o, i) => ({ ...o, isCorrect: i === oIdx }));
    } else {
      options = q.options.map((o, i) => i === oIdx ? { ...o, isCorrect: !o.isCorrect } : o);
    }
    updateQuestion(qId, { ...q, options });
  };

  const handleNext = () => {
    const missing = questions.filter(q => !q.text.trim());
    if (missing.length > 0) {
      setErrors({ questions: 'Tất cả câu hỏi phải có nội dung' });
      return;
    }
    router.push('/teacher/exams/create/settings');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-on-surface">Danh sách câu hỏi</h2>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="border border-outline/20 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-on-surface mb-1 block">Câu hỏi {qi + 1}</label>
                      <textarea
                        value={q.text}
                        onChange={e => {
                          updateQuestion(q.id, { text: e.target.value });
                          setErrors({});
                        }}
                        placeholder="Nhập nội dung câu hỏi..."
                        rows={2}
                        className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                      />
                      {errors.questions && <p className="text-sm text-red-500 mt-1">{errors.questions}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-on-surface mb-1 block">Loại câu hỏi</label>
                      <select
                        value={q.type}
                        onChange={e => updateQuestion(q.id, { type: e.target.value as any })}
                        className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                      >
                        <option value="single">Một đáp án</option>
                        <option value="multiple">Nhiều đáp án</option>
                        <option value="text">Tự luận</option>
                      </select>
                    </div>
                    {q.type !== 'text' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface">Đáp án</label>
                        {q.options.map((opt, oi) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input
                              type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                              checked={opt.isCorrect}
                              onChange={() => handleCorrectChange(q.id, oi)}
                              className="w-4 h-4 accent-primary"
                            />
                            <input
                              value={opt.text}
                              onChange={e => handleOptionChange(q.id, oi, e.target.value)}
                              placeholder={`Đáp án ${oi + 1}`}
                              className="flex-1 rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                            />
                            {q.options.length > 1 && (
                              <button
                                onClick={() => handleRemoveOption(q.id, oi)}
                                className="p-1.5 rounded-lg hover:bg-surface-container-low text-muted-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddOption(q.id)}
                          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm đáp án
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 rounded-lg hover:bg-surface-container-low text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/teacher/exams/create')}
          className="px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold hover:bg-surface-container-low transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Cài đặt →
        </button>
      </div>
    </div>
  );
}