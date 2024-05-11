/*
  Warnings:

  - You are about to drop the column `isDecryptedAndViewed` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isOneTime` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" RENAME COLUMN "isDecryptedAndViewed" TO "isDecrypted";
ALTER TABLE "Message" RENAME COLUMN "isOneTime" TO "isOneTimeMessage";
