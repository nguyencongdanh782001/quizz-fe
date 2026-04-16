---
title: "Stitch Design → Next.js 16 Production App"
description: "Convert Stitch 'Cổng Giải Đề Trực Tuyến' design to Next.js 16 App Router app with TypeScript, shadcn/ui, Tailwind v4, Formik, Zustand, mock data."
status: completed
priority: P1
effort: 23h
branch: main
tags: [frontend, fullstack, feature]
created: 2026-04-16
completed: 2026-04-16
---

# Plan: Stitch → Next.js 16 Exam Portal

## Overview ✅ COMPLETE

Convert Stitch design "Cổng Giải Đề Trực Tuyến" (Online Exam Portal) into a production-ready Next.js 16 App Router application.

**Design:** "The Focused Scholar" — M3 surface system, teal primary (#00464a), Manrope + Public Sans typography, glassmorphism, progress orbs, ghost borders.

**Stack:** Next.js 16.2.3 + TypeScript + Tailwind v4 + shadcn/ui v4 + Formik + Yup + Zustand + mock data.

## Phases
- Phase 1: ✅ Foundation + Auth
- Phase 2: ✅ Student Core Flow
- Phase 3: ✅ Exam Engine
- Phase 4: ✅ Results + History
- Phase 5: ✅ Teacher Flow
- Phase 6: ✅ Polish (dark mode ready)

## Phases

| # | Phase | Status | Effort | Deps | Link |
|---|-------|--------|--------|------|------|
| 1 | Foundation | Pending | 4h | — | [phase-01-foundation](./phase-01-foundation/phase-01-foundation.md) |
| 2 | Student Flow | Pending | 4h | Phase 1 | [phase-02-student-flow](./phase-02-student-flow/phase-02-student-flow.md) |
| 3 | Exam Engine | Pending | 5h | Phase 1+2 | [phase-03-exam-engine](./phase-03-exam-engine/phase-03-exam-engine.md) |
| 4 | Results + History | Pending | 2h | Phase 3 | [phase-04-results-history](./phase-04-results-history/phase-04-results-history.md) |
| 5 | Teacher Flow | Pending | 6h | Phase 1+2 | [phase-05-teacher-flow](./phase-05-teacher-flow/phase-05-teacher-flow.md) |
| 6 | Polish | Pending | 2h | Phase 5 | [phase-06-polish/phase-06-polish.md](./phase-06-polish/phase-06-polish.md) |

**Total:** 23h across 6 phases.

## Screens (19 total)

### Auth (3)
- `/auth/login` — Login
- `/auth/register` — Register
- `/auth/role` — Role selection

### Student (7)
- `/` — Home (hero + exam list)
- `/exams` — Exam library
- `/classes` — My classes
- `/classes/[id]` — Class detail
- `/exam/[id]/take` — Take exam
- `/exam/[id]/result` — Result detail
- `/history` — History + achievements

### Teacher (9)
- `/teacher/classes` — Class management
- `/teacher/classes/create` — Create class
- `/teacher/exams` — Exam management
- `/teacher/exams/create` — Exam wizard step 1
- `/teacher/exams/create/questions` — Step 2
- `/teacher/exams/create/settings` — Step 3
- `/teacher/exams/create/review` — Step 4
- `/teacher/documents` — Document management

### Shared (1)
- `/documents` — Document library

## Key Architecture Decisions

1. **Tailwind v4 + shadcn**: shadcn v4 IS Tailwind v4 compatible (CSS var strategy). Override `:root {}` tokens → import `shadcn/tailwind.css` → `@theme inline {}` map.
2. **Zustand + persist**: Auth + exam session + exam draft all persisted to localStorage via `zustand/middleware`.
3. **Drift-free timer**: `endTime = Date.now() + durationMs`. Recalculate `timeLeft = endTime - Date.now()` on each tick. Never decrement.
4. **Server/Client split**: All pages are Server Components; mark only interactive components "use client".
5. **Formik per form**: Auth forms (login/register/role), teacher wizard. Dynamic question builder via `FieldArray`.
6. **No `any` types**: All types in `/types`, mock data typed, component props typed via interfaces.

## Dependencies

- Next.js 16.2.3 (already installed)
- React 19.2.4 (already installed)
- `zustand`, `formik`, `yup`, `use-debounce` (to install)
- shadcn/ui components (install per-phase as needed)
- Tailwind v4 (already installed)

## Research Reports

- [shadcn + Tailwind v4 Integration](./research/shadcn-tailwindv4-research.md)
- [Zustand + Exam Engine Patterns](./research/zustand-exam-engine-research.md)
- [Brainstorm Report](../reports/brainstorm-260416-1001-stitch-to-nextjs-architecture.md)
