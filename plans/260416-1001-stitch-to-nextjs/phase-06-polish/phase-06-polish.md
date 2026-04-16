# Phase 6: Polish

## Context Links
- Plan: [../plan.md](../plan.md)
- All previous phases: 1–5 must be complete

## Overview
**Priority:** P3
**Status:** Pending
**Effort:** ~2h

LocalStorage persistence, responsive tablet breakpoints, focus mode styling, and optional dark mode extension.

---

## Requirements

### Functional
- [ ] localStorage persistence: exam draft, auth session, exam session
- [ ] Responsive: tablet breakpoints (768px) for all pages
- [ ] Focus mode: exam taking page hides non-essential UI
- [ ] Dark mode: extend globals.css with `.dark {}` class

### Non-Functional
- Responsive via Tailwind breakpoints only (no new components)
- Dark mode: CSS class toggle on `<html>`, not full theme system

---

## Implementation Steps

### Step 6.1: Dark Mode Extension
Extend `globals.css` with `.dark` class matching the research report findings:
- Background: `#071e27` (inverse of light surface)
- Primary: `#acedda` (lighter teal for dark bg)
- Secondary: `#5ddbbc` (brighter green)
- On-surface: `#cfe6f2`
- Card: `#112833`
Add dark mode toggle to Header (sun/moon icon button).

### Step 6.2: Tablet Responsive Layout
```typescript
// Sidebar: 240px desktop → collapsible on tablet
// Grid: 3-col desktop → 2-col tablet (md: breakpoint)
// Cards: maintain SurfaceCard styling
```
- Sidebar: collapses to icon-only rail on tablet, full drawer on mobile
- shadcn `Sheet` component for mobile drawer
- Exam taking: ProgressOrbs wrap to multiple rows on narrow screens

### Step 6.3: Focus Mode (Exam Taking)
Add "Focus Mode" toggle (eye icon in header) that:
- Hides sidebar + header
- Centers question card
- Expands timer to top-center
- Adds subtle ambient background
Activated via `useFocusMode()` hook + CSS class on `<body>`.

### Step 6.4: Persistence Verification
- Auth: already persisted via Zustand
- Exam draft: already persisted via Zustand `persist`
- Exam session: `partialize` excludes `timeLeftMs` — verify recalculates from `endTime` on hydration
- Add `rehydrateOnFocus: false` to all stores (don't reset on tab switch)

### Step 6.5: Mobile Sidebar Drawer
Use shadcn `Sheet` component for sidebar on mobile. Trigger: hamburger menu in mobile header.

---

## Success Criteria
- [ ] Dark mode toggle works, all surfaces/text adapt correctly
- [ ] Tablet: 2-column exam grid, sidebar collapses, timer stays visible
- [ ] Focus mode: hides chrome, centers content, timer remains top-right
- [ ] Exam session persists across page refresh with correct time remaining
- [ ] No layout break on 768px–1280px viewport range
