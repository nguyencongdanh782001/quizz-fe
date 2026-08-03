"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { billingQueryKeys } from "@/hooks/queries/billing.query-keys";
import type { PaymentOrderResponse } from "@/lib/api/types";
import { getPaymentOrder } from "@/services/billing.service";
import {
  formatBillingDate,
  formatVND,
  getPaymentStatusLabel,
} from "./utils";

interface PaymentOrderDialogProps {
  onOpenChange: (open: boolean) => void;
  onPaid: (order: PaymentOrderResponse) => void;
  open: boolean;
  order: PaymentOrderResponse | null;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function CopyValueButton({
  copied,
  label,
  onCopy,
}: {
  copied: boolean;
  label: string;
  onCopy: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9 shrink-0 rounded-md"
      aria-label={`Sao chép ${label}`}
      title={`Sao chép ${label}`}
      onClick={onCopy}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

export function PaymentOrderDialog({
  onOpenChange,
  onPaid,
  open,
  order,
}: PaymentOrderDialogProps) {
  const [now, setNow] = useState(() => Date.now());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const orderId = order?.id ?? null;

  const orderQuery = useQuery({
    queryKey:
      orderId === null
        ? billingQueryKeys.order("missing")
        : billingQueryKeys.order(orderId),
    queryFn: () => getPaymentOrder(orderId as number),
    enabled: open && orderId !== null,
    initialData: order ?? undefined,
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? order?.status;
      return status === "creating" || status === "pending" ? 2500 : false;
    },
    refetchIntervalInBackground: true,
  });

  const currentOrder = orderQuery.data ?? order;
  const secondsLeft = useMemo(() => {
    if (!currentOrder) {
      return 0;
    }
    return Math.max(
      0,
      Math.ceil((new Date(currentOrder.expires_at).getTime() - now) / 1000),
    );
  }, [currentOrder, now]);

  useEffect(() => {
    if (!open || currentOrder?.status !== "pending") {
      return;
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [currentOrder?.status, open]);

  useEffect(() => {
    if (currentOrder?.status === "paid") {
      onPaid(currentOrder);
    }
  }, [currentOrder, onPaid]);

  async function copyValue(field: string, value: string) {
    if (!navigator.clipboard?.writeText) {
      return;
    }
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1800);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-1.5rem,760px)] rounded-lg p-5 sm:p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-3 pr-10">
            <DialogTitle>Thanh toán gói QuizzCoin</DialogTitle>
            {currentOrder ? (
              <Badge
                variant={
                  currentOrder.status === "paid"
                    ? "success"
                    : currentOrder.status === "pending"
                      ? "warning"
                      : "destructive"
                }
              >
                {getPaymentStatusLabel(currentOrder.status)}
              </Badge>
            ) : null}
          </div>
          <DialogDescription>
            Quét mã QR hoặc chuyển khoản đúng số tiền của đơn hàng.
          </DialogDescription>
        </DialogHeader>

        {!currentOrder ? (
          <div className="flex min-h-56 items-center justify-center text-muted-foreground">
            <LoaderCircle className="mr-2 size-5 animate-spin" />
            Đang tải đơn thanh toán...
          </div>
        ) : currentOrder.status === "paid" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
            <CheckCircle2 className="mx-auto size-10" />
            <p className="mt-3 text-lg font-semibold">Thanh toán thành công</p>
            <p className="mt-1 text-sm">
              {currentOrder.qc_amount.toLocaleString("vi-VN")} QC đã được cộng vào ví.
            </p>
          </div>
        ) : currentOrder.status === "expired" || currentOrder.status === "failed" ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <TriangleAlert className="mx-auto size-9" />
            <p className="mt-3 font-semibold">
              {currentOrder.status === "expired"
                ? "Đơn thanh toán đã hết hạn"
                : "Không thể xử lý đơn thanh toán"}
            </p>
            <p className="mt-1 text-sm">Đóng cửa sổ và tạo một đơn mới để tiếp tục.</p>
          </div>
        ) : (
          <div className="grid min-h-0 gap-5 overflow-y-auto md:grid-cols-[260px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center rounded-lg border border-outline/15 bg-white p-4">
              {currentOrder.qr_url ? (
                // The payment provider owns this dynamic QR image URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentOrder.qr_url}
                  alt="Mã QR thanh toán SePay"
                  className="aspect-square w-full max-w-56 object-contain"
                />
              ) : (
                <LoaderCircle className="size-8 animate-spin text-primary" />
              )}
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-700">
                <Clock3 className="size-4" />
                Còn {formatCountdown(secondsLeft)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-outline/15 bg-surface p-3">
                <p className="text-xs uppercase text-muted-foreground">Gói đã chọn</p>
                <p className="mt-1 font-semibold text-on-surface">
                  {currentOrder.plan_name} × {currentOrder.quantity}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nhận {currentOrder.qc_amount.toLocaleString("vi-VN")} QC
                </p>
              </div>

              {[
                {
                  field: "account",
                  label: "Tài khoản nhận",
                  value: currentOrder.payment_account ?? "-",
                },
                {
                  field: "amount",
                  label: "Số tiền",
                  value: formatVND(currentOrder.amount_vnd),
                },
                {
                  field: "content",
                  label: "Nội dung chuyển khoản",
                  value: currentOrder.transfer_code,
                },
              ].map((item) => (
                <div
                  key={item.field}
                  className="flex items-center gap-3 rounded-lg border border-outline/15 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-0.5 break-all font-semibold text-on-surface">
                      {item.value}
                    </p>
                  </div>
                  <CopyValueButton
                    copied={copiedField === item.field}
                    label={item.label}
                    onCopy={() => copyValue(item.field, item.value)}
                  />
                </div>
              ))}

              <p className="text-xs leading-5 text-muted-foreground">
                Đơn hết hạn lúc {formatBillingDate(currentOrder.expires_at)}. Số dư sẽ tự
                cập nhật sau khi SePay xác nhận giao dịch.
              </p>
            </div>
          </div>
        )}

        {orderQuery.isError ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Không thể cập nhật trạng thái đơn.
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => orderQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              Thử lại
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {currentOrder?.status === "paid" ? "Hoàn tất" : "Đóng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
