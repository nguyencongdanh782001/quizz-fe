"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Thông tin cơ bản", path: "/teacher/exams/create" },
  { label: "Câu hỏi", path: "/teacher/exams/create/questions" },
  { label: "Cài đặt", path: "/teacher/exams/create/settings" },
  { label: "Xem lại", path: "/teacher/exams/create/review" },
];

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = STEPS.findIndex((s) => pathname === s.path);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-4">
          Tạo bài thi mới
        </h1>
        <div className="flex items-center gap-0 pb-1">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.path} className="flex items-center shrink-0">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      isDone
                        ? "bg-primary text-white"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-surface-container text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isCurrent
                        ? "text-primary"
                        : isDone
                          ? "text-on-surface"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 mx-4 min-w-8 flex-1",
                      isDone ? "bg-primary" : "bg-surface-container",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
