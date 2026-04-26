# Brainstorm Report: Add fetchMe After Login

**Date:** 2026-04-21
**Status:** IMPLEMENTED ✅

---

## 1. Problem Statement

Sau khi login (Google OAuth), hệ thống dùng `auth-session` mirrored cookie thay vì gọi `/auth/me` để lấy fresh user data từ backend.

**Root cause cũ (đã fix):** Backend đọc `refresh_token` thay vì `session_token`.

**Sau khi backend fix:** Giờ có thể gọi `/auth/me` đáng tin cậy.

---

## 2. Implementation Plan

### 2.1 `RoleSelectionForm.tsx` — Call `fetchMe()` instead of `hydrateFromUser`

**Hiện tại:**
```tsx
useEffect(() => {
  hydrateFromUser(initialUser);  // Chỉ sync store, KHÔNG gọi API
}, [hydrateFromUser, initialUser]);
```

**Sau khi fix:**
```tsx
useEffect(() => {
  fetchMe();  // Gọi /auth/me → fresh user data
}, [fetchMe]);
```

### 2.2 `lib/auth-server.ts` — Priority /auth/me over mirrored cookie

**Hiện tại:** Decode mirrored cookie → nếu success, return ngay (skip `/auth/me`)

**Sau khi fix:** Gọi `/auth/me` trước → nếu fail, dùng mirrored cookie

---

## 3. Files to Change

| File | Change |
|------|--------|
| `features/auth/components/RoleSelectionForm.tsx` | Thay `hydrateFromUser(initialUser)` bằng `fetchMe()` |
| `lib/auth-server.ts` | Đổi thứ tự: gọi `/auth/me` trước, dùng mirrored cookie làm fallback |

---

## 4. Data Flow (Sau fix)

```
Google OAuth callback
  ↓
/auth/callback page → getServerSession()
  → gọi /auth/me (fresh from backend)
  → fallback: auth-session cookie
  ↓
Redirect to /role với initialUser (fresh)
  ↓
RoleSelectionForm mount
  → fetchMe() gọi /auth/me lần nữa (ensure fresh)
  → update store
  ↓
User fills form → completeOnboarding()
```

---

## 5. Verification

1. Login Google → redirect /auth/callback
2. DevTools Network: thấy `/auth/me` được gọi 1-2 lần
3. Submit role form → `/auth/onboarding/complete` thành công (200)
4. Redirect sang /teacher hoặc /student

---

## 6. Unresolved

- Double call `/auth/me` (trong callback + trong form): acceptable cho reliability, nhưng có thể optimize sau
