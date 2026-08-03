"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Coins,
  FolderOpen,
  History,
  LoaderCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { aiExamQueryKeys } from "@/hooks/queries/ai-exam.query-keys";
import { billingQueryKeys } from "@/hooks/queries/billing.query-keys";
import { teacherExamQueryKeys } from "@/hooks/queries/exam.query-keys";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type {
  AIQCCostEstimateResponse,
  AIExamGenerationJobResponse,
  AIExamQuestionType,
  AIExamQuestionTypeDistribution,
  AIQuestionDraftResponse,
  ApiError,
} from "@/lib/api/types";
import {
  estimateAIQCCost,
  getQCWallet,
} from "@/services/billing.service";
import {
  generateAIExam,
  generateMoreAIQuestions,
  getAIExamJob,
  saveAIExamToQuiz,
  updateAIQuestionDraft,
} from "@/services/ai-exam.service";
import { AIGenerateForm } from "./ai-generate-form";
import { AIQuestionDraftCard } from "./ai-question-draft-card";
import { AISavePanel } from "./ai-save-panel";
import type {
  AIExamScope,
  AIExamToastState,
  GenerateAIExamFormState,
  SaveAIExamFormState,
} from "./types";
import {
  AI_QUESTION_TYPE_OPTIONS,
  DEFAULT_GENERATE_FORM,
  DEFAULT_SAVE_FORM,
  buildEvenQuestionTypeDistribution,
  buildGeneratePayload,
  getGenerationValidationMessage,
  getQuestionTypeDistributionTotal,
  getStatusLabel,
  isJobFailed,
  isJobRunning,
  mergeDraftOverrides,
} from "./utils";

interface TeacherAIExamScreenProps {
  classId: string | null;
  initialJobId: number | null;
  initialScope: AIExamScope;
}

interface RecentAIExamDraft {
  approvedCount: number;
  classId: string | null;
  createdAt: string;
  id: number;
  questionCount: number;
  scope: AIExamScope;
  status: string;
  title: string;
  updatedAt: string;
}

const AI_EXAM_RECENT_DRAFTS_KEY = "quizzvn.ai-exam.recent-drafts.v1";
const AI_EXAM_RECENT_DRAFT_LIMIT = 8;

function getClassroomId(classId: string | null): number | null {
  if (!classId) {
    return null;
  }

  const classroomId = Number(classId);

  return Number.isFinite(classroomId) ? classroomId : null;
}

function getDefaultSaveValues(
  job: AIExamGenerationJobResponse,
): SaveAIExamFormState {
  return {
    description:
      job.description?.trim() ||
      `Đề ${job.subject} cho ${job.grade}, chủ đề ${job.topic}.`,
    duration_minutes: job.duration_minutes,
    is_published: false,
    title: job.title?.trim() || `${job.subject} - ${job.topic}`,
  };
}

function mergeUpdatedDraft(
  current: Record<number, AIQuestionDraftResponse>,
  draft: AIQuestionDraftResponse,
) {
  return {
    ...current,
    [draft.id]: draft,
  };
}

function getAIExamPath(
  scope: AIExamScope,
  classId: string | null,
  jobId?: number | null,
) {
  const params = new URLSearchParams();

  params.set("scope", scope);

  if (scope === "class" && classId) {
    params.set("classId", classId);
  }

  if (jobId) {
    params.set("jobId", String(jobId));
  }

  return `/teacher/ai-exams?${params.toString()}`;
}

function readRecentAIExamDrafts(): RecentAIExamDraft[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(AI_EXAM_RECENT_DRAFTS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter(
          (item): item is RecentAIExamDraft =>
            typeof item?.id === "number" &&
            typeof item?.title === "string" &&
            (item?.scope === "system" || item?.scope === "class"),
        )
      : [];
  } catch {
    return [];
  }
}

function writeRecentAIExamDrafts(drafts: RecentAIExamDraft[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AI_EXAM_RECENT_DRAFTS_KEY,
    JSON.stringify(drafts.slice(0, AI_EXAM_RECENT_DRAFT_LIMIT)),
  );
}

function getScopedRecentAIExamDrafts(
  drafts: RecentAIExamDraft[],
  scope: AIExamScope,
  classId: string | null,
) {
  return drafts.filter(
    (draft) =>
      draft.scope === scope && (scope === "system" || draft.classId === classId),
  );
}

function buildRecentAIExamDraft(
  job: AIExamGenerationJobResponse,
  scope: AIExamScope,
  classId: string | null,
): RecentAIExamDraft {
  const now = new Date().toISOString();

  return {
    approvedCount: job.question_drafts.filter((draft) => draft.is_approved)
      .length,
    classId,
    createdAt: job.created_at ?? now,
    id: job.id,
    questionCount: job.question_count,
    scope,
    status: job.status,
    title: job.title?.trim() || `${job.subject} - ${job.topic}`,
    updatedAt: job.updated_at ?? now,
  };
}

function upsertRecentAIExamDraft(
  job: AIExamGenerationJobResponse,
  scope: AIExamScope,
  classId: string | null,
) {
  const draft = buildRecentAIExamDraft(job, scope, classId);
  const drafts = readRecentAIExamDrafts().filter((item) => item.id !== job.id);
  const nextDrafts = [draft, ...drafts].slice(0, AI_EXAM_RECENT_DRAFT_LIMIT);

  writeRecentAIExamDrafts(nextDrafts);

  return nextDrafts;
}

function removeRecentAIExamDraft(jobId: number) {
  const nextDrafts = readRecentAIExamDrafts().filter(
    (draft) => draft.id !== jobId,
  );

  writeRecentAIExamDrafts(nextDrafts);

  return nextDrafts;
}

function formatRecentAIExamDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());

  if (!match) {
    return "Vừa tạo";
  }

  const [, , mm, dd, hh, mi] = match;
  return `${dd}/${mm} ${hh}:${mi}`;
}

function createIdempotencyKey(operation: "initial" | "generate-more") {
  return `${operation}-${crypto.randomUUID()}`;
}

function getInsufficientQCMessage(error: unknown): string | null {
  const apiError = error as ApiError;
  if (apiError?.status !== 402) {
    return null;
  }

  const balance = Number(apiError.details?.balance ?? 0);
  const missingQC = Number(apiError.details?.missing_qc ?? 0);
  return `Số dư ${balance.toLocaleString("vi-VN")} QC, còn thiếu ${missingQC.toLocaleString("vi-VN")} QC.`;
}

function QCCostSummary({
  estimate,
  isLoading,
}: {
  estimate?: AIQCCostEstimateResponse;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-outline/15 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Coins className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">Chi phí tạo câu hỏi</p>
          {isLoading ? (
            <p className="mt-0.5 text-xs text-muted-foreground">Đang tính QuizzCoin...</p>
          ) : estimate ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {estimate.free_questions > 0
                ? `${estimate.free_questions} câu miễn phí · `
                : ""}
              {estimate.qc_cost.toLocaleString("vi-VN")} QC cho {estimate.requested_questions} câu
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Chưa có thông tin chi phí.</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:justify-end">
        {estimate ? (
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Số dư</p>
            <p
              className={`font-semibold ${
                estimate.sufficient_balance ? "text-on-surface" : "text-red-600"
              }`}
            >
              {estimate.balance.toLocaleString("vi-VN")} QC
            </p>
          </div>
        ) : null}
        <Button asChild type="button" variant="outline" size="sm">
          <Link href="/teacher/billing" target="_blank" rel="noreferrer">
            <Coins className="size-4" />
            Nạp QC
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function TeacherAIExamScreen({
  classId,
  initialJobId,
  initialScope,
}: TeacherAIExamScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const classroomId = useMemo(() => getClassroomId(classId), [classId]);
  const scope: AIExamScope =
    initialScope === "class" && classroomId !== null ? "class" : "system";
  const cancelHref =
    scope === "class" && classId ? `/teacher/classes/${classId}` : "/teacher/exams";
  const [formValues, setFormValues] =
    useState<GenerateAIExamFormState>(DEFAULT_GENERATE_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(initialJobId);
  const [jobSeed, setJobSeed] = useState<AIExamGenerationJobResponse | null>(
    null,
  );
  const [draftOverrides, setDraftOverrides] = useState<
    Record<number, AIQuestionDraftResponse>
  >({});
  const [saveValues, setSaveValues] =
    useState<SaveAIExamFormState>(DEFAULT_SAVE_FORM);
  const [generateMoreCount, setGenerateMoreCount] = useState(5);
  const [generateMoreInstructions, setGenerateMoreInstructions] = useState("");
  const [generateMoreQuestionTypes, setGenerateMoreQuestionTypes] = useState<
    AIExamQuestionType[]
  >([]);
  const [
    generateMoreQuestionTypeDistribution,
    setGenerateMoreQuestionTypeDistribution,
  ] = useState<AIExamQuestionTypeDistribution>({});
  const [generateMoreValuesJobId, setGenerateMoreValuesJobId] = useState<
    number | null
  >(null);
  const [recentDrafts, setRecentDrafts] = useState<RecentAIExamDraft[]>([]);
  const [saveValuesJobId, setSaveValuesJobId] = useState<number | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [toast, setToast] = useState<AIExamToastState | null>(null);
  const jobId = jobSeed?.id ?? activeJobId;

  const walletQuery = useQuery({
    queryKey: billingQueryKeys.wallet(),
    queryFn: getQCWallet,
    refetchOnWindowFocus: true,
  });

  const initialCostQuery = useQuery({
    queryKey: billingQueryKeys.estimate(formValues.question_count, "initial"),
    queryFn: () =>
      estimateAIQCCost({
        operation: "initial",
        question_count: formValues.question_count,
      }),
    enabled: jobId === null && formValues.question_count > 0,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });

  const moreCostQuery = useQuery({
    queryKey: billingQueryKeys.estimate(generateMoreCount, "generate_more"),
    queryFn: () =>
      estimateAIQCCost({
        operation: "generate_more",
        question_count: generateMoreCount,
      }),
    enabled: jobId !== null && generateMoreCount > 0,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });

  const jobQuery = useQuery({
    queryKey: jobId === null ? aiExamQueryKeys.job("missing") : aiExamQueryKeys.job(jobId),
    queryFn: async () => {
      if (jobId === null) {
        throw new Error("Thiếu mã phiên tạo đề AI.");
      }

      return getAIExamJob(jobId);
    },
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const latestJob = query.state.data as
        | AIExamGenerationJobResponse
        | undefined;
      const status = latestJob?.status ?? jobSeed?.status;

      return status && isJobRunning(status) ? 2500 : false;
    },
  });

  const job = useMemo(
    () => mergeDraftOverrides(jobQuery.data ?? jobSeed, draftOverrides),
    [draftOverrides, jobQuery.data, jobSeed],
  );
  const questionDrafts = job?.question_drafts;
  const drafts = useMemo(() => questionDrafts ?? [], [questionDrafts]);
  const sortedDrafts = useMemo(
    () => drafts.slice().sort((left, right) => left.order - right.order),
    [drafts],
  );
  const selectedDraft =
    sortedDrafts.find((draft) => draft.id === selectedDraftId) ??
    sortedDrafts[0] ??
    null;
  const approvedCount = drafts.filter((draft) => draft.is_approved).length;
  const generateMoreTypeTotal = getQuestionTypeDistributionTotal(
    generateMoreQuestionTypeDistribution,
    generateMoreQuestionTypes,
  );
  const hasValidGenerateMoreDistribution =
    generateMoreQuestionTypes.length > 0 &&
    generateMoreTypeTotal === generateMoreCount &&
    generateMoreQuestionTypes.every(
      (questionType) =>
        (generateMoreQuestionTypeDistribution[questionType] ?? 0) > 0,
    );
  const jobBusy = Boolean(job && isJobRunning(job.status));
  const jobFailed = Boolean(job && isJobFailed(job.status));
  const canSave =
    Boolean(job) &&
    !jobBusy &&
    !jobFailed &&
    approvedCount > 0 &&
    saveValues.title.trim().length > 0;

  useEffect(() => {
    setRecentDrafts(
      getScopedRecentAIExamDrafts(
        readRecentAIExamDrafts(),
        scope,
        classId,
      ),
    );
  }, [classId, scope]);

  useEffect(() => {
    if (!job) {
      return;
    }

    const nextDrafts = upsertRecentAIExamDraft(job, scope, classId);

    setRecentDrafts(getScopedRecentAIExamDrafts(nextDrafts, scope, classId));
  }, [classId, job, scope]);

  useEffect(() => {
    if (!job || generateMoreValuesJobId === job.id) {
      return;
    }

    const defaultQuestionType =
      job.question_types[0] ?? AI_QUESTION_TYPE_OPTIONS[0].value;
    const nextQuestionTypes = [defaultQuestionType];

    setGenerateMoreQuestionTypes(nextQuestionTypes);
    setGenerateMoreQuestionTypeDistribution(
      buildEvenQuestionTypeDistribution(
        generateMoreCount,
        nextQuestionTypes,
      ),
    );
    setGenerateMoreValuesJobId(job.id);
  }, [generateMoreCount, generateMoreValuesJobId, job]);

  useEffect(() => {
    if (!job || jobBusy || !["charged", "refunded"].includes(job.qc_status)) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: billingQueryKeys.wallet() });
  }, [job, jobBusy, queryClient]);

  useEffect(() => {
    if (!jobQuery.data || saveValuesJobId === jobQuery.data.id) {
      return;
    }

    setSaveValues(getDefaultSaveValues(jobQuery.data));
    setSaveValuesJobId(jobQuery.data.id);
  }, [jobQuery.data, saveValuesJobId]);

  useEffect(() => {
    if (!jobQuery.error || jobId === null) {
      return;
    }

    setToast({
      open: true,
      title: "Không thể mở lại đề AI",
      description: getApiErrorMessage(jobQuery.error),
      variant: "error",
    });
  }, [jobId, jobQuery.error]);

  useEffect(() => {
    if (sortedDrafts.length === 0) {
      setSelectedDraftId(null);
      return;
    }

    if (!sortedDrafts.some((draft) => draft.id === selectedDraftId)) {
      setSelectedDraftId(sortedDrafts[0].id);
    }
  }, [selectedDraftId, sortedDrafts]);

  const generateMutation = useMutation({
    mutationFn: ({
      idempotencyKey,
      payload,
    }: {
      idempotencyKey: string;
      payload: ReturnType<typeof buildGeneratePayload>;
    }) => generateAIExam(payload, idempotencyKey),
    onSuccess: (nextJob) => {
      setActiveJobId(nextJob.id);
      setJobSeed(nextJob);
      setDraftOverrides({});
      setSaveValues(getDefaultSaveValues(nextJob));
      setSaveValuesJobId(nextJob.id);
      router.replace(getAIExamPath(scope, classId, nextJob.id), {
        scroll: false,
      });
      setToast({
        open: true,
        title: "Đã gửi yêu cầu tạo đề",
        description: "AI đang xử lý, danh sách câu hỏi sẽ tự cập nhật.",
        variant: "success",
      });
      void queryClient.invalidateQueries({
        queryKey: billingQueryKeys.wallet(),
      });
    },
    onError: (error) => {
      const insufficientMessage = getInsufficientQCMessage(error);
      if (insufficientMessage) {
        setFormError(insufficientMessage);
      }
      setToast({
        open: true,
        title: insufficientMessage ? "Không đủ QuizzCoin" : "Không thể tạo đề bằng AI",
        description: insufficientMessage ?? getApiErrorMessage(error),
        variant: insufficientMessage ? "warning" : "error",
      });
      void queryClient.invalidateQueries({
        queryKey: billingQueryKeys.wallet(),
      });
    },
  });

  const generateMoreMutation = useMutation({
    mutationFn: async () => {
      if (!job) {
        throw new Error("Chưa có đề AI để tạo thêm câu hỏi.");
      }

      if (!hasValidGenerateMoreDistribution) {
        throw new Error(
          "Vui lòng chọn loại câu hỏi và phân bổ đủ số câu cần tạo thêm.",
        );
      }

      return generateMoreAIQuestions(job.id, {
        additional_instructions: generateMoreInstructions.trim(),
        count: generateMoreCount,
        question_type_distribution: generateMoreQuestionTypeDistribution,
        question_types: generateMoreQuestionTypes,
      }, createIdempotencyKey("generate-more"));
    },
    onSuccess: (nextJob) => {
      setJobSeed(nextJob);
      setDraftOverrides({});
      setGenerateMoreInstructions("");
      setToast({
        open: true,
        title: "Đã tạo thêm câu hỏi",
        description: "Danh sách câu hỏi nháp đã được cập nhật.",
        variant: "success",
      });
      void queryClient.invalidateQueries({
        queryKey: aiExamQueryKeys.job(nextJob.id),
      });
      void queryClient.invalidateQueries({
        queryKey: billingQueryKeys.wallet(),
      });
    },
    onError: (error) => {
      const insufficientMessage = getInsufficientQCMessage(error);
      setToast({
        open: true,
        title: insufficientMessage ? "Không đủ QuizzCoin" : "Không thể tạo thêm câu hỏi",
        description: insufficientMessage ?? getApiErrorMessage(error),
        variant: insufficientMessage ? "warning" : "error",
      });
      void queryClient.invalidateQueries({
        queryKey: billingQueryKeys.wallet(),
      });
    },
  });

  const approveAllMutation = useMutation({
    mutationFn: async () =>
      Promise.all(
        drafts
          .filter((draft) => !draft.is_approved)
          .map((draft) =>
            updateAIQuestionDraft(draft.id, { is_approved: true }),
          ),
      ),
    onSuccess: (updatedDrafts) => {
      setDraftOverrides((current) =>
        updatedDrafts.reduce(mergeUpdatedDraft, current),
      );
      setToast({
        open: true,
        title: "Đã duyệt các câu hỏi",
        variant: "success",
      });
    },
    onError: (error) => {
      setToast({
        open: true,
        title: "Không thể duyệt tất cả câu hỏi",
        description: getApiErrorMessage(error),
        variant: "error",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!job) {
        throw new Error("Chưa có đề AI để lưu.");
      }

      return saveAIExamToQuiz(job.id, {
        classroom_id: scope === "class" ? classroomId : null,
        description: saveValues.description.trim() || null,
        duration_minutes: saveValues.duration_minutes,
        is_active: true,
        is_published: saveValues.is_published,
        scope,
        title: saveValues.title.trim(),
      });
    },
    onSuccess: async (response) => {
      if (job) {
        const nextDrafts = removeRecentAIExamDraft(job.id);

        setRecentDrafts(getScopedRecentAIExamDrafts(nextDrafts, scope, classId));
      }

      await queryClient.invalidateQueries({
        queryKey: teacherExamQueryKeys.all,
      });

      if (scope === "class" && classId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["teacher-class-detail", classId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["teacher-classroom-exams", classId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["teacher-classroom-exam-detail", classId],
          }),
        ]);
      }

      setToast({
        open: true,
        title: "Đã lưu đề AI",
        description: response.message || "Đề thi đã được tạo thành công.",
        variant: "success",
      });
      router.push(cancelHref);
    },
    onError: (error) => {
      setToast({
        open: true,
        title: "Không thể lưu đề AI",
        description: getApiErrorMessage(error),
        variant: "error",
      });
    },
  });

  function openAIExamDraft(jobIdToOpen: number) {
    setActiveJobId(jobIdToOpen);
    setJobSeed(null);
    setDraftOverrides({});
    setFormError(null);
    router.replace(getAIExamPath(scope, classId, jobIdToOpen), {
      scroll: false,
    });
  }

  function handleGenerate() {
    const validationMessage = getGenerationValidationMessage(formValues);

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError(null);
    if (initialCostQuery.data && !initialCostQuery.data.sufficient_balance) {
      setFormError(
        `Cần ${initialCostQuery.data.qc_cost.toLocaleString("vi-VN")} QC nhưng ví chỉ còn ${initialCostQuery.data.balance.toLocaleString("vi-VN")} QC.`,
      );
      return;
    }

    generateMutation.mutate({
      idempotencyKey: createIdempotencyKey("initial"),
      payload: buildGeneratePayload(formValues),
    });
  }

  function updateGenerateMoreCount(nextValue: number) {
    const nextCount = Math.min(50, Math.max(1, nextValue || 1));

    setGenerateMoreCount(nextCount);
    setGenerateMoreQuestionTypeDistribution(
      buildEvenQuestionTypeDistribution(
        nextCount,
        generateMoreQuestionTypes,
      ),
    );
  }

  function toggleGenerateMoreQuestionType(questionType: AIExamQuestionType) {
    const selected = generateMoreQuestionTypes.includes(questionType);
    const nextQuestionTypes = selected
      ? generateMoreQuestionTypes.filter((item) => item !== questionType)
      : [...generateMoreQuestionTypes, questionType];

    setGenerateMoreQuestionTypes(nextQuestionTypes);
    setGenerateMoreQuestionTypeDistribution(
      buildEvenQuestionTypeDistribution(
        generateMoreCount,
        nextQuestionTypes,
      ),
    );
  }

  function updateGenerateMoreQuestionTypeCount(
    questionType: AIExamQuestionType,
    nextValue: number,
  ) {
    setGenerateMoreQuestionTypeDistribution((current) => ({
      ...current,
      [questionType]: Math.min(50, Math.max(1, nextValue || 1)),
    }));
  }

  function handleDraftUpdated(draft: AIQuestionDraftResponse) {
    setDraftOverrides((current) => mergeUpdatedDraft(current, draft));
    setToast({
      open: true,
      title: "Đã lưu câu hỏi nháp",
      variant: "success",
    });
  }

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          {scope === "class" ? "Quay lại lớp học" : "Quay lại danh sách đề thi"}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1E293B]">
              Tạo đề thi bằng AI
            </h1>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Sinh câu hỏi nháp bằng AI, rà soát từng câu rồi lưu thành đề thi
              trong hệ thống hiện tại.
            </p>
          </div>
          <Link
            href="/teacher/billing"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-outline/15 bg-white px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Coins className="size-4 text-primary" />
            {walletQuery.isLoading
              ? "Đang tải ví"
              : `${(walletQuery.data?.balance ?? 0).toLocaleString("vi-VN")} QC`}
          </Link>
        </div>

        <div
          className={
            job
              ? "space-y-6"
              : "grid max-w-7xl gap-5 xl:grid-cols-2"
          }
        >
          {!job ? (
            <div className="space-y-6">
              <QCCostSummary
                estimate={initialCostQuery.data}
                isLoading={initialCostQuery.isLoading}
              />
              <AIGenerateForm
                values={formValues}
                onValuesChange={setFormValues}
                onGenerate={handleGenerate}
                isGenerating={generateMutation.isPending}
                error={formError}
              />
            </div>
          ) : null}

          <div
            className={
              job
                ? "grid max-w-7xl gap-5 xl:grid-cols-2 xl:items-start"
                : "space-y-6"
            }
          >
            <Card
              size="sm"
              className="min-h-[410px] rounded-[10px] border border-[#DDE2EB] bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.08)]"
            >
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="font-display text-xl text-on-surface">
                      Kết quả AI
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed">
                      Theo dõi trạng thái tạo đề và duyệt câu hỏi nháp trước
                      khi lưu.
                    </CardDescription>
                  </div>
                  {job ? (
                    <Badge
                      variant={
                        jobFailed ? "destructive" : jobBusy ? "warning" : "success"
                      }
                    >
                      {getStatusLabel(job.status)}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {!job ? (
                  <div className="space-y-3">
                    {jobId !== null && jobQuery.isFetching ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/6 px-4 py-3 text-sm text-primary">
                        <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin" />
                        Đang mở lại đề AI đã tạo trước đó.
                      </div>
                    ) : null}

                    <div className="rounded-2xl border border-outline/10 bg-surface p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <History className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">
                              Đề AI gần đây
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              Mở lại các đề đã tạo nhưng chưa lưu thành bài thi.
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {recentDrafts.length} đề
                        </Badge>
                      </div>

                      {recentDrafts.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {recentDrafts.map((draft) => (
                            <div
                              key={draft.id}
                              className="flex flex-col gap-3 rounded-xl border border-outline/10 bg-surface-container-lowest p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-on-surface">
                                  {draft.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {draft.approvedCount}/{draft.questionCount} câu
                                  đã duyệt · {formatRecentAIExamDate(draft.updatedAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    isJobFailed(draft.status)
                                      ? "destructive"
                                      : isJobRunning(draft.status)
                                        ? "warning"
                                        : "success"
                                  }
                                >
                                  {getStatusLabel(draft.status)}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAIExamDraft(draft.id)}
                                >
                                  <FolderOpen className="size-4" />
                                  Mở lại
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-outline/25 bg-surface-container-lowest p-4 text-center">
                          <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="size-4" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-on-surface">
                            Chưa có đề AI gần đây
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Tạo đề xong, phiên AI sẽ được lưu ở đây để mở lại.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-outline/10 bg-surface p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Câu hỏi
                        </p>
                        <p className="mt-1.5 text-lg font-semibold text-on-surface">
                          {drafts.length}/{job.question_count}
                        </p>
                      </div>
                      <div className="rounded-xl border border-outline/10 bg-surface p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Đã duyệt
                        </p>
                        <p className="mt-1.5 text-lg font-semibold text-on-surface">
                          {approvedCount}
                        </p>
                      </div>
                    </div>

                    {jobBusy ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin" />
                        AI đang tạo nội dung. Màn hình sẽ tự cập nhật khi có
                        dữ liệu mới.
                      </div>
                    ) : null}

                    {jobFailed ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {job.error_message ||
                          "Quá trình tạo đề AI gặp lỗi. Vui lòng thử lại."}
                      </div>
                    ) : null}

                    <div className="grid gap-3 rounded-xl border border-outline/10 bg-surface p-3">
                      <div className="flex flex-col gap-2 border-b border-outline/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-on-surface">
                          <Coins className="size-4 text-primary" />
                          {moreCostQuery.isLoading
                            ? "Đang tính chi phí tạo thêm..."
                            : moreCostQuery.data
                              ? `${moreCostQuery.data.free_questions} câu miễn phí · ${moreCostQuery.data.qc_cost.toLocaleString("vi-VN")} QC`
                              : "Chưa có thông tin chi phí"}
                        </div>
                        <Link
                          href="/teacher/billing"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Số dư {(moreCostQuery.data?.balance ?? walletQuery.data?.balance ?? 0).toLocaleString("vi-VN")} QC
                        </Link>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-[132px_minmax(0,1fr)_auto] lg:items-end">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-on-surface">
                            Số câu thêm
                          </span>
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={generateMoreCount}
                            onChange={(event) =>
                              updateGenerateMoreCount(
                                Number(event.target.value),
                              )
                            }
                          />
                        </label>
                        <label className="min-w-0 flex-1 space-y-2">
                          <span className="text-sm font-medium text-on-surface">
                            Hướng dẫn thêm
                          </span>
                          <Textarea
                            value={generateMoreInstructions}
                            onChange={(event) =>
                              setGenerateMoreInstructions(event.target.value)
                            }
                            className="min-h-28"
                            placeholder="Ví dụ: thêm câu vận dụng cao, tránh trùng câu đã có"
                          />
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 px-4"
                          disabled={
                            jobBusy ||
                            generateMoreMutation.isPending ||
                            !hasValidGenerateMoreDistribution
                          }
                          onClick={() => generateMoreMutation.mutate()}
                        >
                          <Plus className="size-4" />
                          Tạo thêm
                        </Button>
                      </div>

                      <div className="space-y-3 border-t border-outline/10 pt-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-medium text-on-surface">
                            Loại câu tạo thêm
                          </p>
                          <span
                            className={
                              hasValidGenerateMoreDistribution
                                ? "text-xs font-medium text-muted-foreground"
                                : "text-xs font-medium text-amber-700"
                            }
                          >
                            {generateMoreTypeTotal}/{generateMoreCount} câu
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {AI_QUESTION_TYPE_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 rounded-md border border-outline/10 bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface"
                            >
                              <Checkbox
                                checked={generateMoreQuestionTypes.includes(
                                  option.value,
                                )}
                                onCheckedChange={() =>
                                  toggleGenerateMoreQuestionType(option.value)
                                }
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>

                        {generateMoreQuestionTypes.length > 1 ? (
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {generateMoreQuestionTypes.map((questionType) => {
                              const option = AI_QUESTION_TYPE_OPTIONS.find(
                                (item) => item.value === questionType,
                              );

                              return (
                                <label key={questionType} className="space-y-1.5">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {option?.label ?? questionType}
                                  </span>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={
                                      generateMoreQuestionTypeDistribution[
                                        questionType
                                      ] ?? 0
                                    }
                                    onChange={(event) =>
                                      updateGenerateMoreQuestionTypeCount(
                                        questionType,
                                        Number(event.target.value),
                                      )
                                    }
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : null}

                        {!hasValidGenerateMoreDistribution ? (
                          <p className="text-xs font-medium text-amber-700">
                            Chọn loại câu hỏi và phân bổ đủ {generateMoreCount} câu
                            trước khi tạo thêm.
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 border-t border-outline/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                          {approvedCount}/{drafts.length} câu đã được duyệt.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            drafts.length === approvedCount ||
                            approveAllMutation.isPending
                          }
                          onClick={() => approveAllMutation.mutate()}
                        >
                          <CheckCircle2 className="size-4" />
                          Duyệt tất cả
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {job ? (
              <AISavePanel
                values={saveValues}
                onValuesChange={setSaveValues}
                onSave={() => saveMutation.mutate()}
                isSaving={saveMutation.isPending}
                canSave={canSave}
                approvedCount={approvedCount}
                draftCount={drafts.length}
              />
            ) : null}
          </div>

          {drafts.length > 0 ? (
            <div className="grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,760px)_minmax(280px,360px)] xl:items-start xl:justify-start">
              {selectedDraft ? (
                <AIQuestionDraftCard
                  key={`${selectedDraft.id}-${selectedDraft.updated_at ?? "initial"}`}
                  draft={selectedDraft}
                  disabled={jobBusy}
                  onUpdated={handleDraftUpdated}
                />
              ) : null}

              <Card
                size="sm"
                className="rounded-[10px] border border-[#DDE2EB] bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.08)] xl:sticky xl:top-4"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-display text-lg text-on-surface">
                        Danh sách câu
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Chọn số để mở nhanh câu cần duyệt.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {selectedDraft
                        ? `${sortedDrafts.findIndex(
                            (draft) => draft.id === selectedDraft.id,
                          ) + 1}/${sortedDrafts.length}`
                        : `0/${sortedDrafts.length}`}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {sortedDrafts.map((draft, index) => {
                      const isSelected = draft.id === selectedDraft?.id;
                      const label = draft.order || index + 1;

                      return (
                        <button
                          key={draft.id}
                          type="button"
                          aria-current={isSelected ? "true" : undefined}
                          className={
                            isSelected
                              ? "flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_-16px_rgba(79,70,229,0.55)]"
                              : draft.is_approved
                                ? "flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                                : "flex size-10 items-center justify-center rounded-xl border border-outline/15 bg-surface text-sm font-semibold text-on-surface transition-colors hover:border-primary/25 hover:bg-primary/6"
                          }
                          onClick={() => setSelectedDraftId(draft.id)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-2 rounded-xl border border-outline/10 bg-surface p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Đã duyệt</span>
                      <span className="font-semibold text-on-surface">
                        {approvedCount}/{drafts.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-3 rounded-full bg-primary" />
                      Đang xem
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-3 rounded-full border border-emerald-200 bg-emerald-50" />
                      Đã duyệt
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) => {
            setToast((current) => (current ? { ...current, open } : current));
          }}
        >
          <div className="space-y-1 pr-8">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription>{toast.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}
