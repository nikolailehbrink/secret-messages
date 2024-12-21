import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Clipboard } from "@phosphor-icons/react/dist/ssr/Clipboard";
import { XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";

export const CLIPBOARD_ICONS = new Map([
  ["default", Clipboard],
  ["success", CheckCircle],
  ["error", XCircle],
] as const);
