import type {
  BillingPlanResponse,
  PaymentOrderStatus,
} from "@/lib/api/types";

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatBillingDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getPaymentStatusLabel(status: PaymentOrderStatus): string {
  const labels: Record<PaymentOrderStatus, string> = {
    creating: "Đang tạo",
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    expired: "Đã hết hạn",
    failed: "Thất bại",
  };

  return labels[status];
}

export function getTransactionLabel(type: string): string {
  const labels: Record<string, string> = {
    ai_charge: "Tạo câu hỏi AI",
    ai_reserve: "Tạo câu hỏi AI",
    ai_refund: "Hoàn QC từ AI",
    payment_credit: "Nạp QC",
    welcome_credit: "QC chào mừng",
  };

  return labels[type] ?? type;
}

export function getDiscountPercentByQuantity(
  plan: BillingPlanResponse,
  quantity: number,
): number {
  if (quantity >= 12) return 25;
  if (quantity >= 6) return 15;
  if (quantity >= 3) return 10;
  if (plan.discount_min_quantity > 0 && quantity >= plan.discount_min_quantity) {
    return plan.discount_percent;
  }
  return 0;
}

export function calculatePlanPreview(
  plan: BillingPlanResponse,
  quantity: number,
) {
  const discountPercent = getDiscountPercentByQuantity(plan, quantity);
  const discountApplied = discountPercent > 0;
  const bonusPercent = discountApplied ? plan.bonus_qc_percent : 0;
  const subtotal = plan.price_vnd * quantity;
  const amount = Math.floor((subtotal * (100 - discountPercent)) / 100);
  const baseQC = plan.qc_amount * quantity;
  const bonusQC = Math.floor((baseQC * bonusPercent) / 100);

  return {
    amount,
    baseQC,
    bonusQC,
    discountPercent,
    entitlementDays: plan.duration_days * quantity,
    totalQC: baseQC + bonusQC,
  };
}
