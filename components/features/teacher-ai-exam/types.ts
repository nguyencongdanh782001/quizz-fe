import type {
  AIExamDifficulty,
  AIExamQuestionType,
  AIExamQuestionTypeDistribution,
} from "@/lib/api/types";

export type AIExamScope = "system" | "class";

export interface GenerateAIExamFormState {
  additional_instructions: string;
  difficulty_distribution: Record<AIExamDifficulty, number>;
  duration_minutes: number;
  exam_context: string;
  language: string;
  question_count: number;
  question_type_distribution: AIExamQuestionTypeDistribution;
  question_types: AIExamQuestionType[];
}

export interface SaveAIExamFormState {
  description: string;
  duration_minutes: number;
  is_published: boolean;
  title: string;
}

export type AIExamToastVariant = "success" | "error" | "warning";

export interface AIExamToastState {
  description?: string;
  open: boolean;
  title: string;
  variant: AIExamToastVariant;
}
