# Brainstorm Report: API Integration & Role Form Cleanup

**Date:** 2026-04-21
**Author:** Danh Nguyen
**Status:** IMPLEMENTED ✅

---

## 1. Problem Statement

### Request A: Remove form inputs from role page
- Xóa các fields: `full_name`, `school_name` (dùng Google profile cho full_name)
- Giữ lại: `date_of_birth`, `gender`, role selection cards, submit button

### Request B: Integrate OpenAPI spec endpoints
- Kiểm tra và xác nhận các endpoint đã tích hợp

---

## 2. API Integration Audit

| Endpoint | Status | File |
|----------|--------|------|
| `GET /` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /health` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /db-check` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `POST /auth/register` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `POST /auth/login` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /auth/google/login` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /auth/google/callback` | ✅ Done | `app/auth/callback/page.tsx` (redirect flow, not REST) |
| `GET /auth/me` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /auth/roles` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `POST /auth/refresh` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `POST /auth/logout` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `GET /auth/sessions` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `DELETE /auth/sessions/{id}` | ✅ Done | `lib/api/endpoints/auth.ts` |
| `POST /auth/onboarding/complete` | ✅ Done | `lib/api/endpoints/auth.ts` |

**Conclusion:** Tất cả 15 endpoints đã được tích hợp. Không cần thêm endpoint nào.

---

## 3. Role Form Cleanup — Recommended Solution

### Current State
`RoleSelectionForm.tsx` có 6 phần UI:
1. Header text ("Chọn vai trò của bạn")
2. Role selection cards (Student/Teacher)
3. Input: Họ và tên (full_name)
4. Input: Ngày sinh (date_of_birth)
5. Select: Giới tính (gender)
6. Input: Trường học (school_name)
7. Submit button ("Hoàn tất")

### Target State (Updated)
1. ✅ Header text — giữ lại
2. ✅ Role selection cards — giữ lại
3. ❌ Họ và tên — **XÓA** (dùng `currentUser.full_name` từ Google)
4. ✅ Ngày sinh — giữ lại
5. ✅ Giới tính — giữ lại
6. ✅ Trường học — giữ lại
7. ✅ Submit button — giữ lại

### Changes Required

#### `features/auth/components/RoleSelectionForm.tsx`
- Xóa `<InputField label="Họ và tên" ...>`
- Xóa `full_name` khỏi `RoleSelectionValues` interface
- Xóa `full_name` khỏi `initialValues`
- Xóa `full_name` khỏi `handleSubmit` body

#### `features/auth/schemas/onboarding.schema.ts`
- Loại bỏ `full_name` khỏi schema (nếu chỉ dùng cho form này)

### Data Flow
```
Google Profile full_name → currentUser.full_name (read-only, displayed implicitly)
                          ↓
completeOnboarding({ role, full_name: currentUser.full_name, date_of_birth, gender, school_name })
```

---

## 4. Risks & Considerations

- **Backend validation:** `CompleteOnboardingRequest` yêu cầu `full_name` bắt buộc → truyền `currentUser.full_name` từ Google
- **No breaking changes:** UI vẫn hoạt động, user chỉ nhập ít thông tin hơn

---

## 5. Next Steps

Chuyển sang **Implementation** phase:
1. Update `RoleSelectionForm.tsx` — xóa `full_name` input
2. Update `completeOnboarding` call — dùng `currentUser.full_name`
3. Test flow: login → role → redirect to teacher/student
