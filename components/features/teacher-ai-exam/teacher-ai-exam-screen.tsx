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
  LoaderCircle,
  Plus,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { client } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type {
  AIQCCostEstimateResponse,
  AIExamGenerationJobResponse,
  AIExamQuestionType,
  AIExamQuestionTypeDistribution,
  AIQuestionDraftResponse,
  ApiError,
} from "@/lib/api/types";
import { pickDefaultExamImage } from "@/lib/exam-default-images";
import { estimateAIQCCost, getQCWallet } from "@/services/billing.service";
import {
  generateAIExam,
  generateMoreAIQuestions,
  getAIExamJob,
  saveAIExamToQuiz,
  updateAIQuestionDraft,
} from "@/services/ai-exam.service";
import { AIGenerateForm } from "./ai-generate-form";
import {
  AIJobHistoryTable,
  type AIExamHistoryItem,
} from "./ai-job-history-table";
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

const AI_EXAM_RECENT_DRAFTS_KEY = "quizzvn.ai-exam.recent-drafts.v1";
const AI_EXAM_RECENT_DRAFT_LIMIT = 50;
const AI_EXAM_HISTORY_CHANGED_EVENT = "quizzvn.ai-exam.history-changed";

async function assignDefaultImageToSavedExam(
  examId: number | string,
): Promise<boolean> {
  try {
    await client.put(`/teacher/exams/${examId}`, {
      image_url: pickDefaultExamImage(),
    });

    return true;
  } catch (error) {
    /*
     * Đề AI đã được lưu thành công trước khi cập nhật ảnh. Không ném lỗi ở
     * đây để tránh người dùng bấm lưu lại và vô tình tạo thêm một đề trùng.
     */
    console.error("Failed to assign default image to AI exam", error);
    return false;
  }
}

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

function readAIExamHistoryItems(): AIExamHistoryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(AI_EXAM_RECENT_DRAFTS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue
          .filter(
            (item): item is AIExamHistoryItem =>
              typeof item?.id === "number" &&
              typeof item?.title === "string" &&
              (item?.scope === "system" || item?.scope === "class"),
          )
          .map((item) => ({
            ...item,
            approvedCount: Number(item.approvedCount ?? 0),
            questionCount: Number(item.questionCount ?? 0),
            qcCost: Number(item.qcCost ?? 0),
          }))
      : [];
  } catch {
    return [];
  }
}

function writeAIExamHistoryItems(drafts: AIExamHistoryItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AI_EXAM_RECENT_DRAFTS_KEY,
    JSON.stringify(drafts.slice(0, AI_EXAM_RECENT_DRAFT_LIMIT)),
  );
}

function getScopedAIExamHistoryItems(
  drafts: AIExamHistoryItem[],
  scope: AIExamScope,
  classId: string | null,
) {
  return drafts.filter(
    (draft) =>
      draft.scope === scope &&
      (scope === "system" || draft.classId === classId),
  );
}

function buildAIExamHistoryItem(
  job: AIExamGenerationJobResponse,
  scope: AIExamScope,
  classId: string | null,
): AIExamHistoryItem {
  const now = new Date().toISOString();

  return {
    approvedCount: job.question_drafts.filter((draft) => draft.is_approved)
      .length,
    classId,
    createdAt: job.created_at ?? now,
    grade: job.grade,
    id: job.id,
    qcCost: job.qc_charged || job.qc_reserved || 0,
    questionCount: job.question_count,
    scope,
    status: job.status,
    subject: job.subject,
    title: job.title?.trim() || `${job.subject} - ${job.topic}`,
    topic: job.topic,
    updatedAt: job.updated_at ?? now,
  };
}

function upsertAIExamHistoryItem(
  job: AIExamGenerationJobResponse,
  scope: AIExamScope,
  classId: string | null,
) {
  const draft = buildAIExamHistoryItem(job, scope, classId);
  const drafts = readAIExamHistoryItems().filter((item) => item.id !== job.id);
  const nextDrafts = [draft, ...drafts].slice(0, AI_EXAM_RECENT_DRAFT_LIMIT);

  writeAIExamHistoryItems(nextDrafts);

  return nextDrafts;
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
  balance,
  estimate,
  isLoading,
}: {
  balance?: number;
  estimate?: AIQCCostEstimateResponse;
  isLoading: boolean;
}) {
  const remainingQC = estimate?.balance ?? balance ?? 0;
  const usageQC = estimate?.qc_cost ?? 0;

  return (
    <TooltipProvider>
      <div className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-[#DDE2EB] bg-white px-3 py-2 text-xs shadow-[0_1px_2px_rgba(30,41,59,0.04)]">
        <span className="font-semibold text-[#334155]">Ví sử dụng:</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="cursor-help rounded-[5px] bg-[#EEF2FF] px-2 py-1 font-bold text-[#4F62F2] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#4F62F2]"
            >
              {(isLoading ? 0 : remainingQC).toLocaleString("vi-VN")} QC Token
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            Số lượng còn lại
          </TooltipContent>
        </Tooltip>

        <span className="h-4 w-px bg-[#DDE2EB]" />

        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="cursor-help font-bold text-[#1E293B] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#4F62F2]"
            >
              {isLoading
                ? "Đang tính..."
                : `${usageQC.toLocaleString("vi-VN")} QC`}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            QC dự kiến dùng cho lần tạo đề này
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function collapseTeacherSidebar() {
  const sidebar = document.querySelector<HTMLElement>(
    '[data-sidebar="sidebar"], [data-slot="sidebar"], aside',
  );

  if (!sidebar || sidebar.getBoundingClientRect().width < 140) {
    return;
  }

  const explicitTrigger = document.querySelector<HTMLButtonElement>(
    '[data-sidebar="trigger"], button[aria-label*="thu gọn" i], button[aria-label*="collapse" i], button[title*="thu gọn" i], button[title*="collapse" i]',
  );

  if (explicitTrigger) {
    explicitTrigger.click();
    return;
  }

  const sidebarRect = sidebar.getBoundingClientRect();
  const nearbyTrigger = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button"),
  ).find((button) => {
    const rect = button.getBoundingClientRect();
    const nearSidebarEdge =
      rect.left >= sidebarRect.right - 36 &&
      rect.left <= sidebarRect.right + 36;
    const compactButton = rect.width <= 56 && rect.height <= 56;

    return nearSidebarEdge && compactButton;
  });

  nearbyTrigger?.click();
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
    scope === "class" && classId
      ? `/teacher/classes/${classId}`
      : "/teacher/exams";

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      collapseTeacherSidebar();
    });
    const retryTimeoutId = window.setTimeout(collapseTeacherSidebar, 250);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(retryTimeoutId);
    };
  }, []);
  const [formValues, setFormValues] = useState<GenerateAIExamFormState>(
    DEFAULT_GENERATE_FORM,
  );
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
  const [recentDrafts, setRecentDrafts] = useState<AIExamHistoryItem[]>([]);
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
    queryKey:
      jobId === null
        ? aiExamQueryKeys.job("missing")
        : aiExamQueryKeys.job(jobId),
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
    function syncHistory() {
      setRecentDrafts(
        getScopedAIExamHistoryItems(readAIExamHistoryItems(), scope, classId),
      );
    }

    const timeoutId = window.setTimeout(syncHistory, 0);
    window.addEventListener("storage", syncHistory);
    window.addEventListener(AI_EXAM_HISTORY_CHANGED_EVENT, syncHistory);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener(AI_EXAM_HISTORY_CHANGED_EVENT, syncHistory);
    };
  }, [classId, scope]);

  useEffect(() => {
    if (!job) {
      return;
    }

    upsertAIExamHistoryItem(job, scope, classId);
    window.dispatchEvent(new Event(AI_EXAM_HISTORY_CHANGED_EVENT));
  }, [classId, job, scope]);

  useEffect(() => {
    if (!job || generateMoreValuesJobId === job.id) {
      return;
    }

    const defaultQuestionType =
      job.question_types[0] ?? AI_QUESTION_TYPE_OPTIONS[0].value;
    const nextQuestionTypes = [defaultQuestionType];
    const timeoutId = window.setTimeout(() => {
      setGenerateMoreQuestionTypes(nextQuestionTypes);
      setGenerateMoreQuestionTypeDistribution(
        buildEvenQuestionTypeDistribution(generateMoreCount, nextQuestionTypes),
      );
      setGenerateMoreValuesJobId(job.id);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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

    const nextJob = jobQuery.data;
    const timeoutId = window.setTimeout(() => {
      setSaveValues(getDefaultSaveValues(nextJob));
      setSaveValuesJobId(nextJob.id);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [jobQuery.data, saveValuesJobId]);

  useEffect(() => {
    if (!jobQuery.error || jobId === null) {
      return;
    }

    const error = jobQuery.error;
    const timeoutId = window.setTimeout(() => {
      setToast({
        open: true,
        title: "Không thể mở lại đề AI",
        description: getApiErrorMessage(error),
        variant: "error",
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [jobId, jobQuery.error]);

  useEffect(() => {
    const nextSelectedDraftId =
      sortedDrafts.length === 0
        ? null
        : sortedDrafts.some((draft) => draft.id === selectedDraftId)
          ? selectedDraftId
          : sortedDrafts[0].id;

    if (nextSelectedDraftId === selectedDraftId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedDraftId(nextSelectedDraftId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
        title: insufficientMessage
          ? "Không đủ QuizzCoin"
          : "Không thể tạo đề bằng AI",
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

      return generateMoreAIQuestions(
        job.id,
        {
          additional_instructions: generateMoreInstructions.trim(),
          count: generateMoreCount,
          question_type_distribution: generateMoreQuestionTypeDistribution,
          question_types: generateMoreQuestionTypes,
        },
        createIdempotencyKey("generate-more"),
      );
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
        title: insufficientMessage
          ? "Không đủ QuizzCoin"
          : "Không thể tạo thêm câu hỏi",
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

      const response = await saveAIExamToQuiz(job.id, {
        classroom_id: scope === "class" ? classroomId : null,
        description: saveValues.description.trim() || null,
        duration_minutes: saveValues.duration_minutes,
        is_active: true,
        is_published: saveValues.is_published,
        scope,
        title: saveValues.title.trim(),
      });

      /*
       * Endpoint save-to-quiz hiện chưa nhận image_url. Sau khi Backend tạo
       * đề và trả exam_id, cập nhật ảnh đại diện qua endpoint chỉnh sửa đề.
       * Cách này dùng cùng pickDefaultExamImage với hai luồng tạo đề còn lại.
       */
      const imageAssigned = await assignDefaultImageToSavedExam(
        response.exam_id,
      );

      return {
        ...response,
        imageAssigned,
      };
    },
    onSuccess: async (response) => {
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
        title: response.imageAssigned
          ? "Đã lưu đề AI"
          : "Đã lưu đề AI, chưa cập nhật được ảnh",
        description: response.imageAssigned
          ? response.message || "Đề thi đã được tạo thành công."
          : "Đề đã được lưu nhưng ảnh đại diện chưa cập nhật. Bạn có thể mở phần chỉnh sửa để chọn lại ảnh.",
        variant: response.imageAssigned ? "success" : "warning",
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

  function refreshAIHistory() {
    setRecentDrafts(
      getScopedAIExamHistoryItems(readAIExamHistoryItems(), scope, classId),
    );
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
      buildEvenQuestionTypeDistribution(nextCount, generateMoreQuestionTypes),
    );
  }

  function toggleGenerateMoreQuestionType(questionType: AIExamQuestionType) {
    const selected = generateMoreQuestionTypes.includes(questionType);
    const nextQuestionTypes = selected
      ? generateMoreQuestionTypes.filter((item) => item !== questionType)
      : [...generateMoreQuestionTypes, questionType];

    setGenerateMoreQuestionTypes(nextQuestionTypes);
    setGenerateMoreQuestionTypeDistribution(
      buildEvenQuestionTypeDistribution(generateMoreCount, nextQuestionTypes),
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
      <div className="mx-auto w-full max-w-none space-y-3">
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-on-surface"
        >
          <ArrowLeft className="size-4" />
          {scope === "class" ? "Quay lại lớp học" : "Quay lại danh sách đề thi"}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <header className="min-w-0">
            <h1 className="text-lg font-bold text-[#1E293B]">Tạo đề bằng AI</h1>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Nhập bối cảnh đề thi, cấu hình số lượng câu hỏi và theo dõi kết
              quả AI trước khi lưu thành đề thi.
            </p>
          </header>

          {!job ? (
            <QCCostSummary
              balance={walletQuery.data?.balance}
              estimate={initialCostQuery.data}
              isLoading={initialCostQuery.isLoading}
            />
          ) : null}
        </div>

        {!job ? (
          <>
            <AIGenerateForm
              values={formValues}
              onValuesChange={setFormValues}
              onGenerate={handleGenerate}
              isGenerating={generateMutation.isPending}
              error={formError}
            />

            <AIJobHistoryTable
              items={recentDrafts}
              onOpen={openAIExamDraft}
              onRefresh={refreshAIHistory}
            />
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid max-w-7xl gap-5 xl:grid-cols-2 xl:items-start">
              <Card
                size="sm"
                className="min-h-[410px] rounded-[8px] border border-[#DDE2EB] bg-surface-container-lowest shadow-[0_1px_3px_rgba(30,41,59,0.08)]"
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
                    <Badge
                      variant={
                        jobFailed
                          ? "destructive"
                          : jobBusy
                            ? "warning"
                            : "success"
                      }
                    >
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
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
                      AI đang tạo nội dung. Màn hình sẽ tự cập nhật khi có dữ
                      liệu mới.
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
                        Số dư{" "}
                        {(
                          moreCostQuery.data?.balance ??
                          walletQuery.data?.balance ??
                          0
                        ).toLocaleString("vi-VN")}{" "}
                        QC
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
                            updateGenerateMoreCount(Number(event.target.value))
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
                          Chọn loại câu hỏi và phân bổ đủ {generateMoreCount}{" "}
                          câu trước khi tạo thêm.
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
                </CardContent>
              </Card>

              <AISavePanel
                values={saveValues}
                onValuesChange={setSaveValues}
                onSave={() => saveMutation.mutate()}
                isSaving={saveMutation.isPending}
                canSave={canSave}
                approvedCount={approvedCount}
                draftCount={drafts.length}
              />
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
                          ? `${
                              sortedDrafts.findIndex(
                                (draft) => draft.id === selectedDraft.id,
                              ) + 1
                            }/${sortedDrafts.length}`
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
        )}
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
