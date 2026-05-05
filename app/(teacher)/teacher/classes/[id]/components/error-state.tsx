import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-5 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-1">{message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void onRetry()}
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
}
