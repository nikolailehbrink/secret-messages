import short from "short-uuid";
import { DateTime } from "luxon";
import { prisma } from "@/.server/prisma";

// The message arrives already encrypted from the browser — the server never
// sees the plaintext or the password (end-to-end encryption).
export async function createMessage(
  encryptedContent: string,
  iv: string,
  salt: string | null,
  isOneTimeMessage: boolean,
  minutesToExpire: number | null,
) {
  let expirationDate: string | null = null;
  const uuid = short.generate();
  const createdDate = DateTime.now();
  const createdAt = createdDate.toJSDate();

  if (minutesToExpire !== null) {
    expirationDate = createdDate.plus({ minutes: minutesToExpire }).toISO();
  }

  return await prisma.message.create({
    data: {
      encryptedContent,
      uuid,
      iv,
      salt,
      expiresAt: expirationDate,
      createdAt,
      isOneTimeMessage,
    },
  });
}

export async function getMessage(uuid: string) {
  return await prisma.message.findUnique({
    where: {
      uuid,
    },
  });
}

export async function deleteMessage(uuid: string) {
  return await prisma.message.delete({
    where: {
      uuid,
    },
  });
}

export async function deleteExpiredOrOneTimeMessages() {
  return await prisma.message.deleteMany({
    where: {
      OR: [
        {
          isOneTimeMessage: true,
          isDecrypted: true,
        },
        {
          expiresAt: {
            lte: new Date(),
          },
        },
      ],
    },
  });
}

export async function markMessageAsViewed(uuid: string) {
  return await prisma.message.update({
    where: {
      uuid,
    },
    data: {
      isDecrypted: true,
    },
  });
}

type MessageType = "oneTime" | "expiring" | "standard" | "all";

// The "all" type is used to count all messages. This is necessary because a message can be both one-time and expiring simultaneously.
// We want to count such messages only once in the total count for the output, but still have them appear in both the oneTime and expiring counters.
// This ensures that the total count reflects the actual number of unique messages, while the individual counters provide insight into the specific types of messages.
export async function getMessageCount(type: MessageType = "all") {
  const counter = await prisma.messageCounter.findUnique({
    where: {
      type,
    },
  });
  return counter?.count ?? 0;
}

export async function incrementMessageCount(messageType: MessageType) {
  return await prisma.messageCounter.upsert({
    where: {
      type: messageType,
    },
    create: { count: 1, type: messageType },
    update: {
      count: {
        increment: 1,
      },
    },
  });
}
