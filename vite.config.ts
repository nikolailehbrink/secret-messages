import { sentryVitePlugin } from "@sentry/vite-plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";

// This installs globals such as "fetch", "Response", "Request" and "Headers". See: https://remix.run/docs/en/main/other-api/node
installGlobals();

export default defineConfig(() => {
  // Check if the code is not running on Vercel
  if (!process.env.VERCEL) {
    return {
      test: {
        include: ["**/*.test.ts", "**/*.test.tsx"],
      },
      plugins: [remix(), tsconfigPaths()],
    };
  }

  return {
    plugins: [
      remix({
        presets: [vercelPreset()],
      }),
      tsconfigPaths(),
      sentryVitePlugin({
        org: "nikolailehbrink",
        project: "secret-messages",
      }),
    ],
    build: {
      sourcemap: true,
    },
  };
});
