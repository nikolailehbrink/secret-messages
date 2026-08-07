/// <reference types="vitest/config" />

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig(({ command, isSsrBuild }) => ({
  server: {
    open: true,
    host: true,
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
    // The Node entry of @libsql/client loads platform-specific native bindings
    // (only used for local file: databases) that must not be bundled.
    external: ["@libsql/client", "libsql"],
  },
  build: {
    // The server bundle runs on Node 22, where the top-level await in
    // app/.server/db.ts is supported. Without this it inherits the browser
    // target, which rejects top-level await.
    target: isSsrBuild ? "es2022" : undefined,
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), devtoolsJson()],
}));
