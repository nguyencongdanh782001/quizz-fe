import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <div className="space-y-5">
        <div>
          <div className="mb-3 flex size-11 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#6366F1]">
            <Mail className="size-5" />
          </div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#222222]">
            Khôi phục mật khẩu
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Tính năng đặt lại mật khẩu đang được chuẩn bị. Nếu bạn cần hỗ trợ ngay,
            hãy liên hệ đội ngũ quản trị hoặc quay lại trang đăng nhập.
          </p>
        </div>

        <div className="rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] p-4 text-xs leading-relaxed text-[#64748B]">
          <p className="font-bold text-[#1E293B]">Gợi ý nhanh</p>
          <ul className="mt-2 space-y-1.5">
            <li>• Kiểm tra lại email và tài khoản đã đăng ký.</li>
            <li>• Liên hệ quản trị viên nếu bạn không nhớ thông tin đăng nhập.</li>
            <li>• Quay lại đăng nhập sau khi xác nhận quyền truy cập.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row pt-1">
          <Link
            href="/login"
            className="flex flex-1 items-center justify-center rounded-[6px] bg-[linear-gradient(90deg,#3478ff_0%,#6557f5_54%,#d63cf4_100%)] py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(101,87,245,0.3)] transition-all hover:opacity-95"
          >
            Quay lại đăng nhập
          </Link>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border border-[#CBD5E1] bg-white py-3 text-sm font-bold text-[#1E293B] transition-all hover:bg-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
