import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  blur?: boolean;
  className?: string;
  rotate?: boolean;
};

const GRADIENT = "bg-linear-to-bl from-rose-500 via-sky-500 to-fuchsia-500";

// Wraps children with a gradient border that always follows the container's own
// border radius. The border is painted via a mask on an `inset-0` overlay, so it
// has a uniform width and never depends on the child's radius — set the desired
// roundness on the GradientContainer (defaults to rounded-md) and the child to
// match.
const GradientContainer = forwardRef(function GradientContainer(
  { children, blur, className, rotate = false }: Props,
  ref: React.Ref<HTMLDivElement>,
) {
  const direction = rotate && "bg-linear-to-tl sm:bg-linear-to-br";

  return (
    <div
      className={cn("relative flex flex-col rounded-md", className)}
      ref={ref}
    >
      {blur && (
        <div
          aria-hidden
          className={cn(
            `pointer-events-none absolute -inset-1 rounded-[inherit] opacity-15
            blur-md`,
            GRADIENT,
            direction,
          )}
        />
      )}
      {children}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] opacity-30",
          GRADIENT,
          direction,
        )}
        style={{
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
});

export default GradientContainer;
