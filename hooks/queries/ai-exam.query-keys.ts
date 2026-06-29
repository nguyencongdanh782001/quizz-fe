export const aiExamQueryKeys = {
  all: ["ai-exams"] as const,
  job: (jobId: number | string) => ["ai-exams", "job", jobId] as const,
} as const;
