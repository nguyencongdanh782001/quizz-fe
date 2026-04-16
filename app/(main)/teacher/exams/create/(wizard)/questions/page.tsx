'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useExamWizardStore, WizardQuestion } from '@/stores/exam-wizard-store';
import { InputField, TextAreaField } from '@/components/forms/field-components';
import { cn } from '@/lib/utils';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function createEmptyQuestion(): WizardQuestion {
  return {
    id: `q-${Date.now()}`,
    text: '',
    type: 'single',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false },
    ],
    points: 5,
    explanation: '',
  };
}

export default function QuestionBuilderPage() {
  const router = useRouter();
  const { questions, addQuestion, updateQuestion, removeQuestion } = useExamWizardStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQ, setNewQ] = useState<WizardQuestion | null>(null);

  const openNew = () => setNewQ(createEmptyQuestion());
  const closeNew = () => setNewQ(null);

  const handleAddQuestion = () => {
    if (!newQ) return;
    if (!newQ.text.trim()) return;
    const hasCorrect = newQ.options.some(o => o.isCorrect);
    if (!hasCorrect) return;
    addQuestion(newQ);
    closeNew();
  };

  const updateNewOption = (optionId: string, text: string) => {
    if (!newQ) return;
    setNewQ({
      ...newQ,
      options: newQ.options.map(o => o.id === optionId ? { ...o, text } : o),
    });
  };

  const updateNewCorrect = (optionId: string) => {
    if (!newQ) return;
    setNewQ({
      ...newQ,
      options: newQ.options.map(o => ({
        ...o,
        isCorrect: newQ.type === 'single'
          ? o.id === optionId
          : o.id === optionId ? !o.isCorrect : o.isCorrect,
      })),
    });
  };

  const handleNext = () => {
    router.push('/teacher/exams/create/settings');
  };

  const questionBeingEdited = editingId ? questions.find(q => q.id === editingId) : null;

  const updateQuestionOption = (qId: string, optionId: string, text: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      options: q.options.map(o => o.id === optionId ? { ...o, text } : o),
    });
  };

  const updateQuestionCorrect = (qId: string, optionId: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      options: q.options.map(o => ({
        ...o,
        isCorrect: q.type === 'single'
          ? o.id === optionId
          : o.id === optionId ? !o.isCorrect : o.isCorrect,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing questions */}
      <div className="space-y-4">
        {questions.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-on-surface">
                Đã thêm ({questions.length}) câu hỏi
              </h2>
            </div>

            {questions.map((q, i) => (
              <div key={q.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline/10">
                {editingId === q.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <TextAreaField
                      label={`Câu hỏi ${i + 1}`}
                      value={q.text}
                      onChange={e => updateQuestion(q.id, { text: e.target.value })}
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestionCorrect(q.id, opt.id)}
                            className={cn(
                              'w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold shrink-0',
                              opt.isCorrect
                                ? 'bg-primary border-primary text-white'
                                : 'border-outline/30 bg-surface hover:bg-surface-container'
                            )}
                          >
                            {opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : OPTION_LETTERS[oi]}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => updateQuestionOption(q.id, opt.id, e.target.value)}
                            placeholder={`Đáp án ${OPTION_LETTERS[oi]}`}
                            className="flex-1 px-3 py-2 rounded-xl text-sm bg-surface border border-outline/20 outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <TextAreaField
                          label="Giải thích (tùy chọn)"
                          value={q.explanation}
                          onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium"
                      >
                        Xong
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-on-surface text-sm mb-2">
                          Câu {i + 1}: {q.text || '(chưa nhập câu hỏi)'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, oi) => (
                            <span
                              key={opt.id}
                              className={cn(
                                'px-2 py-1 rounded-lg text-xs font-medium',
                                opt.isCorrect
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-surface text-muted-foreground'
                              )}
                            >
                              {OPTION_LETTERS[oi]}. {opt.text || '(trống)'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingId(q.id)}
                          className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-2 rounded-lg hover:bg-surface-container transition-colors text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add new question */}
      {newQ ? (
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-primary/30 space-y-4">
          <h3 className="font-semibold text-on-surface">Thêm câu hỏi mới</h3>
          <TextAreaField
            label="Nội dung câu hỏi *"
            value={newQ.text}
            onChange={e => setNewQ({ ...newQ, text: e.target.value })}
            placeholder="Nhập nội dung câu hỏi..."
          />

          {/* Type toggle */}
          <div className="flex gap-2">
            {(['single', 'multiple'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setNewQ({ ...newQ, type: t, options: newQ.options.map(o => ({ ...o, isCorrect: false })) })}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  newQ.type === t
                    ? 'bg-primary text-white border-primary'
                    : 'border-outline/20 text-muted-foreground'
                )}
              >
                {t === 'single' ? 'Một đáp án' : 'Nhiều đáp án'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Chọn đáp án đúng (một hoặc nhiều)
            </p>
            {newQ.options.map((opt, oi) => (
              <div key={opt.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateNewCorrect(opt.id)}
                  className={cn(
                    'w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold shrink-0',
                    opt.isCorrect
                      ? 'bg-primary border-primary text-white'
                      : 'border-outline/30 bg-surface hover:bg-surface-container'
                  )}
                >
                  {opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : OPTION_LETTERS[oi]}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={e => updateNewOption(opt.id, e.target.value)}
                  placeholder={`Đáp án ${OPTION_LETTERS[oi]}`}
                  className="flex-1 px-3 py-2 rounded-xl text-sm bg-surface border border-outline/20 outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeNew}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container"
            >
              Hủy
            </button>
            <button
              onClick={handleAddQuestion}
              disabled={!newQ.text.trim() || !newQ.options.some(o => o.isCorrect)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white disabled:opacity-40"
            >
              Thêm câu hỏi
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={openNew}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-outline/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm câu hỏi
        </button>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/teacher/exams/create')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Cài đặt
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
