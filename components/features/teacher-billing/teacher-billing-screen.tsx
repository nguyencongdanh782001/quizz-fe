"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Coins,
  Crown,
  Eye,
  History,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { billingQueryKeys } from "@/hooks/queries/billing.query-keys";
import { getApiErrorMessage } from "@/lib/api/error-message";
import type {
  BillingPlanResponse,
  PaymentOrderResponse,
} from "@/lib/api/types";
import {
  createPaymentOrder,
  getBillingPlans,
  getPaymentOrders,
  getQCTransactions,
  getQCWallet,
} from "@/services/billing.service";
import { PaymentOrderDialog } from "./payment-order-dialog";
import {
  calculatePlanPreview,
  formatBillingDate,
  formatVND,
  getPaymentStatusLabel,
  getTransactionLabel,
} from "./utils";

interface BillingToast {
  description?: string;
  open: boolean;
  title: string;
  variant: "success" | "error" | "warning";
}

function PaymentStatusBadge({ order }: { order: PaymentOrderResponse }) {
  return (
    <Badge
      variant={
        order.status === "paid"
          ? "success"
          : order.status === "pending" || order.status === "creating"
            ? "warning"
            : "destructive"
      }
    >
      {getPaymentStatusLabel(order.status)}
    </Badge>
  );
}

function PlanCard({
  isCreating,
  onBuy,
  onQuantityChange,
  plan,
  quantity,
}: {
  isCreating: boolean;
  onBuy: () => void;
  onQuantityChange: (quantity: number) => void;
  plan: BillingPlanResponse;
  quantity: number;
}) {
  const preview = calculatePlanPreview(plan, quantity);
  const isPremium = plan.priority_level > 0;

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] ${
        isPremium ? "border-primary/35" : "border-outline/15"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isPremium ? (
              <Crown className="size-5 text-amber-500" />
            ) : (
              <Coins className="size-5 text-primary" />
            )}
            <h3 className="text-lg font-semibold text-on-surface">{plan.name}</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-on-surface">
            {formatVND(plan.price_vnd)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">mỗi gói</p>
        </div>
        {isPremium ? <Badge variant="secondary">Premium</Badge> : null}
      </div>

      <div className="mt-5 space-y-2 border-y border-outline/10 py-4 text-sm">
        <p className="flex items-center gap-2 text-on-surface">
          <CheckCircle2 className="size-4 text-emerald-600" />
          {plan.qc_amount.toLocaleString("vi-VN")} QC mỗi gói
        </p>
        {plan.duration_days > 0 ? (
          <p className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Premium {plan.duration_days} ngày
          </p>
        ) : null}
        {plan.daily_free_more_questions > 0 ? (
          <p className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {plan.daily_free_more_questions} câu tạo thêm miễn phí/ngày
          </p>
        ) : null}
        {plan.discount_min_quantity > 0 ? (
          <p className="flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Giảm {plan.discount_percent}% từ {plan.discount_min_quantity} gói
          </p>
        ) : null}
      </div>

      <div className="mt-auto grid grid-cols-[110px_minmax(0,1fr)] items-end gap-3 pt-4">
        <label className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Số lượng</span>
          <Select
            value={String(quantity)}
            onValueChange={(value) => onQuantityChange(Number(value))}
          >
            <SelectTrigger className="rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Thanh toán</p>
          <p className="mt-1 font-semibold text-on-surface">
            {formatVND(preview.amount)}
          </p>
          {preview.discountPercent > 0 ? (
            <p className="text-xs text-emerald-700">Đã giảm {preview.discountPercent}%</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-on-surface">
        Nhận <strong>{preview.totalQC.toLocaleString("vi-VN")} QC</strong>
        {preview.bonusQC > 0
          ? `, gồm ${preview.bonusQC.toLocaleString("vi-VN")} QC thưởng`
          : ""}
      </div>

      <Button
        type="button"
        className="mt-4 w-full rounded-md"
        disabled={isCreating}
        onClick={onBuy}
      >
        {isCreating ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <WalletCards className="size-4" />
        )}
        {isCreating ? "Đang tạo đơn..." : "Thanh toán"}
      </Button>
    </article>
  );
}

export function TeacherBillingScreen() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [creatingPlanCode, setCreatingPlanCode] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrderResponse | null>(
    null,
  );
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [toast, setToast] = useState<BillingToast | null>(null);

  const plansQuery = useQuery({
    queryKey: billingQueryKeys.plans(),
    queryFn: getBillingPlans,
    staleTime: 5 * 60_000,
  });
  const walletQuery = useQuery({
    queryKey: billingQueryKeys.wallet(),
    queryFn: getQCWallet,
  });
  const ordersQuery = useQuery({
    queryKey: billingQueryKeys.orders(),
    queryFn: () => getPaymentOrders(20),
  });
  const transactionsQuery = useQuery({
    queryKey: billingQueryKeys.transactions(),
    queryFn: () => getQCTransactions(30),
  });

  const createOrderMutation = useMutation({
    mutationFn: createPaymentOrder,
    onSuccess: (order) => {
      setSelectedOrder(order);
      setPaymentOpen(true);
      void queryClient.invalidateQueries({ queryKey: billingQueryKeys.orders() });
    },
    onError: (error) => {
      setToast({
        open: true,
        title: "Không thể tạo đơn thanh toán",
        description: getApiErrorMessage(error),
        variant: "error",
      });
    },
    onSettled: () => setCreatingPlanCode(null),
  });

  const handlePaid = useCallback(
    (order: PaymentOrderResponse) => {
      setSelectedOrder(order);
      setToast((current) =>
        current?.title === "Thanh toán thành công"
          ? current
          : {
              open: true,
              title: "Thanh toán thành công",
              description: `${order.qc_amount.toLocaleString("vi-VN")} QC đã được cộng vào ví.`,
              variant: "success",
            },
      );
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: billingQueryKeys.wallet() }),
        queryClient.invalidateQueries({ queryKey: billingQueryKeys.orders() }),
        queryClient.invalidateQueries({
          queryKey: billingQueryKeys.transactions(),
        }),
      ]);
    },
    [queryClient],
  );

  const hasLoadError =
    plansQuery.isError ||
    walletQuery.isError ||
    ordersQuery.isError ||
    transactionsQuery.isError;
  const wallet = walletQuery.data;
  const plans = plansQuery.data?.items ?? [];
  const orders = ordersQuery.data?.items ?? [];
  const transactions = transactionsQuery.data?.items ?? [];
  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  function buyPlan(plan: BillingPlanResponse) {
    const quantity = quantities[plan.code] ?? 1;
    setCreatingPlanCode(plan.code);
    createOrderMutation.mutate({ plan_code: plan.code, quantity });
  }

  function openOrder(order: PaymentOrderResponse) {
    setSelectedOrder(order);
    setPaymentOpen(true);
  }

  function refreshBilling() {
    void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all });
  }

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">QuizzCoin</p>
            <h1 className="mt-1 text-3xl font-semibold text-on-surface">Ví và gói AI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Nạp QC để tạo câu hỏi bằng AI và theo dõi toàn bộ giao dịch trong một nơi.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={refreshBilling}>
            <RefreshCw className="size-4" />
            Làm mới
          </Button>
        </div>

        <section className="surface-panel grid overflow-hidden rounded-lg md:grid-cols-3">
          <div className="border-b border-outline/10 p-5 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="size-4 text-primary" />
              Số dư hiện tại
            </div>
            <p className="mt-2 text-3xl font-semibold text-on-surface">
              {walletQuery.isLoading
                ? "..."
                : `${(wallet?.balance ?? 0).toLocaleString("vi-VN")} QC`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {wallet?.qc_per_question ?? 0} QC cho mỗi câu hỏi tính phí
            </p>
          </div>
          <div className="border-b border-outline/10 p-5 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="size-4 text-amber-500" />
              Trạng thái gói
            </div>
            <p className="mt-2 text-xl font-semibold text-on-surface">
              {wallet?.premium_active ? "Premium đang hoạt động" : "Gói QC thông thường"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {wallet?.premium_active
                ? `Hết hạn ${formatBillingDate(wallet.premium_expires_at)}`
                : "Không giới hạn thời gian sử dụng số QC đã nạp"}
            </p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-secondary" />
              Câu tạo thêm miễn phí
            </div>
            <p className="mt-2 text-3xl font-semibold text-on-surface">
              {wallet?.free_more_questions_remaining ?? 0}
              <span className="ml-1 text-base font-medium text-muted-foreground">
                / {wallet?.free_more_questions_daily ?? 0}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tự làm mới mỗi ngày khi Premium còn hiệu lực
            </p>
          </div>
        </section>

        {hasLoadError ? (
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            Không thể tải đầy đủ dữ liệu thanh toán.
            <Button type="button" variant="outline" size="sm" onClick={refreshBilling}>
              Thử lại
            </Button>
          </div>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-on-surface">Chọn gói QuizzCoin</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Giá và quyền lợi được lấy trực tiếp từ hệ thống.
              </p>
            </div>
            {pendingOrders > 0 ? (
              <Badge variant="warning">{pendingOrders} đơn đang chờ</Badge>
            ) : null}
          </div>

          {plansQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center rounded-lg border border-outline/15 bg-white text-muted-foreground">
              <LoaderCircle className="mr-2 size-5 animate-spin" />
              Đang tải danh sách gói...
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  quantity={quantities[plan.code] ?? 1}
                  isCreating={
                    createOrderMutation.isPending && creatingPlanCode === plan.code
                  }
                  onQuantityChange={(quantity) =>
                    setQuantities((current) => ({
                      ...current,
                      [plan.code]: quantity,
                    }))
                  }
                  onBuy={() => buyPlan(plan)}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="overflow-hidden rounded-lg border border-outline/15 bg-white">
            <div className="flex items-center gap-3 border-b border-outline/10 px-4 py-3">
              <ReceiptText className="size-5 text-primary" />
              <div>
                <h2 className="font-semibold text-on-surface">Đơn thanh toán</h2>
                <p className="text-xs text-muted-foreground">20 đơn gần nhất</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-155 text-left text-sm">
                <thead className="bg-surface text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã đơn</th>
                    <th className="px-4 py-3 font-medium">Gói</th>
                    <th className="px-4 py-3 font-medium">Số tiền</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="w-16 px-4 py-3 font-medium">Xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-on-surface">
                        {order.transfer_code}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.plan_name} × {order.quantity}
                      </td>
                      <td className="px-4 py-3 text-on-surface">
                        {formatVND(order.amount_vnd)}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge order={order} />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="size-8 rounded-md"
                          title="Xem đơn thanh toán"
                          aria-label="Xem đơn thanh toán"
                          onClick={() => openOrder(order)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!ordersQuery.isLoading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Chưa có đơn thanh toán.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-outline/15 bg-white">
            <div className="flex items-center gap-3 border-b border-outline/10 px-4 py-3">
              <History className="size-5 text-secondary" />
              <div>
                <h2 className="font-semibold text-on-surface">Biến động QuizzCoin</h2>
                <p className="text-xs text-muted-foreground">30 giao dịch gần nhất</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-145 text-left text-sm">
                <thead className="bg-surface text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nội dung</th>
                    <th className="px-4 py-3 font-medium">Thời gian</th>
                    <th className="px-4 py-3 text-right font-medium">Thay đổi</th>
                    <th className="px-4 py-3 text-right font-medium">Số dư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 font-medium text-on-surface">
                        {getTransactionLabel(transaction.transaction_type)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatBillingDate(transaction.created_at)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          transaction.amount >= 0 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {transaction.amount.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface">
                        {transaction.balance_after.toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                  {!transactionsQuery.isLoading && transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        Chưa có biến động QuizzCoin.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <PaymentOrderDialog
        open={paymentOpen}
        order={selectedOrder}
        onOpenChange={setPaymentOpen}
        onPaid={handlePaid}
      />

      {toast ? (
        <Toast
          open={toast.open}
          variant={toast.variant}
          onOpenChange={(open) =>
            setToast((current) => (current ? { ...current, open } : current))
          }
        >
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? (
              <ToastDescription>{toast.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ) : null}
      <ToastViewport />
    </ToastProvider>
  );
}
