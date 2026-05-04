import { Mail, ShieldCheck } from "lucide-react";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { cn } from "@/lib/utils";
import type { UserInfoRoleContent } from "./types";

interface UserInfoSidebarProps {
  content: UserInfoRoleContent;
  displayName: string;
  displayEmail: string;
  isOauthAccount: boolean;
  userInitial: string;
}

interface InfoCardItemProps {
  label: string;
  value: string;
  breakAll?: boolean;
}

function InfoCardItem({ label, value, breakAll = false }: InfoCardItemProps) {
  return (
    <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-medium text-on-surface",
          breakAll && "break-all",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AccountSummaryCard({
  content,
  displayName,
  displayEmail,
}: Pick<UserInfoSidebarProps, "content" | "displayName" | "displayEmail">) {
  return (
    <SurfaceCard className="border border-outline/10 p-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            content.accentClassName,
          )}
        >
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Tóm tắt tài khoản
          </h3>
          <p className="text-sm text-muted-foreground">
            Xem nhanh thông tin của tài khoản đang sử dụng.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <InfoCardItem label="Tên hiển thị" value={displayName} />
        <InfoCardItem label="Email" value={displayEmail} breakAll />
        <InfoCardItem label="Vai trò" value={content.badgeLabel} />
      </div>
    </SurfaceCard>
  );
}

function SecurityNotesCard({
  content,
  isOauthAccount,
}: Pick<UserInfoSidebarProps, "content" | "isOauthAccount">) {
  return (
    <SurfaceCard className="border border-outline/10 p-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            content.accentClassName,
          )}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Lưu ý bảo mật
          </h3>
          <p className="text-sm text-muted-foreground">
            Một vài lưu ý trước khi kết nối API lưu thay đổi.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
          {isOauthAccount
            ? "Tài khoản này đang đăng nhập qua nhà cung cấp OAuth, nên việc quản lý mật khẩu được thực hiện ở phía nhà cung cấp."
            : "Sử dụng mật khẩu riêng, không trùng với các nền tảng khác."}
        </div>
        {!isOauthAccount && (
          <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
            Đảm bảo mật khẩu xác nhận khớp hoàn toàn trước khi lưu thay đổi.
          </div>
        )}
        <div className="rounded-2xl border border-outline/10 bg-surface px-4 py-3">
          Giữ tên người dùng dễ nhận biết để học sinh hoặc đồng nghiệp dễ tìm
          thấy bạn.
        </div>
      </div>
    </SurfaceCard>
  );
}

function IntegrationReadyCard({ userInitial }: Pick<UserInfoSidebarProps, "userInitial">) {
  return (
    <SurfaceCard className="border border-dashed border-outline/20 bg-surface-container-low p-5">
      <div className="flex items-center gap-3">
        <div className="flex min-h-12 min-w-12 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface">
          <span className="font-display text-sm font-bold">{userInitial}</span>
        </div>
        <div>
          <p className="font-medium text-on-surface">Sẵn sàng tích hợp</p>
          <p className="text-sm text-muted-foreground">
            Màn hình này hiện chỉ có giao diện và có thể kết nối với API cập
            nhật hồ sơ sau.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function UserInfoSidebar({
  content,
  displayName,
  displayEmail,
  isOauthAccount,
  userInitial,
}: UserInfoSidebarProps) {
  return (
    <div className="space-y-6">
      <AccountSummaryCard
        content={content}
        displayName={displayName}
        displayEmail={displayEmail}
      />
      <SecurityNotesCard
        content={content}
        isOauthAccount={isOauthAccount}
      />
      <IntegrationReadyCard userInitial={userInitial} />
    </div>
  );
}
