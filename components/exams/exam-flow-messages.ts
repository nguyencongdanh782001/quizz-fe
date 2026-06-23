import { APP_MESSAGES } from "@/lib/app-messages";
import type { TeacherExamQuestionType } from "@/types/exam";

export const EXAM_FLOW_MESSAGES = {
  titles: {
    create: "Tạo đề thi",
    edit: "Chỉnh sửa đề thi",
    management: "Quản lý đề thi",
  },
  buttons: {
    save: "Lưu đề thi",
    update: "Cập nhật đề thi",
    publish: "Xuất bản",
    hide: "Ẩn đề thi",
    addQuestion: "Thêm câu hỏi",
    deleteQuestion: "Xóa câu hỏi",
    addOption: "Thêm đáp án",
    deleteOption: "Xóa đáp án",
    back: "Quay lại",
    cancel: "Hủy",
  },
  labels: {
    title: "Tên đề thi",
    description: "Mô tả",
    image: "Ảnh đề thi",
    scope: "Phạm vi",
    classroom: "Lớp học",
    duration: "Thời gian làm bài",
    activeStatus: "Trạng thái hoạt động",
    published: "Xuất bản",
    question: "Câu hỏi",
    answer: "Đáp án",
    points: "Điểm",
    questionType: "Loại câu hỏi",
    acceptedAnswers: "Đáp án chấp nhận",
  },
  questionTypes: {
    single: "Một đáp án",
    text: "Tự luận",
  },
  placeholders: {
    title: "Nhập tên đề thi",
    description: "Nhập mô tả đề thi",
    image: "Nhập đường dẫn ảnh đề thi",
    question: "Nhập nội dung câu hỏi",
    option: "Nhập nội dung đáp án",
    acceptedAnswer: "Nhập đáp án chấp nhận",
  },
  loading: {
    detail: "Đang tải dữ liệu đề thi...",
    update: "Đang cập nhật đề thi...",
    save: "Đang lưu dữ liệu...",
  },
  success: {
    update: APP_MESSAGES.UPDATE_EXAM_SUCCESS,
    create: APP_MESSAGES.CREATE_EXAM_SUCCESS,
    deleteQuestion: "Xóa câu hỏi thành công",
  },
  errors: {
    loadDetail: APP_MESSAGES.LOAD_EXAM_FAILED,
    generic: APP_MESSAGES.NETWORK_ERROR,
    update: APP_MESSAGES.UPDATE_EXAM_FAILED,
    notFound: "Không tìm thấy bài thi",
  },
  validation: {
    examTitleRequired: "Tên đề thi là bắt buộc",
    durationGreaterThanZero: "Thời gian làm bài phải lớn hơn 0",
    examMustHaveQuestions: "Đề thi phải có ít nhất 1 câu hỏi",
    questionPromptRequired: "Nội dung câu hỏi là bắt buộc",
    pointsGreaterThanZero: "Điểm số phải lớn hơn 0",
    minOptions: "Câu hỏi phải có ít nhất 2 đáp án",
    minCorrectOptions: "Câu hỏi phải có ít nhất 1 đáp án đúng",
    singleQuestionOnlyOneCorrect:
      "Câu hỏi một đáp án chỉ được có 1 đáp án đúng",
    minAcceptedAnswers: "Phải có ít nhất 1 đáp án chấp nhận",
    duplicateOptionKeys: "Ký hiệu đáp án không được trùng lặp",
  },
  confirmations: {
    deleteQuestion: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
    leavePage:
      "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?",
  },
  empty: {
    noQuestions: "Chưa có câu hỏi nào",
    startCreate: 'Nhấn "Thêm câu hỏi" để bắt đầu tạo đề thi',
  },
  states: {
    public: "Công khai",
    private: "Riêng tư",
    active: "Đang hoạt động",
    hidden: "Tạm ẩn",
    system: "Hệ thống",
    classroom: "Lớp học",
    noClassroom: "Chưa gắn lớp học",
  },
} as const;

export function getExamScopeLabel(scope: string | null | undefined): string {
  const normalizedScope = scope?.trim().toLowerCase();

  if (normalizedScope === "system") {
    return EXAM_FLOW_MESSAGES.states.system;
  }

  if (
    !normalizedScope ||
    normalizedScope === "classroom" ||
    normalizedScope === "class"
  ) {
    return EXAM_FLOW_MESSAGES.states.classroom;
  }

  return scope?.trim() || EXAM_FLOW_MESSAGES.states.classroom;
}

export function getExamClassroomLabel(classroomId: number | null): string {
  if (classroomId === null) {
    return EXAM_FLOW_MESSAGES.states.noClassroom;
  }

  return `Mã lớp ${classroomId}`;
}

export function getTeacherExamQuestionTypeLabel(
  questionType: TeacherExamQuestionType,
): string {
  if (questionType === "text") {
    return EXAM_FLOW_MESSAGES.questionTypes.text;
  }

  return EXAM_FLOW_MESSAGES.questionTypes.single;
}
