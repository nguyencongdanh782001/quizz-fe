import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RemoveStudentButton({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      aria-label="Remove student"
      disabled={isLoading}
      onClick={onClick}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isLoading ? "Đang đuổi..." : "Đuổi"}
    </Button>
  );
}
