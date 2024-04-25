import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function storeMessage(message: string, password: string) {
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);

  return prisma.encryptedMessage.create({
    data: {
      message,
      password: hashPassword,
      uuid: uuidv4(),
    },
  });
}

export async function getMessage(uuid: string) {
  return prisma.encryptedMessage.findUnique({
    where: {
      uuid,
    },
  });
}

export async function getMessages() {
  return prisma.encryptedMessage.findMany();
}
