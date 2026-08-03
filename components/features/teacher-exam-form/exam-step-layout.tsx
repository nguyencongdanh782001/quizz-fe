"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExamStepDefinition {
  id: "info" | "questions" | "review";
  title: string;
  description: string;
}

export function ExamStepLayout({
  steps,
  currentStepIndex,
  onStepSelect,
  children,
}: {
  steps: ExamStepDefinition[];
  currentStepIndex: number;
  maxVisitedStepIndex?: number;
  onStepSelect: (stepIndex: number) => void;
  children: React.ReactNode;
  aside?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-full space-y-4">
      {/* Compact 3-Step Square Columns Navigation Bar */}
      <section className="overflow-hidden rounded-[10px] border border-[#DDE2EB] bg-white p-2.5 shadow-xs">
        <div className="grid gap-2.5 md:grid-cols-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepSelect(index)}
                className={cn(
                  "rounded-[6px] border px-4 py-3 text-left transition-all flex items-center gap-3 cursor-pointer",
                  isCurrent
                    ? "border-[#8B5CF6] bg-[#F5F3FF] text-[#7C3AED] shadow-xs"
                    : isCompleted
                      ? "border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#94A3B8]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-[#8B5CF6] text-white"
                      : isCompleted
                        ? "bg-[#10B981] text-white"
                        : "bg-[#E2E8F0] text-[#64748B]",
                  )}
                >
                  {isCompleted ? <Check className="size-3.5" /> : index + 1}
                </div>

                <span className="text-xs font-bold truncate">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Step Content */}
      <div>{children}</div>
    </div>
  );
}
