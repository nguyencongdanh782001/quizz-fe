"use client";

import { useFormikContext } from "formik";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  ListChecks,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeacherExamFormValues } from "./types";
import {
  normalizeTeacherExamQuestionType,
  parseAcceptedAnswers,
} from "./utils";

function getTotalPoints(values: TeacherExamFormValues): number {
  return values.questions.reduce(
    (sum, question) => sum + (Number(question.points) || 0),
    0,
  );
}

function getCorrectOptions(
  question: TeacherExamFormValues["questions"][number],
) {
  return question.options.filter((option) => option.is_correct);
}

export function ReviewStep() {
  const { values } = useFormikContext<TeacherExamFormValues>();
  const totalPoints = getTotalPoints(values);
  const questionCount = values.questions.length;

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-0 bg-surface-container-lowest shadow-[0_24px_70px_-46px_rgba(7,30,39,0.24)]">
        <CardHeader className="border-b border-outline/10 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-tertiary/12 text-tertiary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl text-on-surface">
                Bước 3. Xem lại và gửi bài thi
              </CardTitle>
              <CardDescription className="mt-2 max-w-3xl text-sm leading-relaxed">
                Kiểm tra nhanh toàn bộ nội dung, xem trước đáp án đúng và xác
                nhận thông tin trước khi tạo bài thi cho lớp.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[26px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Câu hỏi
              </p>
              <p className="mt-2 text-2xl font-semibold text-on-surface">
                {questionCount}
              </p>
            </div>

            <div className="rounded-[26px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Tổng điểm
              </p>
              <p className="mt-2 text-2xl font-semibold text-on-surface">
                {totalPoints}
              </p>
            </div>

            <div className="rounded-[26px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Thời lượng
              </p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-on-surface">
                <Clock3 className="h-4 w-4 text-primary" />
                {values.duration_minutes}
              </p>
            </div>

            <div className="rounded-[26px] border border-outline/10 bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Trạng thái
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {values.is_published ? "Published" : "riêng tư"}
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-semibold text-secondary">
                  {values.is_active ? "Đang hoạt động" : "Tạm ẩn"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-outline/10 bg-surface p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Thông tin tổng quan
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Đây là phần mô tả tóm tắt mà học sinh sẽ nhìn thấy trước khi
                  bắt đầu làm bài.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Sẵn sàng xem lại
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Tiêu đề
                </p>
                <p className="mt-2 text-xl font-semibold text-on-surface">
                  {values.title.trim() || "Chưa nhập tiêu đề"}
                </p>

                <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Mô tả
                </p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {values.description.trim() ||
                    "Chưa có mô tả cho bài thi này."}
                </p>
              </div>

              <div className="space-y-3 rounded-[24px] border border-outline/10 bg-surface-container-low p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Ảnh bìa
                  </p>
                  <p className="mt-2 break-all text-sm text-on-surface-variant">
                    {values.image_url.trim() || "Không sử dụng ảnh bìa"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Hiển thị
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {values.is_published
                      ? "Bài thi sẽ được hiển thị dưới dạng published."
                      : "Bài thi sẽ được tạo ở trạng thái riêng tư."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                <ListChecks className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Xem trước danh sách câu hỏi
                </p>
                <p className="text-xs text-muted-foreground">
                  Kiểm tra nhanh từng câu hỏi, điểm số và đáp án đúng trước khi
                  gửi bài thi.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {values.questions.map((question, questionIndex) => {
                const questionType = normalizeTeacherExamQuestionType(
                  question.question_type,
                );
                const acceptedAnswers = parseAcceptedAnswers(
                  question.accepted_answers,
                );
                const correctOptions = getCorrectOptions(question);

                return (
                  <Card
                    key={question.client_id}
                    className="rounded-[28px] border border-outline/10 bg-surface shadow-none"
                  >
                    <CardHeader className="border-b border-outline/10 pb-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              Câu hỏi {questionIndex + 1}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                              {questionType === "single_choice"
                                ? "Trắc nghiệm"
                                : "Tự luận"}
                            </span>
                          </div>
                          <CardTitle className="mt-3 text-lg text-on-surface">
                            {question.prompt.trim() ||
                              "Chưa nhập nội dung câu hỏi"}
                          </CardTitle>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 text-sm font-semibold text-on-surface">
                          <FileCheck2 className="h-4 w-4 text-primary" />
                          {question.points} điểm
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-5">
                      {question.image_url.trim() ? (
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            Hình minh họa
                          </p>
                          <p className="mt-2 break-all text-sm text-on-surface-variant">
                            {question.image_url}
                          </p>
                        </div>
                      ) : null}

                      {questionType === "single_choice" ? (
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            Đáp án và đáp án đúng
                          </p>

                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={option.client_id}
                                className={cn(
                                  "rounded-2xl border px-4 py-3 text-sm transition-colors",
                                  option.is_correct
                                    ? "border-primary/25 bg-primary/6 text-on-surface"
                                    : "border-outline/10 bg-surface-container-lowest text-on-surface-variant",
                                )}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-on-surface">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span>
                                    {option.option_text.trim() ||
                                      "Chưa nhập đáp án"}
                                  </span>
                                  {option.is_correct ? (
                                    <span className="inline-flex items-center rounded-full bg-primary/12 px-2 py-0.5 text-[0.7rem] font-semibold text-primary">
                                      Đúng
                                    </span>
                                  ) : null}
                                </div>
                                {option.image_url.trim() ? (
                                  <p className="mt-2 break-all text-xs text-muted-foreground">
                                    Ảnh: {option.image_url}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Đáp án đúng:{" "}
                            <span className="font-medium text-on-surface">
                              {correctOptions.length > 0
                                ? correctOptions
                                    .map((option) => option.option_text.trim())
                                    .filter(Boolean)
                                    .join(", ")
                                : "Chưa chọn đáp án đúng"}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            Đáp án chấp nhận
                          </p>
                          <div className="space-y-2">
                            {acceptedAnswers.length > 0 ? (
                              acceptedAnswers.map((answer) => (
                                <div
                                  key={`${question.client_id}-${answer}`}
                                  className="rounded-2xl border border-secondary/16 bg-secondary/8 px-4 py-3 text-sm text-on-surface"
                                >
                                  {answer}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-destructive/12 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                Chưa nhập đáp án cho câu hỏi tự luận này.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
