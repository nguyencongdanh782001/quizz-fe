import { client } from "@/lib/api/client";
import type {
  AIQCCostEstimateRequest,
  AIQCCostEstimateResponse,
  BillingPlanListResponse,
  CreatePaymentOrderRequest,
  PaymentOrderListResponse,
  PaymentOrderResponse,
  QCTransactionListResponse,
  QCWalletResponse,
} from "@/lib/api/types";

export async function getBillingPlans(): Promise<BillingPlanListResponse> {
  const response = await client.get<BillingPlanListResponse>(
    "/api/billing/plans",
  );
  return response.data;
}

export async function getQCWallet(): Promise<QCWalletResponse> {
  const response = await client.get<QCWalletResponse>("/api/billing/wallet");
  return response.data;
}

export async function estimateAIQCCost(
  data: AIQCCostEstimateRequest,
): Promise<AIQCCostEstimateResponse> {
  const response = await client.post<AIQCCostEstimateResponse>(
    "/api/billing/ai-cost/estimate",
    data,
  );
  return response.data;
}

export async function createPaymentOrder(
  data: CreatePaymentOrderRequest,
): Promise<PaymentOrderResponse> {
  const response = await client.post<PaymentOrderResponse>(
    "/api/billing/orders",
    data,
    { timeout: 30_000 },
  );
  return response.data;
}

export async function getPaymentOrder(
  orderId: number | string,
): Promise<PaymentOrderResponse> {
  const response = await client.get<PaymentOrderResponse>(
    `/api/billing/orders/${orderId}`,
  );
  return response.data;
}

export async function getPaymentOrders(
  limit = 20,
): Promise<PaymentOrderListResponse> {
  const response = await client.get<PaymentOrderListResponse>(
    "/api/billing/orders",
    { params: { limit } },
  );
  return response.data;
}

export async function getQCTransactions(
  limit = 50,
): Promise<QCTransactionListResponse> {
  const response = await client.get<QCTransactionListResponse>(
    "/api/billing/transactions",
    { params: { limit } },
  );
  return response.data;
}
