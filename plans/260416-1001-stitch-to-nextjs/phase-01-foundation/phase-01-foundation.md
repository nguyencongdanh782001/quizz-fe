# Phase 1: Foundation — Design System + Auth Shell

## Context Links
- Plan: [../plan.md](../plan.md)
- Research: [shadcn + Tailwind v4](../research/shadcn-tailwindv4-research.md), [Zustand + Exam Engine](../research/zustand-exam-engine-research.md)
- Design system: "The Focused Scholar" — M3 surface system, teal primary (#00464a), Manrope + Public Sans

## Overview
**Priority:** P1 (critical path)
**Status:** Pending
**Effort:** ~4h

Install all dependencies, wire up the full M3 surface token system in `globals.css`, build the 9 custom common components, scaffold the AppShell (sidebar + header), and implement the complete auth flow (store + 3 pages + middleware).

---

## Key Insights

1. **shadcn v4 IS Tailwind v4 compatible** — shadcn uses CSS variables exclusively (`--primary`, `--background`), not Tailwind config. Override tokens in `:root` before importing `shadcn/tailwind.css`, then map to `@theme inline`.
2. **Order matters**: Define custom `:root {}` tokens → import `shadcn/tailwind.css` → `@theme inline {}` map.
3. **No `tailwind.config.ts`** — Tailwind v4 config lives in CSS. Don't create `tailwind.config.ts`.
4. **Auth state** must be Zustand with `persist` (localStorage) — auth survives page refresh.
5. **Route groups**: `(main)` for app shell; `auth/` for login/register (no shell).

---

## Requirements

### Functional
- [ ] Install: zustand, formik, yup, use-debounce, lucide-react (already has shadcn)
- [ ] Override globals.css with full M3 surface system (primary/secondary/tertiary/surface tokens)
- [ ] Add Manrope + Public Sans via `next/font/google`
- [ ] Build 9 custom common components
- [ ] Build AppShell: Sidebar (glassmorphic) + Header (glassmorphic)
- [ ] Build Zustand auth store + `useAuth` hook
- [ ] Build 3 auth pages: login, register, role-selection
- [ ] Next.js middleware for `/teacher/*` route protection

### Non-Functional
- Components < 150 lines
- No `any` types
- Server/Client boundaries respected

---

## Architecture

### globals.css Token Strategy (confirmed working)
```
1. @import "tailwindcss"
2. Define :root {} with ALL M3 tokens (before shadcn import)
3. @import "shadcn/tailwind.css" (shadcn respects existing vars)
4. @theme inline {} maps CSS vars → Tailwind classes
5. @layer base {} sets body bg/text
```

### AppShell Layout
```
HTML: <html lang="vi">
  <body className="bg-surface text-on-surface font-body antialiased">
    Auth routes: /auth/layout.tsx (no shell, centered card)
    Main routes: /(main)/layout.tsx (sidebar + header shell)
```

### Auth Flow
```
/auth/login → (valid creds) → /auth/role
/auth/role → (choose role) → stored in auth store → /
  OR → /teacher/* (if teacher role)
Middleware: /teacher/* → check auth store → redirect /auth/login if no session
```

---

## Related Code Files

### Files to CREATE
```
app/globals.css                           (MODIFY: full rewrite)
app/layout.tsx                            (MODIFY: add fonts, lang)
app/auth/layout.tsx                       (CREATE)
app/auth/login/page.tsx                   (CREATE: server shell)
app/auth/register/page.tsx                (CREATE)
app/auth/role/page.tsx                    (CREATE)
app/(main)/layout.tsx                     (CREATE: AppShell)
app/(main)/page.tsx                       (CREATE: placeholder home)
middleware.ts                             (CREATE: route protection)
stores/auth-store.ts                      (CREATE: Zustand auth)
hooks/useAuth.ts                          (CREATE)
components/common/GlassSurface.tsx        (CREATE)
components/common/SurfaceCard.tsx         (CREATE)
components/common/GradientHero.tsx        (CREATE)
components/common/SoftInput.tsx            (CREATE)
components/common/GhostButton.tsx          (CREATE)
components/common/NoLineList.tsx           (CREATE)
components/common/AppShell.tsx             (CREATE)
components/common/Sidebar.tsx             (CREATE)
components/common/Header.tsx              (CREATE)
components/common/Logo.tsx                 (CREATE)
components/forms/InputField.tsx            (CREATE)
components/forms/SelectField.tsx          (CREATE)
components/forms/TextAreaField.tsx         (CREATE)
features/auth/components/AuthCard.tsx      (CREATE)
features/auth/components/LoginForm.tsx    (CREATE)
features/auth/components/RegisterForm.tsx  (CREATE)
features/auth/components/RoleSelectionForm.tsx (CREATE)
features/auth/schemas/login.schema.ts     (CREATE)
features/auth/schemas/register.schema.ts  (CREATE)
types/auth.types.ts                       (CREATE)
types/user.types.ts                        (CREATE)
lib/constants.ts                           (CREATE)
lib/exam-utils.ts                          (CREATE: scoring helpers)
```

### Files to MODIFY
```
app/globals.css                           (add @theme M3 tokens)
app/layout.tsx                            (Manrope + Public Sans fonts)
app/(main)/page.tsx                       (placeholder redirect to /auth/login if no session)
```

---

## Implementation Steps

### Step 1.1: Install Dependencies
```bash
npm install zustand formik yup use-debounce
npm install -D @types/use-debounce
```
Verify existing: `next`, `react`, `react-dom`, `tailwindcss`, `shadcn`, `lucide-react`.

### Step 1.2: Rewrite `app/globals.css`
Full Tailwind v4 `@theme inline` with M3 surface system. Key tokens:
- `--color-primary: #00464a`, `--color-primary-container: #006064`
- `--color-secondary: #29695b`, `--color-secondary-container: #acedda`
- `--color-tertiary: #663000`, `--color-tertiary-container: #894400`
- `--color-surface: #f3faff`
- `--color-surface-container-low: #e6f6ff`, `--color-surface-container-lowest: #ffffff`, `--color-surface-container-highest: #cfe6f2`
- `--color-on-surface: #071e27`, `--color-on-surface-variant: #3f4949`
- `--color-error: #ba1a1a`
- `--color-outline: #6f7979`, `--color-outline-variant: #bec8c9`
- `--radius-sm: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1rem`, `--radius-xl: 1.25rem` (NO sm/none — per design rule)
- `--font-display: Manrope`, `--font-body: Public Sans`
- Gradient: `.bg-gradient-hero { background: linear-gradient(135deg, #00464a 0%, #006064 100%) }`

### Step 1.3: Update `app/layout.tsx`
- Add `Manrope` + `Public_Sans` from `next/font/google`
- Set `html lang="vi"` (Vietnamese)
- Remove Geist font imports
- Pass font variables to `body` className

### Step 1.4: Build 9 Common Components
Each `< 80 lines, typed props interface, no business logic:

1. **GlassSurface** — `backdrop-blur`, `bg-surface/80`, border `outline-variant/15`
2. **SurfaceCard** — `bg-surface-container-lowest`, `rounded-xl`, no border, subtle shadow
3. **GradientHero** — `bg-gradient-hero`, Manrope display text, generous padding
4. **SoftInput** — `bg-surface-container-highest`, focus → `bg-surface-container-lowest` + ghost border
5. **GhostButton** — `border border-outline/15`, transparent bg, hover → surface tint
6. **NoLineList** — `gap-6`, no dividers, alternating surface tints
7. **Logo** — Text "Scholar Clarity" in Manrope, primary color
8. **Sidebar** — Glassmorphic, collapsible, nav items with icons (Lucide), active state in primary
9. **Header** — Glassmorphic top bar, user avatar, notification bell

### Step 1.5: AppShell
`AppShell` wrapper: `Sidebar` (left, 240px) + `Header` (top, 64px) + content area. Sidebar hides on mobile (sheet drawer). Header shows timer placeholder + user menu.

### Step 1.6: Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  role: 'student' | 'teacher' | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>; // mock
  register: (data: RegisterData) => Promise<void>; // mock
  selectRole: (role: 'student' | 'teacher') => void;
  logout: () => void;
}
```
Use `persist` middleware. Mock: any `@scholar.com` email = teacher, others = student.

### Step 1.7: 3 Auth Pages + Formik Forms
- **LoginForm**: email + password, Formik + Yup (`login.schema.ts`), "Đăng nhập" primary button, "Quên mật khẩu?" link, "Chưa có tài khoản? Đăng ký" link
- **RegisterForm**: name + email + password + confirmPassword, Formik + Yup (`register.schema.ts`)
- **RoleSelectionForm**: Two large cards (student/teacher), click to select → stored in auth store
- **AuthCard**: Shared wrapper — white card, centered, glassmorphic bg behind it, logo at top

### Step 1.8: Route Groups + Middleware
- `app/auth/layout.tsx`: No shell, centered layout, `bg-surface`
- `app/(main)/layout.tsx`: AppShell wrapper, requires auth
- `middleware.ts`: Redirect `/teacher/*` to `/auth/login` if not authenticated (use cookie check since mock)

---

## Success Criteria
- [ ] `npm run dev` starts without errors
- [ ] `globals.css` defines all M3 surface tokens; `bg-surface`, `bg-surface-container-low`, `text-primary`, `text-on-surface` all work in components
- [ ] Login form validates with Yup, shows inline errors
- [ ] Login → Role selection → Home redirect works
- [ ] Teacher routes redirect to login when unauthenticated
- [ ] All 9 common components render correctly
- [ ] Manrope font visible on headings, Public Sans on body text
- [ ] GlassSurface has backdrop-blur effect
- [ ] GradientHero has teal gradient

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| shadcn token conflict with M3 tokens | Test Button + Card after globals.css rewrite |
| Google Fonts not loading | Use `next/font/google` (already in boilerplate) |
| Zustand persist hydration mismatch | SSR-safe: check `typeof window !== 'undefined'` |

## Security Considerations
- Auth store is client-side only (mock); no real tokens
- Middleware checks cookie for session presence (mock)
- Passwords not validated against real backend (mock)
- Role selection is client-side only — `/teacher/*` route guard is UI-level only in mock

## Next Steps
- Phase 2 blocked until Phase 1 complete (AppShell needed for all subsequent pages)
- After Phase 1: run `npm run dev`, verify all 3 auth pages, test role selection flow
