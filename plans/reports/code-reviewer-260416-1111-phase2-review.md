# Phase 2 Code Review — Student Core Flow

## Scope
Types, mock data, home page, exam library, classes, class detail, documents, Phase 1 auth fixes. ~25 files.

---

## Overall Assessment: 8 / 10

Solid implementation. TypeScript is clean (0 errors), design tokens are consistent, and the data layer is well-structured. Three security/logic issues warrant fixes before Phase 3.

---

## Critical Issues

### 1. Middleware role check is missing — teacher routes unprotected
**File:** `middleware.ts`
The middleware only checks for cookie *presence*, not its contents. Any authenticated user (including students) can access `/teacher/*` routes by simply having the cookie set. The `selectRole` in auth-store is client-side and trivially spoofable.

**Impact:** Students can reach teacher-only pages.

**Fix:** Middleware should decode the `auth-session` cookie and check `role === 'teacher'` before allowing access to `/teacher/*`.

```ts
// In middleware, after reading sessionCookie:
if (TEACHER_ROUTES.some(r => pathname.startsWith(r))) {
  if (!sessionCookie) { /* redirect */ }
  try {
    const session = JSON.parse(atob(sessionCookie.value));
    if (session.role !== 'teacher') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch { return NextResponse.redirect('/auth/login'); }
}
```

### 2. `btoa` in `setSessionCookie` fails on non-ASCII names
**File:** `auth-store.ts` line 12

```ts
const value = btoa(JSON.stringify({ id: user.id, role: user.role, email: user.email }));
```

`btoa` throws a `DOMException` if any character has a code point > 255. Vietnamese names (e.g., "Nguyễn Văn Minh") will crash the login flow.

**Fix:** Use `btoa(unescape(encodeURIComponent(...)))` or `Buffer.from(...).toString('base64')` (browser polyfill).

---

## High Priority

### 3. Unused imports (dead code)
- `app/(main)/classes/[id]/page.tsx` line 5: `Clock` is imported but never used.
- `components/features/document/document-card.tsx` line 3: `Eye` is imported but never used; `Link2` is imported but unused.

### 4. `selectRole` is client-side only — no server enforcement
**File:** `auth-store.ts` lines 69–78

Role switching is a UX convenience, but since `middleware.ts` doesn't validate the role from the cookie, this effectively lets any user become "teacher" in the UI without any server check. If this is intentional for demo purposes, document it; otherwise enforce role server-side.

---

## Medium Priority

### 5. `class-detail` unused `i` variable (shadowing)
**File:** `app/(main)/classes/[id]/page.tsx` lines 89–108

`i` is used as index but only `i === 0` is checked. The index variable is unnecessary noise. Use `cls.students[0]` directly or track a `isFirst` flag.

### 6. `url: '#'` in mock documents is a placeholder
**File:** `data/mock/mock-documents.ts` lines 9, 24, 39, etc.

All document URLs are `'#'`. Fine for Phase 2 mock, but Phase 3 should wire real download URLs.

### 7. Exam card links to non-existent route
**File:** `components/features/exam/exam-card.tsx` line 90

`href={/exam/${exam.id}/take}` — the take-exam page is not yet implemented. Not a bug, but Phase 3 must wire this up or the link will 404.

---

## Positive Observations

- All 3 type files (`exam`, `class`, `document`) are well-structured with clear discriminated unions and optional fields.
- `ExamFilter`, `ClassFilter`, `DocumentFilter` interfaces match their respective filter UIs exactly.
- Design token usage is consistent: `bg-surface-container-lowest`, `text-muted-foreground`, `rounded-xl`, `font-display` — no hardcoded raw colors.
- Mock data is realistic and covers edge cases (mixed `single`/`multiple` question types, various document types).
- `class-detail` page uses `Promise` params pattern (`use(params)`) correctly for Next.js 15.
- `getQuestionsByExamId` and `getResultsByUserId` helper functions in mock files are a good pattern for future reuse.
- `DocumentCard` handles video thumbnails gracefully.

---

## Recommended Actions

1. **[Critical]** Fix middleware to validate `role === 'teacher'` from decoded cookie for `/teacher/*` routes.
2. **[Critical]** Fix `btoa` encoding to handle non-ASCII characters.
3. Remove unused `Clock` and `Eye` imports.
4. Wire `/exam/${id}/take` in Phase 3.

---

## Metrics
- **TypeScript Errors:** 0
- **Lint Issues:** 0 (estimated)
- **Type Coverage:** Full (all types used correctly)
- **Test Coverage:** Not applicable (no tests written yet)

---

## Unresolved Questions

1. Is role switching (`selectRole`) intentionally client-only for demo purposes? If so, should Phase 3 server middleware also skip teacher-role enforcement, or will real auth be wired by then?
2. Will `/exam/${id}/take` be implemented in Phase 3 or deferred?
