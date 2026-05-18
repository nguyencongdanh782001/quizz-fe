"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExamStepDefinition {
  id: "info" | "questions" | "review";
  title: string;
  description: string;
}

export function ExamStepLayout({
  steps,
  currentStepIndex,
  maxVisitedStepIndex,
  onStepSelect,
  children,
  aside,
  actions,
}: {
  steps: ExamStepDefinition[];
  currentStepIndex: number;
  maxVisitedStepIndex: number;
  onStepSelect: (stepIndex: number) => void;
  children: React.ReactNode;
  aside?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const progressWidth =
    steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 100;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-outline/10 bg-surface-container-lowest shadow-[0_24px_70px_-46px_rgba(7,30,39,0.24)]">
        <div className="border-b border-outline/10 bg-[linear-gradient(135deg,rgba(0,70,74,0.08),rgba(41,105,91,0.03))] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">
                Quy trình tạo đề thi
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-on-surface sm:text-3xl">
                Hoàn thiện đề thi theo 3 bước rõ ràng
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Mỗi bước tập trung vào một phần công việc riêng để giáo viên dễ
                nhập liệu, dễ kiểm tra và dễ lưu đề thi hơn.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-surface px-3 py-2 text-sm text-on-surface-variant ring-1 ring-outline/10">
              <span className="font-semibold text-on-surface">
                Bước {currentStepIndex + 1}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span>{steps[currentStepIndex]?.title}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= maxVisitedStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => isAccessible && onStepSelect(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "rounded-[28px] border px-4 py-4 text-left transition-all duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-55",
                    isCurrent
                      ? "border-primary/25 bg-primary/6 shadow-[0_18px_44px_-34px_rgba(0,70,74,0.42)]"
                      : isCompleted
                        ? "border-secondary/20 bg-secondary/6 hover:border-secondary/30"
                        : "border-outline/12 bg-surface hover:border-primary/18",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 h-2 rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#00464a_0%,#29695b_100%)] transition-all duration-300"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>{children}</div>
        {aside ? (
          <aside className="xl:sticky xl:top-6 xl:self-start">{aside}</aside>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-20 rounded-[30px] border border-outline/10 bg-surface-container-lowest/92 px-5 py-4 shadow-[0_20px_50px_-36px_rgba(7,30,39,0.38)] backdrop-blur-xl">
        {actions}
      </div>
    </div>
  );
}
