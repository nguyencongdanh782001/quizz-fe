---
name: stitch-to-nextjs-architecture
description: "Stitch → Next.js 16 architecture: design system, folder structure, tech choices, screen mapping, phase plan"
type: brainstorm
---

# Brainstorm: Stitch Design → Next.js 16 Production App

**Project:** Cổng Giải Đề Trực Tuyến (Online Exam Portal)
**Date:** 2026-04-16
**Author:** Brainstorm Agent
**Status:** ALIGNED — ready for implementation planning

---

## 1. Problem Statement

Convert a Stitch-generated design system ("The Focused Scholar" / "Digital Sanctuary") with ~19 distinct screens into a production-ready Next.js 16 (App Router) application with TypeScript, shadcn/ui, Tailwind CSS, Formik+Yup, mock data layer, and full auth flows.

---

## 2. Design System Summary

**Stitch Design:** "The Focused Scholar" — a Material 3–inspired educational exam platform.

### 2.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#00464a` | CTAs, active states, headers |
| Primary Container | `#006064` | Hover states, gradients |
| Secondary | `#29695b` | Progress, completion states |
| Secondary Container | `#acedda` | Correct answer feedback |
| Tertiary | `#663000` | Encouragement buttons (Start/Continue) |
| Surface | `#f3faff` | Base background |
| Surface Container Low | `#e6f6ff` | Card backgrounds |
| Surface Container Lowest | `#ffffff` | Elevated cards, max pop |
| Surface Container Highest | `#cfe6f2` | Overlays, modals, inputs |
| On Surface | `#071e27` | Body text (never pure black) |
| Error | `#ba1a1a` | Error states |

### 2.2 Typography

- **Display/Headlines:** Manrope (Google Fonts) — editorial, bold, spacious
- **Body/Labels:** Public Sans (Google Fonts) — highly legible, neutral
- **Roundness:** `xl` (0.75rem) minimum — no `sm`/`none`
- **Spacing:** 2x scale, generous whitespace

### 2.3 Key Design Rules

1. **No-Line Rule:** No 1px borders for sectioning. Use background color shifts only.
2. **Glassmorphism:** Floating nav/timer — `backdrop-filter: blur(20px)` + semi-transparent surfaces.
3. **Gradient CTA:** Hero sections — `linear-gradient(135deg, #00464a → #006064)`.
4. **Ghost Border:** If border needed — `outline-variant` at 15% opacity.
5. **Progress Orbs:** `secondary` (#29695b) glowing dots instead of flat progress bars.
6. **Focus Timer:** Glassmorphic floating element, top-right.

---

## 3. Screen Mapping (Stitch → Next.js Routes)

| # | Stitch Screen Title | Route | Feature Module |
|---|---|---|---|
| 1 | Đăng nhập - The Focused Scholar | `/auth/login` | auth |
| 2 | Đăng ký tài khoản - The Focused Scholar | `/auth/register` | auth |
| 3 | Chọn vai trò - The Focused Scholar | `/auth/role` | auth |
| 4 | Trang chủ - Danh sách đề thi | `/` | home |
| 5 | Thư viện đề thi - Chi tiết khối lớp và loại đề | `/exams` | exam |
| 6 | Lớp học của tôi - Scholar Clarity | `/classes` | class |
| 7 | Chi tiết lớp học - Học sinh | `/classes/[id]` | class |
| 8 | Quản lý lớp học - Giáo viên | `/teacher/classes` | teacher |
| 9 | Tạo lớp học mới - Giáo viên | `/teacher/classes/create` | teacher |
| 10 | Tài liệu & Lưu trữ - Giáo viên | `/teacher/documents` | teacher |
| 11 | Thư viện tài liệu - Scholar Clarity | `/documents` | document |
| 12 | Quản lý bài thi - Giáo viên | `/teacher/exams` | teacher |
| 13 | Tạo bài thi mới - Giáo viên | `/teacher/exams/create` | teacher |
| 14 | Tạo bài thi - Bước 2: Chọn dạng câu hỏi | `/teacher/exams/create?step=2` | teacher |
| 15 | Tạo bài thi - Bước 2: Thêm câu hỏi | `/teacher/exams/create/questions` | teacher |
| 16 | Tạo bài thi - Bước 3: Cài đặt | `/teacher/exams/create/settings` | teacher |
| 17 | Tạo bài thi - Bước 4: Xem lại & Xuất bản | `/teacher/exams/create/review` | teacher |
| 18 | Làm bài thi - Scholar Clarity | `/exam/[id]/take` | exam |
| 19 | Kết quả bài thi chi tiết - Scholar Clarity | `/exam/[id]/result` | exam |
| 20 | Thành tích & Lịch sử bài thi | `/history` | history |

### User Flows

**Student Flow:**
```
/auth/login → /auth/role → / → /exams → /classes/[id] → /exam/[id]/take → /exam/[id]/result → /history
```

**Teacher Flow:**
```
/auth/login → /auth/role → / → /teacher/classes → /teacher/classes/create
             → /teacher/exams → /teacher/exams/create (multi-step wizard)
             → /teacher/documents
```

---

## 4. Architecture Decisions

### 4.1 Tailwind v4 + shadcn/ui Integration Strategy ⚠️

**Issue:** shadcn/ui (radix-based) does NOT officially support Tailwind v4 yet. shadcn/ui defaults expect Tailwind v3 + `@tailwindcss/typography` plugin.

**Decision:** Extend Tailwind v4 via CSS `@theme` directive instead of `tailwind.config.ts`. Override shadcn's CSS color tokens to map to our Stitch surface system.

```css
/* globals.css — Tailwind v4 @theme extension */
@theme {
  /* Surface system (M3-inspired) */
  --color-surface: #f3faff;
  --color-surface-container-low: #e6f6ff;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container: #dbf1fe;
  --color-surface-container-high: #d5ecf8;
  --color-surface-container-highest: #cfe6f2;
  --color-surface-dim: #c7dde9;

  /* Primary — Deep Teal */
  --color-primary: #00464a;
  --color-primary-container: #006064;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #8fd8dc;
  --color-primary-fixed: #a6eff3;
  --color-primary-fixed-dim: #8ad3d7;

  /* Secondary — Forest Green */
  --color-secondary: #29695b;
  --color-secondary-container: #acedda;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #2e6d5f;

  /* Tertiary — Warm Orange */
  --color-tertiary: #663000;
  --color-tertiary-container: #894400;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #ffbe93;
  --color-tertiary-fixed: #ffdcc6;

  /* Error */
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;

  /* Text */
  --color-on-surface: #071e27;
  --color-on-surface-variant: #3f4949;
  --color-outline: #6f7979;
  --color-outline-variant: #bec8c9;

  /* Radius — xl/lg only (no sm/none) */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;

  /* Fonts */
  --font-display: var(--font-manrope), sans-serif;
  --font-body: var(--font-public-sans), sans-serif;
}
```

### 4.2 State Management Strategy

| Concern | Solution | Why |
|---|---|---|
| Auth state | React Context + Zustand persist | Auth is global, must survive refresh |
| Exam session state | Zustand store (in-memory + localStorage) | Timer, answers, progress |
| Mock data | Zustand with initial mock data | Easy to swap for API later |
| Form state | Formik (per form) | Per-component, scoped |

**Zustand vs Jotai vs Redux:** Zustand — lightest, best TS support, dead-simple localStorage middleware (`persist`), no boilerplate.

### 4.3 Server vs Client Components

| Pattern | Usage |
|---|---|
| Server Components | All `page.tsx`, layouts, data-fetching shells |
| Client Components (`"use client"`) | Any hook usage, event handlers, Formik, timer, progress orbs |

**Rule:** Start as Server Component; promote to Client only when needed.

### 4.4 shadcn/ui Components to Install

```
button, card, input, label, select,
textarea, dialog, sheet (sidebar), tabs,
avatar, badge, progress, skeleton,
tooltip, popover, dropdown-menu,
checkbox, radio-group, switch,
separator, scroll-area, table
```

### 4.5 Form Architecture

- **Formik** for form state (values, errors, touched, dirty)
- **Yup** for validation schemas (separate `.schemas.ts` files)
- **Reusable fields:** `InputField`, `SelectField`, `TextAreaField` — all accept Formik props + custom styling via className override
- **Schema co-location:** `features/auth/components/LoginForm.tsx` + `features/auth/schemas/login.schema.ts`

### 4.6 Custom Components Required (beyond shadcn)

| Component | Purpose | Design Rule |
|---|---|---|
| `GlassSurface` | Glassmorphic cards/nav | `backdrop-blur`, semi-transparent surface |
| `SurfaceCard` | Elevated card with surface system | Uses `surface-container-lowest` on `surface-container-low` |
| `ProgressOrbs` | Glowing dot progress indicator | Secondary color, CSS glow animation |
| `ExamTimer` | Floating glassmorphic timer | Top-right, backdrop-blur, primary-fixed text |
| `GradientHero` | Hero sections with teal gradient | `linear-gradient(135deg, #00464a, #006064)` |
| `SoftInput` | Form input with surface-highest bg | Focus: `surface-container-lowest` + ghost border |
| `GhostButton` | Ghost variant using ghost-border rule | `outline-variant` at 15% opacity |
| `NoLineList` | List with spacing instead of dividers | Min 1.5rem gap, alternating tint |

---

## 5. Folder Structure

```
/app
  /auth
    /login/page.tsx                    # Server component shell
    /register/page.tsx                 # Server component shell
    /role/page.tsx                     # Role selection
    layout.tsx                         # Auth layout (no app shell)
  /(main)                              # Route group with app shell
    layout.tsx                         # AppShell: sidebar + header
    /page.tsx                          # Home / exam list
    /exams
      /page.tsx                        # Exam library
    /classes
      /page.tsx                        # My classes
      /[id]/page.tsx                  # Class detail
    /exam
      /[id]
        /take/page.tsx                # Exam taking
        /result/page.tsx              # Detailed results
    /history/page.tsx                  # Achievement & history
    /documents/page.tsx                # Document library
    /teacher
      /classes/page.tsx               # Class management
      /classes/create/page.tsx        # Create class
      /exams/page.tsx                 # Exam management
      /exams/create/page.tsx          # Create exam (Step 1)
      /exams/create/questions/page.tsx # Step 2
      /exams/create/settings/page.tsx  # Step 3
      /exams/create/review/page.tsx   # Step 4
      /documents/page.tsx             # Teacher docs

/components
  /ui                                  # shadcn base components
  /common                              # Shared (non-feature) components
    GlassSurface.tsx
    SurfaceCard.tsx
    ProgressOrbs.tsx
    GradientHero.tsx
    SoftInput.tsx
    GhostButton.tsx
    NoLineList.tsx
    AppShell.tsx                       # Main layout wrapper
    Sidebar.tsx
    Header.tsx
    FocusTimer.tsx
    Logo.tsx
  /forms
    InputField.tsx
    SelectField.tsx
    TextAreaField.tsx
    CheckboxField.tsx
    RadioGroupField.tsx

/features
  /auth
    /components
      LoginForm.tsx
      RegisterForm.tsx
      RoleSelectionForm.tsx
      AuthCard.tsx                     # Shared auth card wrapper
    /schemas
      login.schema.ts
      register.schema.ts
    /hooks
      useAuth.ts
    store/
      auth-store.ts                    # Zustand auth store
  /home
    /components
      ExamListCard.tsx
      HeroSection.tsx
      QuickActions.tsx
  /exam
    /components
      ExamCard.tsx
      QuestionCard.tsx
      AnswerOption.tsx
      ExamProgress.tsx
      ExamNavigation.tsx
      ExamTimer.tsx
      ResultSummary.tsx
      ResultChart.tsx
    /schemas
      exam.schema.ts
    /hooks
      useExamTimer.ts
      useExamSession.ts
    /store
      exam-store.ts                    # Zustand exam session store
  /class
    /components
      ClassCard.tsx
      ClassDetailHeader.tsx
      ClassExamList.tsx
    /store
      class-store.ts
  /teacher
    /components
      ExamWizard/
        StepIndicator.tsx
        ExamBasicForm.tsx
        QuestionTypeSelector.tsx
        QuestionBuilder.tsx
        ExamSettingsForm.tsx
        ExamReviewSummary.tsx
      ClassManager/
        ClassTable.tsx
        CreateClassForm.tsx
    /schemas
      exam-create.schema.ts
      class-create.schema.ts
  /document
    /components
      DocumentCard.tsx
      DocumentGrid.tsx

/hooks
  useLocalStorage.ts
  useTimer.ts
  useFocusMode.ts
  useMediaQuery.ts

/lib
  utils.ts                             # cn() — already exists
  constants.ts                         # App-wide constants
  exam-utils.ts                        # Scoring, time formatting helpers
  surface-utils.ts                     # Surface system helpers

/types
  auth.types.ts
  exam.types.ts
  class.types.ts
  document.types.ts
  user.types.ts
  api.types.ts                         # Shared API response types

/data
  mock/
    mock-exams.ts
    mock-questions.ts
    mock-classes.ts
    mock-documents.ts
    mock-users.ts
    mock-results.ts

/stores                                # Zustand stores (root level)
  index.ts                             # Combined store exports

/app/globals.css                       # Tailwind v4 @theme + base styles
```

---

## 6. Critical Technical Trade-offs

### 6.1 shadcn/ui v4 + Tailwind v4 Compatibility

**Problem:** shadcn/ui defaults to Tailwind v3 conventions (CSS variables via `tailwind.config.ts`). Tailwind v4 uses `@theme` in CSS. Mixing can cause token resolution issues.

**Solution:** Custom `globals.css` with `@theme` extending shadcn's default CSS variables. Override shadcn component styles via `app.css` cascade. Works because shadcn components reference CSS custom properties by name — as long as the names match, the values resolve correctly.

**Alternative considered:** Downgrade to Tailwind v3. **Rejected** — user wants Tailwind v4, and the boilerplate already uses it.

### 6.2 Formik vs React Hook Form

**Problem:** Your original prompt specifies Formik. Modern React ecosystem increasingly favors React Hook Form (RHF) for performance (less re-renders, field-array support).

**Recommendation:** Stick with **Formik** per your explicit requirement. The overhead is acceptable for a student/admin app with <50 fields per form. The multi-step exam wizard does benefit from Formik's `Formik` context across steps.

**Validation:** If exam creation wizard grows complex (dynamic question arrays), consider migrating to **RHF + Zod** later — but YAGNI for now.

### 6.3 Next.js 16

**Note:** The latest stable Next.js is v15.x. "Next.js 16" is not a released version. Your boilerplate is **Next.js 16.2.3** (likely a canary/preview). I'll use the App Router conventions as-is, which are consistent from Next.js 13–15+.

---

## 7. Implementation Phases

### Phase 1: Foundation (Design System + Auth)
- Install all shadcn/ui components
- Implement Tailwind v4 `@theme` with full Stitch surface system
- Add Manrope + Public Sans Google Fonts
- Build `GlassSurface`, `SurfaceCard`, `SoftInput`, `GradientHero`, `ProgressOrbs`
- Build AppShell, Sidebar, Header
- Implement Zustand auth store + `useAuth` hook
- Build Login/Register/Role Selection pages + Formik forms

### Phase 2: Core Student Flow
- Home page + Exam list
- Exam library page
- My Classes + Class detail
- Mock data: exams, questions, classes

### Phase 3: Exam Taking Engine
- `useExamTimer` + `useExamSession` hooks
- `ExamTimer` (floating glassmorphic)
- `ProgressOrbs` (glowing dots)
- Question card + answer options
- Navigation (prev/next/jump)
- Exam submission

### Phase 4: Results + History
- Detailed result page
- `ResultChart` (score breakdown)
- History page

### Phase 5: Teacher Flow
- Teacher sidebar layout variant
- Class management CRUD
- Exam creation wizard (4 steps)
- Question builder
- Document management

### Phase 6: Polish + Mock Persistence
- localStorage persistence for exam progress
- Focus mode (timer focus styling)
- Responsive adjustments
- Dark mode extension (optional)

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tailwind v4 + shadcn token mismatch | Medium | Medium | Custom `globals.css` with full `@theme` override; test each component |
| Multi-step exam wizard state loss | Low | High | Zustand persist middleware; Formik step state |
| Complex question builder (dynamic arrays) | Medium | Medium | Formik `arrayHelpers`; defer advanced question types |
| Screen complexity > 150 lines per component | High | Low | Strict splitting; container/presentational separation |
| Exam timer drift on long sessions | Low | Medium | `setInterval` + `Date.now()` delta calculation (not decrement) |

---

## 9. Success Metrics

- [ ] All 19 screens implemented with correct Stitch design fidelity
- [ ] Full surface system matches design token values (hex-accurate)
- [ ] Glassmorphism + gradient hero implemented
- [ ] Auth flow (login → role → dashboard) fully functional
- [ ] Exam timer accurate to ±1s over 60-minute sessions
- [ ] Exam submission persists to localStorage; survives page refresh
- [ ] All forms use Formik + Yup with separate schema files
- [ ] No `any` types anywhere; all props typed via interfaces
- [ ] Components < 150 lines (except pages with composition)
- [ ] Mock data powers all views; API layer is swappable

---

## 10. Unresolved Questions

1. **Multi-step exam wizard persistence:** Should exam creation draft auto-save to localStorage? (Affects UX for teachers — accidental page close.)
2. **Role-based routing guards:** Should non-auth users be redirected from `/teacher/*` routes? (Currently: no guard, just UI hiding.)
3. **Question types:** Which question types are needed? (MCQ, multiple-select, fill-in-blank, essay?) The Stitch design shows "dạng câu hỏi" (question type selector) screen but no detail.
4. **Dark mode:** Extend the design system to dark mode, or ship light-only first?
5. **Responsive breakpoints:** Desktop-first (1280px canvas) — should mobile/tablet be supported?
