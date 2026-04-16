'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useExamWizardStore, WizardQuestion } from '@/stores/exam-wizard-store';
import { InputField, TextAreaField } from '@/components/forms/field-components';
import { QuestionTypeSelect } from '@/components/features/question/question-type-select';
import { TrueFalseFields } from '@/components/features/question/true-false-fields';
import { OTPInput } from '@/components/features/question/otp-input';
import { cn } from '@/lib/utils';
import { QuestionType } from '@/types/exam.types';
import { SelectField } from '@/components/forms/field-components';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// ─── helpers ────────────────────────────────────────────────────────────────

function createEmptyQuestion(): WizardQuestion {
  return {
    id: `q-${Date.now()}`,
    text: '',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false },
    ],
    answer: '',
    points: 5,
    explanation: '',
  };
}

function resetOptionsForType(type: QuestionType): WizardQuestion['options'] {
  if (type === 'true_false') {
    return [
      { id: 't', text: 'True', isCorrect: false },
      { id: 'f', text: 'False', isCorrect: false },
    ];
  }
  return [
    { id: 'a', text: '', isCorrect: false },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false },
  ];
}

// ─── Option row (used by multiple_choice / single / multiple) ───────────────

interface OptionRowProps {
  letter: string;
  text: string;
  isCorrect: boolean;
  onTextChange: (v: string) => void;
  onToggleCorrect: () => void;
  disabled?: boolean;
}

function OptionRow({ letter, text, isCorrect, onTextChange, onToggleCorrect, disabled }: OptionRowProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleCorrect}
        disabled={disabled}
        className={cn(
          'w-7 h-7 rounded-lg border flex items-center justify-center text-sm font-semibold shrink-0 transition-all',
          isCorrect
            ? 'bg-primary border-primary text-white'
            : 'border-outline/30 bg-surface hover:border-outline/60 disabled:opacity-50'
        )}
      >
        {isCorrect ? <Check className="w-3.5 h-3.5" /> : letter}
      </button>
      <input
        type="text"
        value={text}
        onChange={e => onTextChange(e.target.value)}
        placeholder={`Đáp án ${letter}`}
        className="flex-1 px-3 py-2 rounded-xl text-sm bg-surface border border-outline/20 outline-none focus:border-primary disabled:opacity-50"
        disabled={disabled}
      />
    </div>
  );
}

// ─── Option list for single/multiple_choice/multiple types ──────────────────

interface OptionListProps {
  options: WizardQuestion['options'];
  type: QuestionType;
  onTextChange: (optionId: string, text: string) => void;
  onToggleCorrect: (optionId: string) => void;
}

function OptionList({ options, type, onTextChange, onToggleCorrect }: OptionListProps) {
  const isMulti = type === 'multiple';

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {isMulti ? 'Chọn đáp án đúng (một hoặc nhiều)' : 'Chọn đáp án đúng'}
      </p>
      {options.map((opt, oi) => (
        <OptionRow
          key={opt.id}
          letter={OPTION_LETTERS[oi]}
          text={opt.text}
          isCorrect={opt.isCorrect}
          onTextChange={text => onTextChange(opt.id, text)}
          onToggleCorrect={() => onToggleCorrect(opt.id)}
        />
      ))}
    </div>
  );
}

// ─── Add / edit question form ───────────────────────────────────────────────

interface QuestionFormProps {
  initial?: WizardQuestion;
  onSave: (q: WizardQuestion) => void;
  onCancel: () => void;
  submitLabel?: string;
}

function QuestionForm({ initial, onSave, onCancel, submitLabel = 'Thêm câu hỏi' }: QuestionFormProps) {
  const [q, setQ] = useState<WizardQuestion>(() => {
    if (!initial) return createEmptyQuestion();
    return {
      ...initial,
      options: initial.options.length > 0
        ? initial.options
        : resetOptionsForType(initial.type),
    };
  });

  const setType = (type: QuestionType) => {
    setQ(prev => ({
      ...prev,
      type,
      options: resetOptionsForType(type),
      answer: '',
    }));
  };

  const isLegacy = q.type === 'single' || q.type === 'multiple';
  const isOptionBased = ['multiple_choice', 'single', 'multiple'].includes(q.type);
  const isTrueFalse = q.type === 'true_false';
  const isText = q.type === 'text';

  const canSave = () => {
    if (!q.text.trim()) return false;
    if (isOptionBased) return q.options.some(o => o.isCorrect);
    if (isTrueFalse) return !!q.answer;
    if (isText) return q.answer?.length === 4;
    return false;
  };

  const handleSave = () => {
    if (!canSave()) return;
    onSave(q);
  };

  const toggleOptionCorrect = (optionId: string) => {
    setQ(prev => ({
      ...prev,
      options: prev.options.map(o => {
        if (prev.type === 'single' || prev.type === 'multiple_choice') {
          return { ...o, isCorrect: o.id === optionId };
        }
        return { ...o, isCorrect: o.id === optionId ? !o.isCorrect : o.isCorrect };
      }),
    }));
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-primary/30 space-y-4">
      <h3 className="font-semibold text-on-surface">
        {initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
      </h3>

      <TextAreaField
        label="Nội dung câu hỏi *"
        value={q.text}
        onChange={e => setQ(prev => ({ ...prev, text: e.target.value }))}
        placeholder="Nhập nội dung câu hỏi..."
      />

      <QuestionTypeSelect value={q.type} onChange={setType} />

      {/* Option-based: multiple_choice, single, multiple */}
      {isOptionBased && (
        <OptionList
          options={q.options}
          type={q.type}
          onTextChange={(optId, text) =>
            setQ(prev => ({
              ...prev,
              options: prev.options.map(o => o.id === optId ? { ...o, text } : o),
            }))
          }
          onToggleCorrect={toggleOptionCorrect}
        />
      )}

      {/* True / False */}
      {isTrueFalse && (
        <TrueFalseFields
          value={q.answer ?? ''}
          onChange={val => setQ(prev => ({ ...prev, answer: val }))}
        />
      )}

      {/* Text (OTP) */}
      {isText && (
        <OTPInput
          value={q.answer ?? ''}
          onChange={val => setQ(prev => ({ ...prev, answer: val }))}
          error={q.answer && q.answer.length !== 4 ? 'Đáp án phải đủ 4 ký tự' : undefined}
        />
      )}

      <TextAreaField
        label="Giải thích (tùy chọn)"
        value={q.explanation}
        onChange={e => setQ(prev => ({ ...prev, explanation: e.target.value }))}
        rows={2}
        placeholder="Giải thích đáp án đúng..."
      />

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium border border-outline/20 text-on-surface hover:bg-surface-container transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave()}
          className={cn(
            'px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            canSave()
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-surface-container text-muted-foreground cursor-not-allowed'
          )}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Question card (list view) ──────────────────────────────────────────────

interface QuestionCardProps {
  question: WizardQuestion;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (id: string, data: Partial<WizardQuestion>) => void;
}

function QuestionCard({ question: q, index, isEditing, onEdit, onDelete, onUpdate }: QuestionCardProps) {
  if (isEditing) {
    return (
      <QuestionForm
        initial={q}
        submitLabel="Lưu"
        onSave={updated => { onUpdate(q.id, updated); onEdit(); }}
        onCancel={onEdit}
      />
    );
  }

  const typeLabel: Record<QuestionType, string> = {
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng / Sai',
    text: 'Tự luận ngắn',
    single: 'Một đáp án',
    multiple: 'Nhiều đáp án',
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-muted-foreground font-medium">
              {typeLabel[q.type]}
            </span>
          </div>
          <p className="font-medium text-on-surface text-sm mb-2 truncate">
            Câu {index + 1}: {q.text || '(chưa nhập)'}
          </p>

          {/* Option-based answer preview */}
          {['single', 'multiple', 'multiple_choice'].includes(q.type) && (
            <div className="flex flex-wrap gap-1.5">
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
          )}

          {/* True/False answer preview */}
          {q.type === 'true_false' && (
            <span className={cn(
              'inline-block px-3 py-1 rounded-lg text-xs font-semibold',
              q.answer === 'true'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}>
              {q.answer === 'true' ? 'Đúng' : 'Sai'}
            </span>
          )}

          {/* Text answer preview */}
          {q.type === 'text' && (
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-secondary/10 text-secondary">
              Đáp án: {q.answer || '(trống)'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors text-muted-foreground text-xs font-medium"
          >
            Sửa
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function QuestionBuilderPage() {
  const router = useRouter();
  const { questions, addQuestion, updateQuestion, removeQuestion } = useExamWizardStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const handleAdd = (q: WizardQuestion) => {
    addQuestion(q);
    setShowNewForm(false);
  };

  const handleUpdate = (id: string, data: Partial<WizardQuestion>) => {
    updateQuestion(id, data);
  };

  const handleNext = () => {
    router.push('/teacher/exams/create/settings');
  };

  return (
    <div className="space-y-6">
      {/* Question list */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-on-surface">
              Đã thêm ({questions.length}) câu hỏi
            </h2>
          </div>
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              isEditing={editingId === q.id}
              onEdit={() => setEditingId(prev => prev === q.id ? null : q.id)}
              onDelete={() => removeQuestion(q.id)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* New question form */}
      {showNewForm ? (
        <QuestionForm
          onSave={handleAdd}
          onCancel={() => setShowNewForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowNewForm(true)}
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