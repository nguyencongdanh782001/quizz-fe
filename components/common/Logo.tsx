import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import logoImage from "../../public/image/logo.png";
import logoSmallImage from "../../public/image/logoquizzsmall.png";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  className?: string;
  size?: LogoSize;
  showText?: boolean;
}

const sizeClassName: Record<LogoSize, string> = {
  sm: "h-9 w-auto",
  md: "h-12 w-auto",
  lg: "h-16 w-auto",
};

const imageSize: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 40, height: 40 },
  md: { width: 86, height: 48 },
  lg: { width: 115, height: 64 },
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const { width, height } = imageSize[size];
  const imgSrc = size === "sm" ? logoSmallImage : logoImage;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-on-surface",
        className,
      )}
    >
      <Image
        src={imgSrc}
        alt={APP_NAME}
        width={width}
        height={height}
        className={cn("shrink-0 object-contain", sizeClassName[size])}
      />
      {showText ? (
        <span className="min-w-0 text-current">
          <span className="block truncate font-display text-base font-semibold leading-none text-current sm:text-lg">
            {APP_NAME}
          </span>
        </span>
      ) : null}
    </span>
  );
}
