import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RemoveStudentButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Mời học sinh khỏi lớp"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={disabled}
      onClick={onClick}
    >
      <UserMinus className="h-3.5 w-3.5" />
      Mời rời lớp
    </Button>
  );
}
