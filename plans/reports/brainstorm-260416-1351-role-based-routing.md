# Brainstorm Report — Role-Based Routing System

**Date:** 2026-04-16  
**Scope:** Full restructure of Next.js App Router routes into role-based route groups  
**Status:** Agreed — Approach B (full restructuring)

---

## Problem Statement

The current codebase has a single `(main)` route group wrapping all authenticated pages (student + teacher). A single layout with one sidebar serves both roles, which requires role checks scattered across pages. Authenticated users accessing `/` or auth pages were partially protected via middleware and landing page server-check, but there was no enforced role separation.

Goal: completely separate student and teacher experiences via route groups, with strict role-based guards and no shared layouts.

---

## Route Map (Before → After)

### Public (unauthenticated only)

| Before | After | Notes |
|---|---|---|
| `app/page.tsx` (`/`) | `app/(public)/page.tsx` (`/`) | Landing page |
| `app/auth/login/page.tsx` (`/auth/login`) | `app/(public)/login/page.tsx` (`/login`) | Moved out of `auth/` |
| `app/auth/register/page.tsx` | `app/(public)/register/page.tsx` | Moved |
| `app/auth/role/page.tsx` | `app/(public)/role/page.tsx` | Moved |
| `app/auth/layout.tsx` | Deleted (no longer needed) | |

### Student routes

| Before | After | Notes |
|---|---|---|
| `app/(main)/home/page.tsx` | `app/(student)/student/page.tsx` | `/student` — student home |
| `app/(main)/exams/page.tsx` | `app/(student)/exams/page.tsx` | `/exams` |
| `app/(main)/classes/page.tsx` | `app/(student)/classes/page.tsx` | `/classes` |
| `app/(main)/classes/[id]/page.tsx` | `app/(student)/classes/[id]/page.tsx` | `/classes/[id]` |
| `app/(main)/history/page.tsx` | `app/(student)/results/page.tsx` | `/results` (renamed) |
| `app/(main)/exam/[id]/take/page.tsx` | `app/(student)/exam/[id]/take/page.tsx` | `/exam/[id]/take` |
| `app/(main)/exam/[id]/result/page.tsx` | `app/(student)/exam/[id]/result/page.tsx` | `/exam/[id]/result` |
| `app/(main)/documents/page.tsx` | `app/(student)/materials/page.tsx` | `/materials` (renamed) |

### Teacher routes

| Before | After | Notes |
|---|---|---|
| `app/(main)/teacher/page.tsx` | `app/(teacher)/teacher/page.tsx` | `/teacher` — teacher home |
| `app/(main)/teacher/classes/page.tsx` | `app/(teacher)/classes/page.tsx` | `/classes` |
| `app/(main)/teacher/classes/create/page.tsx` | `app/(teacher)/classes/create/page.tsx` | `/classes/create` |
| `app/(main)/teacher/exams/page.tsx` | `app/(teacher)/exams/page.tsx` | `/exams` |
| `app/(main)/teacher/exams/create/...` | `app/(teacher)/exams/create/...` | Entire wizard |
| `app/(main)/teacher/documents/page.tsx` | `app/(teacher)/documents/page.tsx` | `/documents` |
| `app/(main)/teacher/exams/create/(wizard)` | `app/(teacher)/exams/create/(wizard)` | Same group |

### Deleted

| File | Reason |
|---|---|
| `app/(main)/layout.tsx` | Replaced by 2 separate role layouts |
| `app/(main)/page.tsx` | Already deleted (route conflict fix) |
| `app/auth/layout.tsx` | Auth pages now in `(public)` with no shared layout |

---

## Implementation Plan

### Phase 1 — Create new route groups + layouts

1. Create `app/(student)/layout.tsx`:
   - Server Component (auth check server-side via `getServerSession()`)
   - Redirect to `/login` if not authenticated
   - Redirect to `/teacher` if role === 'teacher'
   - Render: student sidebar + header + `{children}`
   - Student sidebar items: `/student`, `/exams`, `/results`, `/materials`, `/classes`

2. Create `app/(teacher)/layout.tsx`:
   - Server Component (auth check server-side)
   - Redirect to `/login` if not authenticated
   - Redirect to `/student` if role === 'student'
   - Render: teacher sidebar + header + `{children}`
   - Teacher sidebar items: `/teacher`, `/classes`, `/students`, `/exams`, `/documents`

3. Create `app/(public)/layout.tsx`:
   - Server Component
   - Redirect to `/student` (if role=student) or `/teacher` (if role=teacher) if already authenticated
   - Render `{children}` with no shell (bare layout, like existing `auth/layout.tsx`)

### Phase 2 — Move files

Move all student pages from `app/(main)/` → `app/(student)/`
Move all teacher pages from `app/(main)/teacher/` → `app/(teacher)/`

### Phase 3 — Update middleware

Rewrite middleware to handle all redirects:

```ts
// Public routes — redirect authed users by role
if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/role')) {
  if (session) {
    return session.role === 'teacher'
      ? NextResponse.redirect('/teacher')
      : NextResponse.redirect('/student');
  }
}

// Student routes — only student
if (pathname.startsWith('/student') || pathname.startsWith('/exams') || pathname.startsWith('/results') || ...) {
  if (!session) return redirect('/login');
  if (session.role !== 'student') return redirect('/teacher');
}

// Teacher routes — only teacher
if (pathname.startsWith('/teacher')) {
  if (!session) return redirect('/login');
  if (session.role !== 'teacher') return redirect('/student');
}
```

### Phase 4 — Update login/register forms

- After login/register succeeds: redirect using role from response → `/student` or `/teacher`
- Update imports for auth components (now under `app/(public)/login/...`)

### Phase 5 — Update sidebar and navigation links

- Update all sidebar links in both role layouts
- Update all `<Link href="...">` in pages to use new route paths

---

## Architecture Decisions

**Server-side auth in layouts (not client-side):**
- Both `(student)/layout.tsx` and `(teacher)/layout.tsx` use `getServerSession()` directly
- No `useEffect` redirect lag, no loading spinner
- Middleware handles the heavy lifting; layouts are a second line of defense

**Route group naming (no URL prefix):**
- `(student)` does NOT add `/student` prefix — only `student/page.tsx` adds `/student`
- `(teacher)` does NOT add `/teacher` prefix — only `teacher/page.tsx` adds `/teacher`
- So the student home route is `app/(student)/student/page.tsx` → `/student`
- Teacher home route is `app/(teacher)/teacher/page.tsx` → `/teacher`

**Middleware matching:**
- Update `config.matcher` to include new public routes + exclude static assets
- Match patterns: `/(student|teacher)/:path*` vs `(public)/:path*`

**Shared student exam pages (take exam, result):**
- `/exam/[id]/take` and `/exam/[id]/result` stay under `app/(student)/` since students take exams
- Teachers don't take exams — they view results via `/teacher/exams/[id]/result` (future)

**Backward compatibility concern:**
- Old localStorage keys in `auth-storage` and `exam-wizard-storage` remain valid
- Session cookie uses `role` field — already correct
- No migration needed for existing session data

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Route conflicts if `(main)` pages aren't removed | Delete all files in `app/(main)/` after moving |
| Auth cookie not set on login → redirect loop | `setSessionCookie()` called in `auth-store.ts` login action |
| Landing page still accessible to authed users via direct URL | `app/(public)/layout.tsx` checks session and redirects |

---

## Success Criteria

1. Authenticated student visiting `/` → redirected to `/student`
2. Authenticated teacher visiting `/login` → redirected to `/teacher`
3. Student accessing `/teacher/*` → redirected to `/student`
4. Teacher accessing `/student/*` → redirected to `/teacher`
5. Both role home pages have completely separate sidebars
6. No `app/(main)/layout.tsx` or any pages remain

---

## Unresolved

- `app/(main)/teacher/exams/create/(wizard)/layout.tsx` — this layout wraps the wizard steps. It currently uses the parent `(main)` layout. When teacher pages move to `(teacher)`, the wizard layout needs to be recreated inside `(teacher)/exams/create/(wizard)/layout.tsx`. The existing layout is simple (step progress indicator) so this is low-risk but must be done.
- Nav items count mismatch — student gets 5 nav items, teacher gets 5, but actual page count differs. The sidebar should only link to pages that exist.