import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { encryptText } from "@/lib/crypto";

const prisma = new PrismaClient();

export async function storeMessage(message: string, password: string) {
  const { iv, encryptedMessage } = encryptText(message, password);

  return prisma.message.create({
    data: {
      encryptedContent: encryptedMessage,
      uuid: uuidv4(),
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
