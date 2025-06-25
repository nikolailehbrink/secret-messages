/// <reference types="vitest/config" />

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig(({ command }) => ({
  server: {
    open: true,
    host: true,
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  // https://github.com/remix-run/react-router/issues/12610#issuecomment-2773018176
  ssr: {
    noExternal: command === "build" ? true : undefined,
    // https://github.com/remix-run/react-router/issues/12610#issuecomment-2773018176
    optimizeDeps: {
      include: ["@prisma/client-generated"],
    },
  },
  build: {
    rollupOptions: {
      external: ["@prisma/client-generated"],
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), devtoolsJson()],
}));
