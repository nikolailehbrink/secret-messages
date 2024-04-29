import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function GradientHeading({
  children,
  level = "1",
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  level?: "1" | "2" | "3" | "4" | "5" | "6";
}) {
  const HeadingLevel = `h${level}` as const;
  return (
    <HeadingLevel
      className={cn(
        `bg-gradient-to-br from-neutral-950 to-neutral-600 bg-clip-text text-3xl
        font-bold tracking-tighter text-transparent`,
        className,
      )}
      {...props}
    >
      {children}
    </HeadingLevel>
  );
}
