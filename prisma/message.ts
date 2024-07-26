import { PrismaClient } from "@prisma/client";
import { encryptText } from "@/lib/crypto";
import short from "short-uuid";
import { addMinutesToDate } from "@/lib/helper";

const prisma = new PrismaClient();

// "all" is used to count all messages, because a message can be one-time and expiring at the same time and we want to count it only once for the output but still have the message appear in both counters for oneTime and expiring messages.
type MessageType = "oneTime" | "expiring" | "standard" | "all";

export async function storeMessage(
  content: string,
  isOneTimeMessage: boolean,
  minutesToExpire: number | null,
  password: string,
) {
  let expirationDate: string | null = null;
  const { iv, encryptedMessage } = encryptText(content, password);
  const createdAt = new Date();

  if (minutesToExpire) {
    expirationDate = addMinutesToDate(createdAt, minutesToExpire).toISOString();
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

export async function getMessage(uuid: string) {
  return prisma.message.findUnique({
    where: {
      uuid,
    },
  });
}

export async function getMessages() {
  return prisma.message.findMany();
}

export async function getMessageCount(messageType: MessageType) {
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
