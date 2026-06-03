import {
  DetectiveIcon,
  LinkSimpleIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";

export const FEATURES = [
  {
    title: "Anonymous",
    description: "No IP addresses or personal information is stored.",
    icon: DetectiveIcon,
  },
  {
    title: "End-to-End Encrypted",
    description:
      "Your message is encrypted in your browser. The server only ever stores ciphertext — never your message or password.",
    icon: LockKeyIcon,
  },
  {
    title: "Shareable",
    description: "Generate a unique link to share your message with others.",
    icon: LinkSimpleIcon,
  },
];
