import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserInfoSaveButtonVariant } from "./types";

interface UserInfoFormActionsProps {
  saveButtonVariant: UserInfoSaveButtonVariant;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function UserInfoFormActions({
  saveButtonVariant,
  isSubmitting,
  onCancel,
}: UserInfoFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-outline/10 pt-6 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-11 rounded-xl px-5"
      >
        Hủy
      </Button>
      <Button
        type="submit"
        variant={saveButtonVariant}
        disabled={isSubmitting}
        className="h-11 rounded-xl px-5"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Lưu thay đổi
      </Button>
    </div>
  );
}
