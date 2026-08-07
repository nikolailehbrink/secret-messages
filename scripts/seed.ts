import { db } from "@/.server/db";
import { message, messageCounter } from "@/.server/schema";

async function main() {
  await db
    .insert(message)
    .values([
      {
        encryptedContent: "U2FsdGVkX1+demo1==",
        iv: "iv-demo-1",
        uuid: "uuid-demo-1",
        isOneTimeMessage: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 1 day
        isDecrypted: false,
      },
      {
        encryptedContent: "U2FsdGVkX1+demo2==",
        iv: "iv-demo-2",
        uuid: "uuid-demo-2",
        isOneTimeMessage: true,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // expires in 2 days
        isDecrypted: false,
      },
    ])
    .onConflictDoNothing();

  // Seed demo message counters
  await db
    .insert(messageCounter)
    .values([
      { count: 10, type: "daily" },
      { count: 100, type: "total" },
    ])
    .onConflictDoNothing();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
