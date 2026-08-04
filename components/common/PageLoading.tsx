import { cn } from "@/lib/utils";

interface PageLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PageLoading({ className, size = "md" }: PageLoadingProps) {
  const outerSize =
    size === "sm" ? "size-10" : size === "lg" ? "size-16" : "size-14";
  const innerSize =
    size === "sm" ? "size-5" : size === "lg" ? "size-8" : "size-7";
  const dotSize =
    size === "sm" ? "size-2" : size === "lg" ? "size-3.5" : "size-2.5";

  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-white dark:bg-[#0F172A]",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div
          className={cn(
            "rounded-full border-[3.5px] border-[#806bf9]/20 border-t-[#6557f5] animate-spin",
            outerSize,
          )}
        />
        {/* Inner ring spinning reverse */}
        <div
          className={cn(
            "absolute rounded-full border-[3px] border-[#d63cf4]/25 border-b-[#d63cf4] animate-spin [animation-duration:0.8s] [animation-direction:reverse]",
            innerSize,
          )}
        />
        {/* Center glowing dot */}
        <div
          className={cn(
            "absolute rounded-full bg-[linear-gradient(135deg,#3478ff_0%,#6557f5_50%,#d63cf4_100%)] shadow-[0_0_12px_rgba(101,87,245,0.6)] animate-pulse",
            dotSize,
          )}
        />
      </div>
    </div>
  );
}
