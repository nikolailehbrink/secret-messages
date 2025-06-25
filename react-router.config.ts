import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // In order to make the local preview work, because the preset changes the server index path
  ...(process.env.VERCEL ? { presets: [vercelPreset()] } : {}),
} satisfies Config;
