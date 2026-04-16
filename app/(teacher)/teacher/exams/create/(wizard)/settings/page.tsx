"use client";

import { useRouter } from "next/navigation";
import { useExamWizardStore } from "@/stores/exam-wizard-store";
import { InputField } from "@/components/common/form/input-field";
import { CheckboxField } from "@/components/common/form/checkbox-field";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    duration,
    passingScore,
    attemptLimit,
    shuffleQuestions,
    shuffleOptions,
    updateSettings,
  } = useExamWizardStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (!duration || duration <= 0) {
      setErrors({ duration: "Thời gian phải lớn hơn 0" });
      return;
    }
    router.push("/teacher/exams/create/review");
  };

  return (
    <div className="space-y-5 w-full">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg text-on-surface">
          Cài đặt bài thi
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Thời gian (phút)"
            required
            type="number"
            min={1}
            value={duration}
            onChange={(e) => {
              updateSettings({ duration: Number(e.target.value) });
              setErrors({});
            }}
            placeholder="VD: 45"
            error={errors.duration}
          />
          <InputField
            label="Điểm đạt (%)"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) =>
              updateSettings({ passingScore: Number(e.target.value) })
            }
            placeholder="VD: 50"
          />
          <InputField
            label="Số lần làm tối đa"
            type="number"
            min={1}
            value={attemptLimit}
            onChange={(e) =>
              updateSettings({ attemptLimit: Number(e.target.value) })
            }
            placeholder="VD: 3"
          />
        </div>

        <div className="space-y-3 pt-2">
          <CheckboxField
            label="Xáo trộn câu hỏi"
            description="Thay đổi thứ tự câu hỏi cho mỗi lượt làm bài để hạn chế học thuộc vị trí."
            checked={shuffleQuestions}
            onCheckedChange={(checked) =>
              updateSettings({ shuffleQuestions: checked })
            }
          />
          <CheckboxField
            label="Xáo trộn đáp án"
            description="Đảo thứ tự các lựa chọn trong câu hỏi trắc nghiệm khi học sinh bắt đầu làm bài."
            checked={shuffleOptions}
            onCheckedChange={(checked) =>
              updateSettings({ shuffleOptions: checked })
            }
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/teacher/exams/create/questions")}
          className="cursor-pointer px-5 py-2.5 rounded-xl border border-outline text-sm font-semibold hover:bg-surface-container-low transition-colors"
        >
          ← Quay lại
        </button>
        <button
          onClick={handleNext}
          className="cursor-pointer px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Xem lại →
        </button>
      </div>
    </div>
  );
}
