"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  Crown,
  Eye,
  FileCheck,
  History,
  Info,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function BillingPaginationFooter({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  function commitJumpPage(value: string) {
    const requestedPage = Number.parseInt(value, 10);
    if (Number.isFinite(requestedPage)) {
      onPageChange(Math.min(Math.max(requestedPage, 1), totalPages));
    }
  }

  return (
    <div className="grid items-center gap-3 border-t border-[#E3E7EE] pt-4 text-xs text-[#1E293B] lg:grid-cols-[1fr_auto_1fr]">
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <span>Số hàng hiển thị trên trang:</span>
        <label className="relative">
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 appearance-none border-0 bg-transparent py-0 pl-2 pr-7 font-semibold text-[#3F63F3] outline-none"
            aria-label="Số hàng hiển thị trên trang"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#3F63F3]" />
        </label>
        <span>của tổng số {total}</span>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] disabled:opacity-30"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] disabled:opacity-30"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="flex size-9 items-center justify-center rounded-full bg-[#3F63F3] font-bold text-white shadow-sm">
          {page}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] disabled:opacity-30"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] disabled:opacity-30"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Trang cuối"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 lg:justify-end">
        <span>Chuyển đến trang:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={page}
          onChange={(event) => commitJumpPage(event.target.value)}
          className="h-9 w-14 rounded-[8px] border border-[#E3E7EE] bg-white text-center text-xs font-semibold outline-none focus:border-[#3F63F3]"
          aria-label="Chuyển đến trang"
        />
      </div>
    </div>
  );
}
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

type ServiceTab = "package" | "invoice";

interface BillingToast {
  description?: string;
  open: boolean;
  title: string;
  variant: "success" | "error" | "warning";
}

function withPackagePrefix(name: string) {
  const normalizedName = name.trim();
  return /^gói\s/i.test(normalizedName)
    ? normalizedName
    : `Gói ${normalizedName}`;
}

function getCurrentPackageName(
  plans: BillingPlanResponse[],
  orders: PaymentOrderResponse[],
  premiumActive: boolean,
  priorityLevel: number,
) {
  if (!premiumActive) {
    return "Gói miễn phí";
  }

  const latestPaidOrder = orders
    .filter((order) => order.status === "paid")
    .sort(
      (left, right) =>
        new Date(right.paid_at ?? right.created_at).getTime() -
        new Date(left.paid_at ?? left.created_at).getTime(),
    )[0];

  if (latestPaidOrder) {
    return withPackagePrefix(latestPaidOrder.plan_name);
  }

  const priorityPlan = plans.find(
    (plan) => plan.priority_level === priorityLevel,
  );

  return priorityPlan ? withPackagePrefix(priorityPlan.name) : "Gói Premium";
}

function getPlanBenefits(plan: BillingPlanResponse, quantity: number) {
  const preview = calculatePlanPreview(plan, quantity);
  const benefits = [
    `${preview.totalQC.toLocaleString("vi-VN")} QC được cộng vào ví`,
    "QC đã nạp không hết hạn",
    "Tạo và quản lý lớp học, đề thi",
    "Theo dõi đầy đủ lịch sử sử dụng",
  ];

  if (preview.bonusQC > 0) {
    benefits.splice(
      1,
      0,
      `${preview.bonusQC.toLocaleString("vi-VN")} QC thưởng`,
    );
  }
  if (plan.duration_days > 0) {
    benefits.push(`Premium ${preview.entitlementDays} ngày`);
  }
  if (plan.daily_free_more_questions > 0) {
    benefits.push(
      `${plan.daily_free_more_questions} câu tạo thêm miễn phí/ngày`,
    );
  }
  if (preview.discountPercent > 0) {
    benefits.push(`Giảm ${preview.discountPercent}% khi mua ${quantity} gói`);
  }

  return benefits;
}

function getQuantityDiscount(plans: BillingPlanResponse[], quantity: number) {
  if (quantity >= 12) return 25;
  if (quantity >= 6) return 15;
  if (quantity >= 3) return 10;
  return plans.reduce((highestDiscount, plan) => {
    const qualifies =
      plan.discount_min_quantity > 0 && quantity >= plan.discount_min_quantity;

    return qualifies
      ? Math.max(highestDiscount, plan.discount_percent)
      : highestDiscount;
  }, 0);
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
  featured,
  isCreating,
  onBuy,
  plan,
  quantity,
}: {
  featured: boolean;
  isCreating: boolean;
  onBuy: () => void;
  plan: BillingPlanResponse;
  quantity: number;
}) {
  const preview = calculatePlanPreview(plan, quantity);
  const benefits = getPlanBenefits(plan, quantity);

  return (
    <article
      className={`relative flex min-h-[460px] flex-col rounded-[12px] bg-white p-6 transition-shadow hover:shadow-lg ${
        featured
          ? "border-2 border-[#3B82F6] shadow-md"
          : "border border-[#ECECEC] shadow-sm"
      }`}
    >
      {featured ? (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#3B82F6] px-3.5 py-1 text-xs font-bold text-white shadow-sm">
          ★ Phổ biến nhất
        </span>
      ) : null}

      <div>
        <h3 className="text-xl font-bold text-[#1E293B]">
          {withPackagePrefix(plan.name)}
        </h3>
        <p className="mt-2 text-xs leading-5 text-[#64748B] min-h-[36px]">
          {plan.priority_level > 0
            ? "Phù hợp cho gia sư và giáo viên cá nhân. Quản lý học viên & tạo đề AI dễ dàng."
            : "Bổ sung QuizzCoin để tiếp tục tạo câu hỏi bằng AI."}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-[#3B82F6]">
          {formatVND(preview.amount)}
        </p>
        {quantity > 1 ? (
          <p className="mt-1 text-xs font-semibold text-[#E11D48]">
            {formatVND(Math.round(preview.amount / quantity))} / gói
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#64748B]">Tổng thanh toán cho 1 gói</p>
        )}
      </div>

      <div className="my-5 border-t border-[#ECECEC]" />

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Quyền lợi
        </p>
        <ul className="space-y-3 text-xs text-[#334155]">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-6">
        <Button
          type="button"
          className={`h-11 w-full rounded-[8px] text-sm font-bold text-white transition-colors shadow-sm ${
            featured
              ? "bg-[#3B82F6] hover:bg-[#2563EB]"
              : "bg-[#3F63F3] hover:bg-[#3151D8]"
          }`}
          disabled={isCreating}
          onClick={onBuy}
        >
          {isCreating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            "Nâng cấp ngay"
          )}
        </Button>
      </div>
    </article>
  );
}

export function TeacherBillingScreen() {
  const queryClient = useQueryClient();
  const [serviceTab, setServiceTab] = useState<ServiceTab>("package");
  const [showUpgradePage, setShowUpgradePage] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [creatingPlanCode, setCreatingPlanCode] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] =
    useState<PaymentOrderResponse | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [toast, setToast] = useState<BillingToast | null>(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");

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
      void queryClient.invalidateQueries({
        queryKey: billingQueryKeys.orders(),
      });
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
  const currentPackageName = getCurrentPackageName(
    plans,
    orders,
    wallet?.premium_active ?? false,
    wallet?.priority_level ?? 0,
  );

  const visibleTransactions = transactions.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  );

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !invoiceSearch ||
      order.transfer_code.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      order.plan_name.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesStatus =
      invoiceStatusFilter === "all" || order.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const visibleOrders = filteredOrders.slice(
    (invoicePage - 1) * invoicePageSize,
    invoicePage * invoicePageSize,
  );

  function buyPlan(plan: BillingPlanResponse) {
    setCreatingPlanCode(plan.code);
    createOrderMutation.mutate({
      plan_code: plan.code,
      quantity: selectedQuantity,
    });
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
      <div className="w-full space-y-4">
        {!showUpgradePage ? (
          <nav
            className="relative flex items-center justify-between rounded-[2px] border border-[#DDE2EB] bg-white px-2 shadow-[0_1px_3px_rgba(30,41,59,0.04)]"
            aria-label="Loại dịch vụ"
          >
            <div className="flex items-center">
              {(["package", "invoice"] as const).map((tab) => {
                const active = serviceTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setServiceTab(tab)}
                    className={`relative px-4 pt-4 pb-4 text-sm font-semibold transition-colors ${
                      active
                        ? "text-[#E11D48]"
                        : "text-[#526079] hover:text-[#1E293B]"
                    }`}
                  >
                    {tab === "package" ? "Gói dịch vụ" : "Hoá đơn"}
                    {active ? (
                      <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#E11D48]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}

        {hasLoadError ? (
          <div className="flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            Không thể tải đầy đủ dữ liệu thanh toán.
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshBilling}
            >
              Thử lại
            </Button>
          </div>
        ) : null}

        {serviceTab === "package" ? (
          showUpgradePage ? (
            <section className="space-y-6 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-[6px]"
                onClick={() => setShowUpgradePage(false)}
              >
                <ArrowLeft className="size-4" />
                Quay lại thông tin gói
              </Button>

              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">
                  Nâng cấp trải nghiệm tạo đề AI
                </h1>
                <p className="mt-2 text-sm text-[#475569]">
                  Chọn số lượng gói phù hợp. Giá và quyền lợi được lấy trực tiếp
                  từ hệ thống.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex items-center rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-1 shadow-sm">
                  {[1, 3, 6, 12].map((quantity) => (
                    <div key={quantity} className="relative">
                      {getQuantityDiscount(plans, quantity) > 0 ? (
                        <span className="pointer-events-none absolute -right-1 -top-3 z-10 rounded-full bg-[#E11D48] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          -{getQuantityDiscount(plans, quantity)}%
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setSelectedQuantity(quantity)}
                        className={`rounded-[6px] px-6 py-2.5 text-sm font-bold transition-all ${
                          selectedQuantity === quantity
                            ? "bg-[#3F63F3] text-white shadow-sm"
                            : "text-[#475569] hover:bg-white hover:text-[#1E293B]"
                        }`}
                      >
                        {quantity} gói
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {plansQuery.isLoading ? (
                <div className="flex min-h-72 items-center justify-center border border-[#ECECEC] bg-white text-[#64748B]">
                  <LoaderCircle className="mr-2 size-5 animate-spin" />
                  Đang tải danh sách gói...
                </div>
              ) : plans.length > 0 ? (
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan, index) => (
                    <PlanCard
                      key={plan.code}
                      plan={plan}
                      quantity={selectedQuantity}
                      featured={
                        plans.length > 1 &&
                        index === Math.floor(plans.length / 2)
                      }
                      isCreating={
                        createOrderMutation.isPending &&
                        creatingPlanCode === plan.code
                      }
                      onBuy={() => buyPlan(plan)}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#CBD5E1] bg-white px-5 py-12 text-center text-sm text-[#64748B]">
                  Chưa có gói dịch vụ khả dụng.
                </div>
              )}
            </section>
          ) : (
            <section className="space-y-6 rounded-[2px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.04)] sm:p-6">
              {/* Top Section: Package Card + Sub Cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Package Card */}
                <article className="flex flex-col overflow-hidden rounded-[10px] border border-[#ECECEC] bg-white shadow-sm">
                  <div className="relative flex min-h-[160px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#8B5CF6] via-[#A855F7] to-[#C084FC] p-5 text-white">
                    <Crown className="pointer-events-none absolute -right-3 -top-4 size-32 text-amber-300/80" />
                    <span className="relative z-10 w-fit rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                      {currentPackageName}
                    </span>
                    <div className="relative z-10 mt-5">
                      <p className="text-xs text-purple-100">
                        {wallet?.premium_active
                          ? "Thời gian hết hạn"
                          : "Thời hạn sử dụng"}
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {wallet?.premium_active
                          ? formatBillingDate(wallet.premium_expires_at)
                          : "18:29 20/03/2027"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Quyền lợi
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-[#334155]">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Không giới hạn tạo đề thi & bài kiểm tra
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Quản lý lớp học tập
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Quản lý học viên
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Quản lý giao bài tập
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Quản lý giao đề thi
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Không giới hạn lượt thi kiểm tra
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Không giới hạn lượt tạo đề
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Không giới hạn lượt tạo câu hỏi
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Không giới hạn thiết bị đăng nhập
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Hỗ trợ giờ hành chính
                      </li>
                    </ul>
                  </div>

                  <div className="mt-auto p-5 pt-1">
                    <Button
                      type="button"
                      className="h-9 w-full rounded-[6px] bg-[#A855F7] text-sm font-bold text-white transition-colors hover:bg-[#9333EA]"
                      onClick={() => setShowUpgradePage(true)}
                    >
                      Nâng cấp gói dịch vụ
                    </Button>
                  </div>
                </article>

                {/* Right Sub Cards */}
                <div className="grid gap-4 self-start sm:grid-cols-2 lg:col-span-2">
                  <article className="rounded-[10px] border border-[#ECECEC] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                      <FileCheck className="size-4 text-[#3B82F6]" />
                      Đề thi & Bài kiểm tra
                    </div>
                    <p className="mt-5 text-sm text-[#64748B]">
                      Đã tạo thành công:
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#3B82F6]">
                      Không giới hạn
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
                      Hệ thống hỗ trợ tạo và giao đề thi, bài kiểm tra không giới hạn cho học viên.
                    </p>
                  </article>

                  <article className="flex flex-col justify-between rounded-[10px] border border-[#ECECEC] bg-white p-5 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                          <Coins className="size-4 text-[#4F46E5]" />
                          QuizzCoin
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-[6px] bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                          onClick={() => setShowUpgradePage(true)}
                        >
                          <WalletCards className="mr-1 size-3.5" />
                          Mua thêm
                        </Button>
                      </div>
                      <p className="mt-5 text-sm text-[#64748B]">Còn lại:</p>
                      <p className="mt-1 text-2xl font-bold text-[#3B82F6]">
                        {walletQuery.isLoading
                          ? "..."
                          : `${(wallet?.balance ?? 0).toLocaleString("vi-VN")}`}
                      </p>
                    </div>
                    <p className="mt-4 flex items-center gap-1 text-xs text-[#4F46E5]">
                      <Info className="size-3.5" />
                      {wallet?.qc_per_question ?? 0} QC cho mỗi câu hỏi tính phí
                    </p>
                  </article>
                </div>
              </div>

              {/* Divider Line */}
              <div className="border-t border-[#ECECEC]" />

              {/* Bottom History Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#1E293B]">
                    Lịch sử sử dụng tính năng
                  </h2>
                  <div className="mt-2 border-b border-[#ECECEC]">
                    <span className="relative inline-block pb-2 text-xs font-semibold text-[#4F46E5]">
                      QuizzCoin
                      <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#4F46E5]" />
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#334155]">
                      <tr>
                        <th className="px-4 py-3">Phân loại</th>
                        <th className="px-4 py-3">Số lượng</th>
                        <th className="px-4 py-3">Nội dung mô tả</th>
                        <th className="px-4 py-3 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECECEC] text-xs text-[#1E293B]">
                      {visibleTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="transition-colors hover:bg-[#F8FAFC]"
                        >
                          <td className="px-4 py-3 font-medium text-[#1E293B]">
                            {getTransactionLabel(transaction.transaction_type)}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              transaction.amount >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount >= 0 ? "+" : ""}
                            {transaction.amount.toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-[#64748B]">
                            Số dư: {transaction.balance_after.toLocaleString("vi-VN")} QC
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B]">
                            {formatBillingDate(transaction.created_at)}
                          </td>
                        </tr>
                      ))}
                      {!transactionsQuery.isLoading &&
                      transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-12 text-center text-[#94A3B8]"
                          >
                            Không tìm thấy dữ liệu nào!
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <BillingPaginationFooter
                  page={historyPage}
                  pageSize={historyPageSize}
                  total={transactions.length}
                  totalPages={Math.max(
                    1,
                    Math.ceil(transactions.length / historyPageSize),
                  )}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={(size) => {
                    setHistoryPageSize(size);
                    setHistoryPage(1);
                  }}
                />
              </div>
            </section>
          )
        ) : (
          <section className="space-y-5 rounded-[2px] border border-[#DDE2EB] bg-white p-5 shadow-[0_1px_3px_rgba(30,41,59,0.04)] sm:p-6">
            {/* Filters Row (Mã đơn hàng, Trạng thái) matching Image 3 */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                  Mã đơn hàng
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setInvoicePage(1);
                    }}
                    placeholder="Nhập từ khóa tìm kiếm..."
                    className="h-9 w-full rounded-[6px] border border-[#ECECEC] bg-white pl-9 pr-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
                  Trạng thái
                </label>
                <div className="relative">
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => {
                      setInvoiceStatusFilter(e.target.value);
                      setInvoicePage(1);
                    }}
                    className="h-9 w-full appearance-none rounded-[6px] border border-[#ECECEC] bg-white px-3 text-xs text-[#1E293B] outline-none transition-colors focus:border-[#3B82F6]"
                  >
                    <option value="all">Chọn Trạng thái</option>
                    <option value="paid">Thành công</option>
                    <option value="pending">Đang xử lý</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="failed">Thất bại</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>
            </div>

            {/* Table with headers matching Image 3 */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#334155]">
                  <tr>
                    <th className="px-4 py-3">Số hoá đơn</th>
                    <th className="px-4 py-3">Gói dịch vụ</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="w-24 px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC] text-xs text-[#1E293B]">
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-3 font-medium text-[#1E293B]">
                        {order.transfer_code}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {order.plan_name} × {order.quantity}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1E293B]">
                        {formatVND(order.amount_vnd)}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge order={order} />
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {formatBillingDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="size-8 rounded-[6px]"
                          title="Xem đơn thanh toán"
                          aria-label="Xem đơn thanh toán"
                          onClick={() => openOrder(order)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!ordersQuery.isLoading && filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-[#94A3B8]"
                      >
                        Không tìm thấy dữ liệu nào!
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <BillingPaginationFooter
              page={invoicePage}
              pageSize={invoicePageSize}
              total={filteredOrders.length}
              totalPages={Math.max(
                1,
                Math.ceil(filteredOrders.length / invoicePageSize),
              )}
              onPageChange={setInvoicePage}
              onPageSizeChange={(size) => {
                setInvoicePageSize(size);
                setInvoicePage(1);
              }}
            />
          </section>
        )}
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
