"use client";

import { useRouter } from "next/navigation";
import { useExamWizardStore } from "@/stores/exam-wizard-store";
import { InputField } from "@/components/common/form/input-field";
import { SelectField } from "@/components/common/form/select-field";
import { TextareaField } from "@/components/common/form/textarea-field";
import { useState } from "react";

const SUBJECTS = [
  "Toán",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Ngữ văn",
  "Tiếng Anh",
  "Lịch sử",
  "Địa lý",
];
const GRADES = [6, 7, 8, 9, 10, 11, 12];

export default function ExamCreatePage() {
  const router = useRouter();
  const { title, description, subject, grade, difficulty, updateBasicInfo } =
    useExamWizardStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: "Tiêu đề bắt buộc" });
      return;
    }
    router.push("/teacher/exams/create/questions");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg text-on-surface">
          Thông tin cơ bản
        </h2>
        <InputField
          label="Tiêu đề bài thi *"
          value={title}
          onChange={(e) => {
            updateBasicInfo({ title: e.target.value });
            setErrors({});
          }}
          placeholder="VD: Kiểm tra giữa kỳ 1 - Toán lớp 10"
          error={errors.title}
        />
        <TextareaField
          label="Mô tả"
          value={description}
          onChange={(e) => updateBasicInfo({ description: e.target.value })}
          placeholder="Mô tả nội dung bài thi..."
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Môn học"
            value={subject}
            onValueChange={(v) => updateBasicInfo({ subject: v })}
            options={SUBJECTS.map((s) => ({ value: s, label: s }))}
            placeholder="Chọn môn"
          />
          <SelectField
            label="Khối lớp"
            value={String(grade)}
            onValueChange={(v) => updateBasicInfo({ grade: Number(v) })}
            options={GRADES.map((g) => ({
              value: String(g),
              label: `Lớp ${g}`,
            }))}
          />
        </div>
        <SelectField
          label="Mức độ"
          value={difficulty}
          onValueChange={(v) =>
            updateBasicInfo({ difficulty: v as "easy" | "medium" | "hard" })
          }
          options={[
            { value: "easy", label: "Dễ" },
            { value: "medium", label: "Trung bình" },
            { value: "hard", label: "Khó" },
          ]}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="cursor-pointer cursor-pointer px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Tiếp theo: Câu hỏi →
        </button>
      </div>
    </form>
  );
}
