import { Detective } from "@phosphor-icons/react/dist/ssr/Detective";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { LinkSimple } from "@phosphor-icons/react/dist/ssr/LinkSimple";

export const FEATURES = [
  {
    title: "Anonymous",
    description: "No IP addresses or personal information is stored.",
    icon: Detective,
  },
  {
    title: "Secure",
    description: "Your message is encrypted and protected with a password.",
    icon: LockKey,
  },
  {
    title: "Shareable",
    description: "Generate a unique link to share your message with others.",
    icon: LinkSimple,
  },
];
