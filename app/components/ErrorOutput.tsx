import { cn } from "@/lib/utils";
import { Warning } from "@phosphor-icons/react/dist/ssr/Warning";

type Props = { message: string; className?: string };
export default function ErrorOutput({ message, className }: Props) {
  return (
    <div
      className={cn("flex gap-1 rounded-md text-xs text-rose-500", className)}
    >
      <Warning size={16} weight="duotone" />
      <p>{message}</p>
    </div>
  );
}
