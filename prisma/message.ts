import { PrismaClient } from "@prisma/client";
import { encryptText } from "@/lib/crypto";
import short from "short-uuid";
import { addMinutesToDate } from "@/lib/helper";

const prisma = new PrismaClient();

export async function storeMessage(
  content: string,
  oneTimeMessage: boolean,
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
      isOneTimeMessage: oneTimeMessage,
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

export async function getMessageCount() {
  return prisma.message.count();
}
