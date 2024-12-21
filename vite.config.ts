import { sentryVitePlugin } from "@sentry/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, command }) => {
  // Check if the code is not running on Vercel
  if (!process.env.VERCEL) {
    return {
      server: {
        open: true,
        host: true,
      },
      test: {
        include: ["**/*.test.ts", "**/*.test.tsx"],
      },
      plugins: [reactRouter(), tsconfigPaths()],
    };
  }

  return {
    plugins: [
      reactRouter(),
      tsconfigPaths(),
      sentryVitePlugin({
        org: "nikolailehbrink",
        project: "secret-messages",
      }),
    ],
    build: {
      sourcemap: true,
      rollupOptions: isSsrBuild
        ? {
            input: "./server/app.ts",
          }
        : undefined,
    },
    ssr: {
      noExternal: command === "build" ? true : undefined,
    },
    resolve: {
      alias: {
        ".prisma/client/default": "./node_modules/.prisma/client/default.js",
        "./query_engine_bg.wasm?module":
          "./node_modules/.prisma/client/query_engine_bg.wasm?init",
      },
    },
  };
});
