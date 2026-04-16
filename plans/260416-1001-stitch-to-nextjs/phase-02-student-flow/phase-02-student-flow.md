# Phase 2: Student Core Flow

## Context Links
- Plan: [../plan.md](../plan.md)
- Phase 1: [../phase-01-foundation/phase-01-foundation.md](../phase-01-foundation/phase-01-foundation.md)
- Design: Stitch "The Focused Scholar" screens

## Overview
**Priority:** P1 (parallel with Phase 1 — shared mock data layer)
**Status:** Pending
**Effort:** ~4h

Build the full student-facing app shell pages: Home, Exam Library, My Classes, Class Detail. Implement mock data layer (5+ exams, 10+ questions, 3+ classes, documents). All pages are Server Components that read from mock data.

---

## Key Insights

1. **Mock data first**: Define all TypeScript types first, then mock data. This is the data contract for all phases.
2. **Server Components**: All pages fetch mock data server-side. No loading states needed for mock.
3. **SurfaceCard is the primary layout primitive** — every list item, every section uses it.
4. **Route group `(main)`**: All these pages live in `app/(main)/` so they get the AppShell.

---

## Requirements

### Functional
- [ ] Define all domain types in `/types`
- [ ] Create comprehensive mock data in `/data/mock/`
- [ ] Home page: hero + exam list with cards
- [ ] Exam Library page: filter by grade level + exam type
- [ ] My Classes page: list of enrolled classes
- [ ] Class Detail page: class info + assigned exams
- [ ] Document Library page: shared resource list

### Non-Functional
- Server Components for all pages (no "use client")
- Types defined in `/types`, not inline
- Mock data in `/data/mock/` — swappable with API later

---

## Related Code Files

### Files to CREATE
```
types/exam.types.ts                       (Exam, Question, Option, ExamResult)
types/class.types.ts                      (Class, ClassMember, ClassExam)
types/document.types.ts                   (Document)
data/mock/mock-exams.ts                   (5+ exams)
data/mock/mock-questions.ts               (10+ questions)
data/mock/mock-classes.ts                 (3+ classes)
data/mock/mock-documents.ts               (2+ documents)
data/mock/mock-users.ts                   (mock user data)
data/mock/mock-results.ts                 (past results)
app/(main)/page.tsx                       (MODIFY: Home with hero + exam cards)
app/(main)/exams/page.tsx                 (CREATE: Exam library)
app/(main)/classes/page.tsx               (CREATE: My classes)
app/(main)/classes/[id]/page.tsx          (CREATE: Class detail)
app/(main)/documents/page.tsx              (CREATE: Document library)
features/home/components/ExamListCard.tsx (CREATE)
features/home/components/HeroSection.tsx  (CREATE)
features/home/components/QuickActions.tsx (CREATE)
features/exam/components/ExamCard.tsx      (CREATE)
features/class/components/ClassCard.tsx   (CREATE)
features/class/components/ClassDetailHeader.tsx (CREATE)
features/class/components/ClassExamList.tsx (CREATE)
features/document/components/DocumentCard.tsx (CREATE)
features/document/components/DocumentGrid.tsx (CREATE)
```

---

## Implementation Steps

### Step 2.1: Define Types
Create `/types/` files. Key types:
```typescript
// exam.types.ts
type QuestionType = 'single' | 'multiple';
type ExamStatus = 'draft' | 'published' | 'archived';

interface Option { id: string; content: string; }
interface Question {
  id: string; content: string; type: QuestionType;
  options: Option[]; explanation?: string;
}
interface Exam {
  id: string; title: string; description: string;
  gradeLevel: number; subject: string; examType: string;
  durationMinutes: number; passingScore: number;
  questionCount: number; status: ExamStatus;
  teacherName: string; createdAt: string;
  thumbnailUrl?: string;
}
interface ExamResult {
  id: string; examId: string; userId: string;
  score: number; totalScore: number; percentage: number;
  status: 'passed' | 'failed'; timeSpentSeconds: number;
  completedAt: string; answers: Record<string, string[]>;
}
```

### Step 2.2: Create Mock Data
Create realistic Vietnamese exam data:
- **5 exams**: Tiếng Anh lớp 12, Toán lớp 10, Vật Lý lớp 11, Ngữ Văn lớp 12, Sinh Học lớp 10
- **10+ questions**: Mix of single + multiple type, 4 options each, 1-2 correct
- **3 classes**: "12A1 - THPT Nguyễn Du", "10A2 - THPT Lê Quý Đôn", "11B3 - THPT Trần Hưng Đạo"
- **2 documents**: Đề thi tham khảo, Tài liệu ôn tập
- Mock data must include: all fields in TypeScript types, real-looking Vietnamese content

### Step 2.3: Home Page (`app/(main)/page.tsx`)
**Server Component** — fetches mock exams, passes to children.
Layout:
```
<SurfaceCard className="bg-gradient-hero text-white p-12 mb-8">
  <h1 className="font-display text-4xl font-bold mb-2">
    Chào mừng quay trở lại, [Tên]
  </h1>
  <p className="text-white/80 font-body">
    Bạn có 3 bài thi đang chờ. Bắt đầu ngay hôm nay!
  </p>
  <div className="flex gap-3 mt-6">
    <GhostButton className="bg-white/20 text-white hover:bg-white/30">
      Xem tất cả đề thi
    </GhostButton>
  </div>
</SurfaceCard>

<h2 className="font-display text-2xl font-bold text-on-surface mb-4">
  Đề thi gần đây
</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {exams.map(exam => <ExamCard key={exam.id} exam={exam} />)}
</div>
```

### Step 2.4: Exam Library (`app/(main)/exams/page.tsx`)
**Server Component** — filter bar + grid.
- Filter bar: grade level chips (Lớp 10, 11, 12) + exam type dropdown
- Client-side filtering via URL search params (no JS needed — URL-driven)
- SurfaceCard grid with ExamCard

### Step 2.5: My Classes (`app/(main)/classes/page.tsx`)
**Server Component** — grid of ClassCard.
Each ClassCard shows: class name, teacher, student count, assigned exams count, next exam deadline.

### Step 2.6: Class Detail (`app/(main)/classes/[id]/page.tsx`)
**Server Component** — `params.id` to fetch class data.
- ClassDetailHeader: class name, teacher, description, student count
- Tab: "Bài thi" (exams assigned) + "Học sinh" (member list)
- ClassExamList: assigned exams with due dates

### Step 2.7: Document Library (`app/(main)/documents/page.tsx`)
**Server Component** — grid of DocumentCard with subject tags.

### Step 2.8: Feature Components (< 150 lines each)
- **ExamCard**: SurfaceCard, exam title (Manrope), subject badge, duration, question count, grade level, teacher avatar, "Làm bài" CTA button
- **HeroSection**: GradientHero wrapper with customizable content slot
- **QuickActions**: 3 SurfaceCards with icons — "Làm bài thi", "Xem kết quả", "Tài liệu"
- **ClassCard**: SurfaceCard with class avatar, name, teacher, student count, next deadline
- **DocumentCard**: SurfaceCard with document icon, title, subject tag, download CTA
- **DocumentGrid**: Responsive grid wrapper for DocumentCard

---

## Success Criteria
- [ ] Home page renders with gradient hero + 3 exam cards
- [ ] Exam library filters work via URL params
- [ ] Class detail page shows correct class by ID
- [ ] All mock data uses realistic Vietnamese content
- [ ] TypeScript types used consistently — no `any`
- [ ] Pages are Server Components (no `"use client"` directive)
- [ ] SurfaceCard used for all card surfaces (not raw divs)
- [ ] Manrope headings, Public Sans body text visible

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Client-side filter requires JS | Use URL search params + server component — filter server-side |
| Large mock data file | Split into separate files per entity in `/data/mock/` |

## Next Steps
- Phase 3: Exam Engine — depends on mock questions being defined correctly
- Phase 4: Results — depends on mock results being defined correctly
- Phase 5: Teacher — depends on exam types being defined correctly
