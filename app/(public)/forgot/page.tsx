import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-on-surface">
            Khôi phục mật khẩu
          </h1>
          <p className="text-sm leading-7 text-on-surface-variant">
            Tính năng đặt lại mật khẩu đang được chuẩn bị. Nếu bạn cần hỗ trợ ngay,
            hãy liên hệ đội ngũ quản trị hoặc quay lại trang đăng nhập.
          </p>
        </div>

        <div className="rounded-2xl border border-outline/10 bg-surface-container-lowest p-5 text-sm leading-7 text-on-surface-variant">
          <p className="font-medium text-on-surface">Gợi ý nhanh</p>
          <ul className="mt-3 space-y-2">
            <li>• Kiểm tra lại email và tài khoản đã đăng ký.</li>
            <li>• Liên hệ quản trị viên nếu bạn không nhớ thông tin đăng nhập.</li>
            <li>• Quay lại đăng nhập sau khi xác nhận quyền truy cập.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
