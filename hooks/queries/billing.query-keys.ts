export const billingQueryKeys = {
  all: ["billing"] as const,
  plans: () => ["billing", "plans"] as const,
  wallet: () => ["billing", "wallet"] as const,
  orders: () => ["billing", "orders"] as const,
  order: (orderId: number | string) =>
    ["billing", "orders", orderId] as const,
  transactions: () => ["billing", "transactions"] as const,
  estimate: (
    questionCount: number,
    operation: "initial" | "generate_more",
  ) => ["billing", "estimate", operation, questionCount] as const,
} as const;
