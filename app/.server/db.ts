import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/.server/schema";

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not set.");
}

// A local "file:" database needs the native bindings of the Node entry point.
// Remote Turso databases are reached over HTTP, so the web entry point is used –
// it avoids shipping platform-specific binaries to the serverless function.
const isLocalFile = TURSO_DATABASE_URL.startsWith("file:");

const { createClient } = isLocalFile
  ? await import("@libsql/client")
  : await import("@libsql/client/web");

const globalForDb = global as unknown as {
  db: ReturnType<typeof createDb>;
};

function createDb() {
  const client = createClient({
    url: TURSO_DATABASE_URL!,
    // Not needed for a local file: database.
    authToken: TURSO_AUTH_TOKEN,
  });
  return drizzle({ client, schema });
}

const db = globalForDb.db || createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export { db };

// Replaces the former Prisma "P2002" check. Drizzle surfaces the underlying
// libSQL error, which reports a violated UNIQUE constraint as SQLITE_CONSTRAINT_UNIQUE.
// Checked structurally instead of via `instanceof LibsqlError` so that it works
// regardless of which client entry point was loaded above.
export function isUniqueConstraintError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return (
    error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    error.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
  );
}
