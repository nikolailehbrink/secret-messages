import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

type Props = React.HTMLProps<HTMLHeadingElement> & {
  children: ReactNode;
  className?: string;
  level?: "1" | "2" | "3" | "4" | "5" | "6";
};

const GradientHeading = forwardRef(function GradientHeading(
  { children, level = "1", className, ...props }: Props,
  ref: React.Ref<HTMLHeadingElement>,
) {
  const HeadingLevel = `h${level}` as const;
  return (
    <HeadingLevel
      className={cn(
        `bg-gradient-to-br from-neutral-950 to-neutral-600 bg-clip-text text-3xl
        font-bold tracking-tighter text-transparent`,
        className,
      )}
      {...props}
      ref={ref}
    >
      {children}
    </HeadingLevel>
  );
});

export default GradientHeading;
