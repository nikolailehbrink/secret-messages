import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  blur?: boolean;
  className?: string;
  rotate?: boolean;
};

const GradientContainer = forwardRef(function GradientContainer(
  { children, blur, className, rotate = false }: Props,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div className={cn("relative flex flex-col", className)} ref={ref}>
      {blur && (
        <div
          className={cn(
            `absolute inset-0 rounded-lg bg-gradient-to-bl from-rose-500
            via-sky-500 to-fuchsia-500 opacity-15 blur-md`,
            rotate && "bg-gradient-to-tl sm:bg-gradient-to-br",
          )}
        ></div>
      )}
      <div
        className={cn(
          `absolute -inset-[2px] rounded-lg bg-gradient-to-bl from-rose-500
          via-sky-500 to-fuchsia-500 opacity-20`,
          rotate && "bg-gradient-to-tl sm:bg-gradient-to-br",
        )}
      ></div>

      {children}
    </div>
  );
});

export default GradientContainer;
