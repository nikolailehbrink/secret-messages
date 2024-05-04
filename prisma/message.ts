import { PrismaClient } from "@prisma/client";
import { encryptText } from "@/lib/crypto";
import short from "short-uuid";

const prisma = new PrismaClient();

export async function storeMessage(message: string, password: string) {
  const { iv, encryptedMessage } = encryptText(message, password);

  return prisma.message.create({
    data: {
      encryptedContent: encryptedMessage,
      uuid: short.generate(),
      iv,
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
