import { cn } from "@/lib/utils";
import { Warning } from "@phosphor-icons/react/dist/ssr/Warning";

type Props = { message: string; className?: string };
export default function Error({ message, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-md text-sm text-red-700",
        className,
      )}
    >
      <Warning size={20} weight="duotone" />
      <p>{message}</p>
    </div>
  );
}
