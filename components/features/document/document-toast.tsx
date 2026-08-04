"use client";

import * as React from "react";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

type DocumentToastVariant = "default" | "success" | "warning" | "error";

interface DocumentToastItem {
  id: number;
  open: boolean;
  title: string;
  description?: string;
  variant: DocumentToastVariant;
}

interface DocumentToastContextValue {
  notify: (toast: Omit<DocumentToastItem, "id" | "open">) => void;
}

const DocumentToastContext = React.createContext<DocumentToastContextValue>({
  notify: () => {},
});

let nextToastId = 1;

export function DocumentToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<DocumentToastItem[]>([]);

  const notify = React.useCallback(
    (toast: Omit<DocumentToastItem, "id" | "open">) => {
      setToasts((current) => [
        ...current,
        {
          ...toast,
          id: nextToastId++,
          open: true,
        },
      ]);
    },
    [],
  );

  const handleOpenChange = React.useCallback((toastId: number, open: boolean) => {
    setToasts((current) =>
      open
        ? current.map((toast) =>
            toast.id === toastId ? { ...toast, open: true } : toast,
          )
        : current.filter((toast) => toast.id !== toastId),
    );
  }, []);

  return (
    <DocumentToastContext.Provider value={{ notify }}>
      <ToastProvider duration={3500}>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            variant={toast.variant}
            onOpenChange={(open) => handleOpenChange(toast.id, open)}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description ? (
                <ToastDescription>{toast.description}</ToastDescription>
              ) : null}
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </DocumentToastContext.Provider>
  );
}

export function useDocumentToast() {
  return React.useContext(DocumentToastContext);
}
