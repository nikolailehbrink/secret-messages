import {
  CheckCircleIcon,
  ClipboardIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

export const CLIPBOARD_ICONS = new Map([
  ["default", ClipboardIcon],
  ["success", CheckCircleIcon],
  ["error", XCircleIcon],
] as const);
