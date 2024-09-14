import { PrismaClient } from "@prisma/client";

// https://www.prisma.io/blog/fullstack-remix-prisma-mongodb-2-ZTmOy58p4re8#create-an-instance-of-prismaclient

let prisma: PrismaClient;
declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}

export { prisma };
