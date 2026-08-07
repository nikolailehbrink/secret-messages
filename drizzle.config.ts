import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env on its own. An already present variable wins,
// so a remote database can be targeted with TURSO_DATABASE_URL=… drizzle-kit migrate.
if (!process.env.TURSO_DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // No .env file present – rely on the ambient environment (e.g. CI, Vercel).
  }
}

export default defineConfig({
  dialect: "turso",
  schema: "./app/.server/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
