export function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-[8px] bg-surface-container-lowest p-6 text-sm text-muted-foreground">
      Đang tải {label.toLowerCase()}...
    </div>
  );
}
