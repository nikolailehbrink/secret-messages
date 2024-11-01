import { encryptText } from "@/lib/crypto";
import short from "short-uuid";
import { DateTime } from "luxon";
import { prisma } from "@/.server/prisma";

export async function createMessage(
  content: string,
  isOneTimeMessage: boolean,
  minutesToExpire: number | null,
  password: string,
) {
  let expirationDate: string | null = null;
  const { iv, encryptedMessage } = encryptText(content, password);
  const createdDate = DateTime.now();
  const createdAt = createdDate.toJSDate();

  if (minutesToExpire) {
    expirationDate = createdDate.plus({ minutes: minutesToExpire }).toISO();
  }

  return prisma.message.create({
    data: {
      encryptedContent: encryptedMessage,
      uuid: short.generate(),
      iv,
      expiresAt: expirationDate,
      createdAt,
      isOneTimeMessage,
    },
  });
}

export async function getMessage(uuid: string) {
  return prisma.message.findUnique({
    where: {
      uuid,
    },
  });
}

export async function deleteMessage(uuid: string) {
  return prisma.message.delete({
    where: {
      uuid,
    },
  });
}

export async function deleteExpiredOrOneTimeMessages() {
  return prisma.message.deleteMany({
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
  return prisma.message.update({
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
      type: messageType,
    },
  });
  return counter?.count ?? 0;
}

export async function incrementMessageCount(messageType: MessageType) {
  return prisma.messageCounter.upsert({
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
