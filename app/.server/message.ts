import { encryptText } from "@/lib/crypto";
import short from "short-uuid";
import { DateTime } from "luxon";
import { db } from "@/.server/db";
import { message, messageCounter } from "@/.server/schema";
import { and, eq, lte, or, sql } from "drizzle-orm";

export async function createMessage(
  content: string,
  isOneTimeMessage: boolean,
  minutesToExpire: number | null,
  password: string,
) {
  let expirationDate: Date | null = null;
  const { iv, encryptedMessage } = encryptText(content, password);
  const uuid = short.generate();
  const createdDate = DateTime.now();
  const createdAt = createdDate.toJSDate();

  if (minutesToExpire !== null) {
    expirationDate = createdDate.plus({ minutes: minutesToExpire }).toJSDate();
  }

  const [createdMessage] = await db
    .insert(message)
    .values({
      encryptedContent: encryptedMessage,
      uuid,
      iv,
      expiresAt: expirationDate,
      createdAt,
      isOneTimeMessage,
    })
    .returning();

  return createdMessage;
}

export async function getMessage(uuid: string) {
  const [foundMessage] = await db
    .select()
    .from(message)
    .where(eq(message.uuid, uuid))
    .limit(1);

  return foundMessage ?? null;
}

export async function deleteMessage(uuid: string) {
  return await db.delete(message).where(eq(message.uuid, uuid));
}

export async function deleteExpiredOrOneTimeMessages() {
  return await db
    .delete(message)
    .where(
      or(
        and(eq(message.isOneTimeMessage, true), eq(message.isDecrypted, true)),
        lte(message.expiresAt, new Date()),
      ),
    );
}

export async function markMessageAsViewed(uuid: string) {
  return await db
    .update(message)
    .set({ isDecrypted: true })
    .where(eq(message.uuid, uuid));
}

type MessageType = "oneTime" | "expiring" | "standard" | "all";

// The "all" type is used to count all messages. This is necessary because a message can be both one-time and expiring simultaneously.
// We want to count such messages only once in the total count for the output, but still have them appear in both the oneTime and expiring counters.
// This ensures that the total count reflects the actual number of unique messages, while the individual counters provide insight into the specific types of messages.
export async function getMessageCount(type: MessageType = "all") {
  const [counter] = await db
    .select({ count: messageCounter.count })
    .from(messageCounter)
    .where(eq(messageCounter.type, type))
    .limit(1);

  return counter?.count ?? 0;
}

export async function incrementMessageCount(messageType: MessageType) {
  return await db
    .insert(messageCounter)
    .values({ count: 1, type: messageType })
    .onConflictDoUpdate({
      target: messageCounter.type,
      set: { count: sql`${messageCounter.count} + 1` },
    })
    .returning();
}
