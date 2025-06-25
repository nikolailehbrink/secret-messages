import { prisma } from "@/.server/prisma";

async function main() {
  await prisma.message.createMany({
    data: [
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
    ],
    skipDuplicates: true,
  });

  // Seed demo message counters
  await prisma.messageCounter.createMany({
    data: [
      { count: 10, type: "daily" },
      { count: 100, type: "total" },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
