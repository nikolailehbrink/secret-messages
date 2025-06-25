import { cn } from "@/lib/utils";
import { WarningIcon } from "@phosphor-icons/react";

type Props = { message: string; className?: string };

export default function ErrorOutput({ message, className }: Props) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-md text-left text-xs text-pretty text-rose-500",
        className,
      )}
    >
      <WarningIcon size={16} weight="duotone" />
      <p>{message}</p>
    </div>
  );
}
