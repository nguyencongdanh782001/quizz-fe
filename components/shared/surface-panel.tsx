import { cn } from "@/lib/utils";

interface SurfacePanelProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "form";
  tone?: "default" | "muted" | "accent";
}

const toneClassName = {
  default:
    "border border-[#DDE2EB] bg-white shadow-[0_1px_2px_rgba(30,41,59,0.04),0_4px_16px_rgba(30,41,59,0.03)]",
  muted: "border border-[#DDE2EB] bg-[#F7F8FB]",
  accent: "border border-[#C7D0FF] bg-[#F4F5FF] shadow-[0_1px_3px_rgba(79,98,242,0.08)]",
} as const;

export function SurfacePanel({
  children,
  className,
  as: Tag = "section",
  tone = "default",
}: SurfacePanelProps) {
  return (
    <Tag className={cn("rounded-[10px] p-4 sm:p-5", toneClassName[tone], className)}>
      {children}
    </Tag>
  );
}
