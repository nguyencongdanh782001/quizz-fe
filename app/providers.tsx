"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Suspense, useState, useEffect } from "react";
import { registerQueryClient } from "@/lib/auth/logout-and-clear-session";
import { AuthEventListener } from "@/components/common/AuthEventListener";
import { AnalyticsTracker } from "@/components/common/AnalyticsTracker";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    registerQueryClient(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthEventListener>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </AuthEventListener>
    </QueryClientProvider>
  );
}
