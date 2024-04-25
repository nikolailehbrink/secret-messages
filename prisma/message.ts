import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function storeMessage(
  message: string,
  password: string,
  uuid: string = "fgd",
) {
  return prisma.encryptedMessage.create({
    data: {
      message,
      password,
      uuid,
    },
  });
}

export async function getMessages() {
  return prisma.encryptedMessage.findMany();
}
