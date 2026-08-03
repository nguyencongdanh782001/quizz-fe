# QuizzVN UI/UX - API backend còn thiếu

Tài liệu này đối chiếu giao diện mới trong `quizzvn-ui-ux-main.zip` với API hiện có. Frontend không tạo dữ liệu giả cho các khối chưa có nguồn dữ liệu.

## Phần đã tích hợp được

| Khu vực | API hiện có |
|---|---|
| Lớp học sinh | `GET /student/classes`, `POST /student/classes/join` |
| Bài thi và tài liệu trong lớp | `GET /student/classes/{class_id}/exams`, `GET /student/classes/{class_id}/documents` |
| Đề thi và tài liệu hệ thống | `GET /student/system/exams`, `GET /student/system/documents` |
| Kết quả học sinh | `GET /student/results`, `GET /student/system/results`, `GET /student/classes/{class_id}/results` |
| Quản lý lớp giáo viên | `/teacher/classes` và các API con students/exams/documents/results |
| Kho đề và tài liệu giáo viên | `/teacher/system/exams`, `/teacher/system/documents` |
| AI và QuizzCoin | Các endpoint AI job, wallet, package, order và transaction hiện có |

## API ưu tiên cần bổ sung

### 1. Trung tâm thông báo

Giao diện có chuông thông báo nhưng OpenAPI chưa có nhóm `/notifications`.

Đề xuất:

```http
GET   /notifications?limit=20&cursor=...
GET   /notifications/unread-count
PATCH /notifications/{notification_id}/read
PATCH /notifications/read-all
```

Mỗi item tối thiểu cần: `id`, `title`, `message`, `type`, `target_url`, `is_read`, `created_at`.

### 2. Truy cập gần đây

Hiện frontend chỉ có thể dùng lịch sử nộp bài làm dữ liệu gần đúng. Prototype cần lịch sử mở đề, tài liệu và lớp học.

```http
GET /student/recent-activities?type=exam,document,classroom&limit=30
POST /student/recent-activities
```

Mỗi item cần: `resource_type`, `resource_id`, `title`, `subtitle`, `target_url`, `accessed_at`.

### 3. Phân tích học tập của học sinh

Prototype chia kết quả thành Ôn thi, Thi thử, Bài kiểm tra và Kỳ thi, đồng thời hiển thị thời gian học. Kết quả hiện tại chưa có trường phân loại ổn định.

```http
GET /student/learning-analytics?from=...&to=...
```

Response nên có:

```json
{
  "study_minutes": 0,
  "practice_attempts": 0,
  "mock_exam_attempts": 0,
  "classroom_test_attempts": 0,
  "contest_attempts": 0,
  "average_score_percent": 0,
  "streak_days": 0
}
```

Đồng thời thêm `activity_type` cho item kết quả với enum `practice | mock | classroom_test | contest`.

### 4. Tổng hợp giao bài tập của giáo viên

Frontend hiện phải tải danh sách lớp rồi gọi bài thi từng lớp. Cách này tạo N+1 request và khó phân trang.

```http
GET /teacher/assignments?class_id=&status=&search=&page=&limit=
```

Mỗi assignment cần: thông tin đề, lớp, lịch mở/đóng, tổng học sinh, đã nộp, chưa nộp, đã chấm và cần chấm.

### 5. Hàng chờ chấm bài

```http
GET /teacher/grading-queue?class_id=&exam_id=&status=pending
```

Mỗi item cần: `attempt_id`, `student`, `classroom`, `exam`, `submitted_at`, `manual_questions_count`, `graded_questions_count`.

### 6. Giám sát bài thi đang diễn ra

Prototype có trạng thái học sinh online và tiến độ làm bài nhưng backend chưa có endpoint tổng hợp/realtime.

```http
GET /teacher/exams/{exam_id}/live-status
WS  /teacher/exams/{exam_id}/live
```

Trả về số đã bắt đầu, đang làm, đã nộp, mất kết nối và tiến độ từng học sinh. WebSocket là lựa chọn phù hợp cho cập nhật liên tục.

### 7. Kho học liệu dùng chung

API hiện tại hỗ trợ kho riêng của giáo viên. Nếu “Kho học liệu” trong prototype là kho cộng đồng, backend cần quyền truy cập và metadata riêng.

```http
GET  /repository/exams?subject=&grade=&level=&search=&page=
GET  /repository/documents?subject=&grade=&type=&search=&page=
POST /repository/exams/{exam_id}/clone
POST /repository/documents/{document_id}/save
```

Metadata nên gồm `subject`, `grade`, `level`, `author`, `usage_count`, `rating`, `visibility` và `updated_at`.

## Thứ tự triển khai backend đề xuất

1. Notifications và unread count.
2. Teacher assignments aggregate để bỏ N+1 request.
3. Student activity type và learning analytics.
4. Grading queue.
5. Recent activities.
6. Live exam monitoring.
7. Shared repository nếu sản phẩm xác nhận có tính năng cộng đồng.
