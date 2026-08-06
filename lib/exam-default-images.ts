export const DEFAULT_EXAM_IMAGES = [
  "/image/hình tạo đề 1.jpeg",
  "/image/hình tạo đề 2.jpeg",
  "/image/hình tạo đề 3.jpeg",
  "/image/hình tạo đề 4.jpeg",
] as const;

export function pickDefaultExamImage(): string {
  const index = Math.floor(Math.random() * DEFAULT_EXAM_IMAGES.length);
  return DEFAULT_EXAM_IMAGES[index];
}
