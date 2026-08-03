# QuizzVN Frontend - Component Breakdown cho UI/UX

> Cập nhật: 22/07/2026  
> Phạm vi: frontend Next.js trong repository `quizz-fe`  
> Mục tiêu: làm bản đồ hiện trạng để thiết kế, kiểm tra và chuẩn hóa UI/UX.

## 1. Tổng quan kiến trúc

Frontend đang sử dụng Next.js App Router. Ứng dụng được chia thành ba vùng trải nghiệm chính:

1. Public và Authentication.
2. Student workspace.
3. Teacher workspace.

Teacher và Student sử dụng chung một `AppShell`. Mỗi route render một page hoặc screen component; screen gọi React Query hooks hoặc service để lấy dữ liệu từ backend.

```mermaid
flowchart TD
    Root[Root Layout] --> Providers[AppProviders]

    Providers --> Public[Public Layout]
    Providers --> TeacherLayout[Teacher Layout]
    Providers --> StudentLayout[Student Layout]

    Public --> Landing[Landing]
    Public --> Auth[Authentication]

    TeacherLayout --> TeacherGuard[Session và Role Guard]
    StudentLayout --> StudentGuard[Session và Role Guard]

    TeacherGuard --> Shell[AppShell]
    StudentGuard --> Shell

    Shell --> Sidebar[Sidebar]
    Shell --> Header[Header và Breadcrumb]
    Shell --> UserMenu[User Menu]
    Shell --> MobileDrawer[Mobile Drawer]
    Shell --> PageContent[Page Content]

    PageContent --> Screen[Feature Screen]
    Screen --> Shared[Shared Components]
    Screen --> Domain[Domain Components]
    Shared --> UI[UI Primitives]
    Domain --> UI

    Screen --> Query[React Query Hooks]
    Query --> Services[Services]
    Services --> APIClient[API Client]
    APIClient --> Backend[Backend API]
```

## 2. Phân tầng component

| Tầng | Vị trí | Trách nhiệm |
| --- | --- | --- |
| Root | `app/layout.tsx` | Font, metadata, CSS toàn cục và provider |
| Provider | `app/providers.tsx` | React Query, auth event và analytics |
| Role layout | `app/(teacher)/layout.tsx`, `app/(student)/layout.tsx` | Kiểm tra session, onboarding và role |
| Application shell | `components/shared/app-shell.tsx` | Sidebar, header, breadcrumb, user menu, mobile navigation |
| Route entry | `app/**/page.tsx` | Điểm vào URL, đọc route params và search params |
| Feature screen | `components/features/*`, một số file trong route | Điều phối toàn bộ một nghiệp vụ hoặc màn hình |
| Domain component | `components/exams/*`, `components/features/*` | UI dành riêng cho bài thi, tài liệu, lớp học, AI và billing |
| Shared composition | `components/shared/*` | Hero, stat, panel, empty state và breadcrumb helpers |
| UI primitive | `components/ui/*` | Button, input, select, dialog, badge, toast và các control cơ bản |
| State và query | `hooks/*`, `hooks/queries/*` | Query key, fetch state, cache và mutation |
| Data access | `services/*`, `lib/api/*` | Gọi API, xử lý token và lỗi HTTP |
| Mapper và utility | `lib/*` | Chuyển đổi payload, format và business helper phía frontend |
| Shared types | `types/*`, `lib/api/types.ts` | Contract dữ liệu dùng trong frontend |

## 3. AppShell hiện tại

`AppShell` là source of truth cho toàn bộ khu vực đã đăng nhập của Teacher và Student.

```mermaid
flowchart TD
    AppShell[AppShell] --> Background[Background Layers]
    Background --> Grid[App Grid]
    Background --> Glow[App Glow]

    AppShell --> Desktop[Desktop Layout]
    Desktop --> Aside[Desktop Sidebar]
    Aside --> Logo[Logo]
    Aside --> Intro[Role Introduction]
    Aside --> Navigation[Role Navigation]

    Desktop --> Workspace[Workspace]
    Workspace --> Header[Sticky Header]
    Header --> Breadcrumb[Breadcrumb]
    Header --> PageLabel[Page Label và Role Badge]
    Header --> Avatar[User Avatar Menu]
    Workspace --> Main[Main Content]

    AppShell --> Mobile[Mobile Layout]
    Mobile --> MenuButton[Menu Button]
    Mobile --> Drawer[Sidebar Drawer]
    Mobile --> Overlay[Drawer Overlay]
```

### Teacher navigation

```text
Teacher
├── Tổng quan             /teacher
├── Lớp học               /teacher/classes
├── Bài thi               /teacher/exams
├── QuizzCoin             /teacher/billing
├── Tài liệu              /teacher/documents
└── Hồ sơ                 /teacher/profile
```

### Student navigation

```text
Student
├── Trang chủ             /student
├── Đề thi                /student/exams
├── Lớp học               /student/classes
├── Kết quả               /student/results
├── Tài liệu              /student/materials
└── Hồ sơ                 /student/profile
```

## 4. Public và Authentication

```mermaid
flowchart LR
    Public[Public Layout] --> Home[Landing Page]
    Public --> Login[Đăng nhập]
    Public --> Register[Đăng ký]
    Public --> Forgot[Quên mật khẩu]
    Public --> Role[Chọn vai trò]
    Public --> Verify[OTP xác thực email]
    Public --> Callback[OAuth Callback]

    Home --> LandingHeader
    Home --> LandingHero
    Home --> LandingStats
    Home --> LandingFeatures
    Home --> DashboardPreview
    Home --> Activity
    Home --> Testimonials
    Home --> CTA
    Home --> LandingFooter

    Login --> AuthCard
    Login --> LoginForm
    Register --> AuthCard
    Register --> RegisterForm
    Verify --> AuthCard
    Verify --> EmailVerificationForm
```

### Component chính

- `features/auth/components/AuthCard.tsx`
- `features/auth/components/LoginForm.tsx`
- `features/auth/components/RegisterForm.tsx`
- `features/auth/components/RoleSelectionForm.tsx`
- `features/auth/components/EmailVerificationForm.tsx`
- `features/auth/components/AuthCallbackRedirect.tsx`
- `components/features/landing/*`

## 5. Teacher workspace

```mermaid
flowchart TD
    Teacher[Teacher AppShell] --> Dashboard[Tổng quan]
    Teacher --> Classes[Lớp học]
    Teacher --> Exams[Bài thi]
    Teacher --> AI[Tạo đề bằng AI]
    Teacher --> Billing[QuizzCoin]
    Teacher --> Documents[Tài liệu]
    Teacher --> Profile[Hồ sơ]

    Classes --> ClassList[Danh sách lớp]
    Classes --> ClassCreate[Tạo lớp]
    Classes --> ClassDetail[Chi tiết lớp]

    ClassDetail --> ClassHeader[Class Header]
    ClassDetail --> ClassTabs[Class Tabs]
    ClassTabs --> StudentsTab[Học sinh]
    ClassTabs --> ExamsTab[Bài thi]
    ClassTabs --> DocumentsTab[Tài liệu]

    Exams --> ExamList[Danh sách đề]
    Exams --> ExamCreate[Tạo đề hệ thống]
    Exams --> ExamEdit[Chỉnh sửa đề]

    ExamsTab --> ClassExamCreate[Tạo đề trong lớp]
    ExamsTab --> Results[Kết quả bài thi]
    Results --> AttemptDetail[Chi tiết lượt làm]

    AI --> GenerateForm[Form cấu hình]
    AI --> JobStatus[Trạng thái AI Job]
    AI --> DraftList[Danh sách câu nháp]
    AI --> DraftEditor[Chỉnh sửa và duyệt]
    AI --> SavePanel[Lưu thành đề thi]

    Billing --> Wallet[Ví QC]
    Billing --> Plans[Gói QuizzCoin]
    Billing --> Payment[Đơn thanh toán]
    Billing --> Transactions[Lịch sử giao dịch]
```

### 5.1. Dashboard giáo viên

```text
Teacher Dashboard
├── Welcome Hero
├── Quick Actions
│   ├── Tạo lớp
│   ├── Tạo đề
│   └── Đăng tài liệu
├── Statistics
├── Lớp học gần đây
├── Bài thi gần đây
└── Tài liệu gần đây
```

### 5.2. Quản lý lớp học

```text
Class List
├── Page heading
├── Create class action
├── Loading / Error / Empty states
└── Class rows hoặc cards
    ├── Class information
    ├── Student count
    ├── Exam count
    ├── Document count
    ├── Join code
    └── Row actions

Class Detail
├── Back navigation
├── ClassHeader
│   ├── Class information
│   ├── Add document
│   ├── Edit classroom dialog
│   └── Delete classroom dialog
└── ClassTabs
    ├── StudentsTab
    │   ├── StudentTable
    │   └── RemoveStudentDialog
    ├── ExamsTab
    │   └── ExamTable
    └── DocumentsTab
        └── DocumentTable
```

### 5.3. Tạo và chỉnh sửa đề thi

`ExamForm` là component điều phối chung cho đề hệ thống và đề trong lớp.

```mermaid
flowchart LR
    Entry[Create hoặc Edit Screen] --> Import[Import Dialog]
    Entry --> Selector[System Exam Selector]
    Entry --> Form[ExamForm]

    Form --> Step1[Thông tin đề]
    Form --> Step2[Xây dựng câu hỏi]
    Form --> Step3[Xem lại]

    Step1 --> General[Tiêu đề, mô tả, lớp, thời gian]
    Step1 --> Availability[Ngày mở, đóng và trạng thái]
    Step1 --> Cover[Ảnh đại diện]

    Step2 --> QuestionItem[Question Item]
    QuestionItem --> Type[Loại câu hỏi]
    QuestionItem --> Difficulty[Độ khó và điểm]
    QuestionItem --> Choice[Choice Options]
    QuestionItem --> TextAnswer[Text Answer]
    QuestionItem --> Image[Question Image]

    Step3 --> Summary[Exam Summary]
    Step3 --> QuestionReview[Question Review]
    Step3 --> Submit[Lưu hoặc cập nhật]
```

Các loại câu hỏi frontend đang xử lý:

1. Trắc nghiệm.
2. Đúng hoặc sai.
3. Trả lời ngắn.
4. Tự luận.

### 5.4. Tạo đề bằng AI

```mermaid
stateDiagram-v2
    [*] --> Configuration
    Configuration --> Validating: Bấm tạo đề
    Validating --> CreatingJob: Form hợp lệ
    Validating --> Configuration: Form không hợp lệ
    CreatingJob --> Polling: Backend tạo job
    Polling --> Reviewing: Job hoàn tất
    Polling --> Failed: Timeout hoặc AI error
    Failed --> Configuration: Thử lại
    Reviewing --> UpdatingDraft: Sửa một câu
    UpdatingDraft --> Reviewing: Lưu câu
    Reviewing --> GeneratingMore: Tạo thêm câu
    GeneratingMore --> Polling
    Reviewing --> SavingExam: Có câu đã duyệt
    SavingExam --> Completed
    Completed --> [*]
```

```text
TeacherAIExamScreen
├── AIGenerateForm
│   ├── Scope và lớp học
│   ├── Bối cảnh đề
│   ├── Thời lượng
│   ├── Tổng số câu
│   ├── Phân bổ loại câu
│   └── Phân bổ độ khó
├── QC Cost Summary
├── AI Job Status
├── Generate More Controls
├── AIQuestionDraftCard
│   ├── Nội dung câu hỏi
│   ├── Loại câu
│   ├── Độ khó
│   ├── Điểm
│   ├── Đáp án
│   ├── Giải thích
│   └── Trạng thái duyệt
├── Question Navigator
├── Recent Drafts
└── AISavePanel
```

### 5.5. QuizzCoin và thanh toán

```text
TeacherBillingScreen
├── Page heading + Refresh
├── Wallet summary
│   ├── QC balance
│   ├── Premium status
│   └── Free daily questions
├── Billing plans
│   └── PlanCard
├── Payment orders table
├── QC transactions table
├── PaymentOrderDialog
└── Toast feedback
```

### 5.6. Tài liệu giáo viên

```text
Teacher Documents
├── Page heading
├── Create document action
├── DocumentFilterBar
├── TeacherDocumentList
│   ├── DocumentCard
│   └── DocumentContextMenu
├── Upload/Create screen
└── DeleteConfirmDialog
```

### 5.7. Kết quả bài thi

```text
Exam Results
├── Exam summary
│   ├── Lượt nộp
│   ├── Số học sinh đạt
│   └── Điểm trung bình
├── Export Excel action
├── Student result table
│   ├── Học sinh
│   ├── Điểm
│   ├── Câu đúng
│   ├── Thời gian nộp
│   ├── Trạng thái
│   └── Chi tiết
└── Attempt Detail
    ├── Student summary
    ├── Score summary
    └── Question result breakdown
```

## 6. Student workspace

```mermaid
flowchart TD
    Student[Student AppShell] --> Home[Trang chủ]
    Student --> Classes[Lớp học]
    Student --> Exams[Đề thi]
    Student --> Results[Kết quả]
    Student --> Materials[Tài liệu]
    Student --> Profile[Hồ sơ]

    Home --> RecentClasses[Lớp gần đây]
    Home --> RecentExams[Đề gần đây]

    Classes --> ClassList[Danh sách lớp]
    ClassList --> ClassDetail[Chi tiết lớp]
    ClassDetail --> ClassExams[Bài thi trong lớp]
    ClassDetail --> ClassDocuments[Tài liệu trong lớp]

    Exams --> SystemExams[Danh sách đề hệ thống]
    SystemExams --> ExamDetail[Chi tiết đề]
    ExamDetail --> Availability[Trạng thái khả dụng]
    Availability --> TakeExam[Làm bài]

    TakeExam --> Timer[Exam Timer]
    TakeExam --> Progress[Progress Orbs]
    TakeExam --> Question[Question Card]
    TakeExam --> Navigation[Exam Navigation]
    TakeExam --> Submit[Nộp bài]
    Submit --> ResultDetail[Kết quả chi tiết]

    Results --> History[Lịch sử bài làm]
    History --> ResultDetail

    Materials --> MaterialList[Danh sách tài liệu]
    MaterialList --> Viewer[Xem trước]
    Viewer --> Download[Tải xuống]
```

### 6.1. Luồng làm bài thi

```mermaid
stateDiagram-v2
    [*] --> ExamDetail
    ExamDetail --> Unavailable: Chưa mở, đã đóng hoặc không có quyền
    ExamDetail --> Ready: Có thể bắt đầu
    Ready --> Taking: Bắt đầu làm bài
    Taking --> Answering: Chọn câu và nhập đáp án
    Answering --> Taking: Chuyển câu
    Taking --> ConfirmSubmit: Bấm nộp bài
    ConfirmSubmit --> Taking: Hủy
    ConfirmSubmit --> Submitting: Xác nhận
    Submitting --> Result: Nộp thành công
    Submitting --> SubmitError: API lỗi
    SubmitError --> Taking: Thử lại
    Result --> [*]
```

```text
Take Exam Page
├── ExamTimer
├── ProgressOrbs
├── QuestionCard
│   ├── Question content
│   ├── Question image
│   └── AnswerOption
├── ExamNavigation
└── Submit confirmation
```

### 6.2. Tài liệu học sinh

```text
Student Materials
├── PageHero
├── Metrics
├── Search và sort
├── DocumentList
│   └── DocumentCard
├── DocumentViewer
│   ├── PDF preview
│   ├── Image preview
│   ├── Text preview
│   └── Unsupported fallback
├── Download button
└── Toast feedback
```

## 7. Hồ sơ dùng chung

Teacher và Student cùng sử dụng `UserInfoPage` và `ProfilePage`, chỉ thay đổi nội dung theo role.

```text
ProfilePage
├── Profile Hero
├── Avatar Upload Card
├── Account Tabs
│   ├── Tài khoản
│   │   ├── Vai trò
│   │   ├── Tên đăng nhập
│   │   ├── Email
│   │   └── Số điện thoại
│   └── Mật khẩu
│       ├── Mật khẩu hiện tại
│       ├── Mật khẩu mới
│       └── Nhập lại mật khẩu
├── Save actions
├── Loading state
├── Error state
└── Toast feedback
```

## 8. Shared components và UI primitives

### Shared composition

| Component | Vai trò UI/UX |
| --- | --- |
| `AppShell` | Khung điều hướng toàn ứng dụng |
| `PageHero` | Tiêu đề, mô tả, action và metrics đầu trang |
| `StatCard` | Hiển thị chỉ số |
| `SurfacePanel` | Khối nội dung bề mặt dùng chung |
| `AppEmptyState` | Trạng thái chưa có dữ liệu |
| Breadcrumb helpers | Nhãn breadcrumb động theo dữ liệu route |

### UI primitives

```text
components/ui
├── AlertDialog
├── Avatar
├── Badge
├── Button
├── Card
├── Checkbox
├── Dialog
├── DropdownMenu
├── Input
├── Label
├── Popover
├── RadioGroup
├── Select
├── Skeleton
├── Textarea
├── Toast
└── Tooltip
```

### Form controls dùng chung

```text
components/common/form
├── Input
├── Select
├── Textarea
├── Checkbox
├── Radio
├── DatePicker
└── DateTimePicker
```

## 9. Design foundations hiện tại

### Typography

- Display và heading: Manrope.
- Body và control: Public Sans.

### Màu chính

| Token | Giá trị light mode | Công dụng chính |
| --- | --- | --- |
| Primary | `#4f46e5` | Action chính, active state |
| Secondary | `#0891b2` | Accent bổ trợ |
| Tertiary | `#7c3aed` | Accent thứ ba và AI-related UI |
| Background | `#f5f7ff` | Nền ứng dụng |
| Foreground | `#0f172a` | Nội dung chính |
| Surface lowest | `#ffffff` | Panel và form surface |

Theme cũng có dark-mode tokens trong `app/globals.css`.

### Visual pattern đang sử dụng

- Nền sáng với grid nhẹ và glow.
- Panel trắng hoặc trắng trong suốt.
- Border mờ.
- Shadow mềm.
- Lucide icons.
- Primary indigo, secondary cyan và tertiary violet.
- Responsive breakpoint theo mobile, tablet và desktop.

## 10. Luồng dữ liệu và trạng thái

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant UI as Page hoặc Screen
    participant Query as React Query
    participant Service as Service
    participant Client as API Client
    participant BE as Backend

    User->>UI: Thực hiện hành động
    UI->>Query: Query hoặc Mutation
    Query->>Service: Gọi nghiệp vụ dữ liệu
    Service->>Client: Tạo HTTP request
    Client->>BE: Request kèm session/token
    BE-->>Client: Response hoặc error
    Client-->>Service: Dữ liệu đã parse
    Service-->>Query: Domain response
    Query-->>UI: data, loading, error
    UI-->>User: Render trạng thái phù hợp
```

Mỗi màn hình cần thiết kế đủ các state sau:

1. Initial loading.
2. Background refresh.
3. Empty data.
4. Partial data.
5. Validation error.
6. API error.
7. Permission denied.
8. Disabled hoặc unavailable.
9. Mutation in progress.
10. Success confirmation.

## 11. Cấu trúc Figma đề xuất

```text
00 Cover & Documentation
01 Foundations
│   ├── Color tokens
│   ├── Typography
│   ├── Spacing
│   ├── Radius
│   ├── Shadow
│   └── Iconography
├── 02 UI Primitives
│   ├── Buttons
│   ├── Inputs
│   ├── Selects
│   ├── Checkboxes và radios
│   ├── Badges
│   ├── Dialogs
│   ├── Toasts
│   └── Tooltips
├── 03 Shared Components
│   ├── AppShell
│   ├── Sidebar
│   ├── Header và breadcrumb
│   ├── PageHero
│   ├── SurfacePanel
│   ├── StatCard
│   ├── Table
│   └── Empty, loading và error states
├── 04 Page Templates
│   ├── Dashboard
│   ├── List và filter
│   ├── Detail và tabs
│   ├── Multi-step form
│   ├── Data table
│   └── Exam workspace
├── 05 Teacher Screens
│   ├── Dashboard
│   ├── Classes
│   ├── Exams
│   ├── AI Exam
│   ├── Billing
│   ├── Documents
│   ├── Results
│   └── Profile
├── 06 Student Screens
│   ├── Home
│   ├── Classes
│   ├── Exams
│   ├── Take Exam
│   ├── Results
│   ├── Materials
│   └── Profile
├── 07 Authentication
│   ├── Login
│   ├── Register
│   ├── OAuth
│   ├── OTP
│   └── Role selection
└── 08 Responsive & States
    ├── Desktop
    ├── Tablet
    ├── Mobile
    ├── Loading
    ├── Empty
    ├── Error
    └── Success
```

## 12. Quy tắc dùng tài liệu khi thiết kế

1. Thiết kế `Foundations` và `UI Primitives` trước.
2. Dựng một `AppShell` duy nhất rồi tạo variant Teacher và Student.
3. Dùng page template cho các trang có cấu trúc giống nhau.
4. Tách trạng thái khỏi màn hình mặc định, không chỉ thiết kế happy path.
5. Mọi action nguy hiểm cần dialog xác nhận.
6. Mọi API mutation cần loading, success và error feedback.
7. Các bảng dữ liệu phải có responsive strategy, không chỉ co nhỏ desktop table.
8. Giữ navigation và breadcrumb thống nhất với route map trong tài liệu này.
9. Không thiết kế dựa trên các `Header` hoặc `Sidebar` cũ nếu chúng không được `AppShell` sử dụng.
10. Khi thay đổi route hoặc feature lớn, cập nhật lại sơ đồ tương ứng.

## 13. Lưu ý về cấu trúc source hiện tại

Hiện tại feature được đặt ở hai khu vực:

- `components/features/*`: phần lớn nghiệp vụ Teacher, Student, landing, exam và document.
- `features/*`: authentication và account/profile.

Ngoài ra, một số feature riêng của route được đặt trực tiếp trong `app`, ví dụ chi tiết lớp và màn hình tạo đề theo lớp. Đây là hiện trạng cần phản ánh trong tài liệu, nhưng không nên tạo thêm một hệ component song song khi thiết kế UI mới.

Source of truth ưu tiên cho UI/UX:

1. `components/shared/app-shell.tsx` cho navigation và layout.
2. `app/globals.css` cho design tokens.
3. `components/ui/*` cho primitive controls.
4. `components/shared/*` cho composition dùng chung.
5. Feature screen thực tế cho flow và trạng thái nghiệp vụ.

