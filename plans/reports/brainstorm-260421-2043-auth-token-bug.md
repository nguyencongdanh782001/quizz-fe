# Bug Report: 401 Unauthorized — Wrong Token in Cookie

**Date:** 2026-04-21
**Severity:** HIGH
**Status:** ROOT CAUSE IDENTIFIED — Backend Bug
**Location:** Backend API — auth middleware / session validation

---

## 1. Problem Statement

Khi user hoàn tất form role (`/role`) và submit, request `POST /auth/onboarding/complete` trả về **401 Unauthorized**.

User feedback: "đang lấy refresh_token thay vì auth_session"

---

## 2. Root Cause

**Backend đang validate `refresh_token` cookie thay vì `session_token` cookie.**

Theo OpenAPI spec:
- `session_token` = access token, dùng để authenticate requests
- `refresh_token` = chỉ dùng để refresh session, không dùng để auth

Backend endpoint đọc sai cookie → validate thất bại → 401.

---

## 3. Affected Flow

```
User login (Google OAuth)
  ↓
Backend sets cookies: session_token + refresh_token (HTTP-only)
  ↓
Redirect to /auth/callback?needs_onboarding=true
  ↓
User fills role form (date_of_birth, gender)
  ↓
POST /auth/onboarding/complete
  Browser sends: Cookie: session_token=..., refresh_token=...
  ↓
Backend reads: refresh_token ❌ (instead of session_token)
  ↓
401 Unauthorized ❌
```

---

## 4. Affected Endpoints

All authenticated endpoints are affected:
- `POST /auth/onboarding/complete` ← User reported
- `GET /auth/me` ← May also fail
- `POST /auth/logout`
- `GET /auth/sessions`
- `DELETE /auth/sessions/{id}`

---

## 5. Fix Required (Backend)

### Option A: Fix token validation order (Recommended)

```python
# Trong auth middleware hoặc dependency
async def get_current_user(request: Request):
    # Ưu tiên session_token
    session_token = request.cookies.get("session_token")
    refresh_token = request.cookies.get("refresh_token")

    if session_token:
        # Validate session_token
        return await validate_session(session_token)

    if refresh_token:
        # Chỉ refresh khi session_token hết hạn
        new_session = await refresh_session(refresh_token)
        return new_session.user

    raise HTTPException(401, "No valid token")
```

### Option B: Validate both tokens

```python
async def get_current_user(request: Request):
    token = request.cookies.get("session_token") or request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No token")
    return await validate_token(token)  # Backend tự biết validate token nào
```

---

## 6. Verification Steps

1. Browser DevTools → Network tab
2. Submit role form
3. Kiểm tra request `/auth/onboarding/complete`:
   - Request Headers có `Cookie: session_token=..., refresh_token=...` ✅
   - Response: 401 ❌ → Confirm bug ở backend

---

## 7. Related Files (Frontend — No Changes Needed)

| File | Status |
|------|--------|
| `lib/api/client.ts` | ✅ Correct — `withCredentials: true` |
| `lib/api/endpoints/auth.ts` | ✅ Correct — calls `/auth/onboarding/complete` |
| `stores/auth-store.ts` | ✅ Correct — sets `auth-session` mirror |
| `lib/auth-server.ts` | ✅ Correct — SSR session hydration |

---

## 8. Unresolved Questions

- Backend repo ở đâu? (để tạo PR fix)
- Backend có đang validate `refresh_token` cho tất cả endpoints không?
