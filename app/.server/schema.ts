import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const message = sqliteTable("Message", {
  id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  encryptedContent: text().notNull(),
  iv: text().notNull().unique(),
  uuid: text().notNull().unique(),
  isOneTimeMessage: integer({ mode: "boolean" }).notNull().default(false),
  expiresAt: integer({ mode: "timestamp_ms" }),
  isDecrypted: integer({ mode: "boolean" }).notNull().default(false),
});

export const messageCounter = sqliteTable("MessageCounter", {
  id: integer().primaryKey({ autoIncrement: true }),
  count: integer().notNull().default(0),
  type: text().notNull().unique(),
});
